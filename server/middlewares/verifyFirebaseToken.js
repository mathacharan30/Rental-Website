const admin = require('../config/firebase');

/**
 * Middleware: verifyFirebaseToken
 * Expects: Authorization: Bearer <firebase-id-token>
 * On success attaches req.user = { uid, email }
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    console.error('[verifyFirebaseToken]', err.message);
    return res.status(401).json({ message: 'Invalid or expired Firebase token' });
  }
};
