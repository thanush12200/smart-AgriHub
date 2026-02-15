const express = require('express');
const { recommendFertilizer } = require('../controllers/fertilizerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/fertilizer/recommend:
 *   post:
 *     summary: Recommend fertilizer and dosage
 *     tags: [Fertilizer]
 *     security:
 *       - bearerAuth: []
 */
router.post('/recommend', protect, recommendFertilizer);

module.exports = router;
