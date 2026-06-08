// One-time migration: generate proper descriptions for all products.
// Run with: node server/scripts/rewriteDescriptions.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const MAX_LEN = 150;

// Per-category occasion phrases and descriptors
const CATEGORY_MAP = {
  lehenga:     { occasion: 'weddings, receptions & festive celebrations',   adjective: 'Stunning'  },
  gowns:       { occasion: 'weddings, receptions & pre-wedding shoots',      adjective: 'Elegant'   },
  sarees:      { occasion: 'weddings, traditional ceremonies & festive events', adjective: 'Beautiful' },
  jewels:      { occasion: 'bridal ceremonies & special occasions',          adjective: 'Exquisite' },
  men:         { occasion: 'weddings, engagements & formal celebrations',    adjective: 'Premium'   },
  makeup:      { occasion: 'bridal makeup & special event styling',          adjective: 'Professional' },
  photography: { occasion: 'weddings & special event photography',           adjective: 'Professional' },
};

// Capitalise first letter of every word
function titleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Trim to MAX_LEN at a word boundary
function safeTrim(str) {
  if (str.length <= MAX_LEN) return str;
  const cut = str.lastIndexOf(' ', MAX_LEN - 1);
  return (cut > 0 ? str.slice(0, cut) : str.slice(0, MAX_LEN)).replace(/[,.]+$/, '') + '.';
}

function buildDescription(productName, categoryName, listingType) {
  const catKey = (categoryName || '').toLowerCase().trim();
  const { occasion, adjective } = CATEGORY_MAP[catKey] || {
    occasion: 'weddings & special occasions',
    adjective: 'Beautiful',
  };

  const name = titleCase(productName);

  // Build base sentence
  let desc;
  if (listingType === 'sale') {
    desc = `${adjective} ${name}, available for purchase. Perfect for ${occasion}.`;
  } else {
    desc = `${adjective} ${name}, available for rent. Perfect for ${occasion}.`;
  }

  return safeTrim(desc);
}

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB\n');

  const products = await Product.find({}).populate('category', 'name');

  console.log(`Processing ${products.length} product(s)...\n`);

  let updated = 0;
  for (const product of products) {
    const categoryName = product.category?.name || '';
    const newDesc = buildDescription(product.name, categoryName, product.listingType);

    console.log(`[${categoryName}] ${product.name}`);
    console.log(`  → "${newDesc}" (${newDesc.length} chars)\n`);

    await Product.updateOne({ _id: product._id }, { description: newDesc });
    updated++;
  }

  console.log(`Done — updated ${updated} product(s).`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
