import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const loadingToast = toast.loading("Logging in...");
    try {
      await login({ email, password, role: "admin" });
      toast.success("Login successful", { id: loadingToast });
      navigate("/admin/products", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e]">\n      <form\n        onSubmit={handleSubmit}\n        className="glass p-8 rounded-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold display-font gradient-text mb-6">
          Admin Login
        </h2>
        {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm text-neutral-400 mb-1">Email</label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm text-neutral-400 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className="w-full btn-funky rounded-xl! disabled:opacity-60"
        >
          <span>{loading ? "Logging in..." : "Login →"}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
