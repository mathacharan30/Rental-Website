/**
 * scripts/seedSuperAdmin.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time script to create the super_admin user in Firebase + MongoDB.
 * Run once from /server:
 *
 *   node scripts/seedSuperAdmin.js
 *
 * Requires a valid .env with MONGODB_URI and FIREBASE_SERVICE_ACCOUNT_JSON.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const connectDB     = require('../config/db');
const firebaseAdmin = require('../config/firebase');
const User          = require('../models/User');

const EMAIL    = process.env.SUPER_ADMIN_EMAIL    || 'superadmin@example.com';
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperSecret123!';
const NAME     = process.env.SUPER_ADMIN_NAME     || 'Super Admin';

(async () => {
  await connectDB();

  // 1. Create Firebase account (or fetch existing)
  let firebaseUser;
  try {
    firebaseUser = await firebaseAdmin.auth().createUser({
      email:         EMAIL,
      password:      PASSWORD,
      displayName:   NAME,
      emailVerified: true,   // admin account — no email verification needed
    });
    console.log('[seed] Firebase user created:', firebaseUser.uid);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      firebaseUser = await firebaseAdmin.auth().getUserByEmail(EMAIL);
      // Ensure emailVerified is true for existing admin accounts
      await firebaseAdmin.auth().updateUser(firebaseUser.uid, { emailVerified: true });
      console.log('[seed] Firebase user already exists:', firebaseUser.uid, '(emailVerified set to true)');
    } else {
      throw err;
    }
  }

  // 2. Upsert MongoDB record
  const existing = await User.findOne({ uid: firebaseUser.uid });
  if (existing) {
    console.log('[seed] MongoDB record already exists, skipping.');
  } else {
    await User.create({
      uid:   firebaseUser.uid,
      email: EMAIL,
      role:  'super_admin',
      name:  NAME,
    });
    console.log('[seed] MongoDB super_admin record created.');
  }

  console.log('\n✅  Super admin ready.\n   Email:   ', EMAIL);
  process.exit(0);
})().catch((err) => {
  console.error('[seed] Error:', err.message);
  process.exit(1);
});
