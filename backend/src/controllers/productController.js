const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Product = require('../models/Product');
const { ensureProductsSeeded } = require('../services/productService');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const mapProduct = (doc) => ({
  id: doc.productCode,
  productCode: doc.productCode,
  name: doc.name,
  category: doc.category,
  brand: doc.brand,
  price: doc.price,
  unit: doc.unit,
  stock: doc.stock,
  rating: doc.rating,
  description: doc.description,
  image: doc.image,
  isActive: doc.isActive
});

const listProducts = asyncHandler(async (req, res) => {
  await ensureProductsSeeded();

  const { search = '', category = 'All', sort = 'featured', page = '1', limit = '60' } = req.query;

  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedLimit = Math.min(200, Math.max(1, Number.parseInt(limit, 10) || 60));
  const skip = (parsedPage - 1) * parsedLimit;

  const filter = { isActive: true };
  const searchValue = String(search).trim();
  const categoryValue = String(category).trim();

  if (categoryValue && categoryValue !== 'All') {
    filter.category = categoryValue;
  }

  if (searchValue) {
    const rx = new RegExp(escapeRegex(searchValue), 'i');
    filter.$or = [{ name: rx }, { brand: rx }, { category: rx }, { description: rx }, { productCode: rx }];
  }

  const sortKey = String(sort || 'featured').trim();
  const sortMap = {
    featured: { rating: -1, stock: -1, name: 1 },
    price_asc: { price: 1, name: 1 },
    price_desc: { price: -1, name: 1 },
    rating: { rating: -1, name: 1 },
    stock: { stock: -1, name: 1 }
  };

  const sortSpec = sortMap[sortKey] || sortMap.featured;

  const [docs, total, categories] = await Promise.all([
    Product.find(filter).sort(sortSpec).skip(skip).limit(parsedLimit).lean(),
    Product.countDocuments(filter),
    Product.distinct('category', { isActive: true })
  ]);

  res.status(StatusCodes.OK).json({
    products: docs.map(mapProduct),
    meta: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.max(1, Math.ceil(total / parsedLimit))
    },
    categories: categories.sort()
  });
});

const getProduct = asyncHandler(async (req, res) => {
  await ensureProductsSeeded();

  const productCode = String(req.params.productCode || '').trim();
  if (!productCode) throw new ApiError(StatusCodes.BAD_REQUEST, 'productCode is required');

  const doc = await Product.findOne({ productCode, isActive: true }).lean();
  if (!doc) throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');

  res.status(StatusCodes.OK).json({ product: mapProduct(doc) });
});

module.exports = { listProducts, getProduct };

