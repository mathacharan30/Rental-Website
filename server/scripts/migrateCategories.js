// One-time migration: set listingMode and hasSizes on existing categories.
// Run with: node server/scripts/migrateCategories.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Jewels: both listing modes, no sizes
  const jewels = await Category.findOneAndUpdate(
    { name: /^jewels$/i },
    { listingMode: 'both', hasSizes: false },
    { new: true }
  );
  if (jewels) {
    console.log(`Jewels → listingMode=both, hasSizes=false`);
  } else {
    console.log('Jewels category not found — skipped');
  }

  // All other categories: rent only, has sizes
  const result = await Category.updateMany(
    { name: { $not: /^jewels$/i } },
    { listingMode: 'rent', hasSizes: true }
  );
  console.log(`Updated ${result.modifiedCount} other categories → listingMode=rent, hasSizes=true`);

  await mongoose.disconnect();
  console.log('Done');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
