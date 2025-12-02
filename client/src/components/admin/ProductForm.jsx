import React, { useState, useEffect } from "react";
import { getCategories } from "../../services/categoryService";
import toast from "react-hot-toast";
import { X } from "lucide-react";
const ProductForm = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(0);
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);
  const [images, setImages] = useState([]); // FileList
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (cats?.length) setCategoryId(cats[0]._id);
      } catch (e) {
        console.error("Failed to load categories", e);
        toast.error("Failed to load categories");
      }
    })();
  }, []);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max size is 2MB.`);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setImages(validFiles);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) {
      toast.error("Please enter a product name");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!price) {
      toast.error("Please enter a price");
      return;
    }

    const fd = new FormData();
    fd.append("name", title);
    fd.append("category", categoryId);

    const priceNum = parseFloat(String(price).replace(/[^0-9.]/g, ""));
    fd.append("price", isNaN(priceNum) ? "0" : String(priceNum));

    const stockNum = parseInt(String(stock).replace(/[^0-9-]/g, ""), 10);
    if (!Number.isNaN(stockNum))
      fd.append("stock", String(Math.max(0, stockNum)));

    const ratingNum = parseFloat(String(rating).replace(/[^0-9.]/g, ""));
    if (!Number.isNaN(ratingNum)) {
      const r = Math.min(5, Math.max(0, ratingNum));
      fd.append("rating", String(r));
    }

    if (description) fd.append("description", description);
    fd.append("available", available ? "true" : "false");
    images.forEach((file) => fd.append("images", file));

    onSave(fd);

    // reset after save
    setTitle("");
    setCategoryId(categories[0]?._id || "");
    setPrice("");
    setStock(0);
    setRating(0);
    setDescription("");
    setAvailable(true);
    setImages([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Product Name
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Elegant Wedding Dress"
            className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-neutral-900 focus:ring-2 focus:ring-pink-800 focus:border-pink-500 outline-none transition-all"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-neutral-900 focus:ring-2 focus:ring-pink-800 focus:border-pink-500 outline-none transition-all"
          >
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Price
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Images
          </label>
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:bg-neutral-50 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFiles}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <span className="text-sm text-neutral-600">
                Click to upload images(select one or more than one file)
              </span>
            </label>
            {images.length > 0 && (
              <div className="text-xs text-pink-800 font-medium mt-2">
                {images.length} file(s) selected
              </div>
            )}
          </div>
          {images.length > 0 && (
            <div className="mt-3 flex gap-3 flex-wrap">
              {images.map((file, idx) => {
                const preview = URL.createObjectURL(file);
                return (
                  <div key={idx} className="relative group">
                    <img
                      src={preview}
                      alt={`preview-${idx}`}
                      className="w-20 h-20 object-cover rounded-lg border border-neutral-300"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 
            opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description..."
            rows="3"
            className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Stock
          </label>
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            type="number"
            min="0"
            step="1"
            className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Rating (0-5)
          </label>
          <input
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="0"
            type="number"
            min="0"
            max="5"
            step="0.1"
            className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 py-2">
        <input
          type="checkbox"
          id="available"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="w-4 h-4 text-pink-800 border-neutral-300 rounded focus:ring-pink-500"
        />
        <label
          htmlFor="available"
          className="text-sm font-medium text-neutral-700 cursor-pointer"
        >
          Available for rent
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          disabled={loading}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 font-medium shadow-sm"
          type="submit"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
