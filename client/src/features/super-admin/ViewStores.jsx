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

const inputCls =
  "bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20 outline-none focus:border-violet-500 w-full";

function StoreRow({
  store: s,
  storeCities,
  navigate,
  handleDelete,
  handleResetPassword,
  handleUpdateStore,
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ name: "", slug: "", city: "" });

  const startEdit = () => {
    setDraft({
      name: s.name || "",
      slug: s.slug || "",
      city: s.city?._id || "",
    });
    setEditing(true);
  };

  const save = async () => {
    if (!draft.name.trim() || !draft.slug.trim()) return;
    setSaving(true);
    const ok = await handleUpdateStore(s._id, {
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      city: draft.city, // "" clears the city on the server
    });
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 text-white font-medium">
        {editing ? (
          <input
            className={inputCls}
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
        ) : (
          s.name
        )}
      </td>
      <td className="px-6 py-4 text-neutral-400">{s.owner?.email || "-"}</td>
      <td className="px-6 py-4">
        <PasswordCell
          password={s.owner?.loginPassword}
          uid={s.owner?.uid}
          onReset={handleResetPassword}
        />
      </td>
      <td className="px-6 py-4 text-neutral-400">
        {editing ? (
          <input
            className={inputCls}
            value={draft.slug}
            onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
          />
        ) : (
          s.slug
        )}
      </td>
      <td className="px-6 py-4 text-neutral-400">
        {editing ? (
          <select
            className={inputCls}
            value={draft.city}
            onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
          >
            <option value="" className="bg-neutral-900">
              — No city —
            </option>
            {storeCities.map((c) => (
              <option key={c._id} value={c._id} className="bg-neutral-900">
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          s.city?.name || <span className="text-neutral-600">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        {editing ? (
          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving || !draft.name.trim() || !draft.slug.trim()}
              className="text-green-400 hover:text-green-300 text-sm font-medium disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-neutral-500 hover:text-neutral-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={startEdit}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Edit
            </button>
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
          </div>
        )}
      </td>
    </tr>
  );
}

export default function ViewStores({
  stores,
  navigate,
  handleDelete,
  handleResetPassword,
  handleUpdateStore,
  storeCities = [],
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
                {["Name", "Email", "Password", "Store Slug", "City", "Actions"].map((h) => (
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
                <StoreRow
                  key={s._id}
                  store={s}
                  storeCities={storeCities}
                  navigate={navigate}
                  handleDelete={handleDelete}
                  handleResetPassword={handleResetPassword}
                  handleUpdateStore={handleUpdateStore}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
