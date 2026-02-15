const mongoose = require('mongoose');

const modelRegistrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    version: { type: String, required: true },
    fileUrl: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['staging', 'deployed', 'archived'], default: 'staging' },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ModelRegistry', modelRegistrySchema);
