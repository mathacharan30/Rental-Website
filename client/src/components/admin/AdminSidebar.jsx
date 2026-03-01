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
        ? "bg-violet-500/15 text-violet-400 font-medium"
        : "text-neutral-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <aside className="w-72 min-h-screen bg-[#151515] border-r dm-sans border-white/10 flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-xl font-bold text-white tracking-tight">
          {storename ? `${storename} Admin` : "Vyoma Admin"}
        </h3>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-4 mt-2">
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

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-neutral-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
