/**
 * Escape special regex characters in a string for safe use in `new RegExp()`.
 */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { escapeRegex };
