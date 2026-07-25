import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, MessageCircle, ArrowRight,
  Clock, MapPin, CalendarClock,
} from "lucide-react";
import { openWhatsApp } from "../../../../services/whatsapp";

const EventDetailModal = ({ event, onClose }) => {
  const [imgIdx, setImgIdx] = useState(0);

  // Cover image first, then gallery images
  const images = [
    ...(event.coverImage?.url ? [event.coverImage] : []),
    ...(event.gallery || []),
  ];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const prev = () => setImgIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setImgIdx((i) => (i + 1) % images.length);

  const price = event.startingPrice || 0;

  const handleBook = () => {
    openWhatsApp({
      action: "enquiry",
      intro: `Hello! I'd like to book / enquire about the following event:`,
      heading: `${event.name}${event.category ? ` (${event.category})` : ""}`,
      product: {
        title: event.name,
        category: event.category,
        price: price ? `Starting from ₹${price.toLocaleString()}` : undefined,
      },
      extraLines: [
        ...(event.shortDescription ? [`• ${event.shortDescription}`] : []),
        ...(event.duration ? [`• Duration: ${event.duration}`] : []),
        ...(event.serviceLocation ? [`• Location: ${event.serviceLocation}`] : []),
        ...(event.bookBefore ? [`• Book before: ${event.bookBefore}`] : []),
      ],
    });
  };

  const infoChips = [
    event.duration && { icon: Clock, label: event.duration },
    event.serviceLocation && { icon: MapPin, label: event.serviceLocation },
    event.bookBefore && { icon: CalendarClock, label: `Book before: ${event.bookBefore}` },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.97, y: 30, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="h-[84vh] md:h-[95vh] mx-2 w-full md:w-[60vw] relative bg-neutral-900 rounded-3xl shadow-2xl overflow-y-scroll"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5" style={{ flexShrink: 0 }}>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Event Details</span>
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
            {/* Gallery */}
            <div className="p-4 space-y-2">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/4.2] md:aspect-square border border-white/5 bg-neutral-950/60 shadow-lg">
                {images.length > 0 ? (
                  <>
                    <img
                      key={imgIdx}
                      src={images[imgIdx].url}
                      alt={`${event.name} ${imgIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <span className="absolute bottom-3 right-3 z-10 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-white text-xs font-mono select-none font-medium">
                        {imgIdx + 1} / {images.length}
                      </span>
                    )}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prev}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 hover:scale-105 transition-all border border-white/5 cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={next}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 hover:scale-105 transition-all border border-white/5 cursor-pointer"
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
                        ? "border-fuchsia-500 scale-102 opacity-100 shadow-[0_0_10px_rgba(217,70,239,0.3)]"
                        : "border-white/10 opacity-60 hover:opacity-95"
                        }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-4 md:p-6 space-y-5">
              <div>
                {event.category && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2.5 bg-fuchsia-500/10 border-y border-fuchsia-500/30 text-fuchsia-300">
                    {event.category}
                  </span>
                )}
                <h2 className="text-2xl font-bold text-white instrument-serif">{event.name}</h2>
              </div>

              {price > 0 && (
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Starting Price</p>
                    <h3 className="text-2xl font-black text-fuchsia-300 mt-1">₹{price.toLocaleString()}</h3>
                  </div>
                </div>
              )}

              {infoChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {infoChips.map((chip, i) => {
                    const Icon = chip.icon;
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-neutral-300"
                      >
                        <Icon size={13} className="text-fuchsia-400" />
                        {chip.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {event.shortDescription && (
                <p className="text-sm text-neutral-300 leading-relaxed font-normal">{event.shortDescription}</p>
              )}

              {event.whatsIncluded?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">What's Included</p>
                  <ul className="space-y-2">
                    {event.whatsIncluded.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-emerald-300 font-medium">
                        <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer / Book */}
        <div className="p-4">
          <div className="flex flex-col gap-1.5 mb-4">
            <p className="text-[11px] text-neutral-400 flex items-start gap-1.5">
              <span className="text-amber-400 mt-0.5">•</span>
              Final pricing may vary based on your requirements and location
            </p>
            {event.bookBefore && (
              <p className="text-[11px] text-neutral-400 flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                Please book at least {event.bookBefore} in advance
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleBook}
            className="group relative overflow-hidden flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-linear-to-r from-green-500 via-green-400 to-emerald-500 text-white font-bold text-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_35px_rgba(34,197,94,0.45)] active:scale-[0.98]"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r from-white/10 via-white/20 to-white/10" />
            <MessageCircle size={20} className="relative z-10" />
            <span className="relative z-10">Book Now / Contact on WhatsApp</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight />
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EventDetailModal;
