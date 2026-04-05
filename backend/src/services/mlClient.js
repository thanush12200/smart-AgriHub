const axios = require('axios');
const ApiError = require('../utils/ApiError');
const { StatusCodes } = require('http-status-codes');

const mlApi = axios.create({
  baseURL: process.env.ML_SERVICE_URL,
  timeout: 40000
});

const invokeML = async (endpoint, payload) => {
  try {
    const { data } = await mlApi.post(endpoint, payload);
    return data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'ML service unavailable';
    throw new ApiError(StatusCodes.BAD_GATEWAY, message);
  }
};

module.exports = { invokeML };
