import React, { useEffect, useRef, useState } from "react";
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadTestimonialPhoto,
  MAX_TESTIMONIAL_PHOTOS,
} from "../../services/testimonialService";
import { getAllProducts } from "../../services/productService";
import toast from "react-hot-toast";
import Loader from "../shared/components/Loader";
import Modal from "../admin/components/Modal";
import { Plus, Star, Trash2, Pencil, ImagePlus, X } from "lucide-react";

const TestimonialsAdmin = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [products, setProducts] = useState([]);
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [productId, setProductId] = useState("");
  const [handle, setHandle] = useState("");
  const [isTop, setIsTop] = useState(false);
  // Photos: { kind: "existing", url, publicId } | { kind: "new", file, preview }
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const resetPhotos = (next = []) => {
    setPhotos((prev) => {
      prev.forEach((p) => p.kind === "new" && URL.revokeObjectURL(p.preview));
      return next;
    });
  };

  const addPhotos = (fileList) => {
    const files = Array.from(fileList || []).filter(
      (f) => f.type.startsWith("image/") || /\.hei[cf]$/i.test(f.name),
    );
    const room = MAX_TESTIMONIAL_PHOTOS - photos.length;
    if (files.length > room) toast.error(`You can add up to ${MAX_TESTIMONIAL_PHOTOS} photos`);
    const accepted = files.slice(0, Math.max(0, room)).map((file) => ({
      kind: "new",
      file,
      preview: URL.createObjectURL(file),
    }));
    if (accepted.length) setPhotos((prev) => [...prev, ...accepted]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      const p = prev[index];
      if (p?.kind === "new") URL.revokeObjectURL(p.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Uploads new photos to S3 and returns the final [{ url, publicId }] list
  const resolvePhotos = async (toastId) => {
    const out = [];
    const newCount = photos.filter((p) => p.kind === "new").length;
    let n = 0;
    for (const p of photos) {
      if (p.kind === "existing") {
        out.push({ url: p.url, publicId: p.publicId });
      } else {
        n += 1;
        toast.loading(`Uploading photo ${n} of ${newCount}...`, { id: toastId });
        out.push(await uploadTestimonialPhoto(p.file));
      }
    }
    return out;
  };

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ts, ps] = await Promise.all([
        listTestimonials(),
        getAllProducts(),
      ]);
      setTestimonials(ts);
      setProducts(ps);
      if (ps?.length && !productId) setProductId(ps[0].id);
    } catch (e) {
      console.error("Failed to load testimonials/products", e);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!userName || !comment || !productId) {
      toast.error("Please fill in all fields");
      return;
    }
    const loadingToast = toast.loading("Adding testimonial...");
    setSaving(true);
    try {
      const images = await resolvePhotos(loadingToast);
      toast.loading("Saving testimonial...", { id: loadingToast });
      await createTestimonial({
        userName,
        handle,
        comment,
        rating,
        product: productId,
        isTop,
        images,
      });
      toast.success("Testimonial added successfully", { id: loadingToast });
      closeModal();
      await load();
    } catch (e) {
      console.error("Create testimonial failed", e);
      toast.error(
        e?.response?.data?.message || "Failed to create testimonial",
        {
          id: loadingToast,
        },
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (t) => {
    setEditingTestimonial(t);
    setUserName(t.userName || "");
    setHandle(t.handle || "");
    setComment(t.comment || "");
    setRating(t.rating ?? 5);
    setIsTop(t.isTop || false);
    setProductId(t.product?._id || t.product || (products[0]?.id ?? ""));
    resetPhotos((t.images || []).map((img) => ({ kind: "existing", url: img.url, publicId: img.publicId })));
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!userName || !comment || !productId) {
      toast.error("Please fill in all fields");
      return;
    }
    const loadingToast = toast.loading("Updating testimonial...");
    setSaving(true);
    try {
      const images = await resolvePhotos(loadingToast);
      toast.loading("Saving changes...", { id: loadingToast });
      await updateTestimonial(editingTestimonial._id, {
        userName,
        handle,
        comment,
        rating,
        product: productId,
        isTop,
        images,
      });
      toast.success("Testimonial updated successfully", { id: loadingToast });
      closeModal();
      await load();
    } catch (e) {
      console.error("Update testimonial failed", e);
      toast.error(
        e?.response?.data?.message || "Failed to update testimonial",
        { id: loadingToast },
      );
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setUserName("");
    setHandle("");
    setComment("");
    setRating(5);
    setIsTop(false);
    resetPhotos([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?"))
      return;
    const loadingToast = toast.loading("Deleting testimonial...");
    try {
      await deleteTestimonial(id);
      toast.success("Testimonial deleted successfully", { id: loadingToast });
      await load();
    } catch (e) {
      console.error("Delete testimonial failed", e);
      toast.error(
        e?.response?.data?.message || "Failed to delete testimonial",
        {
          id: loadingToast,
        },
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonials</h1>
          <p className="text-neutral-500 mt-1">Manage customer reviews</p>
        </div>
        <button
          onClick={() => { setEditingTestimonial(null); setUserName(""); setHandle(""); setComment(""); setRating(5); setIsTop(false); resetPhotos([]); setIsModalOpen(true); }}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No testimonials found. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Photos</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {testimonials.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      {t.images?.length ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={t.images[0].url}
                            alt={t.userName}
                            className="w-11 h-14 rounded-lg object-cover border border-white/10"
                          />
                          {t.images.length > 1 && (
                            <span className="text-xs text-neutral-400">+{t.images.length - 1}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {t.userName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span className="font-medium text-white">
                          {t.rating}
                        </span>
                        <Star size={14} fill="currentColor" stroke="none" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400 max-w-xs truncate">
                      {t.comment}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">
                      {t.product ? t.product.name || t.product : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-2 text-neutral-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
      >
        <form onSubmit={editingTestimonial ? handleUpdate : handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Customer Name
            </label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Handle (optional)
            </label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. @johndoe"
              className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isTop"
              type="checkbox"
              checked={isTop}
              onChange={(e) => setIsTop(e.target.checked)}
              className="h-4 w-4 text-violet-600 border-white/10 rounded focus:ring-violet-500"
            />
            <label htmlFor="isTop" className="text-sm text-neutral-300">
              Mark as Top Testimonial
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Rating (0-5)
            </label>
            <input
              type="number"
              min="0"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Customer feedback..."
              rows="4"
              className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Customer Photos{" "}
              <span className="text-neutral-500 font-normal">(optional, up to {MAX_TESTIMONIAL_PHOTOS})</span>
            </label>
            <p className="text-xs text-neutral-500 mb-3">
              Portrait photos of the customer in the outfit or jewellery look best on the home page. The first photo is the cover.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <div
                  key={p.kind === "new" ? p.preview : p.publicId}
                  className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-white/5"
                >
                  <img
                    src={p.kind === "new" ? p.preview : p.url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold bg-violet-600/90 text-white px-1.5 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    disabled={saving}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_TESTIMONIAL_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="aspect-[4/5] rounded-lg border border-dashed border-white/20 hover:border-violet-500/60 hover:bg-violet-500/5 flex flex-col items-center justify-center gap-1.5 text-neutral-400 hover:text-violet-300 transition-colors"
                >
                  <ImagePlus size={22} />
                  <span className="text-xs font-medium">Add photo</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              multiple
              className="hidden"
              onChange={(e) => addPhotos(e.target.files)}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : editingTestimonial ? "Save Changes" : "Add Testimonial"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TestimonialsAdmin;
