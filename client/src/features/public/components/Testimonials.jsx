import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, ChevronLeft, ChevronRight, Images, ArrowRight } from "lucide-react";
import testimonialService from "../../../services/testimonialService";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { TestimonialsSkeleton } from "../loaders";

const INFO_VIDEO_LINK = "https://www.youtube.com/";

const Stars = ({ rating = 5, size = 12 }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-white/20"}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

/* ── Card with the customer's photo ─────────────────────────────────────── */
const PhotoCard = ({ q, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(q, 0)}
    className="group relative w-60 md:w-72 aspect-4/5 shrink-0 mx-2.5 rounded-[28px] overflow-hidden border border-white/10 bg-white/3 text-left shadow-xl shadow-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    aria-label={`Open ${q.name}'s review with photos`}
  >
    <OptimizedImage
      url={q.images[0]}
      type="testimonial"
      alt={`${q.name} wearing People & Style`}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
    />

    {/* readable text over any photo */}
    <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/35 to-transparent pointer-events-none" />

    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
      <span className="px-2 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10">
        <Stars rating={q.rating} size={11} />
      </span>
      {q.images.length > 1 && (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white">
          <Images size={11} /> {q.images.length}
        </span>
      )}
    </div>

    <div className="absolute bottom-0 inset-x-0 p-4 md:p-5 pointer-events-none">
      <p className="text-white/90 text-[13px] leading-relaxed italic line-clamp-3">“{q.text}”</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{q.name}</p>
          {q.handle && <p className="text-[10px] text-violet-300 font-medium tracking-wide truncate">{q.handle}</p>}
        </div>
        <span className="shrink-0 text-[10px] font-semibold text-white/80 border border-white/20 rounded-full px-2 py-0.5 group-hover:bg-white/10 transition-colors">
          View
        </span>
      </div>
      {q.product?.name && (
        <p className="mt-2 text-[10px] text-neutral-300/90 truncate">
          Wore · <span className="text-violet-300">{q.product.name}</span>
        </p>
      )}
    </div>
  </button>
);

/* ── Text-only card (testimonials without photos) ───────────────────────── */
const TextCard = ({ q }) => (
  <article className="relative w-72 md:w-80 shrink-0 mx-2.5 self-center rounded-4xl border-t-2 border-b border-white/10 bg-white/2 p-6 md:p-8 flex flex-col justify-between">
    <span className="absolute top-2 right-4 text-6xl font-serif text-violet-500/10 pointer-events-none select-none">“</span>
    <div className="relative z-10 flex flex-col gap-3">
      <Stars rating={q.rating} />
      <p className="text-neutral-300 text-sm leading-relaxed font-medium italic line-clamp-6">"{q.text}"</p>
    </div>
    <div className="mt-5 flex items-center gap-3 relative z-10">
      <div className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 text-sm shrink-0">
        {q.name?.charAt(0) || "U"}
      </div>
      <div className="min-w-0">
        <p className="text-white text-xs font-semibold truncate">{q.name}</p>
        <p className="text-[10px] text-violet-400 font-medium tracking-wide">{q.handle}</p>
      </div>
    </div>
  </article>
);

/* ── Full-screen viewer: photos + full review ───────────────────────────── */
const Lightbox = ({ q, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const count = q.images.length;
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && count > 1) prev();
      if (e.key === "ArrowRight" && count > 1) next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next, count]);

  return (
    <motion.div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${q.name}'s review`}
    >
      <motion.div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[28px] border border-white/10 bg-[#111] shadow-2xl grid grid-rows-[auto_1fr] md:grid-rows-none md:grid-cols-[1.1fr_1fr]"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-white/15 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Photo */}
        <div className="relative bg-black h-[52vh] md:h-[80vh] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <OptimizedImage
                url={q.images[index]}
                type="modal"
                loading="eager"
                alt={`${q.name} — photo ${index + 1} of ${count}`}
                className="max-w-full max-h-full w-full h-full object-contain"
              />
            </motion.div>
          </AnimatePresence>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/55 text-white hover:bg-white/15 transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/55 text-white hover:bg-white/15 transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 inset-x-0 z-10 flex justify-center gap-1.5">
                {q.images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
                    aria-label={`Show photo ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Review */}
        <div className="flex flex-col p-6 md:p-8 overflow-y-auto">
          <Stars rating={q.rating} size={16} />
          <span className="mt-4 text-5xl leading-none font-serif text-violet-500/40 select-none">“</span>
          <p className="text-neutral-200 text-[15px] md:text-base leading-relaxed italic -mt-2">{q.text}</p>

          <div className="mt-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-violet-600/15 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 shrink-0">
              {q.name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{q.name}</p>
              {q.handle && <p className="text-xs text-violet-400 truncate">{q.handle}</p>}
            </div>
          </div>

          {q.product?.id && (
            <Link
              to={`/product/${q.product.id}`}
              onClick={onClose}
              className="mt-auto pt-6 group/link"
            >
              <span className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3 hover:border-violet-500/40 hover:bg-violet-500/10 transition-colors">
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-widest text-neutral-500">The look</span>
                  <span className="block text-sm text-white font-medium truncate">{q.product.name}</span>
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-violet-300 shrink-0">
                  View this look <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-0.5" />
                </span>
              </span>
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null); // { q, index }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await testimonialService.listTestimonials({ top: false, limit: 12 });
        const mapped = (Array.isArray(data) ? data : []).map((t, idx) => ({
          id: t._id || idx,
          name: t.userName,
          handle: t.handle || "",
          text: t.comment,
          rating: Number(t.rating) || 5,
          images: (t.images || []).map((img) => img?.url).filter(Boolean),
          product:
            t.product && typeof t.product === "object"
              ? { id: t.product._id, name: t.product.name }
              : null,
        }));
        setQuotes(mapped);
      } catch (e) {
        console.error("[Testimonials] Failed to load", e);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const closeLightbox = useCallback(() => setOpen(null), []);

  if (!loading && quotes.length === 0) return null;

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 flex flex-col items-center justify-center">
          <h2 className="text-3xl md:text-4xl font-medium instrument-serif tracking-wide text-white">
            - Customer <span className="text-violet-400 italic">Love -</span>
          </h2>
          <p className="text-neutral-500 mt-2 max-w-md mx-auto text-xs md:text-sm">
            Real experiences from people who love our styles
          </p>
        </div>

        {loading ? (
          <TestimonialsSkeleton count={4} />
        ) : (
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-24 bg-linear-to-r from-[#0a0a0a] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-24 bg-linear-to-l from-[#0a0a0a] to-transparent" />

            <Marquee gradient={false} speed={36} pauseOnHover autoFill={true}>
              <div className="flex items-stretch py-6">
                {quotes.map((q) =>
                  q.images.length ? (
                    <PhotoCard key={q.id} q={q} onOpen={(item, index) => setOpen({ q: item, index })} />
                  ) : (
                    <TextCard key={q.id} q={q} />
                  ),
                )}
              </div>
            </Marquee>
          </div>
        )}

        {/* Video Button */}
        <div className="mt-12 text-center">
          <a
            href={INFO_VIDEO_LINK}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-white/2 shadow-inner shadow-white/24 text-neutral-400 border-b-[1.55px] border-white/7 hover:bg-white/10 hover:text-white rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>▶ Watch Info Video</span>
          </a>
        </div>
      </div>

      {/* Rendered into <body> so no animated/transformed parent can offset the fixed overlay */}
      {createPortal(
        <AnimatePresence>
          {open && <Lightbox key={open.q.id} q={open.q} startIndex={open.index} onClose={closeLightbox} />}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
};

export default Testimonials;
