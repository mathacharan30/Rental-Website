import React from "react";
import { motion } from "framer-motion";
import OptimizedImage from "../../../shared/components/OptimizedImage";
import { ArrowRight } from "lucide-react";

const EventTile = ({ event, onClick }) => {
  const cover = event.coverImage?.url;
  const price = event.startingPrice || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(event)}
      className="group relative cursor-pointer w-42 md:w-56 overflow-hidden rounded-3xl border-b-2 border-white/8 bg-white/2 backdrop-blur-md transition-all duration-500 mb-6 block p-2 shadow-inner shadow-white/20 md:p-2.5"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none z-20" />

      <div className="relative h-56 md:h-70 overflow-hidden rounded-2xl bg-neutral-950/50">
        {cover ? (
          <OptimizedImage
            url={cover}
            type="category"
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-neutral-600 text-sm">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80" />
      </div>

      <div className="pt-4 px-1 pb-0.5">
        <p className="text-[8px] tracking-wider uppercase text-fuchsia-400 font-semibold opacity-90">
          {event.category || "Event"}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-white/95 line-clamp-1 group-hover:text-fuchsia-200 transition-colors duration-300">
          {event.name}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            {price > 0 ? (
              <>
                <span className="text-[9px] text-neutral-400">from</span>
                <span className="text-sm font-bold text-fuchsia-300 group-hover:text-fuchsia-200 transition-colors duration-300">
                  ₹{price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-[10px] text-neutral-400">Enquire for price</span>
            )}
          </div>
          <span className="text-[10px] md:text-xs text-white/30 group-hover:text-fuchsia-400 group-hover:translate-x-0.5 transition-all duration-300 font-medium inline-flex items-center gap-0.5">
            Details <ArrowRight className="inline-block w-4.5 h-4.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default EventTile;
