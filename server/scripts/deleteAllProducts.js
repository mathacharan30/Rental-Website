/**
 * scripts/deleteAllProducts.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Deletes every product from MongoDB and purges their images from AWS S3.
 * Run once from /server:
 *
 *   node scripts/deleteAllProducts.js
 *
 * Optional – delete products of a single store only:
 *
 *   node scripts/deleteAllProducts.js --store=my-store-slug
 *
 * Requires a valid .env with MONGODB_URI, AWS_ACCESS_KEY_ID,
 * AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const connectDB      = require('../config/db');
const { deleteFromS3 } = require('../config/s3');
const Product        = require('../models/Product');

// Optional --store=<slug> argument
const storeArg = process.argv.find((a) => a.startsWith('--store='));
const filterStore = storeArg ? storeArg.split('=')[1] : null;

(async () => {
  await connectDB();

  // resolve slug → storeId if --store flag was given
  let query = {};
  if (filterStore) {
    const Store = require('../models/Store');
    const store = await Store.findOne({ slug: filterStore });
    if (!store) {
      console.log(`[delete] No store found with slug "${filterStore}".`);
      process.exit(0);
    }
    query = { store: store._id };
  }
  const label = filterStore ? `store "${filterStore}"` : 'all stores';

  const products = await Product.find(query);

  if (products.length === 0) {
    console.log(`[delete] No products found for ${label}.`);
    process.exit(0);
  }

  console.log(`[delete] Found ${products.length} product(s) for ${label}. Starting cleanup…\n`);

  let deletedProducts = 0;
  let deletedImages   = 0;
  let failedImages    = 0;

  for (const product of products) {
    // 1. Delete images from S3
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        try {
          await deleteFromS3(img.publicId);
          console.log(`  [s3] ✓ Deleted image ${img.publicId}`);
          deletedImages++;
        } catch (err) {
          console.warn(`  [s3] ✗ Failed to delete ${img.publicId}: ${err.message}`);
          failedImages++;
        }
      }
    }

    // 2. Delete product from MongoDB
    await product.deleteOne();
    console.log(`  [mongo]      ✓ Deleted product "${product.name}" (${product._id})`);
    deletedProducts++;
  }

  console.log('\n─────────────────────────────────');
  console.log(`✅  Done.`);
  console.log(`   Products deleted : ${deletedProducts}`);
  console.log(`   Images deleted   : ${deletedImages}`);
  if (failedImages > 0) {
    console.log(`   Image failures  : ${failedImages} (manual cleanup may be needed in S3)`);
  }
  console.log('─────────────────────────────────\n');

  process.exit(0);
})().catch((err) => {
  console.error('[delete] Fatal error:', err.message);
  process.exit(1);
});
