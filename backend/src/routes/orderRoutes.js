const express = require('express');
const { placeOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', placeOrder);
router.get('/my', getMyOrders);

module.exports = router;
