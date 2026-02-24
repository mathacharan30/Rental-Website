/**
 * scripts/deleteAllProducts.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Deletes every product from MongoDB and purges their images from Cloudinary.
 * Run once from /server:
 *
 *   node scripts/deleteAllProducts.js
 *
 * Optional – delete products of a single store only:
 *
 *   node scripts/deleteAllProducts.js --store=my-store-slug
 *
 * Requires a valid .env with MONGODB_URI, CLOUDINARY_CLOUD_NAME,
 * CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const connectDB  = require('../config/db');
const cloudinary = require('../config/cloudinary');
const Product    = require('../models/Product');

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
    // 1. Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
          console.log(`  [cloudinary] ✓ Deleted image ${img.publicId}`);
          deletedImages++;
        } catch (err) {
          console.warn(`  [cloudinary] ✗ Failed to delete ${img.publicId}: ${err.message}`);
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
    console.log(`   Image failures  : ${failedImages} (manual cleanup may be needed in Cloudinary)`);
  }
  console.log('─────────────────────────────────\n');

  process.exit(0);
})().catch((err) => {
  console.error('[delete] Fatal error:', err.message);
  process.exit(1);
});
