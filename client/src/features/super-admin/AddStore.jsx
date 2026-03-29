import React from "react";

export default function AddStore({ form, setForm, handleCreateStore, busy }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-white">Create New Store</h2>
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
  );
}
