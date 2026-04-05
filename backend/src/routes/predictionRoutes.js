const express = require('express');
const { getPredictionHistory } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/history', getPredictionHistory);

module.exports = router;
