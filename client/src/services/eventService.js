import api from "./api";

// ─── Direct-to-S3 helper ──────────────────────────────────────────────────────
async function uploadImageToS3(file) {
  const { data } = await api.get("/api/events/sign-upload", {
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

// ─── Event APIs ───────────────────────────────────────────────────────────────
export async function getEvents() {
  const { data } = await api.get("/api/events");
  return Array.isArray(data) ? data : [];
}

export async function getEventById(id) {
  const { data } = await api.get(`/api/events/${id}`);
  return data;
}

export async function createEvent({
  category, name, coverImageFile, startingPrice, shortDescription,
  whatsIncluded, bookBefore, serviceLocation, duration, gallerySlots,
}) {
  const gallery = await resolveImageSlots(gallerySlots);
  const cover = coverImageFile ? await uploadImageToS3(coverImageFile) : null;

  const body = {
    name,
    startingPrice: Number(startingPrice) || 0,
    whatsIncluded: whatsIncluded || [],
    gallery,
  };
  if (cover) {
    body.coverImageUrl = cover.url;
    body.coverImagePublicId = cover.publicId;
  }
  if (category)         body.category         = category;
  if (shortDescription) body.shortDescription = shortDescription;
  if (bookBefore)       body.bookBefore       = bookBefore;
  if (serviceLocation)  body.serviceLocation  = serviceLocation;
  if (duration)         body.duration         = duration;

  const { data } = await api.post("/api/events", body);
  return data;
}

export async function updateEvent(id, {
  category, name, coverImageFile, startingPrice, shortDescription,
  whatsIncluded, bookBefore, serviceLocation, duration, gallerySlots,
}) {
  const gallery = await resolveImageSlots(gallerySlots);

  const body = {
    startingPrice: Number(startingPrice) || 0,
    whatsIncluded: whatsIncluded || [],
    gallery,
  };
  if (category !== undefined)         body.category         = category;
  if (name !== undefined)             body.name             = name;
  if (shortDescription !== undefined) body.shortDescription = shortDescription;
  if (bookBefore !== undefined)       body.bookBefore       = bookBefore;
  if (serviceLocation !== undefined)  body.serviceLocation  = serviceLocation;
  if (duration !== undefined)         body.duration         = duration;

  // Only replace cover image when a new file was picked
  if (coverImageFile) {
    const cover = await uploadImageToS3(coverImageFile);
    body.coverImageUrl = cover.url;
    body.coverImagePublicId = cover.publicId;
  }

  const { data } = await api.put(`/api/events/${id}`, body);
  return data;
}

export async function deleteEvent(id) {
  const { data } = await api.delete(`/api/events/${id}`);
  return data;
}
