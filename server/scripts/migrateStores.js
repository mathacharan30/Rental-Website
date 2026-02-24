/**
 * scripts/migrateStores.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time migration: for every store_owner User that has no storeId, find or
 * create the matching Store document and link it back.
 *
 * Run once from /server:
 *   node scripts/migrateStores.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const connectDB = require('../config/db');
const User  = require('../models/User');
const Store = require('../models/Store');

(async () => {
  await connectDB();

  // Find all store_owners missing a storeId
  const owners = await User.find({ role: 'store_owner', $or: [{ storeId: null }, { storeId: { $exists: false } }] });

  if (owners.length === 0) {
    console.log('[migrate] All store owners already have a storeId. Nothing to do.');
    process.exit(0);
  }

  console.log(`[migrate] Found ${owners.length} store owner(s) without a storeId.\n`);

  let fixed = 0;
  let skipped = 0;

  for (const owner of owners) {
    if (!owner.storeName) {
      console.warn(`  [skip] User ${owner.email} has no storeName – skipping.`);
      skipped++;
      continue;
    }

    // Find or create the Store document
    let store = await Store.findOne({ slug: owner.storeName });
    if (!store) {
      store = await Store.create({ name: owner.name || owner.storeName, slug: owner.storeName, owner: owner._id });
      console.log(`  [created] Store "${store.slug}" (_id: ${store._id}) for user ${owner.email}`);
    } else {
      console.log(`  [found]   Store "${store.slug}" (_id: ${store._id}) for user ${owner.email}`);
    }

    owner.storeId = store._id;
    await owner.save();
    console.log(`  [linked]  storeId set on User ${owner.email}\n`);
    fixed++;
  }

  console.log('─────────────────────────────────');
  console.log(`✅  Migration complete.`);
  console.log(`   Fixed   : ${fixed}`);
  console.log(`   Skipped : ${skipped}`);
  console.log('─────────────────────────────────\n');
  process.exit(0);
})().catch((err) => {
  console.error('[migrate] Fatal error:', err.message);
  process.exit(1);
});
