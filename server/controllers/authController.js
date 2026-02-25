const firebaseAdmin = require('../config/firebase');
const User          = require('../models/User');
const nodemailer    = require('nodemailer');

// ─── Nodemailer transporter (SMTP from .env) ─────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for others
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ─── Email helper ─────────────────────────────────────────────────────────────
async function sendVerificationEmail(toEmail, verifyLink) {
  const appName = process.env.APP_NAME || 'Cloth Rental';
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify your email – ${appName}</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0"
                   style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

              <!-- Header -->
              <tr>
                <td style="background:#111827;padding:28px 40px;">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:-0.5px;">${appName}</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px 40px;">
                  <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">Verify your email address</h2>
                  <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                    Thanks for signing up! Click the button below to confirm your email address
                    and activate your account.
                  </p>
                  <a href="${verifyLink}"
                     style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;
                            padding:13px 28px;border-radius:6px;font-size:15px;font-weight:600;">
                    Verify Email
                  </a>
                  <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;">
                    If you didn't create an account, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;border-top:1px solid #f3f4f6;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from:    `"${appName}" <${process.env.MAIL_USER}>`,
    to:      toEmail,
    subject: `Verify your email – ${appName}`,
    html,
  });

  console.log('[Auth] Verification email sent to:', toEmail, '| messageId:', info.messageId);
  return info;
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
// Creates Firebase user + MongoDB customer profile + sends verification email.
// Body: { name, email, password, phone?, address? }
exports.signup = async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  try {
    // 1. Create Firebase Auth user
    const firebaseUser = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName: name,
    });
    console.log('[Auth] Firebase user created:', firebaseUser.uid);

    // 2. Persist MongoDB profile
    const user = await User.create({
      uid:     firebaseUser.uid,
      email,
      role:    'customer',
      name,
      phone:   phone   || null,
      address: address || null,
    });

    // 3. Generate email-verification link via Admin SDK
    const verifyLink = await firebaseAdmin.auth().generateEmailVerificationLink(email);
    console.log('[Auth] Verification link generated for:', email);

    // 4. Send verification email via Nodemailer
    await sendVerificationEmail(email, verifyLink);

    return res.status(201).json({
      message: 'Account created! Please check your email to verify your address before logging in.',
      user: { uid: user.uid, email: user.email, role: user.role, name: user.name },
    });
  } catch (err) {
    console.error('[Auth] signup error:', err.message);
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Server error during signup' });
  }
};

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────
// Generates a Firebase password-reset link via Admin SDK and emails it.
// Body: { email }
exports.sendPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    const resetLink = await firebaseAdmin.auth().generatePasswordResetLink(email);
    const appName   = process.env.APP_NAME || 'Cloth Rental';
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset your password – ${appName}</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0"
                     style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                <!-- Header -->
                <tr>
                  <td style="background:#111827;padding:28px 40px;">
                    <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:-0.5px;">${appName}</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">Reset your password</h2>
                    <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                      We received a request to reset the password for your account.
                      Click the button below to choose a new password.
                    </p>
                    <a href="${resetLink}"
                       style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;
                              padding:13px 28px;border-radius:6px;font-size:15px;font-weight:600;">
                      Reset Password
                    </a>
                    <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;">
                      If you didn't request a password reset, you can safely ignore this email.
                      This link will expire in 1 hour.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #f3f4f6;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from:    `"${appName}" <${process.env.MAIL_USER}>`,
      to:      email,
      subject: `Reset your password – ${appName}`,
      html,
    });

    console.log('[Auth] Password-reset email sent to:', email);
    return res.json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (err) {
    console.error('[Auth] sendPasswordReset error:', err.message);
    // Return generic message to avoid leaking whether the email exists
    if (err.code === 'auth/user-not-found') {
      return res.json({ message: 'Password reset email sent. Please check your inbox.' });
    }
    return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the caller's MongoDB profile (role, storeName, etc.).
// Requires verifyFirebaseToken + attachUserRole middlewares.
exports.me = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('[Auth] me error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Alias kept for backwards-compat
exports.profile = exports.me;