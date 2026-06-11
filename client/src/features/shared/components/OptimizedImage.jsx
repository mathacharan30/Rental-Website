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
}) => {
  const placeholderRef = useRef(null);
  // eager images (hero) load immediately; lazy ones wait for IntersectionObserver
  const [inView, setInView] = useState(loading !== "lazy");

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
    return <span ref={placeholderRef} className={className} aria-hidden="true" />;
  }

  const extraProps = {};
  if (fetchpriority) extraProps.fetchpriority = fetchpriority;

  if (!url.startsWith("http")) {
    return (
      <img
        src={url}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        {...extraProps}
      />
    );
  }

  if (url.includes("ik.imagekit.io")) {
    return (
      <img
        src={url}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        {...extraProps}
      />
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
        <img
          src={url}
          alt={alt}
          className={className}
          loading={loading}
          decoding={decoding}
          {...extraProps}
        />
      );
    }
  }

  return (
    <IKImage
      path={path}
      transformation={[
        { width: width.toString(), quality: "auto", format: "auto" },
      ]}
      lqip={LQIP_BY_TYPE[type] ?? { active: true, quality: 15 }}
      alt={alt}
      className={className}
      {...extraProps}
    />
  );
};

export default OptimizedImage;
