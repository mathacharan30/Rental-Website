import api from "./api";

export function mapCategory(c = {}) {
  return {
    id: c._id || c.id,
    name: c.name || "",
    image: (c && c.image && c.image.url) ? c.image.url : (c.image || c.cover || ""),
    description: c.description || "",
  };
}

// Category APIs
export async function getCategories() {
  const { data } = await api.get("/api/categories");
  return Array.isArray(data) ? data : [];
}

export async function createCategory(payload) {
  // Accepts FormData (preferred for file upload) or plain object
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    const { data } = await api.post("/api/categories", payload);
    return data;
  }
  const body = { name: payload?.name };
  if (payload?.image) body.image = payload.image;
  if (payload?.description) body.description = payload.description;
  const { data } = await api.post("/api/categories", body);
  return data;
}

export async function deleteCategory(id) {
  const { data } = await api.delete(`/api/categories/${id}`);
  return data;
}

export async function findCategoryIdBySlug(slug) {
  const categories = await getCategories();
  const lower = (slug || "").toString().trim().toLowerCase();
  const found = categories.find(
    (c) => (c?.name || "").toString().trim().toLowerCase() === lower
  );
  return found?._id || null;
}
