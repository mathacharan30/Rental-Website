import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
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
      // Backend creates Firebase user, saves MongoDB profile, and sends verification email
      const { data } = await api.post("/api/auth/signup", form);

      toast.success(
        data.message ||
          "Account created! Please check your email to verify your address before logging in.",
        { id: tid, duration: 6000 },
      );
      navigate("/login");
    } catch (err) {
      console.error("Signup failed", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create account",
        { id: tid },
      );
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
        placeholder={placeholder}
      />
    </div>
  );

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
            Create Account
          </h2>
          <p className="text-neutral-500 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field("Full name", "name", "text", "Your name")}
          {field("Email", "email", "email", "you@example.com")}
          {field("Password", "password", "password", "Choose a password")}
          {field("Phone number", "phone", "tel", "+91 98765 43210")}
          {field("Address", "address", "text", "Your address")}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-funky !rounded-xl !py-3 disabled:opacity-60"
          >
            <span>{loading ? "Creating account…" : "Create account →"}</span>
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-500 text-center">
          Already have an account?{" "}
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

export default Signup;
