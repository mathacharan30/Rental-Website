/**
 * scripts/countProductsByCategory.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Prints a breakdown of product counts per category, plus a grand total.
 * Run from /server:
 *
 *   node scripts/countProductsByCategory.js
 *
 * Optional flags:
 *   --available-only   count only products where available === true
 *   --store=<slug>     restrict counts to a single store
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const connectDB  = require('../config/db');
const Category   = require('../models/Category');
const Product    = require('../models/Product');

const availableOnly = process.argv.includes('--available-only');
const storeArg      = process.argv.find((a) => a.startsWith('--store='));
const filterStore   = storeArg ? storeArg.split('=')[1] : null;

(async () => {
  await connectDB();

  let storeId = null;
  if (filterStore) {
    const Store = require('../models/Store');
    const store = await Store.findOne({ slug: filterStore });
    if (!store) {
      console.log(`[count] No store found with slug "${filterStore}".`);
      process.exit(0);
    }
    storeId = store._id;
  }

  const categories = await Category.find().sort({ name: 1 });

  const rows = [];
  let grandTotal = 0;

  for (const cat of categories) {
    const query = { category: cat._id };
    if (availableOnly) query.available = true;
    if (storeId)       query.store     = storeId;

    const count = await Product.countDocuments(query);
    rows.push({ name: cat.name, listingMode: cat.listingMode, count });
    grandTotal += count;
  }

  // Also catch products whose category reference is missing / deleted
  const orphanQuery = { category: { $nin: categories.map((c) => c._id) } };
  if (availableOnly) orphanQuery.available = true;
  if (storeId)       orphanQuery.store     = storeId;
  const orphanCount = await Product.countDocuments(orphanQuery);
  if (orphanCount > 0) {
    rows.push({ name: '(no category / orphaned)', listingMode: '—', count: orphanCount });
    grandTotal += orphanCount;
  }

  // ── Print table ────────────────────────────────────────────────────────────
  const COL_NAME  = Math.max(8, ...rows.map((r) => r.name.length));
  const COL_MODE  = 11;
  const COL_COUNT = 7;
  const sep = `${'─'.repeat(COL_NAME + 2)}┼${'─'.repeat(COL_MODE + 2)}┼${'─'.repeat(COL_COUNT + 2)}`;

  console.log();
  if (filterStore)   console.log(`  Store  : ${filterStore}`);
  if (availableOnly) console.log('  Filter : available products only');
  console.log();
  console.log(
    `  ${'Category'.padEnd(COL_NAME)}  │  ${'Listing mode'.padEnd(COL_MODE)}  │  ${'Count'.padStart(COL_COUNT)}`
  );
  console.log(`  ${sep}`);

  for (const row of rows) {
    console.log(
      `  ${row.name.padEnd(COL_NAME)}  │  ${row.listingMode.padEnd(COL_MODE)}  │  ${String(row.count).padStart(COL_COUNT)}`
    );
  }

  console.log(`  ${sep}`);
  console.log(
    `  ${'TOTAL'.padEnd(COL_NAME)}  │  ${''.padEnd(COL_MODE)}  │  ${String(grandTotal).padStart(COL_COUNT)}`
  );
  console.log();

  process.exit(0);
})().catch((err) => {
  console.error('[count] Fatal error:', err.message);
  process.exit(1);
});
