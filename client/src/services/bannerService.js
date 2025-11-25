import api from "./api";

export async function getBanners() {
  const { data } = await api.get("/api/banners");
  return Array.isArray(data) ? data : [];
}

export async function uploadBanner({ file, title, category }) {
  const fd = new FormData();
  if (file) fd.append("image", file);
  if (title) fd.append("title", title);
  if (category) fd.append("category", category);
  const { data } = await api.post("/api/banners", fd);
  return data;
}

export async function deleteBanner(id) {
  const { data } = await api.delete(`/api/banners/${id}`);
  return data;
}

export default { getBanners, uploadBanner, deleteBanner };

