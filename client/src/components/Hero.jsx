import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import adminService from "../services/adminService";
import toast from "react-hot-toast";

const Hero = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    try {
      const list = adminService.loadHeroImages();
      setImages(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error("Failed to load hero images" + e.message);
      setImages(["/pic1.jpg"]);
    }
  }, []);

  const heroSrc = images[0] || "/pic1.jpg";

  return (
    <section className="relative w-full h-[90vh] overflow-hidden">
      {/* Background image */}
      <img
        src={heroSrc}
        alt="Designer outfit banner"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Simple dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#0e0e0e]" />

      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-center pb-16 pt-20 md:pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-semibold display-font tracking-tight max-w-3xl leading-tight">
            Rent Designer Outfits
            <br />
            <span className="text-neutral-300">for Every Occasion</span>
          </h1>

          <p className="mt-4 text-neutral-100 text-sm md:text-base max-w-lg leading-relaxed">
            Premium clothing rentals for weddings, events, and special moments.
            Affordable luxury, delivered to your door.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href="#collection" className="btn-funky text-center">
              <span>Browse Collection</span>
            </a>
            <a href="#categories" className="btn-outline-funky text-center">
              View Categories
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
