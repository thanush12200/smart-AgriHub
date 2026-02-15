const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const { getWeatherBundle } = require('../services/weatherService');
const { emitWeatherAlerts } = require('../services/socketService');

const getWeather = asyncHandler(async (req, res) => {
  const region = req.query.region || req.user.region || 'Bengaluru';
  const data = await getWeatherBundle(region);

  emitWeatherAlerts(region, data.alerts);

  res.status(StatusCodes.OK).json(data);
});

module.exports = { getWeather };
