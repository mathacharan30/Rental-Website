// Admin product service – the Firebase token is attached automatically
// by the api.js interceptor; no manual token handling needed here.
import api from "./api";
import { mapProduct } from "./productService";

// ─── Direct-to-Cloudinary helpers ───────────────────────────────────────────
// These let the browser upload image bytes straight to Cloudinary, so no image
// data ever passes through the Vercel serverless function (which has a 4.5 MB
// hard limit).  The server just signs the request; it never sees the pixels.

/**
 * Fetches a short-lived Cloudinary signed-upload token from our backend.
 * One token can be reused for all images in a single submit batch.
 */
export async function getUploadSignature() {
  const { data } = await api.get("/api/products/sign-upload");
  return data; // { signature, timestamp, folder, cloudName, apiKey }
}

/**
 * Uploads a single File directly to Cloudinary using the pre-signed token.
 * Returns the full Cloudinary response which includes secure_url and public_id.
 */
export async function uploadImageToCloudinary(file, sigData) {
  const { signature, timestamp, folder, cloudName, apiKey } = sigData;

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);
  body.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Cloudinary upload failed (${res.status})`);
  }

  return res.json(); // { secure_url, public_id, … }
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

export default { listProducts, createProduct, updateProduct, deleteProduct };

