const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { invokeML } = require('../services/mlClient');
const { askChatWithGemini } = require('../services/geminiService');
const ChatLog = require('../models/ChatLog');
const { normalizeHistory } = require('../utils/normalizeHistory');

const askChatbot = asyncHandler(async (req, res) => {
  const { message, prompt, context = [], history = [], language, region } = req.body;

  const userMessage = (prompt || message || '').trim();
  if (!userMessage) throw new ApiError(StatusCodes.BAD_REQUEST, 'message is required');

  const normalizedHistory = normalizeHistory(history);

  let response = await askChatWithGemini({
    prompt: userMessage,
    history: normalizedHistory,
    region: region || req.user.region,
    language: language || req.user.language
  });

  if (!response) {
    const mlContext = context.length
      ? context
      : normalizedHistory.flatMap((item) => item.parts.map((part) => part.text)).slice(-6);

    response = await invokeML('/chatbot/query', {
      message: userMessage,
      context: mlContext,
      region: req.user.region,
      language: req.user.language
    });
  }

  await ChatLog.create({
    user: req.user._id,
    message: userMessage,
    response: response.answer,
    confidence: response.confidence,
    source: response.source
  });

  res.status(StatusCodes.OK).json(response);
});

module.exports = { askChatbot };
