const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const PredictionLog = require('../models/PredictionLog');
const ChatLog = require('../models/ChatLog');
const { getWeatherBundle } = require('../services/weatherService');
const { buildDashboardReport } = require('../services/reportService');

const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const region = req.user.region || req.user.language === 'kn' ? 'Bengaluru' : 'India';

  const [cropCount, fertCount, chatCount, latestFertilizer, weather] = await Promise.all([
    PredictionLog.countDocuments({ user: userId, type: 'crop' }),
    PredictionLog.countDocuments({ user: userId, type: 'fertilizer' }),
    ChatLog.countDocuments({ user: userId }),
    PredictionLog.findOne({ user: userId, type: 'fertilizer' }).sort({ createdAt: -1 }),
    getWeatherBundle(region)
  ]);

  const recentCropPredictions = await PredictionLog.find({ user: userId, type: 'crop' })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const cropYieldTrend = recentCropPredictions.map((item, idx) => ({
    label: `Run ${recentCropPredictions.length - idx}`,
    confidence: Number(((item.confidence || 0.5) * 100).toFixed(2))
  }));

  const npk = latestFertilizer?.input?.npk || { n: 45, p: 35, k: 40 };

  const analytics = {
    summary: {
      cropPredictions: cropCount,
      fertilizerRecommendations: fertCount,
      chatQueries: chatCount
    },
    cropYieldTrend,
    weatherPattern: weather.forecast,
    soilHealth: [
      { metric: 'Nitrogen (N)', value: npk.n },
      { metric: 'Phosphorus (P)', value: npk.p },
      { metric: 'Potassium (K)', value: npk.k }
    ],
    alerts: weather.alerts
  };

  res.status(StatusCodes.OK).json(analytics);
});

const downloadReport = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [cropCount, fertCount, chatCount, latestFertilizer] = await Promise.all([
    PredictionLog.countDocuments({ user: userId, type: 'crop' }),
    PredictionLog.countDocuments({ user: userId, type: 'fertilizer' }),
    ChatLog.countDocuments({ user: userId }),
    PredictionLog.findOne({ user: userId, type: 'fertilizer' }).sort({ createdAt: -1 })
  ]);

  const npk = latestFertilizer?.input?.npk || { n: 0, p: 0, k: 0 };

  const analytics = {
    summary: {
      cropPredictions: cropCount,
      fertilizerRecommendations: fertCount,
      chatQueries: chatCount
    },
    soilHealth: [
      { metric: 'Nitrogen (N)', value: npk.n },
      { metric: 'Phosphorus (P)', value: npk.p },
      { metric: 'Potassium (K)', value: npk.k }
    ],
    alerts: []
  };

  const pdf = await buildDashboardReport(analytics);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="smart-agri-report.pdf"');
  res.send(pdf);
});

module.exports = { getAnalytics, downloadReport };
