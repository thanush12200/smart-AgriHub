const Product = require('../models/Product');
const { marketplaceProductsSeed } = require('../data/marketplaceProductsSeed');

let seedingPromise = null;

const ensureProductsSeeded = async () => {
  if (seedingPromise) {
    await seedingPromise;
    return;
  }

  seedingPromise = (async () => {
    const count = await Product.estimatedDocumentCount();
    if (count > 0) return;

    await Product.insertMany(marketplaceProductsSeed, { ordered: false });
  })();

  try {
    await seedingPromise;
  } finally {
    seedingPromise = null;
  }
};

module.exports = { ensureProductsSeeded };

