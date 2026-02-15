const express = require('express');
const multer = require('multer');
const { predictCrop, detectPlantImage } = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * @swagger
 * /api/v1/crop/predict:
 *   post:
 *     summary: Predict best crops
 *     tags: [Crop]
 *     security:
 *       - bearerAuth: []
 */
router.post('/predict', protect, predictCrop);
router.post('/detect-plant', protect, upload.single('image'), detectPlantImage);

module.exports = router;
