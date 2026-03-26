import React, { useEffect, useState } from "react";
import bannerService from "../services/bannerService";

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const banners = await bannerService.getBanners('gallery');
        const urls = Array.isArray(banners)
          ? banners.map((b) => b.imageUrl).filter(Boolean)
          : [];
        setGalleryImages(urls.slice(0, 6));
      } catch (e) {
        console.error("[Gallery] Failed to load banners", e);
        setGalleryImages([]);
      }
    })();
  }, []);

  if (galleryImages.length === 0) return null;

  return (
    <section className="py-20" id="gallery">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold display-font tracking-tight text-white">
            Our <span className="text-violet-400">Collection</span>
          </h2>
          <p className="text-sm text-neutral-500 max-w-lg mx-auto mt-3">
            Curated designs where timeless craft meets modern silhouettes
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          <div className="relative col-span-2 sm:col-span-3 md:col-span-3 row-span-2 overflow-hidden rounded-xl">
            <img
              src={galleryImages[0]}
              alt="Gallery Highlight"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {galleryImages.slice(1).map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl h-48 md:h-auto"
            >
              <img
                src={img}
                alt={`Gallery ${i + 2}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
