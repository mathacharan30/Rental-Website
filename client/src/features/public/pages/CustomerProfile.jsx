// src/pages/Main/CustomerProfile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../../../services/orderService";
import toast from "react-hot-toast";
import { addProductTestimonial } from "../../../services/productTestimonialService";
import { convertToJpeg } from "../../../utils/heicConvert";
import {
  Star,
  Upload,
  Camera,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  ShoppingBag,
  Copy,
  ArrowRight,
  Calendar,
  ArrowLeft
} from "lucide-react";
import { OrdersSkeleton } from "../loaders";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  active: "bg-green-500/10 text-green-400 border border-green-500/20",
  completed: "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20",
  cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const STATUS_LABELS = {
  pending: "payment pending",
  confirmed: "payment confirm",
  cancelled: "payment cancelled",
  active: "order active",
  completed: "order completed",
};

const CustomerProfile = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [tab, setTab] = useState("profile");

  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (tab !== "orders") return;
    setOrdersLoading(true);
    getMyOrders()
      .then(setOrders)
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setOrdersLoading(false));
  }, [tab]);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/login");
  };

  const handleReviewImageChange = async (e) => {
    const raw = e.target.files[0];
    if (!raw) return;
    const file = await convertToJpeg(raw);
    setReviewImage(file);
    setReviewImagePreview(URL.createObjectURL(file));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error("Please write a comment.");
    }

    setSubmittingReview(true);
    const fd = new FormData();
    fd.append("productId", reviewOrder.product._id || reviewOrder.product.id);
    fd.append("rating", rating);
    fd.append("comment", comment);
    if (reviewImage) {
      fd.append("image", reviewImage);
    }

    try {
      await addProductTestimonial(fd);
      toast.success("Testimonial submitted!");
      closeReviewModal();
    } catch (err) {
      toast.error(err.message || "Failed to submit testimonial.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const closeReviewModal = () => {
    setReviewOrder(null);
    setRating(5);
    setHoverRating(0);
    setComment("");
    setReviewImage(null);
    setReviewImagePreview(null);
  };

  if (!userProfile) return null;

  const { name, email, phone, address, role } = userProfile;

  return (
    <div className="relative min-h-[80vh] py-10 md:py-14 px-4 mx-auto overflow-visible">
      <div className="max-w-xl mx-auto flex justify-center px-4 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-violet-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>
      <div className="flex justify-center gap-2 mb-8 flex-wrap relative z-20">
        {[
          { key: "profile", label: "Profile" },
          { key: "orders", label: "My Orders" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize cursor-pointer ${
              tab === t.key
                ? "bg-violet-600 text-white shadow-inner shadow-white border-b-[1.55px] border-violet-300/40 hover:bg-violet-500"
                : "bg-white/2 shadow-inner shadow-white/24 text-neutral-400 border-b-[1.55px] border-white/7 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full bg-white/2 max-w-2xl mx-auto border border-white/6 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl shadow-black/30"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b border-white/6 mb-6 relative w-full text-center md:text-left">
            <div className="relative w-16 h-16 shrink-0 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xl">
              {name?.charAt(0) || "U"}
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] bg-violet-600 border border-violet-400/20 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {role}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-bold tracking-wide text-white">
                {name}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-medium flex items-center justify-center md:justify-start gap-1.5">
                <Mail size={12} className="text-neutral-500 shrink-0" />
                {email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: <User size={16} />, label: "Full Name", value: name },
              { icon: <Mail size={16} />, label: "Email Address", value: email },
              { icon: <Phone size={16} />, label: "Phone Number", value: phone },
              { icon: <MapPin size={16} />, label: "Shipping Address", value: address },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                <div className="text-neutral-500 mt-0.5 shrink-0">{item.icon}</div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">{item.label}</span>
                  <span className="text-sm font-medium text-white mt-0.5 block whitespace-pre-wrap leading-relaxed">{item.value || "—"}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 w-full px-5 py-2.5 rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </motion.div>
      )}

      {tab === "orders" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {ordersLoading ? (
            <OrdersSkeleton count={3} />
          ) : orders.length === 0 ? (
            <div className="bg-white/2 max-w-2xl mx-auto border border-white/6 backdrop-blur-md rounded-2xl p-10 text-center text-neutral-400 shadow-xl flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 mb-3 border border-white/5">
                <ShoppingBag size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">No orders found</h3>
              <p className="text-neutral-500 text-xs max-w-xs mb-5">
                You haven't rented or purchased any clothing items yet.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-5 py-2.5 bg-violet-600 text-white shadow-inner shadow-white border-b-[1.55px] border-violet-300/40 hover:bg-violet-500 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Browse Rentals</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {orders.map((o) => {
                const amountPaid =
                  o.listingType === "sale"
                    ? (o.salePrice || 0) +
                    (o.commissionPrice || 0) +
                    (o.deliveryCharge || 0)
                    : (o.rentPrice || 0) +
                    (o.commissionPrice || 0) +
                    (o.advanceAmount || 0) +
                    (o.deliveryCharge || 0);
                const refundable = o.advanceAmount || 0;

                return (
                  <div
                    key={o._id}
                    className="bg-white/2 border border-white/6 rounded-2xl p-5 hover:border-white/10 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: image & details */}
                      <div className="flex gap-4 items-center min-w-0 flex-1">
                        {o.product?.images?.[0]?.url && (
                          <img
                            src={o.product.images[0].url}
                            alt={o.product?.name || "Product image"}
                            className="w-16 h-16 object-cover rounded-xl border border-white/5 bg-neutral-900 shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-neutral-400">#{o._id.slice(-8)}</span>
                            <span
                              className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${STATUS_COLORS[o.status]}`}
                            >
                              {STATUS_LABELS[o.status] || o.status}
                            </span>
                          </div>
                          <h4 className="font-semibold text-white text-sm md:text-base leading-snug truncate">
                            {o.product?.name || "—"}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-400">
                            {o.listingType && (
                              <span className="capitalize">{o.listingType}</span>
                            )}
                            {o.listingType !== "sale" && o.size && (
                              <>
                                <span>•</span>
                                <span>Size: {o.size}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>
                              Ordered on{" "}
                              {new Date(o.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: prices & action button */}
                      <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-0 border-white/5 shrink-0">
                        <div>
                          <span className="text-neutral-500 block text-[9px] uppercase tracking-wider font-bold">
                            Total Paid
                          </span>
                          <span className="text-xs font-bold text-white mt-0.5 block">
                            ₹{amountPaid.toLocaleString()}
                          </span>
                        </div>
                        {o.listingType !== "sale" && (
                          <div>
                            <span className="text-neutral-500 block text-[9px] uppercase tracking-wider font-bold">
                              Refundable
                            </span>
                            <span className="text-xs font-bold text-violet-400 mt-0.5 block">
                              ₹{refundable.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {o.status === "completed" && (
                          <button
                            onClick={() => setReviewOrder(o)}
                            className="px-3.5 py-1.5 bg-violet-600 text-white shadow-inner shadow-white border-b-[1.55px] border-violet-300/40 hover:bg-violet-500 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Star size={12} className="fill-white/20" />
                            <span>Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeReviewModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-neutral-950/90 border border-white/10 rounded-2xl w-full max-w-md p-5 relative shadow-2xl backdrop-blur-xl z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

              <button
                onClick={closeReviewModal}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all z-20 cursor-pointer animate-none"
              >
                <X size={14} />
              </button>

              <h3 className="text-lg font-bold mb-3.5 display-font bg-clip-text text-transparent bg-linear-to-r from-white to-violet-300">
                Write Testimonial
              </h3>

              <div className="mb-4.5 flex items-center gap-3 p-2.5 bg-white/2 border border-white/6 rounded-xl">
                <img
                  src={
                    reviewOrder.product?.images?.[0]?.url ||
                    reviewOrder.product?.image
                  }
                  alt=""
                  className="w-12 h-12 object-cover rounded-lg border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
                    Product
                  </p>
                  <span className="text-xs font-semibold text-white block truncate mt-0.5">
                    {reviewOrder.product?.name ||
                      reviewOrder.product?.title ||
                      "Product"}
                  </span>
                </div>
              </div>

              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform active:scale-95 cursor-pointer animate-none"
                      >
                        <Star
                          size={24}
                          className={`${star <= (hoverRating || rating)
                            ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            : "text-neutral-700"
                            } transition-all duration-150`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-white/2 border border-white/8 focus:border-violet-500/50 rounded-xl p-3.5 text-white text-xs outline-none transition-all duration-300 resize-none"
                    rows={4}
                    placeholder="Share your honest experience..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-2">
                    Add Photo (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/8 bg-white/2 text-xs font-semibold hover:border-violet-500/40 hover:bg-white/5 cursor-pointer transition-all duration-300 text-white animate-none">
                      <Camera size={13} className="text-violet-400 shrink-0" />
                      <span>Take Photo</span>
                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        capture="environment"
                        onChange={handleReviewImageChange}
                        className="hidden"
                      />
                    </label>

                    <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/8 bg-white/2 text-xs font-semibold hover:border-violet-500/40 hover:bg-white/5 cursor-pointer transition-all duration-300 text-white animate-none">
                      <Upload size={13} className="text-violet-400 shrink-0" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        onChange={handleReviewImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {reviewImagePreview && (
                    <div className="mt-3 relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 group">
                      <img
                        src={reviewImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setReviewImage(null);
                          setReviewImagePreview(null);
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white/80 hover:text-white cursor-pointer"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-1.5">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="relative group/submit w-full overflow-hidden bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-3 font-bold shadow-xl shadow-violet-600/20 transition-all duration-300 disabled:opacity-50 cursor-pointer animate-none"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover/submit:translate-x-full transition-transform duration-1000 ease-out bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                    <span className="text-xs">
                      {submittingReview ? "Submitting..." : "Submit Testimonial"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerProfile;
