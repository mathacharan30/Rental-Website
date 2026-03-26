/**
 * scripts/purgeUntypedBanners.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time cleanup: deletes all Banner records that have no `type` field
 * (legacy records created before the type field was added), and removes
 * their images from S3.
 *
 * Run once from /server:
 *   node scripts/purgeUntypedBanners.js
 *
 * Requires a valid .env with MONGODB_URI, AWS_ACCESS_KEY_ID,
 * AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const connectDB        = require('../config/db');
const { deleteFromS3 } = require('../config/s3');
const Banner           = require('../models/Banner');

(async () => {
  await connectDB();

  const stale = await Banner.find({
    $or: [{ type: null }, { type: { $exists: false } }],
  });

  if (stale.length === 0) {
    console.log('[purge] No untyped banners found. Nothing to do.');
    process.exit(0);
  }

  console.log(`[purge] Found ${stale.length} untyped banner(s). Starting cleanup…\n`);

  let deleted = 0;
  let s3Fails = 0;

  for (const banner of stale) {
    try {
      await deleteFromS3(banner.imagePublicId);
      console.log(`  [s3]    ✓ Deleted ${banner.imagePublicId}`);
    } catch (err) {
      console.warn(`  [s3]    ✗ Failed to delete ${banner.imagePublicId}: ${err.message}`);
      s3Fails++;
    }

    await banner.deleteOne();
    console.log(`  [mongo] ✓ Deleted banner ${banner._id}`);
    deleted++;
  }

  console.log('\n─────────────────────────────────');
  console.log('✅  Done.');
  console.log(`   Banners deleted : ${deleted}`);
  if (s3Fails > 0) {
    console.log(`   S3 failures     : ${s3Fails} (check S3 manually for those keys)`);
  }
  console.log('─────────────────────────────────\n');

  process.exit(0);
})().catch((err) => {
  console.error('[purge] Fatal error:', err.message);
  process.exit(1);
});

