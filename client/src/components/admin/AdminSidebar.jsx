import React from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { logout as firebaseLogout } from "../../services/firebaseAuthService";
import toast from "react-hot-toast";

// Lucide Icons
import {
  Box,
  ShoppingBag,
  LogOut,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate  = useNavigate();
  const { storename } = useParams();
  const base = `/admin/${storename}`;

  const logout = async () => {
    const tid = toast.loading("Logging out...");
    try {
      await firebaseLogout();
      toast.success("Logged out successfully", { id: tid });
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Logout failed", e);
      toast.error("Logout failed", { id: tid });
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
          {storename ? `${storename} Admin` : "Vyoma Admin"}
        </h3>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 px-4 mt-2">
          Management
        </div>

        <NavLink to={`${base}/products`} className={linkClass}>
          <Box size={20} />
          Products
        </NavLink>

        <NavLink to={`${base}/orders`} className={linkClass}>
          <ShoppingBag size={20} />
          Orders
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
