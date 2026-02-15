const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    response: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    source: { type: String, enum: ['gemini_chat', 'gemini_vision', 'ml', 'rules'], default: 'rules' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatLog', chatLogSchema);
