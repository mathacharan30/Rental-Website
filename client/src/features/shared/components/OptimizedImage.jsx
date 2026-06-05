import React from "react";
import { IKImage } from "imagekitio-react";

const LQIP_BY_TYPE = {
  hero: { active: true, quality: 10 },
  category: { active: true, quality: 15 },
  gallery: { active: true, quality: 15 },
  modal: { active: true, quality: 10 },
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
  if (!url) return null;

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
      loading={loading}
      {...extraProps}
    />
  );
};

export default OptimizedImage;
