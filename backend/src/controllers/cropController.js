const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { invokeML } = require('../services/mlClient');
const { detectPlantWithGemini } = require('../services/geminiService');
const PredictionLog = require('../models/PredictionLog');

const allowedImageMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const unknownLabels = new Set(['', 'unknown', 'unidentified', 'na', 'n/a']);

const normalizedPlant = (value) => String(value || '').trim().toLowerCase();
const confidenceValue = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n > 1 ? n / 100 : n));
};

const isReliableDetection = (detection) => {
  if (!detection || typeof detection !== 'object') return false;

  const plant = normalizedPlant(detection.plant);
  const confidence = confidenceValue(detection.confidence);
  const commonName = normalizedPlant(detection.commonName);

  if (!unknownLabels.has(plant) && confidence >= 0.55) return true;
  if (unknownLabels.has(plant) && !unknownLabels.has(commonName) && confidence >= 0.45) return true;
  return false;
};

const chooseDetection = (geminiDetection, mlDetection) => {
  if (!geminiDetection && mlDetection) return mlDetection;
  if (geminiDetection && !mlDetection) return geminiDetection;
  if (!geminiDetection && !mlDetection) return null;

  const geminiConfidence = confidenceValue(geminiDetection.confidence);
  const mlConfidence = confidenceValue(mlDetection.confidence);
  const geminiPlant = normalizedPlant(geminiDetection.plant);
  const mlPlant = normalizedPlant(mlDetection.plant);
  const geminiKnown = !unknownLabels.has(geminiPlant);
  const mlKnown = !unknownLabels.has(mlPlant);

  if (geminiKnown && geminiConfidence >= 0.55) return geminiDetection;
  if (!geminiKnown && mlKnown && mlConfidence >= 0.78) {
    return {
      ...mlDetection,
      message: 'Gemini confidence was low. Using high-confidence ML fallback result.'
    };
  }

  if (geminiKnown && mlKnown && mlPlant !== geminiPlant && mlConfidence >= geminiConfidence + 0.2 && mlConfidence >= 0.82) {
    return {
      ...mlDetection,
      message: 'Using ML result because it is significantly more confident than Gemini for this image.'
    };
  }

  return geminiDetection;
};

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

  const geminiDetection = await detectPlantWithGemini(payload);
  let mlDetection = null;

  if (!isReliableDetection(geminiDetection)) {
    mlDetection = await invokeML('/predict/plant', payload);
  }

  const detection = chooseDetection(geminiDetection, mlDetection);
  if (!detection) throw new ApiError(StatusCodes.BAD_GATEWAY, 'Plant detection service is unavailable');

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
