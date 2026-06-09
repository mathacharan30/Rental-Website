import React, { useEffect, useState, useRef } from "react";
import {
  getAllMakeupPackages,
  createMakeupPackage,
  updateMakeupPackage,
  deleteMakeupPackage,
} from "../../services/makeupPackageService";
import { getMakeupCategories } from "../../services/makeupCategoryService";
import { convertToJpeg } from "../../utils/heicConvert";
import toast from "react-hot-toast";
import Loader from "../shared/components/Loader";
import Modal from "../admin/components/Modal";
import {
  Plus, Trash2, UploadCloud, Edit2, X, Image as ImageIcon,
} from "lucide-react";

const TAG_OPTIONS = [
  { value: "most-booked",     label: "Most Booked"     },
  { value: "top-rated",       label: "Top Rated"       },
  { value: "popular-choice",  label: "Popular Choice"  },
  { value: "new",             label: "New"             },
];

const TAG_COLORS = {
  "most-booked":    "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "top-rated":      "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "popular-choice": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "new":            "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const COMPLIMENTARY_PRESETS = ["Free Saree Draping", "Free Jewellery", "Free Touch-up"];

const EMPTY_FORM = {
  categoryId: "",
  subcategory: "",
  name: "",
  artistName: "",
  tag: "",
  pricing: { actualPrice: "", offerPrice: "", commission: "", totalPrice: "" },
  imageSlots: [null, null, null, null],
  packageDetails: "",
  shortDescription: "",
  complimentary: [],
  compInput: "",
};

const MakeupPackagesAdmin = () => {
  const [packages,   setPackages]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCat,  setFilterCat]  = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [loading,    setLoading]    = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode,  setIsEditMode]  = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const fileRefs = [useRef(), useRef(), useRef(), useRef()];

  const selectedCategory = categories.find((c) => c._id === form.categoryId);

  const load = async () => {
    setDataLoading(true);
    try {
      const [pkgs, cats] = await Promise.all([getAllMakeupPackages(), getMakeupCategories()]);
      setPackages(pkgs);
      setCategories(cats);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────────
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setPricing = (key, value) =>
    setForm((f) => ({ ...f, pricing: { ...f.pricing, [key]: value } }));

  const handleImageSelect = async (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const converted = await convertToJpeg(file);
    const preview = URL.createObjectURL(converted);
    setForm((f) => {
      const slots = [...f.imageSlots];
      slots[idx] = { type: "new", file: converted, preview };
      return { ...f, imageSlots: slots };
    });
  };

  const removeImageSlot = (idx) => {
    setForm((f) => {
      const slots = [...f.imageSlots];
      slots[idx] = null;
      return { ...f, imageSlots: slots };
    });
  };

  const addComplimentary = (value) => {
    const trimmed = (value || form.compInput).trim();
    if (!trimmed) return;
    if (form.complimentary.includes(trimmed)) { toast.error("Already added"); return; }
    setForm((f) => ({ ...f, complimentary: [...f.complimentary, trimmed], compInput: "" }));
  };

  const removeComplimentary = (i) =>
    setForm((f) => ({ ...f, complimentary: f.complimentary.filter((_, idx) => idx !== i) }));

  // ── Open / close modal ────────────────────────────────────────────────────────
  const openAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (pkg) => {
    const slots = [null, null, null, null];
    (pkg.images || []).slice(0, 4).forEach((img, i) => {
      slots[i] = { type: "existing", url: img.url, publicId: img.publicId };
    });
    setForm({
      categoryId:       pkg.category?._id || pkg.category || "",
      subcategory:      pkg.subcategory || "",
      name:             pkg.name || "",
      artistName:       pkg.artistName || "",
      tag:              pkg.tag || "",
      pricing: {
        actualPrice: pkg.pricing?.actualPrice ?? "",
        offerPrice:  pkg.pricing?.offerPrice  ?? "",
        commission:  pkg.pricing?.commission  ?? "",
        totalPrice:  pkg.pricing?.totalPrice  ?? "",
      },
      imageSlots:       slots,
      packageDetails:   pkg.packageDetails   || "",
      shortDescription: pkg.shortDescription || "",
      complimentary:    pkg.complimentary    || [],
      compInput: "",
    });
    setEditingId(pkg._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error("Select a category"); return; }
    if (selectedCategory?.subcategories?.length > 0 && !form.subcategory) {
      toast.error("Please select a subcategory"); return;
    }
    if (!form.name.trim()) { toast.error("Package name is required"); return; }

    setLoading(true);
    const tid = toast.loading(isEditMode ? "Updating package..." : "Creating package...");

    try {
      const payload = {
        categoryId:       form.categoryId,
        subcategory:      form.subcategory || undefined,
        name:             form.name.trim(),
        artistName:       form.artistName.trim() || undefined,
        tag:              form.tag || undefined,
        pricing: {
          actualPrice: Number(form.pricing.actualPrice) || 0,
          offerPrice:  Number(form.pricing.offerPrice)  || 0,
          commission:  Number(form.pricing.commission)  || 0,
          totalPrice:  Number(form.pricing.totalPrice)  || 0,
        },
        imageSlots:       form.imageSlots,
        packageDetails:   form.packageDetails.trim()   || undefined,
        shortDescription: form.shortDescription.trim() || undefined,
        complimentary:    form.complimentary,
      };

      if (isEditMode) {
        await updateMakeupPackage(editingId, payload);
        toast.success("Package updated", { id: tid });
      } else {
        await createMakeupPackage(payload);
        toast.success("Package created", { id: tid });
      }

      closeModal();
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this package?")) return;
    const tid = toast.loading("Deleting...");
    try {
      await deleteMakeupPackage(id);
      toast.success("Deleted", { id: tid });
      await load();
    } catch {
      toast.error("Failed to delete", { id: tid });
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const displayed = filterCat
    ? packages.filter((p) => (p.category?._id || p.category) === filterCat)
    : packages;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Makeup Packages</h1>
          <p className="text-neutral-500 mt-1">Manage packages under each makeup category</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg
          flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Package
        </button>
      </div>

      {/* Category filter */}
      <div className="mb-4">
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        {dataLoading ? (
          <div className="p-12 flex justify-center"><Loader /></div>
        ) : displayed.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No packages found. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Tag</th>
                  <th className="px-6 py-4">Offer Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayed.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                          {pkg.images?.[0]?.url ? (
                            <img src={pkg.images[0].url} alt={pkg.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-500">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{pkg.name}</p>
                          {pkg.artistName && <p className="text-xs text-neutral-500">{pkg.artistName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-white">{pkg.category?.name || "—"}</p>
                        {pkg.subcategory && (
                          <p className="text-xs text-neutral-500">{pkg.subcategory}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {pkg.tag ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${TAG_COLORS[pkg.tag]}`}>
                          {TAG_OPTIONS.find((t) => t.value === pkg.tag)?.label || pkg.tag}
                        </span>
                      ) : <span className="text-neutral-600">—</span>}
                    </td>
                    <td className="px-6 py-4 text-white text-sm">
                      {pkg.pricing?.offerPrice ? `₹${pkg.pricing.offerPrice.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(pkg)}
                          className="p-2 text-neutral-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg._id)}
                          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
        onClose={closeModal}
        title={isEditMode ? "Edit Package" : "Add Makeup Package"}
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">

          {/* Category + Subcategory */}
          <div className={`grid gap-3 ${selectedCategory?.subcategories?.length > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => {
                  setField("categoryId", e.target.value);
                  setField("subcategory", "");
                }}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            {selectedCategory?.subcategories?.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Subcategory *</label>
                <select
                  value={form.subcategory}
                  onChange={(e) => setField("subcategory", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">None</option>
                  {selectedCategory.subcategories.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Name + Artist */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Package Name *</label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Bridal HD Makeup"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Artist Name <span className="text-neutral-600">(optional)</span></label>
              <input
                value={form.artistName}
                onChange={(e) => setField("artistName", e.target.value)}
                placeholder="e.g. Priya Makeup Studio"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Tag</label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setField("tag", "")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  !form.tag
                    ? "bg-white/10 text-white border-white/20"
                    : "border-white/10 text-neutral-500 hover:text-white"
                }`}
              >
                None
              </button>
              {TAG_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setField("tag", t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize ${
                    form.tag === t.value
                      ? TAG_COLORS[t.value]
                      : "border-white/10 text-neutral-500 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-2">Pricing</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "actualPrice",  label: "Actual Price (scratch)" },
                { key: "offerPrice",   label: "Offer Price"            },
                { key: "commission",   label: "Commission"             },
                { key: "totalPrice",   label: "Total Price"            },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-neutral-500 mb-1">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={form.pricing[key]}
                      onChange={(e) => setPricing(key, e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 text-white pl-7 pr-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Images (up to 4) */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-2">
              Images <span className="text-neutral-600">(up to 4)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {form.imageSlots.map((slot, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5">
                  {slot ? (
                    <>
                      <img
                        src={slot.type === "existing" ? slot.url : slot.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageSlot(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/5 transition-colors gap-1">
                      <UploadCloud size={18} className="text-neutral-500" />
                      <span className="text-[10px] text-neutral-600">Upload</span>
                      <input
                        ref={fileRefs[idx]}
                        type="file"
                        accept="image/*,.heic,.heif"
                        className="hidden"
                        onChange={(e) => handleImageSelect(e, idx)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Short Description</label>
            <textarea
              value={form.shortDescription}
              onChange={(e) => setField("shortDescription", e.target.value)}
              placeholder="Brief one-liner about this package…"
              rows={2}
              className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Package Details */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Package Details</label>
            <textarea
              value={form.packageDetails}
              onChange={(e) => setField("packageDetails", e.target.value)}
              placeholder="Describe what's included in this package…"
              rows={3}
              className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Complimentary */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-2">
              Complimentary <span className="text-neutral-600">(optional)</span>
            </label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {COMPLIMENTARY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addComplimentary(preset)}
                  disabled={form.complimentary.includes(preset)}
                  className="px-2.5 py-1 rounded-full text-xs border border-white/10 text-neutral-400 hover:text-white hover:border-violet-500/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  + {preset}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={form.compInput}
                onChange={(e) => setField("compInput", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addComplimentary(); } }}
                placeholder="Custom complimentary item…"
                className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={() => addComplimentary()}
                className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {form.complimentary.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.complimentary.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  >
                    {item}
                    <button type="button" onClick={() => removeComplimentary(i)} className="hover:text-white">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60 font-medium"
            >
              {loading
                ? isEditMode ? "Updating…" : "Creating…"
                : isEditMode ? "Update Package" : "Add Package"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MakeupPackagesAdmin;
