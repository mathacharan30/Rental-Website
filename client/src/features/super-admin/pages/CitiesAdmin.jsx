import React from "react";

export default function CitiesAdmin({
  cities,
  cityForm,
  setCityForm,
  cityBusy,
  editingCity,
  setEditingCity,
  handleCitySubmit,
  handleCityEdit,
  handleCityToggle,
  handleCityDelete,
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Delivery Cities</h2>
      <div className="glass rounded-xl p-8 max-w-2xl">
        <h3 className="text-lg font-medium text-white mb-6">
          {editingCity ? `Edit: ${editingCity.name}` : "Add New Delivery City"}
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
                {["City", "Delivery Charge", "Status", "Actions"].map((h) => (
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
                <tr
                  key={city._id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-white font-medium">
                    {city.name}
                  </td>
                  <td className="px-6 py-4 text-neutral-300">
                    {city.deliveryCharge === 0 ? (
                      <span className="text-green-400 font-medium">Free</span>
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
  );
}
