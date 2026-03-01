// src/pages/Main/ForgotPassword.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { sendPasswordReset } from "../../services/firebaseAuthService";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Enter your email");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (err) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-[80vh] flex items-center justify-center py-16 px-4 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-md glass rounded-xl p-8 relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold display-font gradient-text">
            Reset password
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-green-400 text-sm">
              A password-reset email was sent to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-funky rounded-xl! py-3! disabled:opacity-60"
            >
              <span>{loading ? "Sending…" : "Send reset link →"}</span>
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-neutral-500 text-center">
          Remember it?{" "}
          <Link
            to="/login"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
