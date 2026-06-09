import api from "./api";

// ─── Direct-to-S3 helpers ────────────────────────────────────────────────────
async function uploadImageToS3(file) {
  const { data } = await api.get("/api/makeup-categories/sign-upload", {
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

// ─── Makeup Category APIs ─────────────────────────────────────────────────────
export async function getMakeupCategories() {
  const { data } = await api.get("/api/makeup-categories");
  return Array.isArray(data) ? data : [];
}

export async function createMakeupCategory({ name, imageFile, subcategories = [] }) {
  const body = { name, subcategories };
  if (imageFile) {
    const { imageUrl, imagePublicId } = await uploadImageToS3(imageFile);
    body.imageUrl = imageUrl;
    body.imagePublicId = imagePublicId;
  }
  const { data } = await api.post("/api/makeup-categories", body);
  return data;
}

export async function updateMakeupCategory(id, { name, imageFile, subcategories }) {
  const body = {};
  if (name) body.name = name;
  if (subcategories !== undefined) body.subcategories = subcategories;
  if (imageFile) {
    const { imageUrl, imagePublicId } = await uploadImageToS3(imageFile);
    body.imageUrl = imageUrl;
    body.imagePublicId = imagePublicId;
  }
  const { data } = await api.put(`/api/makeup-categories/${id}`, body);
  return data;
}

export async function deleteMakeupCategory(id) {
  const { data } = await api.delete(`/api/makeup-categories/${id}`);
  return data;
}
