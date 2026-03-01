import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BiLeftArrow } from "react-icons/bi";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import Footer from "../../components/Footer";
import { getProductById } from "../../services/productService";
import { createPayment } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser, role } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (e) {
        console.error("[ProductDetail] Failed to load product", e);
        toast.error("Failed to load product details");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <motion.div
        className="min-h-[60vh] flex items-center justify-center bg-[#0e0e0e]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Loader />
      </motion.div>
    );
  }

  if (!product) {
    return (
      <motion.div
        className="min-h-[60vh] flex items-center justify-center bg-[#0e0e0e]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center p-8 glass rounded-2xl max-w-sm">
          <h2 className="text-xl font-bold text-white">Product not found</h2>
          <p className="mt-2 text-neutral-500 text-sm">
            The product you are looking for does not exist.
          </p>
          <button onClick={() => navigate(-1)} className="mt-4 btn-funky">
            <span>Go Back</span>
          </button>
        </div>
      </motion.div>
    );
  }

  const rating = product.rating || 4.3;
  const isJewels = product.category?.toLowerCase() === "jewels";
  const isSale = product.listingType === "sale";
  const sizes = product.sizes || ["XS", "S", "M", "L", "XL"];

  const handleRent = async () => {
    if (!firebaseUser) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    if (role !== "customer") {
      toast.error("Only customers can place orders");
      return;
    }
    if (!isJewels && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    setOrdering(true);
    const tid = toast.loading("Initiating payment…");
    try {
      const res = await createPayment({ productId: product.id, size: isSale ? "N/A" : selectedSize });
      toast.dismiss(tid);
      if (res.checkoutUrl) {
        // Redirect to PhonePe checkout page
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("Could not get payment URL. Please try again.");
        setOrdering(false);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to initiate payment", {
        id: tid,
      });
      setOrdering(false);
    }
  };

  const handleEnquire = () => {
    toast("Enquiry feature coming soon!");
  };

  return (
    <motion.div
      className="bg-[#0e0e0e] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── Top bar: back link ── */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Link
          to={`/products/${encodeURIComponent(product.category)}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-violet-400 transition-colors"
        >
          <BiLeftArrow /> Back to Products
        </Link>
      </div>

      {/* ── Product name + rating — TOP ── */}
      <motion.div
        className="text-center mt-6 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-violet-400 font-medium mb-2">
          {product.category}
        </p>
        <h1 className="text-3xl md:text-5xl font-bold display-font text-white tracking-tight">
          {product.title}
        </h1>
        <div className="flex items-center justify-center gap-1 mt-3">
          {Array.from({ length: 5 }).map((_, i) =>
            i < Math.floor(rating) ? (
              <AiFillStar key={i} className="text-violet-400" />
            ) : (
              <AiOutlineStar key={i} className="text-violet-400/30" />
            ),
          )}
          <span className="text-sm text-neutral-500 ml-1.5">
            {rating.toFixed(1)}
          </span>
        </div>
      </motion.div>

      {/* ── Hero image — CENTER ── */}
      <motion.div
        className="relative max-w-2xl mx-auto mt-8 px-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative rounded-3xl overflow-hidden glass border border-white/6">
          {/* Soft glow behind image */}
          <div className="absolute inset-0 bg-linear-to-b from-violet-600/4 via-transparent to-violet-600/4 pointer-events-none" />
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-[400px] md:h-[520px] object-contain p-6 relative z-1"
          />
        </div>

        {/* Thumbnail strip */}
        {product.images && product.images.length > 0 && (
          <div className="flex justify-center gap-2.5 mt-4 overflow-x-auto pb-1">
            {product.images.map((imgUrl, index) => (
              <img
                key={index}
                src={imgUrl}
                alt={`${product.title} ${index + 1}`}
                className="w-14 h-14 object-cover rounded-xl cursor-pointer border border-white/10 hover:border-violet-500/40 transition-all duration-200 hover:scale-105"
                onClick={() => setProduct({ ...product, image: imgUrl })}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Details + Actions — BOTTOM ── */}
      <motion.div
        className="max-w-3xl mx-auto mt-10 px-4 pb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        {/* Price row */}
        <div className="flex items-end justify-center gap-4 flex-wrap">
          <span className="text-4xl font-bold gradient-text">
            {product.price}
          </span>
          {product.advanceAmount > 0 && (
            <span className="text-sm text-violet-400 font-medium pb-1">
              Advance: ₹
              {Number.isInteger(product.advanceAmount)
                ? product.advanceAmount
                : product.advanceAmount.toFixed(2)}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-5 text-sm text-neutral-400 leading-relaxed text-center max-w-xl mx-auto">
          {product.description ||
            "Elegant rental piece — perfect for special occasions. Contact us for custom durations and styling options."}
        </p>

        {/* Info chips */}
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-neutral-400 glass px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span>
              <strong className="text-neutral-300">Condition:</strong> Excellent
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-400 glass px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span>
              <strong className="text-neutral-300">Availability:</strong>{" "}
              {isSale ? "Available for sale" : "Ready to rent"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/6 my-8 max-w-md mx-auto" />

        {/* Size selector — hidden for Jewels */}
        {!isJewels && (
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-300 mb-3">
            Select Size
          </p>
          <div className="flex justify-center flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedSize === size
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "glass text-neutral-400 hover:text-white hover:border-violet-500/30"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={handleRent}
            disabled={ordering}
            className="btn-funky rounded-xl! px-10 disabled:opacity-60"
          >
            <span>{ordering ? "Redirecting to payment…" : isSale ? "Buy Now →" : "Rent Now →"}</span>
          </button>
          <button
            onClick={handleEnquire}
            className="btn-outline-funky rounded-xl! px-10"
          >
            Enquire Now
          </button>
        </div>
      </motion.div>

      <Footer />
    </motion.div>
  );
};

export default ProductDetail;
