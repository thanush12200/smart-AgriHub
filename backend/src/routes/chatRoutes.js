const express = require('express');
const { askChatbot } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/query', protect, askChatbot);

module.exports = router;
