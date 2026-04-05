/**
 * Format a number as Indian Rupees (₹).
 * @param {number} value
 * @returns {string}
 */
export const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
