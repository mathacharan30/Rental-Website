import React, { useRef, useState, useEffect } from "react";
import { IKImage } from "imagekitio-react";

const LQIP_BY_TYPE = {
  hero: { active: true, quality: 10 },
  category: { active: true, quality: 15 },
  gallery: { active: false },
  modal: { active: false },
};

const OptimizedImage = ({
  url,
  type = "gallery",
  alt = "",
  className = "",
  loading = "lazy",
  decoding = "async",
  fetchpriority,
  onClick,
}) => {
  const placeholderRef = useRef(null);
  // eager images (hero) load immediately; lazy ones wait for IntersectionObserver
  const [inView, setInView] = useState(loading !== "lazy");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = placeholderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  if (!url) return null;

  // Placeholder occupies the same space until the element scrolls into view
  if (!inView) {
    return (
      <div
        ref={placeholderRef}
        className={`${className} flex items-center justify-center overflow-hidden`}
        aria-hidden="true"
      >
        <span className="text-[10px] text-violet-400 font-medium tracking-widest uppercase animate-pulse text-center px-2">Loading...</span>
      </div>
    );
  }

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => {
    setIsLoaded(true);
    setHasError(true);
  };

  const extraProps = {};
  if (fetchpriority) extraProps.fetchpriority = fetchpriority;
  if (onClick) extraProps.onClick = onClick;

  const imageClass = `${className} transition-opacity duration-500 ${!isLoaded || hasError ? 'absolute w-0 h-0 opacity-0 pointer-events-none overflow-hidden border-none p-0 m-0' : 'opacity-100'}`.trim();

  const renderPlaceholder = () => {
    if (isLoaded && !hasError) return null;
    return (
      <div className={`${className} flex items-center justify-center overflow-hidden`}>
        {hasError ? (
          <div className="text-[12px] text-neutral-500 font-medium tracking-widest uppercase text-center px-2">Not Found</div>
        ) : (
          <div className="text-[12px] flex flex-col items-center justify-center gap-2 text-violet-400 font-medium uppercase animate-pulse text-center px-2">
            <div className="h-5 w-5 border-t-2 border-violet-400 rounded-full animate-spin"></div>
            Loading...
          </div>
        )}
      </div>
    );
  };

  if (!url.startsWith("http")) {
    return (
      <>
        {renderPlaceholder()}
        <img
          src={url}
          alt={alt}
          className={imageClass}
          decoding={decoding}
          onLoad={handleLoad}
          onError={handleError}
          {...extraProps}
        />
      </>
    );
  }

  if (url.includes("ik.imagekit.io")) {
    return (
      <>
        {renderPlaceholder()}
        <img
          src={url}
          alt={alt}
          className={imageClass}
          decoding={decoding}
          onLoad={handleLoad}
          onError={handleError}
          {...extraProps}
        />
      </>
    );
  }

  const isMobile = window.innerWidth < 768;
  let width;

  switch (type) {
    case "hero":
      width = isMobile ? 600 : 1400;
      break;
    case "category":
      width = isMobile ? 300 : 400;
      break;
    case "gallery":
      width = isMobile ? 250 : 350;
      break;
    case "modal":
      width = isMobile ? 800 : 1400;
      break;
    default:
      width = 800;
  }

  const s3BaseUrl =
    "https://people-and-style-assets-mumbai.s3.ap-south-1.amazonaws.com/";
  let path = url;

  if (url.startsWith(s3BaseUrl)) {
    path = url.substring(s3BaseUrl.length);
  } else {
    try {
      const urlObj = new URL(url);
      path = urlObj.pathname.startsWith("/")
        ? urlObj.pathname.substring(1)
        : urlObj.pathname;
    } catch {
      return (
        <>
          {renderPlaceholder()}
          <img
            src={url}
            alt={alt}
            className={imageClass}
            decoding={decoding}
            onLoad={handleLoad}
            onError={handleError}
            {...extraProps}
          />
        </>
      );
    }
  }

  return (
    <>
      {renderPlaceholder()}
      <IKImage
        path={path}
        transformation={[
          { width: width.toString(), quality: "auto", format: "auto" },
        ]}
        lqip={{ active: false }}
        alt={alt}
        className={imageClass}
        onLoad={handleLoad}
        onError={handleError}
        {...extraProps}
      />
    </>
  );
};

export default OptimizedImage;
