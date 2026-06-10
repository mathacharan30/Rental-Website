import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, CheckCircle2, MessageCircle } from "lucide-react";
import OptimizedImage from "../../../shared/components/OptimizedImage";
import { openWhatsApp } from "../../../../services/whatsapp";

const TAG_LABELS = {
  "most-booked": "Most Booked",
  "top-rated": "Top Rated",
  "popular-choice": "Popular Choice",
  "new": "New",
};

const TAG_COLORS = {
  "most-booked": "bg-amber-500/10 border-y border-amber-500/30 text-amber-300 backdrop-blur-md shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  "top-rated": "bg-emerald-500/10 border-y border-emerald-500/30 text-emerald-300 backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  "popular-choice": "bg-violet-500/10 border-y border-violet-500/30 text-violet-300 backdrop-blur-md shadow-[0_0_10px_rgba(139,92,246,0.1)]",
  "new": "bg-blue-500/10 border-y border-blue-500/30 text-blue-300 backdrop-blur-md shadow-[0_0_10px_rgba(59,130,246,0.1)]",
};

const ADDON_SERVICES = [
  { id: "makeup", label: "Makeup", price: 1500 },
  { id: "hairstyle", label: "Hairstyle", price: 800 },
  { id: "saree-draping", label: "Saree Draping", price: 500 },
  { id: "saree-folding", label: "Saree Box Folding", price: 300 },
  { id: "jewellery", label: "Jewellery", price: 600 },
  { id: "flowers", label: "Flowers", price: 400 },
];

const PackageDetailModal = ({ pkg, onClose }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState(new Set());
  const images = pkg.images || [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const prev = () => setImgIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setImgIdx((i) => (i + 1) % images.length);

  const toggleAddon = (id) =>
    setSelectedAddons((prevSet) => {
      const nextSet = new Set(prevSet);
      if (nextSet.has(id)) {
        nextSet.delete(id);
      } else {
        nextSet.add(id);
      }
      return nextSet;
    });

  const addonTotal = ADDON_SERVICES
    .filter((a) => selectedAddons.has(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const packagePrice = pkg.pricing?.offerPrice || pkg.pricing?.totalPrice || 0;
  const grandTotal = packagePrice + addonTotal;

  const handleBook = () => {
    const chosenAddons = ADDON_SERVICES.filter((a) => selectedAddons.has(a.id));
    const addonLines = chosenAddons.map((a) => `  • ${a.label}: ₹${a.price.toLocaleString()}`);

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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.97, y: 30, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="h-[84vh] md:h-[95vh] mx-4 w-full md:w-[60vw] relative bg-neutral-900 rounded-3xl shadow-2xl overflow-y-scroll"
      >
        <div className="flex items-center justify-between px-5  py-3.5 border-b border-white/5 " style={{ flexShrink: 0 }}>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Package Details</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 border-y border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="pkg-modal-body">
          <div className="grid md:grid-cols-[0.95fr_1.05fr] gap-0">
            <div className="p-4 space-y-2 ">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/4.2] md:aspect-square border border-white/5 bg-neutral-950/60 shadow-lg">
                {images.length > 0 ? (
                  <>
                    <OptimizedImage
                      url={images[imgIdx].url}
                      type="modal"
                      alt={`${pkg.name} ${imgIdx + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {images.length > 1 && (
                      <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-white text-xs font-mono select-none font-medium">
                        {imgIdx + 1} / {images.length}
                      </span>
                    )}

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prev}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 hover:scale-105 transition-all border border-white/5 cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={next}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 hover:scale-105 transition-all border border-white/5 cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 text-sm">
                    No image available
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${i === imgIdx
                        ? "border-violet-500 scale-102 opacity-100 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        : "border-white/10 opacity-60 hover:opacity-95"
                        }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 space-y-5">
              <div>
                {pkg.tag && (
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold   mb-2.5 ${TAG_COLORS[pkg.tag]}`}>
                    {TAG_LABELS[pkg.tag]}
                  </span>
                )}
                <h2 className="text-2xl font-bold text-white instrument-serif leading-tight">{pkg.name}</h2>
                {pkg.artistName && (
                  <p className="text-sm text-neutral-400 mt-1 font-medium">by {pkg.artistName}</p>
                )}
              </div>

              {(pkg.pricing?.offerPrice > 0 || pkg.pricing?.actualPrice > 0) && (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2.5">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Pricing Breakdown</p>
                  {[
                    { label: "Actual Price", value: pkg.pricing?.actualPrice, strike: true },
                    { label: "Offer Price", value: pkg.pricing?.offerPrice, highlight: true },
                    { label: "Commission", value: pkg.pricing?.commission },
                    { label: "Total Price", value: pkg.pricing?.totalPrice, bold: true },
                  ]
                    .filter((r) => r.value > 0)
                    .map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400 font-medium">{row.label}</span>
                        <span
                          className={`text-sm font-semibold ${row.highlight
                            ? "text-violet-300 text-base"
                            : row.bold
                              ? "text-white"
                              : row.strike
                                ? "text-neutral-500 line-through text-xs"
                                : "text-white"
                            }`}
                        >
                          ₹{Number(row.value).toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Description */}
              {pkg.shortDescription && (
                <p className="text-sm text-neutral-300 leading-relaxed font-normal">{pkg.shortDescription}</p>
              )}

              {/* Package Details */}
              {pkg.packageDetails && (
                <div className="space-y-1">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Package Details</p>
                  <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-normal">{pkg.packageDetails}</p>
                </div>
              )}

              {/* Complimentary */}
              {pkg.complimentary?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Included Complimentaries</p>
                  <ul className="space-y-2">
                    {pkg.complimentary.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-emerald-300 font-medium">
                        <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add-on Options */}
              <div className="space-y-3">
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Add-on Options</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ADDON_SERVICES.map((addon) => {
                    const checked = selectedAddons.has(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer select-none transition-all duration-200 ${checked
                          ? "bg-violet-500/10 border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                          : "border-white/5 hover:border-white/15 bg-white/[0.01] hover:bg-white/[0.03]"
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-violet-600 border-violet-600" : "border-white/20"
                              }`}
                          >
                            {checked && (
                              <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-xs font-semibold truncate ${checked ? "text-white" : "text-neutral-300"}`}>{addon.label}</span>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${checked ? "text-violet-300" : "text-neutral-400"}`}>
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
              </div>
            </div>
          </div>
        </div>

        {/* ── Fixed Footer CTA ── uses .pkg-modal-footer for guaranteed flex-shrink:0 */}
        <div className="pkg-modal-footer px-5 py-4 border-t border-white/5 bg-neutral-950/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-violet-600/5 border border-violet-500/25 shadow-inner mb-3">
            <span className="text-xs text-violet-200/80 font-medium">Grand Total (Incl. Add-ons)</span>
            <span className="text-sm font-bold text-white tracking-wide">₹{grandTotal.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={handleBook}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20b858] text-white font-bold text-sm transition-all duration-300 hover:shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:scale-102 active:scale-98 cursor-pointer"
          >
            <MessageCircle size={18} />
            Book on WhatsApp
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PackageDetailModal;
