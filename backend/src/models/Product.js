const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productCode: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, trim: true, default: 'unit' },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    description: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', category: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1, stock: 1 });

module.exports = mongoose.model('Product', productSchema);

