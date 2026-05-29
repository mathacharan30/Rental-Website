// Converts HEIC/HEIF files to JPEG in the browser before upload.
// All other formats are returned unchanged.
export async function convertToJpeg(file) {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);

  if (!isHeic) return file;

  const heic2any = (await import("heic2any")).default;
  const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  const outBlob = Array.isArray(blob) ? blob[0] : blob;
  const jpegName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
  return new File([outBlob], jpegName, { type: "image/jpeg", lastModified: Date.now() });
}
