const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');

const allowRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: access denied'));
  }
  next();
};

module.exports = { allowRoles };
