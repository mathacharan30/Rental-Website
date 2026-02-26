import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    <section className="py-20" id="gallery">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold display-font tracking-tight text-white">
            Our <span className="text-violet-400">Collection</span>
          </h2>
          <p className="text-sm text-neutral-500 max-w-lg mx-auto mt-3">
            Curated designs where timeless craft meets modern silhouettes
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          <motion.div
            className="relative col-span-2 sm:col-span-3 md:col-span-3 row-span-2 overflow-hidden rounded-xl group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={galleryImages[0]}
              alt="Gallery Highlight"
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          {galleryImages.slice(1).map((img, i) => (
            <motion.div
              key={i}
              className="relative overflow-hidden rounded-xl group h-48 md:h-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <img
                src={img}
                alt={`Gallery ${i + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
