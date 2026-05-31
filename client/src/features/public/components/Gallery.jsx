import React, { useEffect, useState } from "react";
import bannerService from "../../../services/bannerService";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { GallerySkeleton } from "../loaders";

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
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

  return (
    <section className="py-20" id="gallery">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-medium instrument-serif tracking-wide text-white">
            - Our <span className="text-violet-400 italic">Collection -</span>
          </h2>
          <p className="text-sm text-neutral-500 max-w-lg mx-auto mt-3">
            Curated designs where timeless craft meets modern silhouettes
          </p>
        </div>
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-neutral-400 text-sm">{error}</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 md:gap-3">
            {isLoading ? (
              <GallerySkeleton count={8} />
            ) : (
              galleryImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className="group relative mb-2 block w-full overflow-hidden rounded-xl break-inside-avoid md:mb-3"
                  aria-label={`View gallery image ${i + 1}`}
                >
                  <OptimizedImage
                    url={img}
                    type="gallery"
                    alt={`Gallery ${i + 1}`}
                    className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/90 hover:text-white text-3xl leading-none"
            onClick={() => setActiveImage(null)}
            aria-label="Close image preview"
          >
            ×
          </button>
          <OptimizedImage
            url={activeImage}
            type="modal"
            alt="Selected gallery preview"
            className="max-h-[90vh] max-w-[92vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}
    </section>
  );
};

export default Gallery;
