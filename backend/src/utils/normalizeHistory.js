/**
 * Normalize a Gemini-style chat history array.
 * Ensures each entry has a valid role and non-empty parts.
 * Limits to the last 16 entries and truncates individual texts to 900 chars.
 */
const normalizeHistory = (history) => {
  if (!Array.isArray(history)) return [];

  return history
    .map((item) => {
      const role = item?.role === 'model' ? 'model' : 'user';
      const parts = Array.isArray(item?.parts)
        ? item.parts
            .map((part) => String(part?.text || '').trim())
            .filter(Boolean)
            .slice(0, 2)
            .map((text) => ({ text: text.slice(0, 900) }))
        : [];

      if (!parts.length) return null;
      return { role, parts };
    })
    .filter(Boolean)
    .slice(-16);
};

module.exports = { normalizeHistory };
