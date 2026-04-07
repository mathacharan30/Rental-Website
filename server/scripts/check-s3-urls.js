/**
 * check-s3-urls.js
 *
 * Scans all relevant MongoDB collections and reports any S3 image URLs
 * that still point to the old Sydney bucket instead of the new Mumbai bucket.
 *
 * Usage:
 *   node server/scripts/check-s3-urls.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const OLD_URL = 'https://people-and-style-assets.s3.ap-southeast-2.amazonaws.com/';
const NEW_URL = 'https://people-and-style-assets-mumbai.s3.ap-south-1.amazonaws.com/';

const COLLECTIONS = [
  'products',
  'banners',
  'categories',
  'invoices',
  'producttestimonials',
];

function findOldUrls(value, path = '', results = []) {
  if (typeof value === 'string') {
    if (value.includes(OLD_URL)) results.push({ path, url: value });
    return results;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => findOldUrls(item, `${path}[${i}]`, results));
    return results;
  }
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      findOldUrls(value[key], path ? `${path}.${key}` : key, results);
    }
  }
  return results;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const db = mongoose.connection.db;
  let totalOld = 0;
  let totalNew = 0;

  for (const name of COLLECTIONS) {
    const exists = await db.listCollections({ name }).toArray();
    if (!exists.length) {
      console.log(`[SKIP] Collection "${name}" does not exist.\n`);
      continue;
    }

    const collection = db.collection(name);
    const docs = await collection.find({}).toArray();

    let oldCount = 0;
    let newCount = 0;
    const oldDocs = [];

    for (const doc of docs) {
      const plain = JSON.parse(JSON.stringify(doc));
      const raw = JSON.stringify(plain);

      const oldMatches = findOldUrls(plain);
      const newMatches = (raw.match(new RegExp(NEW_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

      if (oldMatches.length) {
        oldCount += oldMatches.length;
        oldDocs.push({ id: doc._id, hits: oldMatches });
      }
      newCount += newMatches;
    }

    totalOld += oldCount;
    totalNew += newCount;

    const status = oldCount === 0 ? '✓ OK' : '✗ STALE';
    console.log(`── ${name} [${status}]`);
    console.log(`   Mumbai URLs : ${newCount}`);
    console.log(`   Sydney URLs : ${oldCount}`);

    if (oldDocs.length) {
      for (const { id, hits } of oldDocs) {
        console.log(`\n   doc _id: ${id}`);
        for (const { path, url } of hits) {
          console.log(`     field : ${path}`);
          console.log(`     url   : ${url}`);
        }
      }
    }
    console.log();
  }

  console.log('══════════════════════════════════');
  console.log(`  Total Mumbai (new) URLs : ${totalNew}`);
  console.log(`  Total Sydney (old) URLs : ${totalOld}`);
  if (totalOld === 0) {
    console.log('  All URLs are pointing to Mumbai. ');
  } else {
    console.log(`  ${totalOld} URL(s) still point to Sydney — re-run migrate-s3-urls.js`);
  }
  console.log('══════════════════════════════════\n');
}

main()
  .catch((err) => { console.error('Error:', err); process.exit(1); })
  .finally(() => mongoose.disconnect());
