import React from "react";
import { motion } from "framer-motion";
import OptimizedImage from "../../../shared/components/OptimizedImage";
import { ArrowRight } from "lucide-react";

const TAG_LABELS = {
  "most-booked": "Most Booked",
  "top-rated": "Top Rated",
  "popular-choice": "Popular Choice",
  "new": "New",
};

const TAG_COLORS = {
  "most-booked": "bg-amber-500/10 border border-amber-500/30 text-amber-300 backdrop-blur-md shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  "top-rated": "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  "popular-choice": "bg-violet-500/10 border border-violet-500/30 text-violet-300 backdrop-blur-md shadow-[0_0_10px_rgba(139,92,246,0.1)]",
  "new": "bg-blue-500/10 border border-blue-500/30 text-blue-300 backdrop-blur-md shadow-[0_0_10px_rgba(59,130,246,0.1)]",
};

const PackageTile = ({ pkg, onClick }) => {
  const cover = pkg.images?.[0]?.url;
  const offer = (pkg.pricing?.offerPrice || 0) + (pkg.pricing?.commission || 0);
  const actual = pkg.pricing?.actualPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(pkg)}
      className="group relative cursor-pointer w-42 md:w-56 overflow-hidden rounded-3xl border-b-2 border-white/8 bg-white/2 backdrop-blur-md transition-all duration-500 mb-6 block p-2 shadow-inner shadow-white/20 md:p-2.5"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none z-20" />

      <div className="relative h-56 md:h-70 overflow-hidden rounded-2xl bg-neutral-950/50">
        {cover ? (
          <OptimizedImage
            url={cover}
            type="category"
            alt={pkg.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-neutral-600 text-sm">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {pkg.tag && (
          <span className={`absolute top-2 right-2 z-10 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${TAG_COLORS[pkg.tag]}`}>
            {TAG_LABELS[pkg.tag]}
          </span>
        )}
      </div>

      <div className="pt-4 px-1 pb-0.5">
        <p className="text-[8px] tracking-wider uppercase text-violet-400 font-semibold opacity-90">
          {pkg.subcategory || "Makeup Package"}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-white/95 line-clamp-1 group-hover:text-violet-200 transition-colors duration-300">
          {pkg.name}
        </h3>
        {pkg.artistName && (
          <p className="text-[9px] text-neutral-400 mt-0.5 font-medium leading-none">by {pkg.artistName}</p>
        )}

        {/* Pricing and Action trigger */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {offer > 0 && (
              <span className="text-sm font-bold text-violet-300 group-hover:text-violet-200 transition-colors duration-300">
                ₹{offer.toLocaleString()}
              </span>
            )}
            {actual > 0 && actual !== offer && (
              <span className="text-neutral-500 line-through text-[10px]">
                ₹{actual.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-[10px] md:text-xs text-white/30 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-300 font-medium inline-flex items-center gap-0.5">
            Details <ArrowRight className="inline-block w-4.5 h-4.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PackageTile;
