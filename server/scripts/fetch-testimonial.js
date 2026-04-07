/**
 * fetch-testimonial.js
 *
 * One-time script to fetch a ProductTestimonial along with its
 * populated User and Product documents.
 *
 * Usage:
 *   node server/scripts/fetch-testimonial.js <testimonialId>
 *
 * Example:
 *   node server/scripts/fetch-testimonial.js 69bc2bc956d423cb13541910
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const ProductTestimonial = require('../models/ProductTestimonial');
const User = require('../models/User');     // ensures model is registered
const Product = require('../models/Product'); // ensures model is registered

const TESTIMONIAL_ID = process.argv[2] || '69bc2bc956d423cb13541910';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const testimonial = await ProductTestimonial.findById(TESTIMONIAL_ID)
    .populate('user', 'name email phone role')
    .populate('product', 'name listingType rentPrice salePrice price images');

  if (!testimonial) {
    console.log(`No testimonial found with id: ${TESTIMONIAL_ID}`);
    process.exit(0);
  }

  console.log('=== ProductTestimonial ===');
  console.log(JSON.stringify(testimonial, null, 2));
}

main()
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
