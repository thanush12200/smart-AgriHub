const express = require('express');
const multer = require('multer');
const {
  listFarmers,
  toggleFarmerStatus,
  getPredictionLogs,
  getChatLogs,
  uploadModel,
  listModels
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

router.get('/farmers', listFarmers);
router.patch('/farmers/:farmerId/status', toggleFarmerStatus);
router.get('/predictions', getPredictionLogs);
router.get('/chat-logs', getChatLogs);
router.get('/models', listModels);
router.post('/models/upload', upload.single('modelFile'), uploadModel);

router.get('/products', listAdminProducts);
router.post('/products', createProduct);
router.patch('/products/:productCode', updateProduct);
router.delete('/products/:productCode', deactivateProduct);

module.exports = router;
