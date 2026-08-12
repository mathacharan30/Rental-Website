import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getAllStoreCities,
  createStoreCity,
  updateStoreCity,
  deleteStoreCity,
} from "../../services/cityService";

export default function StoreCitiesAdmin() {
  const [cities, setCities] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setCities(await getAllStoreCities());
    } catch {
      toast.error("Failed to load store cities");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setName("");
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("City name is required");
      return;
    }
    setBusy(true);
    const tid = toast.loading(editing ? "Updating city..." : "Adding city...");
    try {
      if (editing) {
        await updateStoreCity(editing._id, { name: name.trim() });
        toast.success("City updated!", { id: tid });
      } else {
        await createStoreCity({ name: name.trim() });
        toast.success("City added!", { id: tid });
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed", { id: tid });
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (city) => {
    const tid = toast.loading(city.active ? "Deactivating..." : "Activating...");
    try {
      await updateStoreCity(city._id, { active: !city.active });
      toast.success(city.active ? "City deactivated" : "City activated", { id: tid });
      load();
    } catch {
      toast.error("Failed to update city status", { id: tid });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this store city?")) return;
    const tid = toast.loading("Deleting...");
    try {
      await deleteStoreCity(id);
      toast.success("City deleted", { id: tid });
      load();
    } catch {
      toast.error("Failed to delete city", { id: tid });
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Store Cities</h2>
      <div className="glass rounded-xl p-8 max-w-2xl">
        <h3 className="text-lg font-medium text-white mb-6">
          {editing ? `Edit: ${editing.name}` : "Add New Store City"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              City Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full border border-white/10 bg-white/5 px-4 py-3 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-neutral-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {busy ? "Saving..." : editing ? "Update City" : "Add City"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
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
          No store cities added yet.
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {["City", "Status", "Actions"].map((h) => (
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
              {cities.map((city) => (
                <tr key={city._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{city.name}</td>
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
                      onClick={() => {
                        setEditing(city);
                        setName(city.name);
                      }}
                      className="text-violet-400 hover:text-violet-300 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggle(city)}
                      className="text-yellow-400 hover:text-yellow-300 font-medium"
                    >
                      {city.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(city._id)}
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
  );
}
