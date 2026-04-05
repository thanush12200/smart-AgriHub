const express = require('express');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const Announcement = require('../models/Announcement');

const router = express.Router();

const getPublicAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('createdBy', 'name'); // optionally show who created it
  res.status(StatusCodes.OK).json({ announcements });
});

router.get('/', getPublicAnnouncements);

module.exports = router;
