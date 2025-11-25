import api from "./api";

export async function listTestimonials(params = {}) {
  const { data } = await api.get("/api/testimonials", { params });
  return Array.isArray(data) ? data : [];
}

export async function listTopTestimonials(limit = 10) {
  const { data } = await api.get("/api/testimonials/top/by-product", { params: { limit } });
  return Array.isArray(data) ? data : [];
}

export async function createTestimonial({ userName, handle, comment, rating, product, isTop }) {
  const payload = { userName, handle, comment, rating: Number(rating), product, isTop };
  const { data } = await api.post("/api/testimonials", payload);
  return data;
}

export async function deleteTestimonial(id) {
  const { data } = await api.delete(`/api/testimonials/${id}`);
  return data;
}

export default { listTestimonials, listTopTestimonials, createTestimonial, deleteTestimonial };
