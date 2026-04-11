const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { invokeML } = require('../services/mlClient');
const PredictionLog = require('../models/PredictionLog');

const recommendFertilizer = asyncHandler(async (req, res) => {
  const { cropType, soilType, nitrogen, phosphorous, potassium, temperature, humidity, moisture } = req.body;

  if (!cropType || !soilType ||
      nitrogen === undefined || phosphorous === undefined || potassium === undefined ||
      temperature === undefined || humidity === undefined || moisture === undefined) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'cropType, soilType, nitrogen, phosphorous, potassium, temperature, humidity, and moisture are required');
  }

  const payload = {
    cropType,
    soilType,
    nitrogen: Number(nitrogen),
    phosphorous: Number(phosphorous),
    potassium: Number(potassium),
    temperature: Number(temperature),
    humidity: Number(humidity),
    moisture: Number(moisture),
  };

  const recommendation = await invokeML('/predict/fertilizer', payload);

  await PredictionLog.create({
    user: req.user._id,
    type: 'fertilizer',
    input: payload,
    output: recommendation,
    confidence: recommendation.confidence,
    modelVersion: recommendation.modelVersion || 'v1'
  });

  res.status(StatusCodes.OK).json(recommendation);
});

module.exports = { recommendFertilizer };
