const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema(
  {
    schemeCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    ministry: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'income_support',
        'insurance',
        'irrigation',
        'credit',
        'infrastructure',
        'organic_farming',
        'market_linkage',
        'mechanization',
        'pension',
        'fpo_support',
        'food_processing',
        'horticulture',
        'sustainable_farming'
      ]
    },
    summary: { type: String, required: true, trim: true },
    benefits: [{ type: String, trim: true }],
    eligibility: [{ type: String, trim: true }],
    requiredDocuments: [{ type: String, trim: true }],
    applicationMode: { type: String, enum: ['online', 'offline', 'both'], default: 'online' },
    officialUrl: { type: String, required: true, trim: true },
    states: [{ type: String, trim: true, default: 'All India' }],
    tags: [{ type: String, trim: true, lowercase: true }],
    isActive: { type: Boolean, default: true },
    lastVerifiedOn: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

governmentSchemeSchema.index({ category: 1, applicationMode: 1, isActive: 1 });
governmentSchemeSchema.index({ title: 'text', summary: 'text', ministry: 'text', tags: 'text' });

module.exports = mongoose.model('GovernmentScheme', governmentSchemeSchema);
