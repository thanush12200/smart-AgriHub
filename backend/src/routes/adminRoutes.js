const express = require('express');
const multer = require('multer');
const {
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
} = require('../controllers/adminController');
const {
  listAdminProducts,
  createProduct,
  updateProduct,
  deactivateProduct
} = require('../controllers/adminProductController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect, allowRoles('admin'));

// Stats
router.get('/stats', getStats);

// Farmers
router.get('/farmers', listFarmers);
router.get('/farmers/:farmerId', getFarmerDetail);
router.patch('/farmers/:farmerId/status', toggleFarmerStatus);

// Predictions
router.get('/predictions', getPredictionLogs);
router.get('/predictions/analytics', getPredictionAnalytics);

// Chat
router.get('/chat-logs', getChatLogs);

// Models
router.get('/models', listModels);
router.post('/models/upload', upload.single('modelFile'), uploadModel);
router.patch('/models/:modelId/status', updateModelStatus);

// Products
router.get('/products', listAdminProducts);
router.post('/products', createProduct);
router.patch('/products/:productCode', updateProduct);
router.delete('/products/:productCode', deactivateProduct);

// Announcements
router.get('/announcements', listAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:announcementId', deleteAnnouncement);

// Audit log
router.get('/audit-log', getAuditLog);

module.exports = router;
