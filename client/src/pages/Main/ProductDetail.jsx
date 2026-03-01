import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BiLeftArrow } from "react-icons/bi";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import Footer from "../../components/Footer";
import { getProductById } from "../../services/productService";
import { createPayment } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6 },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser, role } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const carouselRef = useRef(null);

  const scrollToImage = (index) => {
    const container = carouselRef.current;
    if (!container) return;
    const card = container.children[index];
    if (card)
      card.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
  };

  const allImages = product?.images?.length
    ? product.images
    : product?.image
      ? [product.image]
      : [];

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setLightboxOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then(setProduct)
      .catch((e) => {
        console.error("[ProductDetail]", e);
        toast.error("Failed to load product details");
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <motion.div
        className="min-h-[60vh] flex items-center justify-center bg-[#0e0e0e]"
        {...fade}
      >
        <Loader />
      </motion.div>
    );

  if (!product) {
    return (
      <motion.div
        className="min-h-[60vh] flex items-center justify-center bg-[#0e0e0e]"
        {...fade}
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
      if (res.checkoutUrl) window.location.href = res.checkoutUrl;
      else {
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
    const text = encodeURIComponent(
      [
        `Product: ${product.title}`,
        product.category && `Category: ${product.category}`,
        product.price && `Price: ${product.price}`,
        selectedSize && `Size: ${selectedSize}`,
        product.id && `Product ID: ${product.id}`,
        `Link: ${window.location.href}`,
        "",
        "Please tell me more about this product...",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    window.open(
      `https://wa.me/919187668280?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <motion.div className="bg-[#0e0e0e] min-h-screen" {...fade}>
      <div className="max-w-6xl mx-auto px-4 pt-2">
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
          {[...Array(5)].map((_, i) =>
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

      <motion.div
        className="relative max-w-2xl mx-auto mt-4 px-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div
          ref={carouselRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#7c3aed33 transparent",
          }}
        >
          {allImages.map((imgUrl, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-full snap-center rounded-3xl overflow-hidden border border-white/6"
            >
              <img
                src={imgUrl}
                alt={`${product.title} — view ${i + 1}`}
                className="w-full h-[360px] rounded-xl md:h-[450px] object-contain cursor-pointer"
                draggable={false}
                onClick={() => {
                  setLightboxIndex(i);
                  setLightboxOpen(true);
                }}
              />
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-4 z-10 px-3 py-1 rounded-full glass text-xs text-white/60 font-medium backdrop-blur-md">
                  {i + 1} / {allImages.length}
                </div>
              )}
            </div>
          ))}
        </div>
        {allImages.length > 1 && (
          <>
            <div
              className="flex justify-center gap-2 mt-3 overflow-x-auto pb-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#7c3aed33 transparent",
              }}
            >
              {allImages.map((imgUrl, i) => (
                <img
                  key={i}
                  src={imgUrl}
                  alt={`${product.title} thumb ${i + 1}`}
                  className="w-14 h-14 object-cover rounded-xl cursor-pointer border border-white/10 hover:border-violet-500/40 transition-all duration-200 hover:scale-105 flex-shrink-0"
                  onClick={() => scrollToImage(i)}
                  draggable={false}
                />
              ))}
            </div>
            <p className="text-center text-xs text-neutral-500 mt-2">
              Swipe or scroll to see more photos
            </p>
          </>
        )}
      </motion.div>

      {/* Lightbox */}
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
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Close"
            >
              <IoClose size={28} />
            </button>
            <motion.img
              src={allImages[lightboxIndex] || product.image}
              alt={`${product.title} — fullscreen`}
              className="max-w-[92vw] max-h-[88vh] object-contain select-none"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details */}
      <motion.div
        className="max-w-3xl mx-auto mt-10 px-4 pb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
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

        <p className="mt-5 text-sm text-neutral-400 leading-relaxed text-center max-w-xl mx-auto">
          {product.description ||
            "Elegant rental piece — perfect for special occasions. Contact us for custom durations and styling options."}
        </p>

        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {[
            { color: "bg-green-400", label: "Condition", value: "Excellent" },
            {
              color: "bg-violet-400",
              label: "Availability",
              value: isSale ? "Available for sale" : "Ready to rent",
            },
          ].map(({ color, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm text-neutral-400 glass px-4 py-2 rounded-xl"
            >
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span>
                <strong className="text-neutral-300">{label}:</strong> {value}
              </span>
            </div>
          ))}
        </div>

        <div className="h-px bg-white/6 my-8 max-w-md mx-auto" />

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
