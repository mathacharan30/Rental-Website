// src/pages/Main/CustomerProfile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../../services/orderService";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  active: "bg-green-500/20 text-green-400 border border-green-500/30",
  completed: "bg-neutral-500/20 text-neutral-400 border border-neutral-500/30",
  cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const CustomerProfile = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    if (tab !== "orders") return;
    setOrdersLoading(true);
    getMyOrders()
      .then(setOrders)
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setOrdersLoading(false));
  }, [tab]);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/login");
  };

  if (!userProfile) return null;

  const { name, email, phone, address, role, uid } = userProfile;

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b border-white/5 last:border-b-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-white">{value || "—"}</span>
    </div>
  );

  return (
    <div className="min-h-[70vh] py-16 px-4 max-w-2xl mx-auto bg-[#0e0e0e]">
      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {["profile", "orders"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 capitalize ${
              tab === t
                ? "bg-violet-600 text-white"
                : "glass text-neutral-400 hover:text-white"
            }`}
          >
            {t === "orders" ? `My Orders` : "Profile"}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {tab === "profile" && (
        <div className="w-full glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold display-font text-white">
              My Profile
            </h2>
            <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-3 py-1 rounded-full font-medium">
              {role}
            </span>
          </div>
          <div className="space-y-0">
            <Row label="Name" value={name} />
            <Row label="Email" value={email} />
            <Row label="Phone" value={phone} />
            <Row label="Address" value={address} />
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 w-full border border-red-500/30 text-red-400 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            Sign out
          </button>
        </div>
      )}

      {/* ── Orders tab ── */}
      {tab === "orders" && (
        <div>
          {ordersLoading ? (
            <p className="text-neutral-500 text-sm">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-neutral-500">
              No orders yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o._id} className="glass rounded-2xl p-4">
                  <div className="flex items-start gap-4">
                    {o.product?.images?.[0]?.url && (
                      <img
                        src={o.product.images[0].url}
                        alt=""
                        className="w-16 h-16 object-cover rounded-xl border border-white/10 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-white truncate">
                          {o.product?.name || "—"}
                        </p>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[o.status]}`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {o.store?.name}{o.listingType !== 'sale' && <> &bull; Size: {o.size || '—'}</>}
                      </p>
                      <div className="mt-2 text-sm text-neutral-400">
                        Amount Paid: <strong className="text-green-400">₹{o.totalPrice}</strong>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
