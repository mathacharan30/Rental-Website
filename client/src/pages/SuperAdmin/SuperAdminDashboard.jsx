// src/pages/SuperAdmin/SuperAdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getIdToken } from '../../services/firebaseAuthService';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── Global-content panels managed by super-admin ────────────────────────────
import CategoriesAdmin   from '../Admin/CategoriesAdmin';
import HeroImagesAdmin   from '../Admin/HeroImagesAdmin';
import InstaAdmin        from '../Admin/InstaAdmin';
import TestimonialsAdmin from '../Admin/TestimonialsAdmin';
import SuperAdminOrders  from './SuperAdminOrders';

// ─── Helper to build an auth header ──────────────────────────────────────────
async function authHeader() {
  const token = await getIdToken();
  return { Authorization: `Bearer ${token}` };
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ['View Stores', 'Add Store', 'All Users', 'Categories', 'Gallery Images', 'Instagram Posts', 'Testimonials', 'Orders'];

export default function SuperAdminDashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [tab,    setTab]    = useState('View Stores');
  const [stores, setStores] = useState([]);
  const [users,  setUsers]  = useState([]);
  const [form,   setForm]   = useState({ name: '', email: '', password: '', storeName: '' });
  const [busy,   setBusy]   = useState(false);

  // ── Fetch stores ─────────────────────────────────────────────────────────
  const loadStores = useCallback(async () => {
    try {
      const headers = await authHeader();
      const { data } = await api.get('/api/superadmin/stores', { headers });
      setStores(data.stores);
    } catch {
      toast.error('Failed to load stores');
    }
  }, []);

  // ── Fetch all users ───────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    try {
      const headers = await authHeader();
      const { data } = await api.get('/api/superadmin/users', { headers });
      setUsers(data.users);
    } catch {
      toast.error('Failed to load users');
    }
  }, []);

  useEffect(() => {
    if (tab === 'View Stores') loadStores();
    if (tab === 'All Users')  loadUsers();
  }, [tab, loadStores, loadUsers]);

  // ── Create store ──────────────────────────────────────────────────────────
  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.storeName) {
      toast.error('All fields are required'); return;
    }
    setBusy(true);
    const tid = toast.loading('Creating store owner…');
    try {
      const headers = await authHeader();
      await api.post('/api/superadmin/stores', form, { headers });
      toast.success('Store owner created!', { id: tid });
      setForm({ name: '', email: '', password: '', storeName: '' });
      setTab('View Stores');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create', { id: tid });
    } finally {
      setBusy(false);
    }
  };

  // ── Delete store ──────────────────────────────────────────────────────────
  const handleDelete = async (uid) => {
    if (!window.confirm('Delete this store owner?')) return;
    const tid = toast.loading('Deleting…');
    try {
      const headers = await authHeader();
      await api.delete(`/api/superadmin/stores/${uid}`, { headers });
      toast.success('Deleted', { id: tid });
      loadStores();
    } catch {
      toast.error('Failed to delete', { id: tid });
    }
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top bar */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Super Admin</h1>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
          Sign out
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tab navigation */}
        <nav className="flex gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded text-sm font-medium border transition-colors ${
                tab === t
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* ──────────── View Stores ──────────── */}
        {tab === 'View Stores' && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Stores</h2>
            {stores.length === 0 ? (
              <p className="text-gray-500 text-sm">No stores found.</p>
            ) : (
              <table className="w-full bg-white border rounded text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Email', 'Store slug', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stores.map((s) => (
                    <tr key={s._id} className="border-t">
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">{s.owner?.email || '—'}</td>
                      <td className="px-4 py-2">{s.slug}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/${s.slug}`)}
                          className="text-indigo-600 hover:underline text-xs"
                        >
                          View store
                        </button>
                        <button
                          onClick={() => handleDelete(s.owner?.uid)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ──────────── Add Store ──────────── */}
        {tab === 'Add Store' && (
          <section className="max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add new store</h2>
            <form onSubmit={handleCreateStore} className="space-y-4 bg-white border rounded p-5">
              {[
                { label: 'Owner name',  name: 'name',      type: 'text',     ph: 'John Doe' },
                { label: 'Email',       name: 'email',     type: 'email',    ph: 'owner@store.com' },
                { label: 'Password',    name: 'password',  type: 'password', ph: 'Temp password' },
                { label: 'Store slug',  name: 'storeName', type: 'text',     ph: 'my-store' },
              ].map(({ label, name, type, ph }) => (
                <div key={name}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[name]}
                    onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                    placeholder={ph}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
              >
                {busy ? 'Creating…' : 'Create store owner'}
              </button>
            </form>
          </section>
        )}

        {/* ──────────── All Users ──────────── */}
        {tab === 'All Users' && (
          <section>
            <h2 className="text-lg font-semibold mb-4">All users</h2>
            {users.length === 0 ? (
              <p className="text-gray-500 text-sm">No users found.</p>
            ) : (
              <table className="w-full bg-white border rounded text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Email', 'Role', 'Store'].map((h) => (
                      <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="px-4 py-2">{u.name || '—'}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'super_admin'  ? 'bg-violet-100 text-violet-700' :
                          u.role === 'store_owner'  ? 'bg-blue-100 text-blue-700'    :
                                                      'bg-green-100 text-green-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-2">{u.storeName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ──────────── Categories (global, managed by super-admin) ──────────── */}
        {tab === 'Categories' && (
          <section>
            <CategoriesAdmin />
          </section>
        )}

        {/* ──────────── Gallery Images ──────────── */}
        {tab === 'Gallery Images' && (
          <section>
            <HeroImagesAdmin />
          </section>
        )}

        {/* ──────────── Instagram Posts ──────────── */}
        {tab === 'Instagram Posts' && (
          <section>
            <InstaAdmin />
          </section>
        )}

        {/* ──────────── Testimonials ──────────── */}
        {tab === 'Testimonials' && (
          <section>
            <TestimonialsAdmin />
          </section>
        )}

        {/* ──────────── All Orders (with commission) ──────────── */}
        {tab === 'Orders' && (
          <section>
            <SuperAdminOrders />
          </section>
        )}
      </div>
    </div>
  );
}
