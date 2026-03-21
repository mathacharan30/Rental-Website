import { Edit, Trash2 } from "lucide-react";
import React from "react";

const ProductList = ({ products = [], onEdit, onDelete, onToggleAvailability }) => {
  const canEdit = typeof onEdit === "function";
  const canToggle = typeof onToggleAvailability === "function";

  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500">
        No products found. Add one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4">Stock</th>
            <th className="px-6 py-4 text-center">Availability</th>
            <th className="px-6 py-4 text-center">Edit</th>
            <th className="px-6 py-4 text-center">Delete</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {products.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-white/5 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {p.title}
                    </div>
                    <div className="text-xs text-neutral-500 truncate max-w-[200px]">
                      {p.description || "No description"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-neutral-600">
                <span className="px-2 py-1 bg-white/5 rounded-full text-xs font-medium text-neutral-300">
                  {p.category}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-white">
                {p.price}
              </td>
              <td className="px-6 py-4 text-sm text-neutral-400">{p.stock}</td>

              {/* ── Availability toggle ── */}
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <button
                    title={p.available ? "Click to mark Unavailable" : "Click to mark Available"}
                    onClick={() => canToggle && onToggleAvailability(p.id)}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      width: "44px",
                      height: "24px",
                      borderRadius: "9999px",
                      border: "none",
                      cursor: canToggle ? "pointer" : "default",
                      backgroundColor: p.available ? "#16a34a" : "#dc2626",
                      transition: "background-color 0.25s",
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: p.available ? "calc(100% - 22px)" : "2px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        transition: "left 0.25s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      }}
                    />
                  </button>
                  <span
                    className="text-xs font-medium"
                    style={{ color: p.available ? "#4ade80" : "#f87171" }}
                  >
                    {p.available ? "Available" : "Not Available"}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4 text-center">
                {canEdit && (
                  <button
                    onClick={() => onEdit(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onDelete(p.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
