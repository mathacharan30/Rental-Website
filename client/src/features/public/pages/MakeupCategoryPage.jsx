import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, X, ChevronLeft, ChevronRight,
  CheckCircle2, MessageCircle,
} from "lucide-react";
import Footer from "../../shared/components/Footer";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { getMakeupCategories } from "../../../services/makeupCategoryService";
import { getMakeupPackagesByCategory } from "../../../services/makeupPackageService";
import { openWhatsApp } from "../../../services/whatsapp";

const TAG_LABELS = {
  "most-booked":    "Most Booked",
  "top-rated":      "Top Rated",
  "popular-choice": "Popular Choice",
  "new":            "New",
};

const TAG_COLORS = {
  "most-booked":    "bg-amber-500/90 text-white",
  "top-rated":      "bg-emerald-500/90 text-white",
  "popular-choice": "bg-violet-500/90 text-white",
  "new":            "bg-blue-500/90 text-white",
};

// ── Package tile ───────────────────────────────────────────────────────────────
const PackageTile = ({ pkg, onClick }) => {
  const cover = pkg.images?.[0]?.url;
  const offer  = pkg.pricing?.offerPrice;
  const actual = pkg.pricing?.actualPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onClick={() => onClick(pkg)}
      className="group cursor-pointer bg-white/3 border border-white/10 rounded-2xl overflow-hidden
      hover:border-violet-400/40 hover:shadow-[0_8px_32px_rgba(139,92,246,0.15)] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-4/3">
        {cover ? (
          <OptimizedImage
            url={cover}
            type="category"
            alt={pkg.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-neutral-600 text-sm">
            No image
          </div>
        )}

        {/* Tag badge */}
        {pkg.tag && (
          <span className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-semibold ${TAG_COLORS[pkg.tag]}`}>
            {TAG_LABELS[pkg.tag]}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">{pkg.name}</h3>
        {pkg.artistName && (
          <p className="text-neutral-500 text-xs mt-1">{pkg.artistName}</p>
        )}
        {pkg.shortDescription && (
          <p className="text-neutral-400 text-xs mt-2 line-clamp-2 leading-relaxed">
            {pkg.shortDescription}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          {offer > 0 && (
            <span className="text-violet-300 font-bold text-base">
              ₹{offer.toLocaleString()}
            </span>
          )}
          {actual > 0 && actual !== offer && (
            <span className="text-neutral-500 text-sm line-through">
              ₹{actual.toLocaleString()}
            </span>
          )}
        </div>
        <button className="mt-3 w-full py-2 rounded-xl text-xs font-medium border border-violet-500/30 text-violet-300
         group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all duration-300">
          View Details
        </button>
      </div>
    </motion.div>
  );
};

const ADDON_SERVICES = [
  { id: "makeup",        label: "Makeup",            price: 1500 },
  { id: "hairstyle",     label: "Hairstyle",         price: 800  },
  { id: "saree-draping", label: "Saree Draping",     price: 500  },
  { id: "saree-folding", label: "Saree Box Folding", price: 300  },
  { id: "jewellery",     label: "Jewellery",         price: 600  },
  { id: "flowers",       label: "Flowers",           price: 400  },
];

// ── Detail modal ───────────────────────────────────────────────────────────────
const PackageDetailModal = ({ pkg, onClose }) => {
  const [imgIdx, setImgIdx]           = useState(0);
  const [selectedAddons, setSelectedAddons] = useState(new Set());
  const images = pkg.images || [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const prev = () => setImgIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setImgIdx((i) => (i + 1) % images.length);

  const toggleAddon = (id) =>
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const addonTotal = ADDON_SERVICES
    .filter((a) => selectedAddons.has(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const packagePrice = pkg.pricing?.offerPrice || pkg.pricing?.totalPrice || 0;
  const grandTotal   = packagePrice + addonTotal;

  const handleBook = () => {
    const chosenAddons = ADDON_SERVICES.filter((a) => selectedAddons.has(a.id));
    const addonLines   = chosenAddons.map((a) => `  • ${a.label}: ₹${a.price.toLocaleString()}`);

    openWhatsApp({
      action: "enquiry",
      intro: `Hello! I'd like to book the following makeup package:`,
      heading: `${pkg.name}${pkg.artistName ? ` by ${pkg.artistName}` : ""}`,
      product: {
        title: pkg.name,
        category: pkg.category?.name,
        price: packagePrice ? `₹${packagePrice.toLocaleString()}` : undefined,
      },
      extraLines: [
        ...(pkg.shortDescription ? [`• ${pkg.shortDescription}`] : []),
        ...(chosenAddons.length > 0
          ? [`\nAdd-on Services:`, ...addonLines, `\nTotal (package + add-ons): ₹${grandTotal.toLocaleString()}`]
          : []),
      ],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* Close button — fixed at top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="grid md:grid-cols-2">

            {/* Left — Image gallery */}
            <div className="p-4 space-y-3">
              {/* Main image with counter */}
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-white/5">
                {images.length > 0 ? (
                  <>
                    <img
                      key={imgIdx}
                      src={images[imgIdx].url}
                      alt={`${pkg.name} ${imgIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Counter */}
                    {images.length > 1 && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-medium">
                        {imgIdx + 1} / {images.length}
                      </span>
                    )}
                    {/* Nav arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prev}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={next}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 text-sm">No image</div>
                )}
              </div>

              {/* Thumbnail strip — always shown when >1 image */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        i === imgIdx
                          ? "border-violet-500 opacity-100"
                          : "border-white/10 opacity-50 hover:opacity-90"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — Details */}
            <div className="p-4 md:p-5 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-white/8">
              {/* Header */}
              <div className="pr-8">
                {pkg.tag && (
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${TAG_COLORS[pkg.tag]}`}>
                    {TAG_LABELS[pkg.tag]}
                  </span>
                )}
                <h2 className="text-xl font-bold text-white instrument-serif leading-snug">{pkg.name}</h2>
                {pkg.artistName && <p className="text-sm text-neutral-400 mt-1">{pkg.artistName}</p>}
              </div>

              {/* Pricing */}
              {(pkg.pricing?.offerPrice > 0 || pkg.pricing?.actualPrice > 0) && (
                <div className="bg-white/4 border border-white/8 rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-2">Pricing</p>
                  {[
                    { label: "Actual Price", value: pkg.pricing?.actualPrice, strike: true },
                    { label: "Offer Price",  value: pkg.pricing?.offerPrice,  highlight: true },
                    { label: "Commission",   value: pkg.pricing?.commission },
                    { label: "Total Price",  value: pkg.pricing?.totalPrice,  bold: true },
                  ]
                    .filter((r) => r.value > 0)
                    .map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">{row.label}</span>
                        <span className={`text-sm font-semibold ${
                          row.highlight ? "text-violet-300 text-base" :
                          row.bold      ? "text-white"                :
                          row.strike    ? "text-neutral-500 line-through" :
                          "text-white"
                        }`}>
                          ₹{Number(row.value).toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Short description */}
              {pkg.shortDescription && (
                <p className="text-sm text-neutral-300 leading-relaxed">{pkg.shortDescription}</p>
              )}

              {/* Package details */}
              {pkg.packageDetails && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1.5">Package Details</p>
                  <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{pkg.packageDetails}</p>
                </div>
              )}

              {/* Complimentary */}
              {pkg.complimentary?.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-2">Complimentary</p>
                  <ul className="space-y-1.5">
                    {pkg.complimentary.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-emerald-300">
                        <CheckCircle2 size={13} className="shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add-on Services */}
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-3">Add-on Services</p>
                <div className="space-y-2">
                  {ADDON_SERVICES.map((addon) => {
                    const checked = selectedAddons.has(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                          checked
                            ? "bg-violet-500/10 border-violet-500/40"
                            : "border-white/8 hover:border-white/20 hover:bg-white/3"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            checked ? "bg-violet-600 border-violet-600" : "border-white/20"
                          }`}>
                            {checked && (
                              <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm ${checked ? "text-white" : "text-neutral-300"}`}>{addon.label}</span>
                        </div>
                        <span className={`text-sm font-semibold ${checked ? "text-violet-300" : "text-neutral-400"}`}>
                          +₹{addon.price.toLocaleString()}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddon(addon.id)}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>

                {/* Running total when addons selected */}
                {selectedAddons.size > 0 && (
                  <div className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-neutral-400">Total (package + add-ons)</span>
                    <span className="text-sm font-bold text-white">₹{grandTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={handleBook}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                bg-[#25D366] hover:bg-[#20b858] text-white font-semibold text-sm transition-colors"
              >
                <MessageCircle size={18} /> Book on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
const MakeupCategoryPage = () => {
  const { categoryId } = useParams();
  const [activeTab, setActiveTab] = useState("__all__");
  const [selectedPkg, setSelectedPkg] = useState(null);

  const { data: allCategories = [] } = useQuery({
    queryKey: ["makeup-categories-raw"],
    queryFn: getMakeupCategories,
    staleTime: 1000 * 60 * 5,
  });

  const category = allCategories.find((c) => c._id === categoryId || c.id === categoryId);

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["makeup-packages", categoryId],
    queryFn: () => getMakeupPackagesByCategory(categoryId),
    staleTime: 0,
    enabled: !!categoryId && categoryId !== "undefined",
  });

  const subcategories = category?.subcategories || [];

  // Reset tab when category changes
  useEffect(() => { setActiveTab("__all__"); }, [categoryId]);

  const displayed =
    activeTab === "__all__"
      ? packages
      : packages.filter((p) => p.subcategory === activeTab);

  return (
    <>
      <Helmet>
        <title>{category?.name ? `${category.name} Makeup Packages` : "Makeup Packages"}</title>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Back */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-white instrument-serif">
              {category?.name || "Makeup Packages"}
            </h1>
            <p className="text-neutral-500 mt-2 text-sm">
              Choose a package that fits your occasion and budget.
            </p>
          </div>

          {/* Subcategory tabs (shown only when subcategories exist) */}
          {subcategories.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-8">
              <button
                onClick={() => setActiveTab("__all__")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  activeTab === "__all__"
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-white/10 text-neutral-400 hover:text-white hover:border-violet-500/40"
                }`}
              >
                All
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveTab(sub)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    activeTab === sub
                      ? "bg-violet-600 border-violet-600 text-white"
                      : "border-white/10 text-neutral-400 hover:text-white hover:border-violet-500/40"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Package grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/10 aspect-3/4 animate-pulse" />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              No packages available{activeTab !== "__all__" ? ` for "${activeTab}"` : ""}.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayed.map((pkg) => (
                <PackageTile key={pkg._id} pkg={pkg} onClick={setSelectedPkg} />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedPkg && (
          <PackageDetailModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default MakeupCategoryPage;
