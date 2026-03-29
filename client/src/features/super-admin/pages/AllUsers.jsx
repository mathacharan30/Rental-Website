import React from "react";

export default function AllUsers({ users }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-white">All Users</h2>
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
                <tr key={u._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">
                    {u.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-neutral-400">{u.email}</td>
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
  );
}
