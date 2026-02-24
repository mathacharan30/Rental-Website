/**
 * scripts/debugStores.js
 * Run: node scripts/debugStores.js
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User  = require('../models/User');
const Store = require('../models/Store');

(async () => {
  await connectDB();

  console.log('\n=== STORES collection ===');
  const stores = await Store.find().lean();
  console.log(JSON.stringify(stores, null, 2));

  console.log('\n=== USERS (store_owners) ===');
  const owners = await User.find({ role: 'store_owner' }).lean();
  console.log(JSON.stringify(owners, null, 2));

  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
