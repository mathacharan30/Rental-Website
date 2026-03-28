// src/pages/SuperAdmin/SuperAdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getIdToken } from "../../services/firebaseAuthService";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Building2,
  Users,
  Tag,
  Image,
  Instagram,
  Heart,
  Box,
  MapPin,
} from "lucide-react";

import CategoriesAdmin from "../Admin/CategoriesAdmin";
import HeroImagesAdmin from "../Admin/HeroImagesAdmin";
import BannerImagesAdmin from "../Admin/BannerImagesAdmin";
import InstaAdmin from "../Admin/InstaAdmin";
import TestimonialsAdmin from "../Admin/TestimonialsAdmin";
import SuperAdminOrders from "./SuperAdminOrders";

async function authHeader() {
  const token = await getIdToken();
  return { Authorization: `Bearer ${token}` };
}

const MENU_ITEMS = [
  { id: "view-stores", label: "View Stores", icon: Building2 },
  { id: "add-store", label: "Add Store", icon: Building2 },
  { id: "all-users", label: "All Users", icon: Users },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "banners", label: "Banner Images", icon: Image },
  { id: "gallery", label: "Gallery Images", icon: Image },
  { id: "instagram", label: "Instagram Posts", icon: Instagram },
  { id: "testimonials", label: "Testimonials", icon: Heart },
  { id: "orders", label: "All Orders", icon: Box },
  { id: "cities", label: "Delivery Cities", icon: MapPin },
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("view-stores");
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
  });
  const [busy, setBusy] = useState(false);

  const [cities, setCities] = useState([]);
  const [cityBusy, setCityBusy] = useState(false);
  const [cityForm, setCityForm] = useState({ name: "", deliveryCharge: "" });
  const [editingCity, setEditingCity] = useState(null);

  const loadStores = useCallback(async () => {
    try {
      const headers = await authHeader();
      const { data } = await api.get("/api/superadmin/stores", { headers });
      setStores(data.stores);
    } catch {
      toast.error("Failed to load stores");
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const headers = await authHeader();
      const { data } = await api.get("/api/superadmin/users", { headers });
      setUsers(data.users);
    } catch {
      toast.error("Failed to load users");
    }
  }, []);

  const loadCities = useCallback(async () => {
    try {
      const headers = await authHeader();
      const { data } = await api.get("/api/superadmin/cities", { headers });
      setCities(data.cities);
    } catch {
      toast.error("Failed to load delivery cities");
    }
  }, []);

  useEffect(() => {
    if (activeTab === "view-stores") loadStores();
    if (activeTab === "all-users") loadUsers();
    if (activeTab === "cities") loadCities();
  }, [activeTab, loadStores, loadUsers, loadCities]);

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.storeName) {
      toast.error("All fields are required");
      return;
    }

    setBusy(true);
    const tid = toast.loading("Creating store owner...");
    try {
      const headers = await authHeader();
      await api.post("/api/superadmin/stores", form, { headers });
      toast.success("Store owner created!", { id: tid });
      setForm({ name: "", email: "", password: "", storeName: "" });
      setActiveTab("view-stores");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create", {
        id: tid,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (uid) => {
    if (!window.confirm("Delete this store owner?")) return;

    const tid = toast.loading("Deleting...");
    try {
      const headers = await authHeader();
      await api.delete(`/api/superadmin/stores/${uid}`, { headers });
      toast.success("Deleted", { id: tid });
      loadStores();
    } catch {
      toast.error("Failed to delete", { id: tid });
    }
  };

  const handleCitySubmit = async (e) => {
    e.preventDefault();
    if (!cityForm.name.trim() || cityForm.deliveryCharge === "") {
      toast.error("City name and delivery charge are required");
      return;
    }

    setCityBusy(true);
    const tid = toast.loading(
      editingCity ? "Updating city..." : "Adding city...",
    );
    try {
      const headers = await authHeader();
      if (editingCity) {
        await api.put(
          `/api/superadmin/cities/${editingCity._id}`,
          {
            name: cityForm.name.trim(),
            deliveryCharge: Number(cityForm.deliveryCharge),
          },
          { headers },
        );
        toast.success("City updated!", { id: tid });
      } else {
        await api.post(
          "/api/superadmin/cities",
          {
            name: cityForm.name.trim(),
            deliveryCharge: Number(cityForm.deliveryCharge),
          },
          { headers },
        );
        toast.success("City added!", { id: tid });
      }

      setCityForm({ name: "", deliveryCharge: "" });
      setEditingCity(null);
      loadCities();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed", { id: tid });
    } finally {
      setCityBusy(false);
    }
  };

  const handleCityEdit = (city) => {
    setEditingCity(city);
    setCityForm({ name: city.name, deliveryCharge: city.deliveryCharge });
  };

  const handleCityDelete = async (id) => {
    if (!window.confirm("Delete this delivery city?")) return;

    const tid = toast.loading("Deleting...");
    try {
      const headers = await authHeader();
      await api.delete(`/api/superadmin/cities/${id}`, { headers });
      toast.success("City deleted", { id: tid });
      loadCities();
    } catch {
      toast.error("Failed to delete city", { id: tid });
    }
  };

  const handleCityToggle = async (city) => {
    const tid = toast.loading(
      city.active ? "Deactivating..." : "Activating...",
    );
    try {
      const headers = await authHeader();
      await api.put(
        `/api/superadmin/cities/${city._id}`,
        { active: !city.active },
        { headers },
      );
      toast.success(city.active ? "City deactivated" : "City activated", {
        id: tid,
      });
      loadCities();
    } catch {
      toast.error("Failed to update city status", { id: tid });
    }
  };

  return (
    <div className=" bg-[#0e0e0e] flex">
      <div className={` transition-all duration-300 overflow-hidden`}>
        <aside className="w-64 h-screen bg-[#151515] border-r border-white/10 flex flex-col sticky top-0">
          <div className="p-4  border-b border-white/10">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Admin Panel
            </h2>
            <p className="text-xs text-neutral-500 mt-1">System Management</p>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? "bg-violet-500/15 text-violet-400 font-medium"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>
      </div>

      <main className="flex-1 h-screen overflow-y-auto flex flex-col">
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="mx-2 mt-4 space-y-4">
            {activeTab === "view-stores" && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-white">
                  Manage Stores
                </h2>
                {stores.length === 0 ? (
                  <div className="glass rounded-xl p-8 text-center text-neutral-500">
                    No stores found.{" "}
                    <button
                      onClick={() => setActiveTab("add-store")}
                      className="text-violet-400 hover:underline"
                    >
                      Create one
                    </button>
                  </div>
                ) : (
                  <div className="glass rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          {["Name", "Email", "Store Slug", "Actions"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left px-6 py-4 font-medium text-neutral-400"
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {stores.map((s) => (
                          <tr
                            key={s._id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 text-white font-medium">
                              {s.name}
                            </td>
                            <td className="px-6 py-4 text-neutral-400">
                              {s.owner?.email || "-"}
                            </td>
                            <td className="px-6 py-4 text-neutral-400">
                              {s.slug}
                            </td>
                            <td className="px-6 py-4 flex gap-3">
                              <button
                                onClick={() => navigate(`/admin/${s.slug}`)}
                                className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(s.owner?.uid)}
                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {activeTab === "add-store" && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-white">
                  Create New Store
                </h2>
                <div className="glass rounded-xl p-8 max-w-2xl">
                  <form onSubmit={handleCreateStore} className="space-y-6">
                    {[
                      {
                        label: "Owner Name",
                        name: "name",
                        type: "text",
                        placeholder: "John Doe",
                      },
                      {
                        label: "Email",
                        name: "email",
                        type: "email",
                        placeholder: "owner@store.com",
                      },
                      {
                        label: "Password",
                        name: "password",
                        type: "password",
                        placeholder: "Temporary password",
                      },
                      {
                        label: "Store Slug",
                        name: "storeName",
                        type: "text",
                        placeholder: "my-store",
                      },
                    ].map(({ label, name, type, placeholder }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          {label}
                        </label>
                        <input
                          type={type}
                          value={form[name]}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, [name]: e.target.value }))
                          }
                          placeholder={placeholder}
                          className="w-full border border-white/10 bg-white/5 px-4 py-3 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    ))}
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-neutral-700 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      {busy ? "Creating..." : "Create Store Owner"}
                    </button>
                  </form>
                </div>
              </section>
            )}

            {activeTab === "all-users" && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-white">
                  All Users
                </h2>
                {users.length === 0 ? (
                  <div className="glass rounded-xl p-8 text-center text-neutral-500">
                    No users found.
                  </div>
                ) : (
                  <div className="glass rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          {["Name", "Email", "Role", "Store"].map((h) => (
                            <th
                              key={h}
                              className="text-left px-6 py-4 font-medium text-neutral-400"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((u) => (
                          <tr
                            key={u._id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 text-white font-medium">
                              {u.name || "-"}
                            </td>
                            <td className="px-6 py-4 text-neutral-400">
                              {u.email}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  u.role === "super_admin"
                                    ? "bg-violet-500/10 text-violet-400"
                                    : u.role === "store_owner"
                                      ? "bg-blue-500/10 text-blue-400"
                                      : "bg-green-500/10 text-green-400"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-neutral-400">
                              {u.storeName || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {activeTab === "categories" && <CategoriesAdmin />}
            {activeTab === "banners" && <BannerImagesAdmin />}
            {activeTab === "gallery" && <HeroImagesAdmin />}
            {activeTab === "instagram" && <InstaAdmin />}
            {activeTab === "testimonials" && <TestimonialsAdmin />}
            {activeTab === "orders" && <SuperAdminOrders />}

            {activeTab === "cities" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">
                  Delivery Cities
                </h2>

                <div className="glass rounded-xl p-8 max-w-2xl">
                  <h3 className="text-lg font-medium text-white mb-6">
                    {editingCity
                      ? `Edit: ${editingCity.name}`
                      : "Add New Delivery City"}
                  </h3>
                  <form onSubmit={handleCitySubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        City Name
                      </label>
                      <input
                        type="text"
                        value={cityForm.name}
                        onChange={(e) =>
                          setCityForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="e.g. Mumbai"
                        className="w-full border border-white/10 bg-white/5 px-4 py-3 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Delivery Charge (Rs)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={cityForm.deliveryCharge}
                        onChange={(e) =>
                          setCityForm((p) => ({
                            ...p,
                            deliveryCharge: e.target.value,
                          }))
                        }
                        placeholder="0 for free delivery"
                        className="w-full border border-white/10 bg-white/5 px-4 py-3 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={cityBusy}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-neutral-700 text-white py-3 rounded-lg font-medium transition-colors"
                      >
                        {cityBusy
                          ? "Saving..."
                          : editingCity
                            ? "Update City"
                            : "Add City"}
                      </button>
                      {editingCity && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCity(null);
                            setCityForm({ name: "", deliveryCharge: "" });
                          }}
                          className="px-6 py-3 rounded-lg border border-white/10 text-neutral-300 hover:bg-white/5 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {cities.length === 0 ? (
                  <div className="glass rounded-xl p-8 text-center text-neutral-500">
                    No delivery cities added yet.
                  </div>
                ) : (
                  <div className="glass rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          {["City", "Delivery Charge", "Status", "Actions"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left px-6 py-4 font-medium text-neutral-400"
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {cities.map((city) => (
                          <tr
                            key={city._id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 text-white font-medium">
                              {city.name}
                            </td>
                            <td className="px-6 py-4 text-neutral-300">
                              {city.deliveryCharge === 0 ? (
                                <span className="text-green-400 font-medium">
                                  Free
                                </span>
                              ) : (
                                `Rs ${city.deliveryCharge.toLocaleString()}`
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  city.active
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-neutral-500/10 text-neutral-500"
                                }`}
                              >
                                {city.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex gap-4">
                              <button
                                onClick={() => handleCityEdit(city)}
                                className="text-violet-400 hover:text-violet-300 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCityToggle(city)}
                                className="text-yellow-400 hover:text-yellow-300 font-medium"
                              >
                                {city.active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => handleCityDelete(city._id)}
                                className="text-red-400 hover:text-red-300 font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
