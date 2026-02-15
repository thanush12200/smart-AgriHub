const express = require('express');
const { listProducts, getProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: List marketplace products
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', listProducts);

/**
 * @swagger
 * /api/v1/products/{productCode}:
 *   get:
 *     summary: Get a product by product code
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:productCode', getProduct);

module.exports = router;

