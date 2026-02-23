import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { loginWithEmail, fetchMe } from "../../services/firebaseAuthService";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

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
          { id: tid, duration: 5000 }
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
      className="min-h-[70vh] flex items-center justify-center py-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-md bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Sign in to your account</h2>
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

          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Your password"
            />
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;