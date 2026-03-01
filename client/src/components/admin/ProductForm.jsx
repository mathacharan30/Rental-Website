import React, { useState, useEffect } from "react";
import { getCategories } from "../../services/categoryService";
import toast from "react-hot-toast";
import { X } from "lucide-react";
const ProductForm = ({ onSave, onCancel, initialData = null }) => {
  const isEditMode = !!initialData;
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [listingType, setListingType] = useState("rent"); // 'rent' | 'sale' — only for Jewels
  const [rentPrice, setRentPrice] = useState("");
  const [commissionPrice, setCommissionPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
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
        if (initialData) {
          // Pre-populate for edit – find category _id by name
          const matchedCat = cats.find(
            (c) => c.name.toLowerCase() === (initialData.category || "").toLowerCase()
          );
          setCategoryId(matchedCat?._id || cats[0]?._id || "");
          setListingType(initialData.listingType || "rent");
          setTitle(initialData.title || "");
          setRentPrice(initialData.rentPrice ?? "");
          setCommissionPrice(initialData.commissionPrice ?? "");
          setSalePrice(initialData.salePrice ?? "");
          setAdvanceAmount(initialData.advanceAmount ?? "");
          setStock(initialData.stock ?? 0);
          setRating(initialData.rating ?? 0);
          setDescription(initialData.description || "");
          setAvailable(initialData.available !== false);
        } else {
          if (cats?.length) setCategoryId(cats[0]._id);
        }
      } catch (e) {
        console.error("Failed to load categories", e);
        toast.error("Failed to load categories");
      }
    })();
  }, []);

  // Derived: is the currently selected category "Jewels"?
  const selectedCategory = categories.find((c) => c._id === categoryId);
  const isJewels = selectedCategory && selectedCategory.name.toLowerCase() === "jewels";

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

    // Jewels-specific validation
    if (isJewels && listingType === "sale") {
      if (!salePrice) {
        toast.error("Please enter a sale price");
        return;
      }
      if (commissionPrice === "") {
        toast.error("Please enter a commission price");
        return;
      }
    } else {
      if (!rentPrice) {
        toast.error("Please enter a rent price");
        return;
      }
      if (commissionPrice === "") {
        toast.error("Please enter a commission price");
        return;
      }
    }

    const fd = new FormData();
    fd.append("name", title);
    fd.append("category", categoryId);

    const actualListingType = isJewels ? listingType : "rent";
    fd.append("listingType", actualListingType);

    if (actualListingType === "sale") {
      const salePriceNum = parseFloat(String(salePrice).replace(/[^0-9.]/g, ""));
      fd.append("salePrice", isNaN(salePriceNum) ? "0" : String(salePriceNum));
      const saleCommissionNum = parseFloat(String(commissionPrice).replace(/[^0-9.]/g, ""));
      fd.append("commissionPrice", isNaN(saleCommissionNum) ? "0" : String(saleCommissionNum));
      fd.append("rentPrice", "0");
    } else {
      const rentPriceNum = parseFloat(String(rentPrice).replace(/[^0-9.]/g, ""));
      fd.append("rentPrice", isNaN(rentPriceNum) ? "0" : String(rentPriceNum));

      const commissionPriceNum = parseFloat(String(commissionPrice).replace(/[^0-9.]/g, ""));
      fd.append("commissionPrice", isNaN(commissionPriceNum) ? "0" : String(commissionPriceNum));
      fd.append("salePrice", "0");
    }

    const advanceAmountNum = (isJewels && listingType === "sale")
      ? 0
      : parseFloat(String(advanceAmount).replace(/[^0-9.]/g, ""));
    fd.append("advanceAmount", isNaN(advanceAmountNum) ? "0" : String(advanceAmountNum));

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
    setListingType("rent");
    setRentPrice("");
    setCommissionPrice("");
    setSalePrice("");
    setAdvanceAmount("");
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
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Product Name
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Elegant Wedding Dress"
            className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setListingType("rent"); }}
            className="w-full border border-white/10 bg-neutral-900 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
          >
            {categories.map((c) => (
              <option key={c._id} value={c._id} className="bg-neutral-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Jewels — Rent or Sale toggle */}
        {isJewels && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Listing Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setListingType("rent")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  listingType === "rent"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "border border-white/10 text-neutral-400 hover:text-white hover:border-violet-500/40"
                }`}
              >
                Rent
              </button>
              <button
                type="button"
                onClick={() => setListingType("sale")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  listingType === "sale"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "border border-white/10 text-neutral-400 hover:text-white hover:border-violet-500/40"
                }`}
              >
                Sale
              </button>
            </div>
          </div>
        )}

        {/* Sale price + commission — only for Jewels + Sale */}
        {isJewels && listingType === "sale" ? (
          <>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Sale Price (₹)
              </label>
              <input
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Commission Price (₹)
              </label>
              <input
                value={commissionPrice}
                onChange={(e) => setCommissionPrice(e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Total Price (₹) — auto-computed
              </label>
              <input
                readOnly
                value={
                  salePrice !== "" && commissionPrice !== ""
                    ? (parseFloat(salePrice) || 0) + (parseFloat(commissionPrice) || 0)
                    : ""
                }
                placeholder="Sale + Commission"
                type="number"
                className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-neutral-500 outline-none cursor-not-allowed"
              />
            </div>
          </>
        ) : (
          <>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Rent Price (₹)
              </label>
              <input
                value={rentPrice}
                onChange={(e) => setRentPrice(e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Commission Price (₹)
              </label>
              <input
                value={commissionPrice}
                onChange={(e) => setCommissionPrice(e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Total Price (₹) — auto-computed
              </label>
              <input
                readOnly
                value={
                  rentPrice !== "" && commissionPrice !== ""
                    ? (parseFloat(rentPrice) || 0) + (parseFloat(commissionPrice) || 0)
                    : ""
                }
                placeholder="Rent + Commission"
                type="number"
                className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-neutral-500 outline-none cursor-not-allowed"
              />
            </div>
          </>
        )}

        {!(isJewels && listingType === "sale") && (
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Advance Amount (₹)
            </label>
            <input
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
            />
          </div>
        )}

        <div className="col-span-2">
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Images
          </label>
          <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:bg-white/5 transition-colors">
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
                <span className="text-sm text-neutral-400">
                Click to upload images(select one or more than one file)
              </span>
            </label>
            {images.length > 0 && (
                <div className="text-xs text-violet-400 font-medium mt-2">
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
                      className="w-20 h-20 object-cover rounded-lg border border-white/10"
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
          {/* In edit mode show current images when no new files selected */}
          {isEditMode && images.length === 0 && initialData?.images?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-neutral-500 mb-2">Current images (upload new to replace):</p>
              <div className="flex gap-3 flex-wrap">
                {initialData.images.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`current-${idx}`}
                    className="w-20 h-20 object-cover rounded-lg border border-white/10 opacity-60"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description..."
            rows="3"
            className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Stock
          </label>
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            type="number"
            min="0"
            step="1"
            className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-neutral-300 mb-1">
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
            className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 py-2">
        <input
          type="checkbox"
          id="available"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="w-4 h-4 text-violet-600 border-white/10 rounded focus:ring-violet-500"
        />
        <label
          htmlFor="available"
          className="text-sm font-medium text-neutral-300 cursor-pointer"
        >
          {isJewels && listingType === "sale" ? "Available for sale" : "Available for rent"}
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          disabled={loading}
          className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60 font-medium"
          type="submit"
        >
          {loading ? "Saving..." : isEditMode ? "Save Changes" : "Save Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
