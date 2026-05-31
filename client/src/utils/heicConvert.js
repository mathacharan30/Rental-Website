// Converts HEIC/HEIF files to JPEG in the browser before upload.
// All other formats are returned unchanged.
export async function convertToJpeg(file) {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);

  if (!isHeic) return file;

  const jpegName = file.name.replace(/\.(heic|heif)$/i, ".jpg");

  // Stage 1: heic2any — lighter, fast for common HEIC variants (libheif ~1.12)
  try {
    const heic2any = (await import("heic2any")).default;
    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    const outBlob = Array.isArray(blob) ? blob[0] : blob;
    return new File([outBlob], jpegName, { type: "image/jpeg", lastModified: Date.now() });
  } catch (err) {
    console.warn("[heicConvert] heic2any failed:", err?.message);
  }

  // Stage 2: libheif-js — newer libheif (1.19.x) handles HEVC/HDR/multi-seq variants
  try {
    let libheif = (await import("libheif-js/wasm-bundle")).default;
    // The CJS factory may export a Promise (async WASM init) or the module directly
    if (typeof libheif?.then === "function") libheif = await libheif;

    const decoder = new libheif.HeifDecoder();
    const buffer = await file.arrayBuffer();
    const images = decoder.decode(new Uint8Array(buffer));
    if (!images?.length) throw new Error("No images decoded");

    const image = images[0];
    const width = image.get_width();
    const height = image.get_height();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(width, height);

    await new Promise((resolve, reject) => {
      image.display(imageData, (displayData) => {
        if (!displayData) reject(new Error("libheif display failed"));
        else resolve();
      });
    });

    ctx.putImageData(imageData, 0, 0);
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("canvas.toBlob returned null")); return; }
          resolve(new File([blob], jpegName, { type: "image/jpeg", lastModified: Date.now() }));
        },
        "image/jpeg",
        0.92,
      );
    });
  } catch (err) {
    console.warn("[heicConvert] libheif-js failed:", err?.message);
  }

  // Stage 3: browser native decoder — works on Safari/macOS/iOS always,
  // and on Windows when HEVC Video Extensions are installed
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("canvas.toBlob returned null")); return; }
          resolve(new File([blob], jpegName, { type: "image/jpeg", lastModified: Date.now() }));
        },
        "image/jpeg",
        0.92,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(
        "Cannot convert this HEIC image. Please export the photo as JPEG " +
        "from your phone's Photos app and try again.",
      ));
    };
    img.src = url;
  });
}
