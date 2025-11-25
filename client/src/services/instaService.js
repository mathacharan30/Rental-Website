import api from "./api";

export async function getPosts() {
  const { data } = await api.get("/api/insta");
  return Array.isArray(data) ? data : [];
}

export async function addPost({ postUrl, caption }) {
  const { data } = await api.post("/api/insta", { postUrl, caption });
  return data?.post || data;
}

export async function deletePost(id) {
  const { data } = await api.delete(`/api/insta/${id}`);
  return data;
}

export default { getPosts, addPost, deletePost };

