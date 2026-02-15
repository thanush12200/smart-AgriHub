const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Product = require('../models/Product');
const { ensureProductsSeeded } = require('../services/productService');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 24);

const listAdminProducts = asyncHandler(async (req, res) => {
  await ensureProductsSeeded();

  const { search = '', category = 'All', includeInactive = 'true', page = '1', limit = '80' } = req.query;
  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedLimit = Math.min(200, Math.max(1, Number.parseInt(limit, 10) || 80));
  const skip = (parsedPage - 1) * parsedLimit;

  const filter = {};
  const searchValue = String(search).trim();
  const categoryValue = String(category).trim();
  const includeInactiveValue = String(includeInactive).toLowerCase() !== 'false';

  if (!includeInactiveValue) filter.isActive = true;
  if (categoryValue && categoryValue !== 'All') filter.category = categoryValue;

  if (searchValue) {
    const rx = new RegExp(escapeRegex(searchValue), 'i');
    filter.$or = [{ name: rx }, { brand: rx }, { category: rx }, { description: rx }, { productCode: rx }];
  }

  const [docs, total, categories] = await Promise.all([
    Product.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(parsedLimit).lean(),
    Product.countDocuments(filter),
    Product.distinct('category')
  ]);

  res.status(StatusCodes.OK).json({
    products: docs,
    meta: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.max(1, Math.ceil(total / parsedLimit))
    },
    categories: categories.sort()
  });
});

const createProduct = asyncHandler(async (req, res) => {
  await ensureProductsSeeded();

  const {
    productCode,
    name,
    category,
    brand = '',
    price,
    unit = 'unit',
    stock = 0,
    rating = 4.5,
    description = '',
    image = ''
  } = req.body;

  if (!name || !category || price === undefined) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'name, category and price are required');
  }

  const cleanedCode = String(productCode || '').trim();
  const baseCode = `${slugify(category).slice(0, 8) || 'prod'}-${slugify(name).slice(0, 12) || 'item'}`;
  const generated = `${baseCode}-${Date.now().toString(36)}`;

  const finalCode = cleanedCode || generated;

  const created = await Product.create({
    productCode: finalCode,
    name: String(name).trim(),
    category: String(category).trim(),
    brand: String(brand || '').trim(),
    price: Number(price),
    unit: String(unit || 'unit').trim(),
    stock: Math.max(0, Number(stock) || 0),
    rating: Math.max(0, Math.min(5, Number(rating) || 0)),
    description: String(description || '').trim(),
    image: String(image || '').trim(),
    isActive: true,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  res.status(StatusCodes.CREATED).json({ product: created });
});

const updateProduct = asyncHandler(async (req, res) => {
  const productCode = String(req.params.productCode || '').trim();
  if (!productCode) throw new ApiError(StatusCodes.BAD_REQUEST, 'productCode is required');

  const allowedFields = [
    'name',
    'category',
    'brand',
    'price',
    'unit',
    'stock',
    'rating',
    'description',
    'image',
    'isActive'
  ];

  const updates = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.stock !== undefined) updates.stock = Math.max(0, Number(updates.stock) || 0);
  if (updates.rating !== undefined) updates.rating = Math.max(0, Math.min(5, Number(updates.rating) || 0));
  updates.updatedBy = req.user._id;

  const updated = await Product.findOneAndUpdate({ productCode }, updates, { new: true });
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');

  res.status(StatusCodes.OK).json({ product: updated });
});

const deactivateProduct = asyncHandler(async (req, res) => {
  const productCode = String(req.params.productCode || '').trim();
  if (!productCode) throw new ApiError(StatusCodes.BAD_REQUEST, 'productCode is required');

  const updated = await Product.findOneAndUpdate(
    { productCode },
    { isActive: false, updatedBy: req.user._id },
    { new: true }
  );
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');

  res.status(StatusCodes.OK).json({ product: updated });
});

module.exports = { listAdminProducts, createProduct, updateProduct, deactivateProduct };

