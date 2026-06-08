// One-time migration: trim all product descriptions to 150 characters.
// Run with: node server/scripts/trimDescriptions.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const products = await Product.find({
    description: { $exists: true, $ne: '' },
    $expr: { $gt: [{ $strLenCP: '$description' }, 150] },
  }).select('_id name description');

  console.log(`Found ${products.length} product(s) with descriptions over 150 chars`);

  for (const product of products) {
    const trimmed = product.description.slice(0, 150);
    console.log(`  "${product.name}": ${product.description.length} → 150 chars`);
    await Product.updateOne({ _id: product._id }, { description: trimmed });
  }

  console.log('Done');
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
