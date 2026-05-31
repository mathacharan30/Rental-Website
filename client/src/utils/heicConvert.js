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

  // Primary: heic2any (covers most HEIC variants via libheif wasm)
  try {
    const heic2any = (await import("heic2any")).default;
    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    const outBlob = Array.isArray(blob) ? blob[0] : blob;
    return new File([outBlob], jpegName, { type: "image/jpeg", lastModified: Date.now() });
  } catch (err) {
    // heic2any fails on some HEIC variants (HDR, HEVC, multi-sequence).
    // Fall back to createImageBitmap which the OS/browser can decode natively
    // (works on Safari always; works on Chrome/Edge for most iPhone HEIC files).
    console.warn("[heicConvert] heic2any failed, trying createImageBitmap fallback:", err?.message);
  }

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0);
    bitmap.close();
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
    throw new Error(
      "This HEIC file format is not supported by your browser. Please convert it to JPEG before uploading.",
    );
  }
}
