import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getStoreOrders, updateOrderStatus } from "../../services/orderService";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

const STATUS_COLORS = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  active:    "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
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
          <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
          <p className="text-neutral-500 mt-1">Orders placed at this store</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader /></div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Size</th>
                  <th className="px-5 py-4">Rent</th>
                  <th className="px-5 py-4">Advance</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-neutral-50">
                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {o.product?.images?.[0]?.url && (
                          <img src={o.product.images[0].url} alt="" className="w-10 h-10 rounded object-cover border" />
                        )}
                        <span className="font-medium text-neutral-900">{o.product?.name || "—"}</span>
                      </div>
                    </td>
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-neutral-900">{o.customer?.name || "—"}</div>
                      <div className="text-xs text-neutral-500">{o.customer?.email}</div>
                      {o.customer?.phone && <div className="text-xs text-neutral-500">{o.customer.phone}</div>}
                    </td>
                    {/* Size */}
                    <td className="px-5 py-4">{o.size || "—"}</td>
                    {/* Rent */}
                    <td className="px-5 py-4 font-medium">₹{o.rentPrice}</td>
                    {/* Advance */}
                    <td className="px-5 py-4">₹{o.advanceAmount}</td>
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
                        className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-pink-400"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
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
