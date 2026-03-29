import React from "react";

export default function ViewStores({
  stores,
  navigate,
  handleDelete,
  setActiveTab,
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-white">Manage Stores</h2>
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
                {["Name", "Email", "Store Slug", "Actions"].map((h) => (
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
              {stores.map((s) => (
                <tr key={s._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-neutral-400">
                    {s.owner?.email || "-"}
                  </td>
                  <td className="px-6 py-4 text-neutral-400">{s.slug}</td>
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
  );
}
