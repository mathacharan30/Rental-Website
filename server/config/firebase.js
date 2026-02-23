const admin = require('firebase-admin');

/**
 * Initialise Firebase Admin SDK once.
 * Supply credentials via the FIREBASE_SERVICE_ACCOUNT_JSON env variable
 * (JSON-stringified service-account key file) or via ADC / GOOGLE_APPLICATION_CREDENTIALS.
 */
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Falls back to Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS)
    admin.initializeApp();
  }
}

module.exports = admin;
