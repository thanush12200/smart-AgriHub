const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const buildAuthResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  region: user.region,
  language: user.language
});

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, region, language } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'name, email and password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(StatusCodes.CONFLICT, 'Email already registered');

  const user = await User.create({ name, email, password, region, language, role: 'farmer' });
  const token = signToken(user);

  res.status(StatusCodes.CREATED).json({
    token,
    user: buildAuthResponse(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const token = signToken(user);

  res.status(StatusCodes.OK).json({
    token,
    user: buildAuthResponse(user)
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
});

module.exports = { signup, login, me };
