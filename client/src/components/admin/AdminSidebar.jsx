import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../../services/authService";
import toast from "react-hot-toast";

// Lucide Icons
import {
  Box,
  List,
  MessageCircle,
  Image,
  Instagram,
  LogOut,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const logout = async () => {
    const loadingToast = toast.loading("Logging out...");
    try {
      await logoutApi();
      toast.success("Logged out successfully", { id: loadingToast });
    } catch (e) {
      console.error("Logout failed", e);
      toast.error("Logout failed", { id: loadingToast });
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-pink-50 text-pink-600 font-medium shadow-sm"
        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
    }`;

  return (
    <aside className="w-72 min-h-screen bg-white border-r dm-sans border-neutral-200 flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-neutral-100">
        <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
          Vyoma Admin
        </h3>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 px-4 mt-2">
          Management
        </div>

        <NavLink to="/admin/products" className={linkClass}>
          <Box size={20} />
          Products
        </NavLink>

        <NavLink to="/admin/categories" className={linkClass}>
          <List size={20} />
          Categories
        </NavLink>

        <NavLink to="/admin/testimonials" className={linkClass}>
          <MessageCircle size={20} />
          Testimonials
        </NavLink>

        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 px-4 mt-6">
          Media
        </div>

        <NavLink to="/admin/hero-images" className={linkClass}>
          <Image size={20} />
          Gallery Images
        </NavLink>

        <NavLink to="/admin/gallery" className={linkClass}>
          <Instagram size={20} />
          Instagram Posts
        </NavLink>
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-white border border-neutral-200 text-neutral-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
