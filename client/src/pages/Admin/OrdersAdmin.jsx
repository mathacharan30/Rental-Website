import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getStoreOrders, updateOrderStatus } from "../../services/orderService";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

const STATUS_COLORS = {
  pending:   "bg-yellow-500/10 text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-400",
  active:    "bg-green-500/10 text-green-400",
  completed: "bg-neutral-500/10 text-neutral-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const STATUSES = ["pending", "confirmed", "active", "completed", "cancelled"];

const OrdersAdmin = () => {
  const { storename } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStoreOrders(storename);
      setOrders(data);
    } catch (e) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [storename]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (orderId, status) => {
    const tid = toast.loading("Updating…");
    try {
      await updateOrderStatus(orderId, status);
      toast.success("Status updated", { id: tid });
      load();
    } catch {
      toast.error("Failed to update status", { id: tid });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-neutral-500 mt-1">Orders placed at this store</p>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader /></div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Size</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Commission</th>
                  <th className="px-5 py-4">Advance</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-white/5">
                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {o.product?.images?.[0]?.url && (
                          <img src={o.product.images[0].url} alt="" className="w-10 h-10 rounded object-cover border border-white/10" />
                        )}
                        <span className="font-medium text-white">{o.product?.name || "—"}</span>
                      </div>
                    </td>
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{o.customer?.name || "—"}</div>
                      <div className="text-xs text-neutral-500">{o.customer?.email}</div>
                      {o.customer?.phone && <div className="text-xs text-neutral-500">{o.customer.phone}</div>}
                    </td>
                    {/* Type badge */}
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.listingType === 'sale'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-violet-500/10 text-violet-400'
                      }`}>
                        {o.listingType === 'sale' ? 'Sale' : 'Rent'}
                      </span>
                    </td>
                    {/* Size */}
                    <td className="px-5 py-4 text-neutral-300">{o.listingType === 'sale' ? '—' : (o.size || '—')}</td>
                    {/* Price */}
                    <td className="px-5 py-4 font-medium text-white">
                      {o.listingType === 'sale' ? `₹${o.salePrice}` : `₹${o.rentPrice}`}
                    </td>
                    {/* Commission */}
                    <td className="px-5 py-4 text-violet-400">₹{o.commissionPrice}</td>
                    {/* Advance */}
                    <td className="px-5 py-4 text-neutral-300">{o.listingType === 'sale' ? '—' : `₹${o.advanceAmount}`}</td>
                    {/* Total */}
                    <td className="px-5 py-4 font-semibold text-green-400">₹{o.totalPrice}</td>
                    {/* Status badge */}
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    {/* Update status */}
                    <td className="px-5 py-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatus(o._id, e.target.value)}
                        className="text-xs bg-[#1a1a1a] border border-white/10 text-neutral-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-[#1a1a1a] text-neutral-300">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersAdmin;
