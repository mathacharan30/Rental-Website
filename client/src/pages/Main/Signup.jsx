import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { loginWithEmail, verifyEmail } from "../../services/firebaseAuthService";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import api from "../../services/api";
import toast from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = form;
    if (!name || !email || !password) {
      toast.error("Name, email and password are required");
      return;
    }
    setLoading(true);
    const tid = toast.loading("Creating account…");
    try {
      // Backend creates Firebase user + MongoDB customer profile
      await api.post("/api/auth/signup", form);

      // Sign in temporarily just to get currentUser for sendEmailVerification
      await loginWithEmail(email, password);

      // Send verification email via client SDK
      await verifyEmail();

      // Sign out — user must verify email before they can log in
      await signOut(auth);

      toast.success(
        "Account created! Please check your email and verify your address before logging in.",
        { id: tid, duration: 6000 }
      );
      navigate("/login");
    } catch (err) {
      console.error("Signup failed", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to create account",
        { id: tid }
      );
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <motion.div
      className="min-h-[70vh] flex items-center justify-center py-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-md bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Create an account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field("Full name",    "name",     "text",  "Your name")}
          {field("Email",        "email",    "email", "you@example.com")}
          {field("Password",     "password", "password", "Choose a password")}
          {field("Phone number", "phone",    "tel",   "+91 98765 43210")}
          {field("Address",      "address",  "text",  "Your address")}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;
