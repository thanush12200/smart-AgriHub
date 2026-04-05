const Product = require('../models/Product');
const { marketplaceProductsSeed } = require('../data/marketplaceProductsSeed');

let seedingPromise = null;

const ensureProductsSeeded = async () => {
  if (seedingPromise) {
    await seedingPromise;
    return;
  }

  seedingPromise = (async () => {
    // Always upsert so that changes to images/fields in the seed file propagate
    await Promise.all(
      marketplaceProductsSeed.map((product) =>
        Product.findOneAndUpdate(
          { productCode: product.productCode },
          { $set: product },
          { upsert: true, new: true }
        )
      )
    );
  })();

  try {
    await seedingPromise;
  } finally {
    seedingPromise = null;
  }
};

module.exports = { ensureProductsSeeded };

