import { Edit, Trash2 } from "lucide-react";
import React from "react";

const ProductList = ({ products = [], onEdit, onDelete }) => {
  const canEdit = typeof onEdit === "function";

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
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {products.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-white/5 transition-colors group"
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
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canEdit && (
                    <button
                      onClick={() => onEdit(p)}
                      className="p-2 text-neutral-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(p.id)}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
