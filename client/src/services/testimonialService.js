import api from "./api";
import { convertToJpeg } from "../utils/heicConvert";

export const MAX_TESTIMONIAL_PHOTOS = 3;

export async function listTestimonials(params = {}) {
  const { data } = await api.get("/api/testimonials", { params });
  return Array.isArray(data) ? data : [];
}

export async function listTopTestimonials(limit = 10) {
  const { data } = await api.get("/api/testimonials/top/by-product", { params: { limit } });
  return Array.isArray(data) ? data : [];
}

/**
 * Uploads one customer photo straight to S3 (testimonials/ folder) via a
 * presigned URL. iPhone HEIC photos are converted to JPEG first.
 * Returns { url, publicId } to store on the testimonial.
 */
export async function uploadTestimonialPhoto(file) {
  const upload = await convertToJpeg(file);
  const { data } = await api.get("/api/testimonials/sign-upload", {
    params: { filename: upload.name, contentType: upload.type },
  });
  const res = await fetch(data.presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": upload.type },
    body: upload,
  });
  if (!res.ok) throw new Error(`Photo upload failed (${res.status})`);
  return { url: data.publicUrl, publicId: data.key };
}

export async function createTestimonial({ userName, handle, comment, rating, product, isTop, images }) {
  const payload = { userName, handle, comment, rating: Number(rating), product, isTop, images };
  const { data } = await api.post("/api/testimonials", payload);
  return data;
}

export async function updateTestimonial(id, { userName, handle, comment, rating, product, isTop, images }) {
  const payload = { userName, handle, comment, rating: Number(rating), product, isTop, images };
  const { data } = await api.put(`/api/testimonials/${id}`, payload);
  return data;
}

export async function deleteTestimonial(id) {
  const { data } = await api.delete(`/api/testimonials/${id}`);
  return data;
}

export default {
  listTestimonials,
  listTopTestimonials,
  uploadTestimonialPhoto,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
