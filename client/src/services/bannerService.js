import api from "./api";

// type: 'hero' | 'gallery' | undefined (all)
export async function getBanners(type) {
  const params = type ? { type } : {};
  const { data } = await api.get("/api/banners", { params });
  return Array.isArray(data) ? data : [];
}

export async function uploadBanner({ file, title, category, type = 'gallery' }) {
  const fd = new FormData();
  if (file) fd.append("image", file);
  if (title) fd.append("title", title);
  if (category) fd.append("category", category);
  fd.append("type", type);
  const { data } = await api.post("/api/banners", fd);
  return data;
}

export async function deleteBanner(id) {
  const { data } = await api.delete(`/api/banners/${id}`);
  return data;
}

export default { getBanners, uploadBanner, deleteBanner };

