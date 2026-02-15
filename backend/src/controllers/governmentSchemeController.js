const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const GovernmentScheme = require('../models/GovernmentScheme');
const { ensureGovernmentSchemesSeeded } = require('../services/governmentSchemeService');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listSchemes = asyncHandler(async (req, res) => {
  await ensureGovernmentSchemesSeeded();

  const {
    search = '',
    category = '',
    state = '',
    mode = '',
    page = '1',
    limit = '20'
  } = req.query;

  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const filter = { isActive: true };
  const searchValue = String(search).trim();
  const categoryValue = String(category).trim();
  const stateValue = String(state).trim();
  const modeValue = String(mode).trim();

  if (categoryValue && categoryValue.toLowerCase() !== 'all') {
    filter.category = categoryValue;
  }

  if (modeValue && modeValue.toLowerCase() !== 'all') {
    filter.applicationMode = modeValue;
  }

  if (stateValue && stateValue.toLowerCase() !== 'all india' && stateValue.toLowerCase() !== 'all') {
    filter.states = { $in: [new RegExp(`^${escapeRegex(stateValue)}$`, 'i'), 'All India'] };
  }

  if (searchValue) {
    const searchRegex = new RegExp(escapeRegex(searchValue), 'i');
    filter.$or = [
      { title: searchRegex },
      { summary: searchRegex },
      { ministry: searchRegex },
      { tags: searchRegex }
    ];
  }

  const [schemes, total, categories] = await Promise.all([
    GovernmentScheme.find(filter)
      .sort({ title: 1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    GovernmentScheme.countDocuments(filter),
    GovernmentScheme.distinct('category', { isActive: true })
  ]);

  res.status(StatusCodes.OK).json({
    schemes,
    meta: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.max(1, Math.ceil(total / parsedLimit))
    },
    filters: {
      search: searchValue,
      category: categoryValue || 'all',
      state: stateValue || 'all',
      mode: modeValue || 'all'
    },
    categories: categories.sort()
  });
});

const getSchemeByCode = asyncHandler(async (req, res) => {
  await ensureGovernmentSchemesSeeded();

  const schemeCode = String(req.params.schemeCode || '').trim().toUpperCase();
  if (!schemeCode) throw new ApiError(StatusCodes.BAD_REQUEST, 'schemeCode is required');

  const scheme = await GovernmentScheme.findOne({ schemeCode, isActive: true }).lean();
  if (!scheme) throw new ApiError(StatusCodes.NOT_FOUND, 'Scheme not found');

  res.status(StatusCodes.OK).json({ scheme });
});

module.exports = { listSchemes, getSchemeByCode };
