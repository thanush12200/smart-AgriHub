const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

const generateOrderId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ORD-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const placeOrder = asyncHandler(async (req, res) => {
  const { items, deliveryAddress, paymentMode = 'cod', notes } = req.body;

  if (!items || !items.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order must contain at least one item');
  }
  if (!deliveryAddress) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Delivery address is required');
  }

  let totalAmount = 0;
  const processedItems = [];

  // Verify stock and calculate total
  for (const item of items) {
    const product = await Product.findOne({ productCode: item.productCode, isActive: true });
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, `Product ${item.productCode} not found or inactive`);
    if (product.stock < item.quantity) throw new ApiError(StatusCodes.BAD_REQUEST, `Insufficient stock for ${product.name}`);

    totalAmount += product.price * item.quantity;
    processedItems.push({
      productCode: product.productCode,
      name: product.name,
      price: product.price,
      quantity: item.quantity
    });

    // Deduct stock
    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    farmer: req.user._id,
    orderId: generateOrderId(),
    items: processedItems,
    totalAmount,
    deliveryAddress,
    paymentMode,
    notes
  });

  res.status(StatusCodes.CREATED).json({ order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ farmer: req.user._id }).sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ orders });
});

module.exports = { placeOrder, getMyOrders };
