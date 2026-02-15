const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { invokeML } = require('../services/mlClient');
const PredictionLog = require('../models/PredictionLog');

const recommendFertilizer = asyncHandler(async (req, res) => {
  const { crop, npk } = req.body;

  if (!crop || !npk || npk.n === undefined || npk.p === undefined || npk.k === undefined) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'crop and npk (n,p,k) are required');
  }

  const payload = {
    crop,
    npk: { n: Number(npk.n), p: Number(npk.p), k: Number(npk.k) }
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
