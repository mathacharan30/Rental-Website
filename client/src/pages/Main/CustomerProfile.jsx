// src/pages/Main/CustomerProfile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../../services/orderService";
import toast from "react-hot-toast";
import { addProductTestimonial } from "../../services/productTestimonialService";
import { Star, Upload, Camera, X } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  active: "bg-green-500/20 text-green-400 border border-green-500/30",
  completed: "bg-neutral-500/20 text-neutral-400 border border-neutral-500/30",
  cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const STATUS_LABELS = {
  pending: "payment pending",
  confirmed: "payment confirm",
  cancelled: "payment cancelled",
  active: "order active",
  completed: "order completed"
};

const CustomerProfile = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [tab, setTab] = useState("profile");

  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
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

  const handleReviewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReviewImage(file);
      setReviewImagePreview(URL.createObjectURL(file));
    }
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
    setComment("");
    setReviewImage(null);
    setReviewImagePreview(null);
  };

  if (!userProfile) return null;

  const { name, email, phone, address, role, uid } = userProfile;

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b border-white/5 last:border-b-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-white">{value || "—"}</span>
    </div>
  );

  return (
    <div className="min-h-[70vh] py-16 px-4 max-w-2xl mx-auto bg-[#0e0e0e]">
      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {["profile", "orders"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 capitalize ${
              tab === t
                ? "bg-violet-600 text-white"
                : "glass text-neutral-400 hover:text-white"
            }`}
          >
            {t === "orders" ? `My Orders` : "Profile"}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {tab === "profile" && (
        <div className="w-full glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold display-font text-white">
              My Profile
            </h2>
            <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-3 py-1 rounded-full font-medium">
              {role}
            </span>
          </div>
          <div className="space-y-0">
            <Row label="Name" value={name} />
            <Row label="Email" value={email} />
            <Row label="Phone" value={phone} />
            <Row label="Address" value={address} />
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 w-full border border-red-500/30 text-red-400 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            Sign out
          </button>
        </div>
      )}

      {/* ── Orders tab ── */}
      {tab === "orders" && (
        <div>
          {ordersLoading ? (
            <p className="text-neutral-500 text-sm">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-neutral-500">
              No orders yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => {
                const amountPaid = o.listingType === 'sale' 
                  ? ((o.salePrice || 0) + (o.commissionPrice || 0))
                  : ((o.advanceAmount || 0) + (o.commissionPrice || 0));
                const refunded = amountPaid - (o.totalPrice || 0);

                return (
                  <div key={o._id} className="glass rounded-2xl p-4">
                    <div className="flex items-start gap-4">
                      {o.product?.images?.[0]?.url && (
                        <img
                          src={o.product.images[0].url}
                          alt=""
                          className="w-16 h-16 object-cover rounded-xl border border-white/10 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-white truncate">
                            {o.product?.name || "—"}
                          </p>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[o.status]}`}
                          >
                            {STATUS_LABELS[o.status] || o.status}
                          </span>
                        </div>
                        {o.listingType !== 'sale' && (
                          <p className="text-sm text-neutral-500 mt-0.5">
                            Size: {o.size || '—'}
                          </p>
                        )}
                        <div className="mt-2 text-sm text-neutral-400 flex flex-col gap-1">
                          <div>Amount Paid: <strong className="text-green-400">₹{amountPaid}</strong></div>
                          {o.listingType !== 'sale' && (
                            <div>Refundable Amount: <strong className="text-blue-400">₹{refunded > 0 ? refunded : 0}</strong></div>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {o.status === "completed" && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                        <button
                          onClick={() => setReviewOrder(o)}
                          className="text-xs px-4 py-1.5 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors border border-violet-500/30"
                        >
                          Write Testimonial
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={closeReviewModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Write Testimonial</h3>
            <div className="mb-4 flex items-center gap-2">
              <img
                src={reviewOrder.product?.images?.[0]?.url || reviewOrder.product?.image}
                alt=""
                className="w-10 h-10 object-cover rounded-md"
              />
              <span className="text-sm font-medium text-white line-clamp-1">
                {reviewOrder.product?.name || reviewOrder.product?.title || "Product"}
              </span>
            </div>
            
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        size={24}
                        className={`${
                          star <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-neutral-600"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-violet-500 transition-colors"
                  rows={4}
                  placeholder="Share your experience..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Add Photo (Optional)</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-black/50 text-sm hover:bg-white/5 cursor-pointer transition-colors text-white">
                    <Camera size={16} />
                    <span>Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleReviewImageChange}
                      className="hidden"
                    />
                  </label>
                  
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-black/50 text-sm hover:bg-white/5 cursor-pointer transition-colors text-white">
                    <Upload size={16} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReviewImageChange}
                      className="hidden"
                    />
                  </label>
                  
                  {reviewImagePreview && (
                    <img
                      src={reviewImagePreview}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-white/10 ml-auto"
                    />
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-violet-600 text-white rounded-xl py-2.5 font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
