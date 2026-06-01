import React from "react";
import { IKImage } from "imagekitio-react";

const OptimizedImage = ({ url, type = "gallery", alt = "", className = "", loading = "lazy", decoding = "async" }) => {
  if (!url) return null;

  // Render normal image for non-S3 URLs or local fallbacks
  if (!url.startsWith("http")) {
    return <img src={url} alt={alt} className={className} loading={loading} decoding={decoding} />;
  }

  // If already an imagekit URL
  if (url.includes("ik.imagekit.io")) {
    return <img src={url} alt={alt} className={className} loading={loading} decoding={decoding} />;
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

  // Extract path from S3
  const s3BaseUrl = "https://people-and-style-assets-mumbai.s3.ap-south-1.amazonaws.com/";
  let path = url;

  if (url.startsWith(s3BaseUrl)) {
    path = url.substring(s3BaseUrl.length);
  } else {
    // Attempt fallback parsing
    try {
      const urlObj = new URL(url);
      path = urlObj.pathname.startsWith("/") ? urlObj.pathname.substring(1) : urlObj.pathname;
    } catch {
      // Just fallback to default image element if parsing fails heavily
      return <img src={url} alt={alt} className={className} loading={loading} decoding={decoding} />;
    }
  }

  return (
    <IKImage
      path={path}
      transformation={[{ width: width.toString(), quality: "auto", format: "auto" }]}
      {...(type === "hero" ? { lqip: { active: true, quality: 10 } } : {})}
      alt={alt}
      className={className}
      loading={loading}
    />
  );
};

export default OptimizedImage;
