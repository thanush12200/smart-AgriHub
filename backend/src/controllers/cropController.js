const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { invokeML } = require('../services/mlClient');
const { detectPlantWithGemini } = require('../services/geminiService');
const PredictionLog = require('../models/PredictionLog');

const allowedImageMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const predictCrop = asyncHandler(async (req, res) => {
  const { soilType, rainfall, temperature, region } = req.body;

  if (!soilType || rainfall === undefined || temperature === undefined || !region) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'soilType, rainfall, temperature and region are required');
  }

  const payload = {
    soilType,
    rainfall: Number(rainfall),
    temperature: Number(temperature),
    region
  };

  const prediction = await invokeML('/predict/crop', payload);

  await PredictionLog.create({
    user: req.user._id,
    type: 'crop',
    input: payload,
    output: prediction.recommendations,
    confidence: prediction.confidence,
    modelVersion: prediction.modelVersion || 'v1'
  });

  res.status(StatusCodes.OK).json(prediction);
});

const detectPlantImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Image file is required');
  }

  if (!allowedImageMimeTypes.has((req.file.mimetype || '').toLowerCase())) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Unsupported image format. Please upload JPEG, PNG, or WEBP images.'
    );
  }

  const payload = {
    imageBase64: req.file.buffer.toString('base64'),
    fileName: req.file.originalname || 'uploaded-image',
    mimeType: req.file.mimetype
  };

  let detection = await detectPlantWithGemini(payload);
  if (!detection) {
    detection = await invokeML('/predict/plant', payload);
  }

  await PredictionLog.create({
    user: req.user._id,
    type: 'plant_detection',
    input: { fileName: payload.fileName, size: req.file.size },
    output: detection,
    confidence: detection.confidence,
    modelVersion: detection.modelVersion || 'v1'
  });

  res.status(StatusCodes.OK).json(detection);
});

module.exports = { predictCrop, detectPlantImage };
