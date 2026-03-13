/**
 * scripts/migrateImagesToS3.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time migration: downloads every image referenced in MongoDB (Products,
 * Banners, Categories) from their current Cloudinary URLs, uploads them to
 * AWS S3, and updates the MongoDB documents with the new S3 URLs + keys.
 *
 * Usage (from /server):
 *
 *   node scripts/migrateImagesToS3.js
 *
 * Add --dry-run to see what would be migrated without making changes:
 *
 *   node scripts/migrateImagesToS3.js --dry-run
 *
 * Prerequisites:
 *   .env must contain MONGODB_URI, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
 *   AWS_REGION, S3_BUCKET_NAME.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const https = require('https');
const http = require('http');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const connectDB = require('../config/db');
const { s3, S3_BUCKET } = require('../config/s3');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Category = require('../models/Category');

const DRY_RUN = process.argv.includes('--dry-run');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Download a file from a URL into a Buffer.
 */
function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Guess content type from URL or extension.
 */
function guessContentType(url) {
  const lower = url.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.gif')) return 'image/gif';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.svg')) return 'image/svg+xml';
  return 'image/jpeg'; // default
}

/**
 * Extract a usable filename from a Cloudinary URL or publicId.
 * e.g. "products/1700000000-shirt" → "1700000000-shirt"
 */
function extractFilename(publicIdOrUrl) {
  // Try to get the last segment of the publicId
  const parts = publicIdOrUrl.split('/');
  return parts[parts.length - 1];
}

/**
 * Upload a buffer to S3 and return { url, key }.
 */
async function uploadToS3(buffer, folder, filename, contentType) {
  const key = `${folder}/${filename}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  const url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { url, key };
}

/**
 * Migrate a single image: download from old URL → upload to S3 → return new { url, key }.
 * Returns null if the image URL is already an S3 URL (skip).
 */
async function migrateImage(oldUrl, oldPublicId, folder) {
  // Skip if already an S3 URL
  if (oldUrl && oldUrl.includes('.s3.') && oldUrl.includes('amazonaws.com')) {
    return null;
  }

  if (!oldUrl) return null;

  const contentType = guessContentType(oldUrl);
  const baseName = extractFilename(oldPublicId || oldUrl);
  // Add an extension if the basename doesn't have one
  const hasExt = /\.\w{3,4}$/.test(baseName);
  const ext = hasExt ? '' : (contentType === 'image/png' ? '.png' : contentType === 'image/webp' ? '.webp' : '.jpg');
  const filename = `${baseName}${ext}`;

  const buffer = await downloadBuffer(oldUrl);
  const { url, key } = await uploadToS3(buffer, folder, filename, contentType);
  return { url, key };
}

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  await connectDB();
  console.log(DRY_RUN ? '\n🔍  DRY RUN MODE – no changes will be made\n' : '\n🚀  Starting migration to AWS S3…\n');

  let migratedProducts = 0;
  let migratedBanners = 0;
  let migratedCategories = 0;
  let migratedImages = 0;
  let skippedImages = 0;
  let failedImages = 0;

  // ── 1. Migrate Product images ──────────────────────────────────────────

  const products = await Product.find();
  console.log(`📦  Found ${products.length} product(s)\n`);

  for (const product of products) {
    if (!product.images || product.images.length === 0) continue;

    let changed = false;
    const newImages = [];

    for (const img of product.images) {
      try {
        const result = await migrateImage(img.url, img.publicId, 'products');
        if (result) {
          newImages.push({ url: result.url, publicId: result.key });
          migratedImages++;
          changed = true;
          console.log(`  ✅  [product "${product.name}"] ${img.publicId} → ${result.key}`);
        } else {
          newImages.push(img); // keep existing (already S3 or no URL)
          skippedImages++;
          console.log(`  ⏭️  [product "${product.name}"] ${img.publicId} (already S3 or empty)`);
        }
      } catch (err) {
        console.error(`  ❌  [product "${product.name}"] Failed ${img.publicId}: ${err.message}`);
        newImages.push(img); // keep old on failure
        failedImages++;
      }
    }

    if (changed && !DRY_RUN) {
      product.images = newImages;
      await product.save();
      migratedProducts++;
    }
  }

  // ── 2. Migrate Banner images ───────────────────────────────────────────

  const banners = await Banner.find();
  console.log(`\n🖼️   Found ${banners.length} banner(s)\n`);

  for (const banner of banners) {
    if (!banner.imageUrl) continue;

    try {
      const result = await migrateImage(banner.imageUrl, banner.imagePublicId, 'banners');
      if (result) {
        console.log(`  ✅  [banner "${banner.title || banner._id}"] ${banner.imagePublicId} → ${result.key}`);
        if (!DRY_RUN) {
          banner.imageUrl = result.url;
          banner.imagePublicId = result.key;
          await banner.save();
        }
        migratedBanners++;
        migratedImages++;
      } else {
        console.log(`  ⏭️  [banner "${banner.title || banner._id}"] (already S3 or empty)`);
        skippedImages++;
      }
    } catch (err) {
      console.error(`  ❌  [banner "${banner.title || banner._id}"] Failed: ${err.message}`);
      failedImages++;
    }
  }

  // ── 3. Migrate Category images ─────────────────────────────────────────

  const categories = await Category.find();
  console.log(`\n📂  Found ${categories.length} category(ies)\n`);

  for (const category of categories) {
    if (!category.image || !category.image.url) continue;

    try {
      const result = await migrateImage(category.image.url, category.image.publicId, 'categories');
      if (result) {
        console.log(`  ✅  [category "${category.name}"] ${category.image.publicId} → ${result.key}`);
        if (!DRY_RUN) {
          category.image.url = result.url;
          category.image.publicId = result.key;
          await category.save();
        }
        migratedCategories++;
        migratedImages++;
      } else {
        console.log(`  ⏭️  [category "${category.name}"] (already S3 or empty)`);
        skippedImages++;
      }
    } catch (err) {
      console.error(`  ❌  [category "${category.name}"] Failed: ${err.message}`);
      failedImages++;
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════');
  console.log(DRY_RUN ? '🔍  DRY RUN SUMMARY' : '✅  MIGRATION COMPLETE');
  console.log('═══════════════════════════════════════');
  console.log(`  Products updated : ${migratedProducts}`);
  console.log(`  Banners updated  : ${migratedBanners}`);
  console.log(`  Categories updated: ${migratedCategories}`);
  console.log(`  Images migrated  : ${migratedImages}`);
  console.log(`  Images skipped   : ${skippedImages}`);
  if (failedImages > 0) {
    console.log(`  Images FAILED    : ${failedImages}`);
  }
  console.log('═══════════════════════════════════════\n');

  process.exit(0);
})().catch((err) => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});
