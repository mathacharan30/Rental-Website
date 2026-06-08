import api from "./api";

export function mapCategory(c = {}) {
  return {
    id: c._id || c.id,
    name: c.name || "",
    image: (c && c.image && c.image.url) ? c.image.url : (c.image || c.cover || ""),
    description: c.description || "",
    listingMode: c.listingMode || "rent",
    hasSizes: c.hasSizes !== false,
  };
}

// ─── Direct-to-S3 helpers ────────────────────────────────────────────────────
async function uploadImageToS3(file) {
  const { data } = await api.get("/api/categories/sign-upload", {
    params: { filename: file.name, contentType: file.type },
  });
  const { presignedUrl, publicUrl, key } = data;
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`S3 upload failed (${res.status})`);
  return { imageUrl: publicUrl, imagePublicId: key };
}

// ─── Category APIs ────────────────────────────────────────────────────────────
export async function getCategories() {
  const { data } = await api.get("/api/categories");
  return Array.isArray(data) ? data : [];
}

export async function createCategory({ name, description, imageFile, listingMode, hasSizes }) {
  const body = { name };
  if (description) body.description = description;
  if (listingMode) body.listingMode = listingMode;
  if (hasSizes !== undefined) body.hasSizes = hasSizes;
  if (imageFile) {
    const { imageUrl, imagePublicId } = await uploadImageToS3(imageFile);
    body.imageUrl = imageUrl;
    body.imagePublicId = imagePublicId;
  }
  const { data } = await api.post("/api/categories", body);
  return data;
}

export async function updateCategory(id, { name, description, imageFile, listingMode, hasSizes }) {
  const body = {};
  if (name) body.name = name;
  if (description !== undefined) body.description = description;
  if (listingMode !== undefined) body.listingMode = listingMode;
  if (hasSizes !== undefined) body.hasSizes = hasSizes;
  if (imageFile) {
    const { imageUrl, imagePublicId } = await uploadImageToS3(imageFile);
    body.imageUrl = imageUrl;
    body.imagePublicId = imagePublicId;
  }
  const { data } = await api.put(`/api/categories/${id}`, body);
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
