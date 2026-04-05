const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

const generateOrderId = () => {
  return 'ORD-' + crypto.randomBytes(6).toString('hex').toUpperCase();
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

  // Atomic stock reservation — prevents overselling race condition
  for (const item of items) {
    const product = await Product.findOneAndUpdate(
      {
        productCode: item.productCode,
        isActive: true,
        stock: { $gte: item.quantity } // atomic guard
      },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!product) {
      // Rollback previously reserved items
      for (const prev of processedItems) {
        await Product.updateOne(
          { productCode: prev.productCode },
          { $inc: { stock: prev.quantity } }
        );
      }
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Product ${item.productCode} not found, inactive, or insufficient stock`
      );
    }

    totalAmount += product.price * item.quantity;
    processedItems.push({
      productCode: product.productCode,
      name: product.name,
      price: product.price,
      quantity: item.quantity
    });
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
