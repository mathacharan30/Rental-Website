import React, { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../../services/categoryService";

import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import Modal from "../../components/admin/Modal";

import { Plus, Image as ImageIcon, Trash2, UploadCloud } from "lucide-react";

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = async () => {
    setDataLoading(true);
    try {
      const list = await getCategories();
      setCategories(list);
    } catch (e) {
      console.error("Failed to load categories", e);
      toast.error("Failed to load categories");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error("Please enter a category name");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating category...");

    try {
      const fd = new FormData();
      fd.append("name", name);
      if (imageFile) fd.append("image", imageFile);

      await createCategory(fd);

      setName("");
      setImageFile(null);
      setFileKey(Date.now());

      toast.success("Category created successfully", { id: loadingToast });
      setIsModalOpen(false);
      await load();
    } catch (e) {
      console.error("Create category failed", e);
      toast.error(e?.response?.data?.message || "Failed to create category", {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this category? This will also delete all products in this category."
      )
    )
      return;

    setLoading(true);
    const loadingToast = toast.loading("Deleting category...");

    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully", { id: loadingToast });
      await load();
    } catch (e) {
      console.error("Delete category failed", e);
      toast.error(e?.response?.data?.message || "Failed to delete category", {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-neutral-500 mt-1">Manage product categories</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg 
          flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        {dataLoading ? (
          <div className="p-12 flex justify-center">
            <Loader />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No categories found. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {categories.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                          {c.image?.url || c.image ? (
                            <img
                              src={c.image?.url || c.image}
                              alt={c.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>

                        <div className="font-medium text-white">
                          {c.name}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 
                        rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Category"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Category Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bridal Wear"
              className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg 
              text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 
              outline-none transition-all"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Cover Image
            </label>

            <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:bg-white/5 transition-colors">
              <input
                key={fileKey}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    if (selectedFile.size > 2 * 1024 * 1024) {
                      toast.error("File is too large. Max size is 2MB.");
                      e.target.value = null; // Reset input
                      setImageFile(null);
                    } else {
                      setImageFile(selectedFile);
                    }
                  } else {
                    setImageFile(null);
                  }
                }}
                className="hidden"
                id="cat-file-upload"
              />

              <label
                htmlFor="cat-file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <UploadCloud size={24} className="text-neutral-400" />
                <span className="text-sm text-neutral-400">
                  {imageFile ? imageFile.name : "Click to upload image"}
                </span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-white/10 
              text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg 
              hover:bg-violet-700 transition-colors disabled:opacity-60 font-medium"
              type="submit"
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesAdmin;
