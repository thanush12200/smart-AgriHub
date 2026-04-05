const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const PredictionLog = require('../models/PredictionLog');
const ChatLog = require('../models/ChatLog');
const ModelRegistry = require('../models/ModelRegistry');
const Product = require('../models/Product');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const ApiError = require('../utils/ApiError');

// ── Helpers ────────────────────────────────────────────
const writeAudit = (adminId, action, detail = '') =>
  AuditLog.create({ admin: adminId, action, detail }).catch(() => {});

// ── Farmers ────────────────────────────────────────────
const listFarmers = asyncHandler(async (req, res) => {
  const { search = '', status = 'all' } = req.query;
  const filter = { role: 'farmer' };
  if (status === 'active') filter.isActive = true;
  if (status === 'blocked') filter.isActive = false;
  if (search.trim()) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { region: rx }];
  }
  const farmers = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ farmers });
});

const getFarmerDetail = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;
  const farmer = await User.findOne({ _id: farmerId, role: 'farmer' }).select('-password');
  if (!farmer) throw new ApiError(StatusCodes.NOT_FOUND, 'Farmer not found');

  const [predCount, chatCount] = await Promise.all([
    PredictionLog.countDocuments({ user: farmerId }),
    ChatLog.countDocuments({ user: farmerId })
  ]);

  res.status(StatusCodes.OK).json({ farmer, predCount, chatCount });
});

const toggleFarmerStatus = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;
  const { isActive } = req.body;
  const farmer = await User.findOne({ _id: farmerId, role: 'farmer' });
  if (!farmer) throw new ApiError(StatusCodes.NOT_FOUND, 'Farmer not found');

  farmer.isActive = typeof isActive === 'boolean' ? isActive : !farmer.isActive;
  await farmer.save();
  writeAudit(req.user._id, farmer.isActive ? 'farmer_activated' : 'farmer_blocked', farmer.email);
  res.status(StatusCodes.OK).json({ farmer });
});

// ── Overview Stats ─────────────────────────────────────
const getStats = asyncHandler(async (req, res) => {
  const [
    totalFarmers, activeFarmers, blockedFarmers,
    totalProducts, activeProducts, lowStockProducts,
    totalPredictions, totalChats, totalModels
  ] = await Promise.all([
    User.countDocuments({ role: 'farmer' }),
    User.countDocuments({ role: 'farmer', isActive: true }),
    User.countDocuments({ role: 'farmer', isActive: false }),
    Product.countDocuments({}),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: { $lt: 10 } }),
    PredictionLog.countDocuments({}),
    ChatLog.countDocuments({}),
    ModelRegistry.countDocuments({})
  ]);

  // Prediction breakdown by type
  const predByType = await PredictionLog.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  // Recent activity (last 7 days)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [recentPreds, recentChats, recentFarmers] = await Promise.all([
    PredictionLog.countDocuments({ createdAt: { $gte: since } }),
    ChatLog.countDocuments({ createdAt: { $gte: since } }),
    User.countDocuments({ role: 'farmer', createdAt: { $gte: since } })
  ]);

  res.status(StatusCodes.OK).json({
    farmers: { total: totalFarmers, active: activeFarmers, blocked: blockedFarmers, newThisWeek: recentFarmers },
    products: { total: totalProducts, active: activeProducts, lowStock: lowStockProducts },
    predictions: { total: totalPredictions, byType: predByType, thisWeek: recentPreds },
    chats: { total: totalChats, thisWeek: recentChats },
    models: { total: totalModels }
  });
});

// ── Prediction & Chat Logs ─────────────────────────────
const getPredictionLogs = asyncHandler(async (req, res) => {
  const logs = await PredictionLog.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(100);
  res.status(StatusCodes.OK).json({ logs });
});

const getPredictionAnalytics = asyncHandler(async (req, res) => {
  const byType = await PredictionLog.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 }, avgConfidence: { $avg: '$confidence' } } }
  ]);

  // Confidence histogram buckets: 0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0
  const confidenceBuckets = await PredictionLog.aggregate([
    {
      $bucket: {
        groupBy: '$confidence',
        boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1.01],
        default: 'unknown',
        output: { count: { $sum: 1 } }
      }
    }
  ]);

  res.status(StatusCodes.OK).json({ byType, confidenceBuckets });
});

const getChatLogs = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const filter = {};
  if (search.trim()) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.message = rx;
  }
  const logs = await ChatLog.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(100);
  res.status(StatusCodes.OK).json({ logs });
});

// ── ML Models ──────────────────────────────────────────
const uploadModel = asyncHandler(async (req, res) => {
  const { name, version, status = 'staging', metadata } = req.body;
  if (!name || !version) throw new ApiError(StatusCodes.BAD_REQUEST, 'name and version are required');

  const record = await ModelRegistry.create({
    name,
    version,
    status,
    metadata: metadata ? JSON.parse(metadata) : {},
    fileUrl: req.file?.originalname,
    uploadedBy: req.user._id
  });

  writeAudit(req.user._id, 'model_uploaded', `${name} v${version}`);
  res.status(StatusCodes.CREATED).json({ model: record });
});

const listModels = asyncHandler(async (req, res) => {
  const models = await ModelRegistry.find()
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(100);
  res.status(StatusCodes.OK).json({ models });
});

const updateModelStatus = asyncHandler(async (req, res) => {
  const { modelId } = req.params;
  const { status } = req.body;
  const allowed = ['staging', 'deployed', 'archived'];
  if (!allowed.includes(status)) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status');

  const model = await ModelRegistry.findByIdAndUpdate(modelId, { status }, { new: true });
  if (!model) throw new ApiError(StatusCodes.NOT_FOUND, 'Model not found');

  writeAudit(req.user._id, 'model_status_changed', `${model.name} → ${status}`);
  res.status(StatusCodes.OK).json({ model });
});

// ── Announcements ──────────────────────────────────────
const listAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ announcements });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, body, type = 'info' } = req.body;
  if (!title || !body) throw new ApiError(StatusCodes.BAD_REQUEST, 'title and body are required');

  const announcement = await Announcement.create({
    title: title.trim(),
    body: body.trim(),
    type,
    createdBy: req.user._id
  });

  writeAudit(req.user._id, 'announcement_created', title);
  res.status(StatusCodes.CREATED).json({ announcement });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  await Announcement.findByIdAndDelete(announcementId);
  writeAudit(req.user._id, 'announcement_deleted', announcementId);
  res.status(StatusCodes.OK).json({ message: 'Deleted' });
});

// ── Audit Log ──────────────────────────────────────────
const getAuditLog = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .populate('admin', 'name email')
    .sort({ createdAt: -1 })
    .limit(200);
  res.status(StatusCodes.OK).json({ logs });
});

module.exports = {
  listFarmers,
  getFarmerDetail,
  toggleFarmerStatus,
  getStats,
  getPredictionLogs,
  getPredictionAnalytics,
  getChatLogs,
  uploadModel,
  listModels,
  updateModelStatus,
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAuditLog
};
