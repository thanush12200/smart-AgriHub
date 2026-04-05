const mongoose = require('mongoose');

const farmJournalSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    activityType: {
      type: String,
      enum: ['sowing', 'irrigation', 'pesticide', 'fertilizer', 'harvest', 'other'],
      default: 'other'
    },
    cropName: { type: String, trim: true },
    notes: { type: String, default: '' },
    attachedPredictionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PredictionLog' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FarmJournal', farmJournalSchema);
