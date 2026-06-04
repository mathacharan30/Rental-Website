import React, { useState } from "react";

function PasswordCell({ password, uid, onReset }) {
  const [visible, setVisible] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [newPwd, setNewPwd] = useState("");

  const submit = async () => {
    if (newPwd.length < 6) return;
    await onReset(uid, newPwd);
    setNewPwd("");
    setResetting(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-2">
        <span className="font-mono text-neutral-300 select-all">
          {password ? (visible ? password : "••••••••") : <span className="text-neutral-600 italic text-xs">not saved</span>}
        </span>
        {password && (
          <button
            onClick={() => setVisible((v) => !v)}
            className="text-violet-400 hover:text-violet-300 text-xs"
          >
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </span>
      {resetting ? (
        <span className="flex items-center gap-2">
          <input
            type="text"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="New password (min 6)"
            className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20 outline-none w-40"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />
          <button
            onClick={submit}
            disabled={newPwd.length < 6}
            className="text-green-400 hover:text-green-300 text-xs disabled:opacity-40"
          >
            Save
          </button>
          <button
            onClick={() => { setResetting(false); setNewPwd(""); }}
            className="text-neutral-500 hover:text-neutral-300 text-xs"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          onClick={() => setResetting(true)}
          className="text-yellow-400 hover:text-yellow-300 text-xs text-left w-fit"
        >
          Reset password
        </button>
      )}
    </div>
  );
}

export default function ViewStores({
  stores,
  navigate,
  handleDelete,
  handleResetPassword,
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
                {["Name", "Email", "Password", "Store Slug", "Actions"].map((h) => (
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
                  <td className="px-6 py-4">
                    <PasswordCell
                      password={s.owner?.loginPassword}
                      uid={s.owner?.uid}
                      onReset={handleResetPassword}
                    />
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
