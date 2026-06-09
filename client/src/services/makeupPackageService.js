import api from "./api";

async function uploadImageToS3(file) {
  const { data } = await api.get("/api/makeup-packages/sign-upload", {
    params: { filename: file.name, contentType: file.type },
  });
  const { presignedUrl, publicUrl, key } = data;
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`S3 upload failed (${res.status})`);
  return { url: publicUrl, publicId: key };
}

// GET /api/makeup-packages?category=id&subcategory=name
export async function getMakeupPackagesByCategory(categoryId, subcategory) {
  if (!categoryId || categoryId === "undefined") return [];
  const params = { category: categoryId };
  if (subcategory) params.subcategory = subcategory;
  const { data } = await api.get("/api/makeup-packages", { params });
  return Array.isArray(data) ? data : [];
}

export async function getAllMakeupPackages() {
  const { data } = await api.get("/api/makeup-packages");
  return Array.isArray(data) ? data : [];
}

export async function getMakeupPackageById(id) {
  const { data } = await api.get(`/api/makeup-packages/${id}`);
  return data;
}

// imageSlots: array of { type: 'existing', url, publicId } | { type: 'new', file: File } | null
async function resolveImageSlots(imageSlots) {
  return Promise.all(
    (imageSlots || [])
      .filter(Boolean)
      .map((slot) =>
        slot.type === "existing"
          ? Promise.resolve({ url: slot.url, publicId: slot.publicId })
          : uploadImageToS3(slot.file)
      )
  );
}

export async function createMakeupPackage({
  categoryId, subcategory, name, artistName, tag,
  pricing, imageSlots, packageDetails, shortDescription, complimentary,
}) {
  const images = await resolveImageSlots(imageSlots);

  const body = {
    category: categoryId,
    name,
    pricing,
    images,
    complimentary: complimentary || [],
  };
  if (subcategory)    body.subcategory     = subcategory;
  if (artistName)     body.artistName      = artistName;
  if (tag)            body.tag             = tag;
  if (packageDetails) body.packageDetails  = packageDetails;
  if (shortDescription) body.shortDescription = shortDescription;

  const { data } = await api.post("/api/makeup-packages", body);
  return data;
}

export async function updateMakeupPackage(id, {
  name, artistName, subcategory, tag, pricing,
  imageSlots, packageDetails, shortDescription, complimentary,
}) {
  const images = await resolveImageSlots(imageSlots);

  const body = { name, pricing, images, complimentary: complimentary || [] };
  if (artistName   !== undefined) body.artistName      = artistName;
  if (subcategory  !== undefined) body.subcategory      = subcategory;
  if (tag          !== undefined) body.tag              = tag;
  if (packageDetails !== undefined) body.packageDetails = packageDetails;
  if (shortDescription !== undefined) body.shortDescription = shortDescription;

  const { data } = await api.put(`/api/makeup-packages/${id}`, body);
  return data;
}

export async function deleteMakeupPackage(id) {
  const { data } = await api.delete(`/api/makeup-packages/${id}`);
  return data;
}
