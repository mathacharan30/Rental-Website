import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const STATUS_COLORS = {
  pending:   'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-blue-500/10 text-blue-400',
  active:    'bg-green-500/10 text-green-400',
  completed: 'bg-neutral-500/10 text-neutral-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const STATUSES = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

export default function SuperAdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await getAllOrders());
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (orderId, status) => {
    const tid = toast.loading('Updating…');
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Status updated', { id: tid });
      load();
    } catch {
      toast.error('Failed to update', { id: tid });
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader /></div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">All Orders</h2>
        <p className="text-sm text-neutral-500 mt-0.5">Every order across all stores — includes commission breakdown</p>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">No orders found.</p>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Advance</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-white/5">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {o.product?.images?.[0]?.url && (
                          <img src={o.product.images[0].url} alt="" className="w-9 h-9 rounded object-cover border border-white/10" />
                        )}
                        <span className="font-medium text-white whitespace-nowrap">{o.product?.name || '—'}</span>
                      </div>
                    </td>
                    {/* Store */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-white">{o.store?.name || '—'}</span>
                      <br />
                      <span className="text-xs text-neutral-500">{o.store?.slug}</span>
                    </td>
                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{o.customer?.name || '—'}</div>
                      <div className="text-xs text-neutral-500">{o.customer?.email}</div>
                      {o.customer?.phone && <div className="text-xs text-neutral-500">{o.customer.phone}</div>}
                    </td>
                    {/* Type badge */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.listingType === 'sale' ? 'bg-amber-500/10 text-amber-400' : 'bg-violet-500/10 text-violet-400'
                      }`}>
                        {o.listingType === 'sale' ? 'Sale' : 'Rent'}
                      </span>
                    </td>
                    {/* Size */}
                    <td className="px-4 py-3 text-neutral-300">{o.listingType === 'sale' ? '—' : (o.size || '—')}</td>
                    {/* Price + commission */}
                    <td className="px-4 py-3 text-white">
                      {o.listingType === 'sale' ? `₹${o.salePrice}` : `₹${o.rentPrice}`}
                    </td>
                    <td className="px-4 py-3 text-violet-400 font-medium">₹{o.commissionPrice}</td>
                    <td className="px-4 py-3 text-neutral-300">{o.listingType === 'sale' ? '—' : `₹${o.advanceAmount}`}</td>
                    <td className="px-4 py-3 font-semibold text-green-400">₹{o.totalPrice}</td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    {/* Status dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatus(o._id, e.target.value)}
                        className="text-xs bg-[#1a1a1a] border border-white/10 text-neutral-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      >
                        {STATUSES.map((s) => <option key={s} value={s} className="bg-[#1a1a1a] text-neutral-300">{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
