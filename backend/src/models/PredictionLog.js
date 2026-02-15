const mongoose = require('mongoose');

const predictionLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['crop', 'fertilizer', 'plant_detection'], required: true },
    input: { type: mongoose.Schema.Types.Mixed, required: true },
    output: { type: mongoose.Schema.Types.Mixed, required: true },
    confidence: { type: Number, min: 0, max: 1 },
    modelVersion: { type: String, default: 'v1' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PredictionLog', predictionLogSchema);
