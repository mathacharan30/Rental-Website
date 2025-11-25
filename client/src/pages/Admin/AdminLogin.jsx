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
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md shadow-sm w-full max-w-md border"
      >
        <h2 className="text-2xl mb-4">Admin Login</h2>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <div className="mb-3">
          <label className="block text-sm">Email</label>
          <input
            className="border px-2 py-1 w-full"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            className="border px-2 py-1 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
