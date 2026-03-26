import React, { useEffect, useState } from "react";
import bannerService from "../services/bannerService";

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    bannerService
      .getBanners("hero")
      .then((list) => {
        const urls = list.map((b) => b.imageUrl).filter(Boolean);
        setImages(urls);
      })
      .catch(() => {
        setImages([]);
      });
  }, []);

  useEffect(() => {
    if (images.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % images.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [images]);

  useEffect(() => {
    if (activeSlide >= images.length && images.length > 0) {
      setActiveSlide(0);
    }
  }, [activeSlide, images.length]);

  const goToPrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % images.length);
  };

  return (
    <section className="relative w-full h-[90vh] mb-10 md:h-[90vh] overflow-hidden">
      {images.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt="Rent designer outfits in Bangalore and Karnataka — People &amp; Style"
          loading={index === 0 ? "eager" : "lazy"}
          fetchpriority={index === activeSlide ? "high" : "auto"}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevSlide}
            className="absolute z-20 left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full  text-white"
            aria-label="Previous hero image"
          >
            &#10094;
          </button>
          <button
            type="button"
            onClick={goToNextSlide}
            className="absolute z-20 right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full  text-white"
            aria-label="Next hero image"
          >
            &#10095;
          </button>
        </>
      )}
    </section>
  );
};

export default Hero;
