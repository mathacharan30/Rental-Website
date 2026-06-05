import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, X, MapPin, Truck, ShieldCheck } from "lucide-react";
import { Share } from "lucide-react";
import Footer from "../../shared/components/Footer";
import FavoriteButton from "../../shared/components/FavoriteButton";
import { getProductById } from "../../../services/productService";
import { createPayment } from "../../../services/paymentService";
import { getDeliveryCities } from "../../../services/deliveryCityService";
import { getProductTestimonials } from "../../../services/productTestimonialService";
import toast from "react-hot-toast";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { useAuth } from "./../../../context/AuthContext";
import { DeliveryCitiesSkeleton, ProductDetailSkeleton } from "../loaders";

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6 },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser, role } = useAuth();

  // React Query for product and testimonials
  const {
    data: product,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      try {
        return await getProductById(id);
      } catch (e) {
        toast.error("Failed to load product details", error);
        throw e;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ["product-testimonials", id],
    queryFn: async () => {
      try {
        return await getProductTestimonials(id);
      } catch {
        return [];
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
  const [ordering, setOrdering] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [reviewLightboxImage, setReviewLightboxImage] = useState(null);
  const carouselRef = useRef(null);

  // Checkout sidebar state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null); // { _id, name, deliveryCharge }

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
    const onKey = (e) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setReviewLightboxImage(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (loading) return <ProductDetailSkeleton />;

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

  // Open checkout sidebar (pre-flight checks only)
  const handleRent = () => {
    if (!firebaseUser) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    if (role !== "customer") {
      toast.error("Only customers can place orders");
      return;
    }
    if (product.available === false) {
      toast.error("This product is currently not available");
      return;
    }
    if (!isJewels && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    // Fetch delivery cities and open sidebar
    setSelectedCity(null);
    setCitiesLoading(true);
    setCheckoutOpen(true);
    getDeliveryCities()
      .then((list) => setCities(list || []))
      .catch(() => toast.error("Could not load delivery cities"))
      .finally(() => setCitiesLoading(false));
  };

  // Proceed to PhonePe payment from the sidebar
  const handleProceedToPayment = async () => {
    if (!selectedCity) {
      toast.error("Please select a delivery city");
      return;
    }
    setOrdering(true);
    const tid = toast.loading("Initiating payment…");
    try {
      const res = await createPayment({
        productId: product.id,
        size: isSale ? "N/A" : selectedSize,
        deliveryCharge: selectedCity.deliveryCharge,
        deliveryCity: selectedCity.name,
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
    <motion.div className="min-h-screen" {...fade}>
      <Helmet>
        <title>
          {product.title} — Rent in Bangalore &amp; Karnataka | People &amp;
          Style
        </title>
        <meta
          name="description"
          content={`Rent ${product.title} (${product.category}) at ${product.price}. Premium designer outfit rental in Bangalore, Mysuru and across Karnataka.`}
        />
        <link
          rel="canonical"
          href={`https://peopleandstyle.in/product/${product.id}`}
        />
        <meta
          property="og:title"
          content={`${product.title} — Rent at People & Style`}
        />
        <meta
          property="og:description"
          content={
            product.description ||
            `Rent ${product.title} for your next event. Premium clothing rental in Karnataka.`
          }
        />
        <meta property="og:image" content={product.image} />
        <meta
          property="og:url"
          content={`https://peopleandstyle.in/product/${product.id}`}
        />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            image: allImages.length ? allImages : [product.image],
            description:
              product.description ||
              `Premium ${product.category} available for rent at People & Style`,
            brand: { "@type": "Brand", name: "People & Style" },
            offers: {
              "@type": "Offer",
              url: `https://peopleandstyle.in/product/${product.id}`,
              priceCurrency: "INR",
              price:
                String(product.advanceAmount || "").replace(/[^0-9.]/g, "") ||
                "0",
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/UsedCondition",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: String(rating),
              bestRating: "5",
              ratingCount: "1",
            },
          })}
        </script>
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <Link
          to={`/products/${encodeURIComponent(product.category)}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-violet-400 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Products
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:gap-6 max-w-6xl mx-auto mt-4 px-2 md:px-4">
        <motion.div
          className="relative w-full md:w-[48%] max-w-xl mx-auto md:mx-0"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div
            ref={carouselRef}
            className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#7c3aed33 transparent",
            }}
          >
            {allImages.map((imgUrl, i) => (
              <div
                key={i}
                className="relative shrink-0 w-full snap-center rounded-2xl overflow-hidden border border-white/6 aspect-4/5 md:aspect-3/4 max-h-105 md:max-h-120"
              >
                <OptimizedImage
                  url={imgUrl}
                  type="modal"
                  alt={`${product.title} — view ${i + 1}`}
                  className="w-full h-full object-contain rounded-xl cursor-pointer bg-neutral-900"
                  onClick={() => {
                    setLightboxIndex(i);
                    setLightboxOpen(true);
                  }}
                />
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-3 z-10 px-2 py-0.5 rounded-full glass text-xs text-white/60 font-medium backdrop-blur-md">
                    {i + 1} / {allImages.length}
                  </div>
                )}
              </div>
            ))}
          </div>
          {allImages.length > 1 && (
            <div className="flex justify-center gap-1 mt-2 overflow-x-auto pb-1">
              {allImages.map((imgUrl, i) => (
                <div
                  onClick={() => scrollToImage(i)}
                  key={i}
                  className="cursor-pointer"
                >
                  <OptimizedImage
                    url={imgUrl}
                    type="gallery"
                    alt={`${product.title} thumb ${i + 1}`}
                    className="w-10 h-10 object-cover rounded-lg border border-white/10 hover:border-violet-500/40 transition-all duration-200 hover:scale-105 shrink-0"
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className="w-full md:w-[52%] max-w-2xl p-4 mx-auto md:mx-0 mt-6 md:mt-0 pb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
        >
          <div className="flex items-center gap-2 justify-between md:justify-start">
            <h1 className="text-3xl md:text-4xl font-semibold instrument-serif tracking-wide text-white flex-1">
              {product.title}
            </h1>
            <FavoriteButton productId={product.id} size={18} />
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.title,
                    text: product.description || product.title,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                }
              }}
              className="p-2 rounded-full  text-violet-400 border border-violet-300/40 hover:bg-violet-500/15 hover:text-violet-500 transition-all duration-200"
              title="Share product link"
              aria-label="Share product"
            >
              <Share size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) =>
                  i < Math.floor(rating) ? (
                    <Star
                      key={i}
                      size={15}
                      className="text-violet-400 fill-violet-400"
                    />
                  ) : (
                    <Star key={i} size={15} className="text-violet-400/30" />
                  ),
                )}
                <span className="text-xs text-neutral-500 ml-1">
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-3 flex-wrap mt-4">
            <span className="text-2xl font-medium tracking-tight gradient-text">
              {product.price}
            </span>
            {product.advanceAmount > 0 && (
              <span className="text-xs text-violet-400 font-medium pb-1">
                Advance: ₹
                {Number.isInteger(product.advanceAmount)
                  ? product.advanceAmount
                  : product.advanceAmount.toFixed(2)}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-xl">
            {product.description ||
              "Elegant rental piece — perfect for special occasions. Contact us for custom durations and styling options."}
          </p>
          <div className="flex flex-row gap-2 mt-3">
            {[
              {
                color: "bg-green-400",
                label: "Condition",
                value: "Excellent",
              },
              {
                color:
                  product.available === false ? "bg-red-400" : "bg-violet-400",
                label: "Availability",
                value:
                  product.available === false
                    ? "Not Available"
                    : isSale
                      ? "Available for sale"
                      : "Ready to rent",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center gap-1 text-xs text-neutral-400 glass px-3 py-1 rounded-lg"
              >
                <span>
                  <strong className="text-neutral-300">{label}:</strong> {value}
                </span>
              </div>
            ))}
          </div>
          {!isJewels && (
            <div className="mt-5">
              <p className="text-xs font-medium text-neutral-300 mb-2">
                Select Size
              </p>

              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedSize === size ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "glass text-neutral-400 hover:text-white hover:border-violet-500/30"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-7 flex gap-3">
            {/* TEMPORARILY DISABLED — Rent Now / Buy Now button. Re-enable when order flow is ready.
            <button
              onClick={handleRent}
              disabled={ordering || product.available === false}
              className="btn-funky flex-1 rounded-xl! px-0 disabled:opacity-60 min-w-0"
            >
              <span>
                {ordering
                  ? "Redirecting to payment…"
                  : product.available === false
                    ? "Currently Unavailable"
                    : isSale
                      ? "Buy Now →"
                      : "Rent Now →"}
              </span>
            </button>
            */}
            <button
              onClick={handleEnquire}
              className="btn-outline-funky flex-1 rounded-xl! px-0 min-w-0"
            >
              Enquire &amp; Rent Now
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-sm"
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
              <X size={28} />
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <OptimizedImage
                url={allImages[lightboxIndex] || product.image}
                type="modal"
                alt={`${product.title} — fullscreen`}
                className="max-w-[92vw] max-h-[88vh] object-contain select-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {testimonials.length > 0 && (
        <motion.div
          className="max-w-4xl mx-auto px-4 pb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="h-px bg-white/6 my-10" />
          <h3 className="text-2xl font-bold text-white mb-6 text-center display-font">
            Customer Reviews
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="glass p-5 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {t.user?.profilePicture ? (
                      <OptimizedImage
                        url={t.user.profilePicture}
                        type="gallery"
                        alt={
                          t.user?.name
                            ? `${t.user.name} profile picture`
                            : "Customer profile picture"
                        }
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold border border-violet-500/30">
                        {t.user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {t.user?.name || "Customer"}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= t.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-neutral-700"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                  "{t.comment}"
                </p>
                {t.image && (
                  <div onClick={() => setReviewLightboxImage(t.image)}>
                    <OptimizedImage
                      url={t.image}
                      type="category"
                      alt="Review attachment"
                      className="w-full h-40 md:h-48 object-cover rounded-xl mt-1 border border-white/5 cursor-pointer hover:border-violet-500/30 transition-colors"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {reviewLightboxImage && (
          <motion.div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setReviewLightboxImage(null)}
          >
            <button
              onClick={() => setReviewLightboxImage(null)}
              className="absolute top-4 right-4 z-10 p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <OptimizedImage
                url={reviewLightboxImage}
                type="modal"
                alt="Review Fullscreen"
                className="max-w-[92vw] max-h-[88vh] object-contain select-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <AnimatePresence>
        {checkoutOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-9998 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !ordering && setCheckoutOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-full max-w-md z-9999 bg-[#111] border-l border-white/10 flex flex-col shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Order Summary</h2>
                <button
                  onClick={() => !ordering && setCheckoutOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                <div className="flex gap-4 items-start glass p-4 rounded-2xl">
                  {(product.images?.[0] || product.image) && (
                    <OptimizedImage
                      url={product.images?.[0] || product.image}
                      type="gallery"
                      alt={product.title}
                      className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-violet-400 font-medium">
                      {product.category}
                    </p>
                    <p className="text-white font-semibold mt-0.5 leading-tight">
                      {product.title}
                    </p>
                    {selectedSize && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Size:{" "}
                        <span className="text-neutral-200">{selectedSize}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="glass rounded-2xl p-4 space-y-3 text-sm">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium mb-1">
                    Price Breakdown
                  </p>

                  {isSale ? (
                    <div className="flex justify-between text-neutral-300">
                      <span>Sale Price</span>
                      <span className="font-medium text-white">
                        ₹
                        {(
                          (product.salePrice || 0) +
                          (product.commissionPrice || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-neutral-300">
                      <span>Total Rent Price</span>
                      <span className="font-medium text-white">
                        ₹
                        {(
                          (product.rentPrice || 0) +
                          (product.commissionPrice || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {!isSale && product.advanceAmount > 0 && (
                    <div className="flex justify-between items-start text-neutral-300">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={13} className="text-green-400" />
                        Advance (Refundable)
                      </span>
                      <div className="text-right">
                        <span className="font-medium text-white">
                          ₹{product.advanceAmount?.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-green-400 mt-0.5">
                          Returned after product return
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedCity && (
                    <div className="flex justify-between text-neutral-300">
                      <span className="flex items-center gap-1">
                        <Truck size={13} className="text-violet-400" />
                        Delivery ({selectedCity.name})
                      </span>
                      <span className="font-medium text-white">
                        {selectedCity.deliveryCharge === 0
                          ? "Free"
                          : `₹${selectedCity.deliveryCharge.toLocaleString()}`}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-neutral-200">
                      Total Payable
                    </span>
                    <span className="text-xl font-bold gradient-text">
                      ₹
                      {(
                        (isSale
                          ? (product.salePrice || 0) +
                            (product.commissionPrice || 0)
                          : (product.rentPrice || 0) +
                            (product.commissionPrice || 0) +
                            (product.advanceAmount || 0)) +
                        (selectedCity?.deliveryCharge || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  {!isSale && (
                    <p className="text-[11px] text-neutral-500 -mt-1">
                      Total Rent + Refundable Advance + Delivery.
                    </p>
                  )}
                </div>
                <div className="glass rounded-2xl p-4 space-y-3">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium flex items-center gap-1.5">
                    <MapPin size={12} /> Select Delivery City
                  </p>
                  {citiesLoading ? (
                    <DeliveryCitiesSkeleton count={6} />
                  ) : cities.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      No delivery cities available. Please contact us.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {cities.map((city) => (
                        <button
                          key={city._id}
                          onClick={() => setSelectedCity(city)}
                          className={`px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-200 border ${
                            selectedCity?._id === city._id
                              ? "bg-violet-600 border-violet-500 text-white"
                              : "glass border-white/10 text-neutral-300 hover:border-violet-500/40 hover:text-white"
                          }`}
                        >
                          <p className="font-medium">{city.name}</p>
                          <p className="text-[11px] mt-0.5 opacity-80">
                            {city.deliveryCharge === 0
                              ? "Free delivery"
                              : `₹${city.deliveryCharge}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-4 border-t border-white/10">
                <button
                  onClick={handleProceedToPayment}
                  disabled={ordering || !selectedCity}
                  className="btn-funky w-full rounded-xl! disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {ordering
                      ? "Redirecting to payment…"
                      : selectedCity
                        ? `Pay ₹${(
                            (isSale
                              ? (product.salePrice || 0) +
                                (product.commissionPrice || 0)
                              : (product.rentPrice || 0) +
                                (product.commissionPrice || 0) +
                                (product.advanceAmount || 0)) +
                            (selectedCity?.deliveryCharge || 0)
                          ).toLocaleString()} →`
                        : "Select a city to continue"}
                  </span>
                </button>
                <p className="text-center text-[11px] text-neutral-600 mt-2">
                  Secured by PhonePe · 256-bit encryption
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductDetail;
