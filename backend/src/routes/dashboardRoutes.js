const express = require('express');
const { getAnalytics, downloadReport } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, getAnalytics);
router.get('/report/pdf', protect, downloadReport);

module.exports = router;
