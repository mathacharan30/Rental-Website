// Admin product service – the Firebase token is attached automatically
// by the api.js interceptor; no manual token handling needed here.
import api from "./api";
import { mapProduct } from "./productService";

// ─── Direct-to-S3 helpers ───────────────────────────────────────────────────
// These let the browser upload image bytes straight to S3 via presigned PUT
// URLs, so no image data ever passes through the Vercel serverless function
// (which has a 4.5 MB hard limit).  The server just signs the request.

/**
 * Fetches a presigned S3 PUT URL from our backend for a given file.
 * Each file needs its own presigned URL (different key).
 */
export async function getPresignedUrl(file) {
  const { data } = await api.get("/api/products/sign-upload", {
    params: { filename: file.name, contentType: file.type },
  });
  return data; // { presignedUrl, publicUrl, key }
}

/**
 * Uploads a single File directly to S3 using the presigned PUT URL.
 * Returns { url, publicId } ready to send to our API.
 */
export async function uploadImageToS3(file) {
  const { presignedUrl, publicUrl, key } = await getPresignedUrl(file);

  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`S3 upload failed (${res.status})`);
  }

  return { url: publicUrl, publicId: key };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function listProducts(storeName) {
  // /mine returns only this store's products (auth token sent by api.js interceptor)
  // storeName is passed as a query param so super_admin can view a specific store
  const params = storeName ? { storeName } : {};
  const { data } = await api.get("/api/products/mine", { params });
  return Array.isArray(data) ? data.map(mapProduct) : [];
}

export async function createProduct(formData) {
  const { data } = await api.post("/api/products/createProduct", formData);
  return data;
}

export async function updateProduct(id, formData) {
  const { data } = await api.put(`/api/products/${id}`, formData);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/api/products/${id}`);
  return data;
}

export async function toggleAvailability(id) {
  // Send an explicit empty body so Axios sets Content-Type: application/json
  // and Express always populates req.body (avoids undefined body edge case)
  const { data } = await api.patch(`/api/products/${id}/availability`, {});
  return data; // { id, available }
}

export default { listProducts, createProduct, updateProduct, deleteProduct, toggleAvailability };

