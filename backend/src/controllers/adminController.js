const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const PredictionLog = require('../models/PredictionLog');
const ChatLog = require('../models/ChatLog');
const ModelRegistry = require('../models/ModelRegistry');
const ApiError = require('../utils/ApiError');

const listFarmers = asyncHandler(async (req, res) => {
  const farmers = await User.find({ role: 'farmer' }).select('-password');
  res.status(StatusCodes.OK).json({ farmers });
});

const toggleFarmerStatus = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;
  const { isActive } = req.body;

  const farmer = await User.findOne({ _id: farmerId, role: 'farmer' });
  if (!farmer) throw new ApiError(StatusCodes.NOT_FOUND, 'Farmer not found');

  farmer.isActive = typeof isActive === 'boolean' ? isActive : !farmer.isActive;
  await farmer.save();

  res.status(StatusCodes.OK).json({ farmer });
});

const getPredictionLogs = asyncHandler(async (req, res) => {
  const logs = await PredictionLog.find().populate('user', 'name email role').sort({ createdAt: -1 }).limit(100);
  res.status(StatusCodes.OK).json({ logs });
});

const getChatLogs = asyncHandler(async (req, res) => {
  const logs = await ChatLog.find().populate('user', 'name email role').sort({ createdAt: -1 }).limit(100);
  res.status(StatusCodes.OK).json({ logs });
});

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

  res.status(StatusCodes.CREATED).json({ model: record });
});

const listModels = asyncHandler(async (req, res) => {
  const models = await ModelRegistry.find().sort({ createdAt: -1 }).limit(100);
  res.status(StatusCodes.OK).json({ models });
});

module.exports = {
  listFarmers,
  toggleFarmerStatus,
  getPredictionLogs,
  getChatLogs,
  uploadModel,
  listModels
};
