import React, { useEffect, useState } from "react";
import bannerService from "../../../services/bannerService";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { GallerySkeleton } from "../loaders";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Maximize2, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
    },
  },
};

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const banners = await bannerService.getBanners("gallery");
        const urls = Array.isArray(banners)
          ? banners.map((b) => b.imageUrl).filter(Boolean)
          : [];
        setGalleryImages(urls);
      } catch (e) {
        console.error("[Gallery] Failed to load banners", e);
        setError("Images could not be loaded at this time.");
        setGalleryImages([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
      } else if (e.key === "Escape") {
        setActiveIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, galleryImages.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 relative overflow-hidden" id="gallery">

      <div className="max-w-7xl mx-auto px-2 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-medium instrument-serif tracking-wide text-white">
            - Our <span className="text-violet-400 italic font-normal">Collection -</span>
          </h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto mt-4 leading-relaxed">
            Curated designs where timeless craft meets modern silhouettes, designed to elevate your unique style.
          </p>
        </motion.div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border border-white/5 bg-white/[0.01]">
            <p className="text-neutral-400 text-sm">{error}</p>
          </div>
        ) : isLoading ? (
          <GallerySkeleton count={8} />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="columns-2 sm:columns-3 lg:columns-4 gap-1.5"
          >
            {galleryImages.map((img, i) => (
              <motion.button
                key={i}
                variants={itemVariants}
                onClick={() => setActiveIndex(i)}
                className="group relative mb-4 md:mb-6 block w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/50 cursor-zoom-in shadow-lg hover:shadow-[0_12px_30px_rgba(139,92,246,0.15)] hover:border-violet-500/40 transition-all duration-300 break-inside-avoid"
                aria-label={`View gallery image ${i + 1}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex flex-col justify-end p-5">
                  <div className="flex items-center gap-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="p-2.5 rounded-full bg-violet-600/35 border border-violet-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                      <Maximize2 size={15} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-violet-100">
                      View
                    </span>
                  </div>
                </div>

                <OptimizedImage
                  url={img}
                  type="gallery"
                  alt={`Gallery item ${i + 1}`}
                  className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setActiveIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Gallery image preview"
          >
            <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-50 pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-full bg-white/5 border-y  backdrop-blur-md border-white/10 backdrop-blur-md text-xs font-mono text-neutral-300 select-none font-medium">
                {activeIndex + 1} / {galleryImages.length}
              </div>
              <button
                type="button"
                className="pointer-events-auto p-2.5 rounded-full backdrop-blur-md bg-white/5 border-y border-white/10 text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                onClick={() => setActiveIndex(null)}
                aria-label="Close image preview"
              >
                <X size={20} />
              </button>
            </div>

            <button
              type="button"
              className="absolute left-4 z-50 p-3 md:p-3.5 backdrop-blur-md rounded-full bg-white/5 border-y border-white/20 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-200 select-none cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="relative max-h-[85vh] max-w-[85vw] flex items-center justify-center pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <OptimizedImage
                url={galleryImages[activeIndex]}
                type="modal"
                alt={`Selected gallery preview ${activeIndex + 1}`}
                className="max-h-[80vh] max-w-[80vw] object-contain rounded-2xl border border-white/10 shadow-2xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
            </motion.div>

            <button
              type="button"
              className="absolute right-4 z-50 p-3 md:p-3.5 backdrop-blur-md rounded-full bg-white/5 border-y border-white/20 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-200 select-none cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
