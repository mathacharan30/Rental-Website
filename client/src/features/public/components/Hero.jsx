import React, { useEffect, useState, useCallback } from "react";
import bannerService from "../../../services/bannerService";
import Loader from "../../shared/components/Loader";

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayedSlide, setDisplayedSlide] = useState(null);
  const [banners, setBanners] = useState([]);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const loadBanners = useCallback((mobile) => {
    const device = mobile ? "mobile" : "desktop";
    bannerService
      .getBanners("hero", device)
      .then((list) => {
        setBanners(list.filter((b) => b.imageUrl));
        setActiveSlide(0);
        setDisplayedSlide(null);
      })
      .catch(() => {
        setBanners([]);
        setDisplayedSlide(null);
      });
  }, []);

  useEffect(() => {
    const nextBanner = banners[activeSlide];

    if (!nextBanner?.imageUrl) {
      setDisplayedSlide(null);
      return;
    }

    let cancelled = false;
    let resolved = false;
    const image = new Image();

    const finish = () => {
      if (cancelled || resolved) return;
      resolved = true;
      setDisplayedSlide(activeSlide);
    };

    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = "high";
    image.onload = finish;
    image.onerror = finish;
    image.src = nextBanner.imageUrl;

    if (image.complete && image.naturalWidth > 0) {
      finish();
    }

    return () => {
      cancelled = true;
    };
  }, [activeSlide, banners]);

  useEffect(() => {
    if (banners.length < 2) return;

    const nextIndex = (activeSlide + 1) % banners.length;
    const nextBanner = banners[nextIndex];

    if (!nextBanner?.imageUrl) return;

    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = "low";
    image.src = nextBanner.imageUrl;
  }, [activeSlide, banners]);

  // Detect screen size on mount and on resize
  useEffect(() => {
    loadBanners(isMobile);

    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e) => {
      setIsMobile(e.matches);
      loadBanners(e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [loadBanners, isMobile]);

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

  const activeBanner = displayedSlide === null ? null : banners[displayedSlide];

  return (
    <section className="relative w-full h-[85vh] overflow-hidden">
      {activeBanner ? (
        <img
          key={activeBanner._id || activeBanner.imageUrl}
          src={activeBanner.imageUrl}
          alt={
            activeBanner.title ||
            "People & Style — Rent designer outfits in Bangalore"
          }
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#0e0e0e]" />
      )}

      {displayedSlide === null && banners.length > 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0e0e0e]/70 backdrop-blur-[2px]">
          <Loader />
        </div>
      )}

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

      <div className="relative z-10 max-w-7xl mx-auto h-full flex items-end pb-20 justify-center px-4">
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
