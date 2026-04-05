const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const FarmJournal = require('../models/FarmJournal');

const getEntries = asyncHandler(async (req, res) => {
  const { type, search } = req.query;
  const filter = { farmer: req.user._id };
  
  if (type && type !== 'all') filter.activityType = type;
  if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { notes: new RegExp(search, 'i') }, { cropName: new RegExp(search, 'i') }];

  const entries = await FarmJournal.find(filter).sort({ date: -1, createdAt: -1 });
  res.status(StatusCodes.OK).json({ entries });
});

const createEntry = asyncHandler(async (req, res) => {
  const { title, date, activityType, cropName, notes } = req.body;
  if (!title) res.status(StatusCodes.BAD_REQUEST).json({ message: 'Title is required' });

  const entry = await FarmJournal.create({
    farmer: req.user._id,
    title,
    date: date || new Date(),
    activityType,
    cropName,
    notes
  });

  res.status(StatusCodes.CREATED).json({ entry });
});

const updateEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const entry = await FarmJournal.findOneAndUpdate(
    { _id: id, farmer: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!entry) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Journal entry not found' });
  }

  res.status(StatusCodes.OK).json({ entry });
});

const deleteEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const entry = await FarmJournal.findOneAndDelete({ _id: id, farmer: req.user._id });
  
  if (!entry) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Journal entry not found' });
  }

  res.status(StatusCodes.OK).json({ message: 'Entry deleted successfully' });
});

module.exports = { getEntries, createEntry, updateEntry, deleteEntry };
