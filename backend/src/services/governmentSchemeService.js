const GovernmentScheme = require('../models/GovernmentScheme');
const { governmentSchemesSeed } = require('../data/governmentSchemesSeed');

let seedingPromise = null;

const ensureGovernmentSchemesSeeded = async () => {
  if (seedingPromise) {
    await seedingPromise;
    return;
  }

  seedingPromise = (async () => {
    const count = await GovernmentScheme.estimatedDocumentCount();
    if (count > 0) return;

    await GovernmentScheme.insertMany(governmentSchemesSeed, { ordered: false });
  })();

  try {
    await seedingPromise;
  } finally {
    seedingPromise = null;
  }
};

module.exports = { ensureGovernmentSchemesSeeded };
