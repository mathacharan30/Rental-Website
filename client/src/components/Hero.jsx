import React, { useEffect, useState, useCallback } from "react";
import bannerService from "../services/bannerService";

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const loadBanners = useCallback((mobile) => {
    const device = mobile ? 'mobile' : 'desktop';
    bannerService.getBanners('hero', device).then((list) => {
      setBanners(list.filter((b) => b.imageUrl));
      setActiveSlide(0);
    }).catch(() => setBanners([]));
  }, []);

  // Detect screen size on mount and on resize
  useEffect(() => {
    loadBanners(isMobile);

    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => {
      setIsMobile(e.matches);
      loadBanners(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [loadBanners]);

  useEffect(() => {
    if (banners.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => window.clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    if (activeSlide >= banners.length && banners.length > 0) setActiveSlide(0);
  }, [activeSlide, banners.length]);

  const goToPrevSlide = () => setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length);
  const goToNextSlide = () => setActiveSlide((prev) => (prev + 1) % banners.length);

  const activeBanner = banners[activeSlide];

  return (
    <section className="relative w-full h-[90vh] overflow-hidden">
      {banners.map((b, index) => (
        <img
          key={b._id || `${b.imageUrl}-${index}`}
          src={b.imageUrl}
          alt={b.title || "People & Style — Rent designer outfits in Bangalore"}
          loading={index === 0 ? "eager" : "lazy"}
          fetchpriority={index === activeSlide ? "high" : "auto"}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-[#0e0e0e]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_98%)]" />

      {banners.length > 1 && (
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

      {/* Title + Caption overlay */}
      {activeBanner && (activeBanner.title || activeBanner.caption) && (
        <div className="absolute z-10 bottom-24 left-0 right-0 px-6 md:px-16 text-center pointer-events-none">
          {activeBanner.title && (
            <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg mb-1 leading-tight">
              {activeBanner.title}
            </h2>
          )}
          {activeBanner.caption && (
            <p className="text-white/80 text-sm md:text-lg drop-shadow">
              {activeBanner.caption}
            </p>
          )}
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto h-full flex items-end pb-10 justify-center px-4">
        <a
          href="#categories"
          className="btn-funky inline-flex items-center justify-center text-center min-w-[220px]"
        >
          View Categories
        </a>
      </div>
    </section>
  );
};

export default Hero;
