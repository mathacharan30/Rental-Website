import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BiLeftArrow } from "react-icons/bi";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import {
  IoChevronBack,
  IoChevronForward,
  IoClose,
  IoExpand,
} from "react-icons/io5";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // All images for the carousel
  const allImages =
    product?.images?.length > 0
      ? product.images
      : product?.image
        ? [product.image]
        : [];

  const goToImage = useCallback(
    (index) => {
      if (allImages.length === 0) return;
      setCurrentImageIndex((index + allImages.length) % allImages.length);
    },
    [allImages.length],
  );

  const prevImage = useCallback(
    () => goToImage(currentImageIndex - 1),
    [currentImageIndex, goToImage],
  );
  const nextImage = useCallback(
    () => goToImage(currentImageIndex + 1),
    [currentImageIndex, goToImage],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevImage, nextImage]);

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) nextImage();
    else if (diff < -threshold) prevImage();
    touchStartX.current = null;
    touchEndX.current = null;
  };

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
      const res = await createPayment({
        productId: product.id,
        size: isSale ? "N/A" : selectedSize,
      });
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
    const number = "919187668280";
    const parts = [
      `Product: ${product?.title ?? "N/A"}`,
      product?.category ? `Category: ${product.category}` : null,
      product?.price ? `Price: ₹${product.price}` : null,
      selectedSize ? `Size: ${selectedSize}` : null,
      product?.id ? `Product ID: ${product.id}` : null,
      `Link: ${window.location.href}`,
      "",
      "Please tell me more about this product...",
    ].filter(Boolean);
    const text = encodeURIComponent(parts.join("\n"));
    window.open(`https://wa.me/${number}?text=${text}`, "_blank", "noopener,noreferrer");
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

      {/* ── Image Carousel — CENTER ── */}
      <motion.div
        className="relative max-w-2xl mx-auto mt-8 px-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div
          className="relative rounded-3xl overflow-hidden glass border border-white/6 group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Soft glow behind image */}
          <div className="absolute inset-0 bg-linear-to-b from-violet-600/4 via-transparent to-violet-600/4 pointer-events-none" />

          {/* Main image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={allImages[currentImageIndex] || product.image}
              alt={`${product.title} — view ${currentImageIndex + 1}`}
              className="w-full h-[400px] md:h-[520px] object-contain p-6 relative z-[1] cursor-zoom-in"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              onClick={() => setLightboxOpen(true)}
              draggable={false}
            />
          </AnimatePresence>

          {/* Fullscreen hint badge */}
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl glass text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
            title="View fullscreen"
          >
            <IoExpand size={18} />
          </button>

          {/* Left / Right arrows (hidden when only 1 image) */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full glass text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-md"
                aria-label="Previous image"
              >
                <IoChevronBack size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full glass text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-md"
                aria-label="Next image"
              >
                <IoChevronForward size={20} />
              </button>
            </>
          )}

          {/* Image counter badge */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full glass text-xs text-white/60 font-medium backdrop-blur-md">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>

        {/* Dot indicators */}
        {allImages.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "w-6 h-2.5 bg-violet-500"
                    : "w-2.5 h-2.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="flex justify-center gap-2.5 mt-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-violet-600/30">
            {allImages.map((imgUrl, index) => (
              <img
                key={index}
                src={imgUrl}
                alt={`${product.title} ${index + 1}`}
                className={`w-14 h-14 object-cover rounded-xl cursor-pointer border transition-all duration-200 hover:scale-105 flex-shrink-0 ${
                  index === currentImageIndex
                    ? "border-violet-500 ring-2 ring-violet-500/30 scale-105"
                    : "border-white/10 hover:border-violet-500/40"
                }`}
                onClick={() => goToImage(index)}
                draggable={false}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Fullscreen Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Close fullscreen"
            >
              <IoClose size={28} />
            </button>

            {/* Counter */}
            {allImages.length > 1 && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-sm text-white/50 font-medium">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Left / Right arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                  aria-label="Previous image"
                >
                  <IoChevronBack size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                  aria-label="Next image"
                >
                  <IoChevronForward size={28} />
                </button>
              </>
            )}

            {/* Fullscreen image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={`lightbox-${currentImageIndex}`}
                src={allImages[currentImageIndex] || product.image}
                alt={`${product.title} — fullscreen view ${currentImageIndex + 1}`}
                className="max-w-[92vw] max-h-[88vh] object-contain select-none"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                draggable={false}
              />
            </AnimatePresence>

            {/* Lightbox dot indicators */}
            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToImage(index);
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "w-6 h-2.5 bg-violet-500"
                        : "w-2.5 h-2.5 bg-white/25 hover:bg-white/50"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
            <span>
              {ordering
                ? "Redirecting to payment…"
                : isSale
                  ? "Buy Now →"
                  : "Rent Now →"}
            </span>
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
