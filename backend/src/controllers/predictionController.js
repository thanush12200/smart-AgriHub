const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const PredictionLog = require('../models/PredictionLog');

const getPredictionHistory = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const filter = { user: req.user._id };
  if (type) filter.type = type;

  const logs = await PredictionLog.find(filter).sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ logs });
});

module.exports = { getPredictionHistory };
