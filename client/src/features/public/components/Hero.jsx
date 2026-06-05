import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import bannerService from "../../../services/bannerService";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { HeroSkeleton } from "../loaders";

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const device = isMobile ? "mobile" : "desktop";

  const { data: banners = [] } = useQuery({
    queryKey: ["banners", "hero", device],
    queryFn: () =>
      bannerService
        .getBanners("hero", device)
        .then((list) => list.filter((b) => b.imageUrl)),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setActiveSlide(0);
  }, [device]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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

  const goToPrevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length);
  const goToNextSlide = () =>
    setActiveSlide((prev) => (prev + 1) % banners.length);

  const activeBanner = banners.length > 0 ? banners[activeSlide] : null;

  return (
    <section
      className="relative w-full h-[100vh] overflow-hidden bg-[#0e0e0e]"
      style={{ marginTop: "calc(var(--floating-nav-footprint) * -1)" }}
    >
      {activeBanner && (
        <OptimizedImage
          key={activeBanner._id || activeBanner.imageUrl}
          url={activeBanner.imageUrl}
          type="hero"
          alt={
            activeBanner.title ||
            "People & Style — Rent designer outfits in Bangalore"
          }
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full md:mt-7 mt-4.5 object-cover"
        />
      )}

      {banners.length === 0 && <HeroSkeleton />}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevSlide}
            className="absolute z-20 left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-white bg-black/20 hover:bg-black/50 transition-colors pointer-events-auto"
            aria-label="Previous hero image"
          >
            &#10094;
          </button>
          <button
            type="button"
            onClick={goToNextSlide}
            className="absolute z-20 right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-white bg-black/20 hover:bg-black/50 transition-colors pointer-events-auto"
            aria-label="Next hero image"
          >
            &#10095;
          </button>
        </>
      )}

      {activeBanner && (activeBanner.title || activeBanner.caption) && (
        <div className="absolute z-10 bottom-40 left-0 right-0 px-6 md:px-16 text-center pointer-events-none">
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

      <div className="relative z-10 max-w-7xl mx-auto h-full flex items-end pb-20 justify-center px-4 pointer-events-none">
        <a
          href="#categories"
          className="btn-funky inline-flex items-center justify-center text-center min-w-55 pointer-events-auto"
        >
          View Categories
        </a>
      </div>
    </section>
  );
};

export default Hero;
