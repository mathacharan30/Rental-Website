// src/pages/Main/CustomerProfile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../../services/orderService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  active:    'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

const CustomerProfile = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    if (tab !== 'orders') return;
    setOrdersLoading(true);
    getMyOrders()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setOrdersLoading(false));
  }, [tab]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  if (!userProfile) return null;

  const { name, email, phone, address, role, uid } = userProfile;

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );

  return (
    <div className="min-h-[70vh] py-16 px-4 max-w-2xl mx-auto">
      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {['profile', 'orders'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm font-medium border transition-colors capitalize ${
              tab === t ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t === 'orders' ? `My Orders` : 'Profile'}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {tab === 'profile' && (
        <div className="w-full bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">My Profile</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{role}</span>
          </div>
          <div className="space-y-0">
            <Row label="Name"    value={name} />
            <Row label="Email"   value={email} />
            <Row label="Phone"   value={phone} />
            <Row label="Address" value={address} />
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 w-full border border-red-300 text-red-600 py-2 rounded hover:bg-red-50 transition-colors text-sm"
          >
            Sign out
          </button>
        </div>
      )}

      {/* ── Orders tab ── */}
      {tab === 'orders' && (
        <div>
          {ordersLoading ? (
            <p className="text-gray-500 text-sm">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500">No orders yet.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o._id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    {o.product?.images?.[0]?.url && (
                      <img src={o.product.images[0].url} alt="" className="w-16 h-16 object-cover rounded border flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-neutral-900 truncate">{o.product?.name || '—'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[o.status]}`}>
                          {o.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{o.store?.name} &bull; Size: {o.size || '—'}</p>
                      <div className="mt-2 flex gap-4 text-sm text-gray-700">
                        <span>Rent: <strong>₹{o.rentPrice}</strong></span>
                        <span>Advance: <strong>₹{o.advanceAmount}</strong></span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{new Date(o.createdAt).toLocaleDateString()}</p>
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
