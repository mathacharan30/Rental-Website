import React, { useEffect, useState } from "react";
import products from "../data/products";
import bannerService from "../services/bannerService";
import toast from "react-hot-toast";

const Gallery = ({ images }) => {
  const [managed, setManaged] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const banners = await bannerService.getBanners();
        const urls = Array.isArray(banners)
          ? banners.map((b) => b.imageUrl).filter(Boolean)
          : [];
        setManaged(urls);
      } catch (e) {
        console.error("[Gallery] Failed to load banners", e);
        toast.error("Failed to load gallery images");
        setManaged([]);
      }
    })();
  }, []);

  const galleryImages = (
    managed.length
      ? managed
      : images?.length
      ? images
      : products.slice(0, 6).map((p) => p.image)
  ).slice(0, 6);

  return (
    <section className="py-10 bg-base-off-white" id="gallery">
      <div className="max-w-6xl mx-auto px-3">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tighter">
            <span className="text-pink-800 font-extrabold mr-1">/</span>
            Our Collection
          </h2>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Discover elegance through carefully curated designs built around
            timeless craft and modern silhouettes.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <div className="relative col-span-2 sm:col-span-3 md:col-span-3 row-span-2 overflow-hidden rounded-sm group bg-neutral-200">
            <img
              src={galleryImages[0]}
              alt="Gallery Highlight"
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
            />
          </div>

          {galleryImages.slice(1).map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-sm group bg-neutral-200 h-48 md:h-auto"
            >
              <img
                src={img}
                alt={`Gallery ${i + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
