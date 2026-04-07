/**
 * migrate-s3-urls.js
 *
 * Migrates all S3 image URLs from the old Sydney bucket to the new Mumbai bucket
 * across all specified MongoDB collections.
 *
 * Old: https://people-and-style-assets.s3.ap-southeast-2.amazonaws.com/
 * New: https://people-and-style-assets-mumbai.s3.ap-south-1.amazonaws.com/
 *
 * Usage:
 *   Set DRY_RUN = true  → preview changes without writing
 *   Set DRY_RUN = false → apply changes to the database
 */

require("dotenv").config();
const mongoose = require("mongoose");

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = false; // ← flip to false to apply changes

const OLD_URL = "https://people-and-style-assets.s3.ap-southeast-2.amazonaws.com/";
const NEW_URL = "https://people-and-style-assets-mumbai.s3.ap-south-1.amazonaws.com/";

const COLLECTIONS = [
  "products",
  "banners",
  "categories",
  "invoices",
  "producttestimonials",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Recursively walks a plain JS value (object / array / string / primitive)
 * and replaces every occurrence of OLD_URL with NEW_URL in string values.
 *
 * Returns { updated, changed } where:
 *   updated  — the transformed value (may be the same reference if nothing changed)
 *   changed  — true if at least one string was modified
 */
function replaceUrls(value) {
  if (typeof value === "string") {
    if (value.includes(OLD_URL)) {
      return { updated: value.split(OLD_URL).join(NEW_URL), changed: true };
    }
    return { updated: value, changed: false };
  }

  if (Array.isArray(value)) {
    let anyChanged = false;
    const updated = value.map((item) => {
      const result = replaceUrls(item);
      if (result.changed) anyChanged = true;
      return result.updated;
    });
    return { updated: anyChanged ? updated : value, changed: anyChanged };
  }

  if (value !== null && typeof value === "object") {
    let anyChanged = false;
    const updated = {};
    for (const key of Object.keys(value)) {
      const result = replaceUrls(value[key]);
      if (result.changed) anyChanged = true;
      updated[key] = result.updated;
    }
    return { updated: anyChanged ? updated : value, changed: anyChanged };
  }

  // number, boolean, null, undefined — unchanged
  return { updated: value, changed: false };
}

/**
 * Collect a flat list of sample before/after pairs for display.
 * Stops collecting once we have maxSamples entries.
 */
function collectSamples(original, transformed, samples, max = 5) {
  if (samples.length >= max) return;

  if (typeof original === "string" && original.includes(OLD_URL)) {
    samples.push({ before: original, after: transformed });
    return;
  }

  if (Array.isArray(original)) {
    for (let i = 0; i < original.length && samples.length < max; i++) {
      collectSamples(original[i], transformed[i], samples, max);
    }
    return;
  }

  if (original !== null && typeof original === "object") {
    for (const key of Object.keys(original)) {
      if (samples.length >= max) break;
      collectSamples(original[key], transformed[key], samples, max);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("ERROR: MONGODB_URI is not set in environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("Connected.\n");

  const db = mongoose.connection.db;

  let totalScanned = 0;
  let totalChanged = 0;
  const allSamples = [];

  for (const collectionName of COLLECTIONS) {
    console.log(`\n── Collection: ${collectionName} ──`);

    // Confirm the collection exists (listCollections is cheap)
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();

    if (collections.length === 0) {
      console.log(`  [SKIP] Collection "${collectionName}" does not exist.`);
      continue;
    }

    const collection = db.collection(collectionName);

    // Fetch all documents and filter in JS — Atlas free tier does not allow $where.
    const cursor = collection.find({});

    const bulkOps = [];
    let collectionScanned = 0;
    let collectionChanged = 0;
    const collectionSamples = [];

    await cursor.forEach((doc) => {
      // Quick pre-check: skip docs that definitely don't have the old URL
      if (!JSON.stringify(doc).includes(OLD_URL)) return;

      collectionScanned++;
      totalScanned++;

      // Convert Mongoose _id and other BSON types to plain JS so our walker
      // can traverse them; we'll rebuild the update from the transformed plain object.
      const plain = JSON.parse(JSON.stringify(doc));
      const { updated: transformedDoc, changed } = replaceUrls(plain);

      if (!changed) return; // safety guard — $where should have filtered these out

      collectionChanged++;
      totalChanged++;

      if (collectionSamples.length < 3) {
        collectSamples(plain, transformedDoc, collectionSamples, 3);
      }

      if (!DRY_RUN) {
        // Build a $set payload from only the top-level fields that changed so we
        // don't accidentally overwrite fields touched by concurrent writes.
        const setPayload = {};
        for (const key of Object.keys(transformedDoc)) {
          // Skip _id — MongoDB doesn't allow updating _id
          if (key === "_id") continue;

          // Only include fields that differ
          if (
            JSON.stringify(transformedDoc[key]) !== JSON.stringify(plain[key])
          ) {
            setPayload[key] = transformedDoc[key];
          }
        }

        bulkOps.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: setPayload },
          },
        });
      }
    });

    console.log(`  Matched : ${collectionScanned} document(s) with old URL`);
    console.log(`  Changed : ${collectionChanged} document(s)`);

    if (DRY_RUN) {
      console.log(`  [DRY RUN] No writes performed.`);
    } else if (bulkOps.length > 0) {
      const result = await collection.bulkWrite(bulkOps, { ordered: false });
      console.log(
        `  bulkWrite → matched: ${result.matchedCount}, modified: ${result.modifiedCount}`
      );
    } else {
      console.log(`  Nothing to write.`);
    }

    allSamples.push(...collectionSamples);
  }

  // ─── Summary ───────────────────────────────────────────────────────────────

  console.log("\n══════════════════════════════════════════════");
  console.log("  MIGRATION SUMMARY");
  console.log("══════════════════════════════════════════════");
  console.log(`  Mode              : ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`  Total matched     : ${totalScanned} document(s) containing old URL`);
  console.log(`  Total to change   : ${totalChanged} document(s)`);

  if (allSamples.length > 0) {
    const displayCount = Math.min(5, allSamples.length);
    console.log(`\n  Sample replacements (showing ${displayCount}):`);
    for (let i = 0; i < displayCount; i++) {
      const s = allSamples[i];
      console.log(`\n  [${i + 1}] BEFORE: ${s.before}`);
      console.log(`       AFTER : ${s.after}`);
    }
  } else {
    console.log("\n  No matching URLs found across the scanned collections.");
  }

  console.log("\n══════════════════════════════════════════════\n");

  if (DRY_RUN && totalChanged > 0) {
    console.log(
      "  To apply these changes, set  DRY_RUN = false  and re-run the script.\n"
    );
  }

  await mongoose.disconnect();
  console.log("Disconnected. Done.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
