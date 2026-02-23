// src/pages/Main/ForgotPassword.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { sendPasswordReset } from '../../services/firebaseAuthService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-[70vh] flex items-center justify-center py-16 px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-md bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Forgot password</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter the email address for your account and we'll send you a reset link.
        </p>

        {sent ? (
          <p className="text-green-600 text-sm">
            A password-reset email was sent to <strong>{email}</strong>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-gray-600 text-center">
          Remember it?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
