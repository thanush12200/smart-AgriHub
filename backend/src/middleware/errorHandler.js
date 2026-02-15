const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

const notFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({ message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`);
  const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  res.status(status).json({
    message: err.message || 'Internal server error'
  });
};

module.exports = { notFound, errorHandler };
