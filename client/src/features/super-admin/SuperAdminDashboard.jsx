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

import ViewStores from "./ViewStores";
import AddStore from "./AddStore";
import AllUsers from "./AllUsers";
import CitiesAdmin from "./CitiesAdmin";
import CategoriesAdmin from "./CategoriesAdmin";
import HeroImagesAdmin from "./HeroImagesAdmin";
import BannerImagesAdmin from "./BannerImagesAdmin";
import InstaAdmin from "./InstaAdmin";
import TestimonialsAdmin from "./TestimonialsAdmin";
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

  const handleResetPassword = async (uid, newPassword) => {
    const tid = toast.loading("Resetting password...");
    try {
      const headers = await authHeader();
      await api.patch(
        `/api/superadmin/stores/${uid}/password`,
        { password: newPassword },
        { headers },
      );
      toast.success("Password updated!", { id: tid });
      loadStores();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset password", {
        id: tid,
      });
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

  // Main render
  return (
    <div className=" bg-[#0e0e0e] mt-6 flex">
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
              <ViewStores
                stores={stores}
                navigate={navigate}
                handleDelete={handleDelete}
                handleResetPassword={handleResetPassword}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === "add-store" && (
              <AddStore
                form={form}
                setForm={setForm}
                handleCreateStore={handleCreateStore}
                busy={busy}
              />
            )}
            {activeTab === "all-users" && <AllUsers users={users} />}
            {activeTab === "categories" && <CategoriesAdmin />}
            {activeTab === "banners" && <BannerImagesAdmin />}
            {activeTab === "gallery" && <HeroImagesAdmin />}
            {activeTab === "instagram" && <InstaAdmin />}
            {activeTab === "testimonials" && <TestimonialsAdmin />}
            {activeTab === "orders" && <SuperAdminOrders />}
            {activeTab === "cities" && (
              <CitiesAdmin
                cities={cities}
                cityForm={cityForm}
                setCityForm={setCityForm}
                cityBusy={cityBusy}
                editingCity={editingCity}
                setEditingCity={setEditingCity}
                handleCitySubmit={handleCitySubmit}
                handleCityEdit={handleCityEdit}
                handleCityToggle={handleCityToggle}
                handleCityDelete={handleCityDelete}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
