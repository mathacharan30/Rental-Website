import api from "./api";

// type: 'hero' | 'gallery' | undefined (all)
export async function getBanners(type) {
  const params = type ? { type } : {};
  const { data } = await api.get("/api/banners", { params });
  return Array.isArray(data) ? data : [];
}

// ─── Direct-to-S3 helpers ────────────────────────────────────────────────────
// Image bytes go straight from the browser to S3 via a presigned PUT URL,
// bypassing the Vercel serverless function (4.5 MB hard limit).

async function getPresignedUrl(file) {
  const { data } = await api.get("/api/banners/sign-upload", {
    params: { filename: file.name, contentType: file.type },
  });
  return data; // { presignedUrl, publicUrl, key }
}

async function uploadToS3(file) {
  const { presignedUrl, publicUrl, key } = await getPresignedUrl(file);
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`S3 upload failed (${res.status})`);
  return { imageUrl: publicUrl, imagePublicId: key };
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function uploadBanner({ file, title, category, type = 'gallery' }) {
  // 1. Upload image directly to S3
  const { imageUrl, imagePublicId } = await uploadToS3(file);
  // 2. Send only metadata + S3 references to the server (no file bytes)
  const { data } = await api.post("/api/banners", { imageUrl, imagePublicId, title, category, type });
  return data;
}

export async function deleteBanner(id) {
  const { data } = await api.delete(`/api/banners/${id}`);
  return data;
}

export default { getBanners, uploadBanner, deleteBanner };

