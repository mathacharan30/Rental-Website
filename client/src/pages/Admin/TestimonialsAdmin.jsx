import React, { useEffect, useState } from "react";
import {
  listTestimonials,
  createTestimonial,
  deleteTestimonial,
} from "../../services/testimonialService";
import { getAllProducts } from "../../services/productService";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import Modal from "../../components/admin/Modal";
import { Plus, Star, Trash2 } from "lucide-react";

const TestimonialsAdmin = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [products, setProducts] = useState([]);
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [productId, setProductId] = useState("");
  const [handle, setHandle] = useState("");
  const [isTop, setIsTop] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    try {
      await createTestimonial({
        userName,
        handle,
        comment,
        rating,
        product: productId,
        isTop,
      });
      setUserName("");
      setComment("");
      setRating(5);
      toast.success("Testimonial added successfully", { id: loadingToast });
      setIsModalOpen(false);
      await load();
    } catch (e) {
      console.error("Create testimonial failed", e);
      toast.error(
        e?.response?.data?.message || "Failed to create testimonial",
        {
          id: loadingToast,
        }
      );
    }
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
        }
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
          onClick={() => setIsModalOpen(true)}
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
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Testimonial"
      >
        <form onSubmit={handleAdd} className="space-y-4">
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

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              Add Testimonial
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TestimonialsAdmin;
