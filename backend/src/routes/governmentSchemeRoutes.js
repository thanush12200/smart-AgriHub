const express = require('express');
const { listSchemes, getSchemeByCode } = require('../controllers/governmentSchemeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/v1/schemes:
 *   get:
 *     summary: List government agriculture schemes
 *     tags: [Government Schemes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', listSchemes);

/**
 * @swagger
 * /api/v1/schemes/{schemeCode}:
 *   get:
 *     summary: Get a government scheme by scheme code
 *     tags: [Government Schemes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:schemeCode', getSchemeByCode);

module.exports = router;
