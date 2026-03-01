import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { loginWithEmail, fetchMe } from "../../services/firebaseAuthService";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const tid = toast.loading("Signing in…");
    try {
      const firebaseUser = await loginWithEmail(email, password);

      // Block login until email is verified
      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        toast.error(
          "Please verify your email before logging in. Check your inbox.",
          { id: tid, duration: 5000 },
        );
        setLoading(false);
        return;
      }

      const profile = await fetchMe();

      toast.success("Signed in successfully", { id: tid });

      // Role-based redirect
      if (profile?.role === "super_admin") {
        navigate("/superadmin");
      } else if (profile?.role === "store_owner" && profile.storeName) {
        navigate(`/admin/${profile.storeName}`);
      } else if (profile?.role === "customer" && profile.uid) {
        navigate(`/${profile.uid}/profile`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed", err);
      toast.error(err?.message || "Failed to sign in", { id: tid });
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
            Welcome back
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

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

          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              placeholder="Your password"
            />
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-funky rounded-xl! py-3! disabled:opacity-60"
          >
            <span>{loading ? "Signing in…" : "Sign in →"}</span>
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-500 text-center">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
