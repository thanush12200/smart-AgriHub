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
  language: user.language,
  isDemo: user.isDemo || false
});

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, region, language } = req.body;
  if (!name || !email || !password) throw new ApiError(StatusCodes.BAD_REQUEST, 'name, email and password are required');
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(StatusCodes.CONFLICT, 'Email already registered');
  const user = await User.create({ name, email, password, region, language, role: 'farmer' });
  const token = signToken(user);
  res.status(StatusCodes.CREATED).json({ token, user: buildAuthResponse(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(StatusCodes.BAD_REQUEST, 'email and password are required');
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been blocked. Contact admin.');
  const token = signToken(user);
  res.status(StatusCodes.OK).json({ token, user: buildAuthResponse(user) });
});

const me = asyncHandler(async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, region, language } = req.body;
  const updates = {};
  if (name?.trim()) updates.name = name.trim();
  if (region?.trim()) updates.region = region.trim();
  if (language?.trim()) updates.language = language.trim();

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.status(StatusCodes.OK).json({ user: buildAuthResponse(user) });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(StatusCodes.BAD_REQUEST, 'currentPassword and newPassword are required');
  if (newPassword.length < 6) throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be at least 6 characters');

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect');

  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ message: 'Password changed successfully' });
});

module.exports = { signup, login, me, updateProfile, changePassword };
