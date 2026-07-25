const Event = require('../models/Event');
const { s3, S3_BUCKET, deleteFromS3 } = require('../config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }     = require('@aws-sdk/s3-request-presigner');
const cache = require('../config/cache');

const SIGN_UPLOAD_ALLOWED_EXTS  = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const SIGN_UPLOAD_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_GALLERY = 5;
const CACHE_KEY = 'events';

// GET /api/events/sign-upload
exports.signEventUpload = async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename) return res.status(400).json({ message: 'filename is required' });

    const ext = filename.includes('.')
      ? filename.substring(filename.lastIndexOf('.')).toLowerCase()
      : '';
    if (!SIGN_UPLOAD_ALLOWED_EXTS.has(ext))
      return res.status(400).json({ message: 'Invalid file extension' });

    const baseName = filename
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9\-_]/g, '-')
      .slice(0, 80);

    const safeType = SIGN_UPLOAD_ALLOWED_TYPES.has(contentType) ? contentType : 'image/jpeg';
    const key = `events/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${baseName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: safeType,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return res.json({ presignedUrl, publicUrl, key });
  } catch (err) {
    console.error('[Event] signUpload error:', err.message);
    return res.status(500).json({ message: 'Failed to generate presigned URL' });
  }
};

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const cached = await cache.get(CACHE_KEY);
    if (cached) return res.json(cached);

    const events = await Event.find().sort({ createdAt: -1 });
    await cache.set(CACHE_KEY, events, 300);
    return res.json(events);
  } catch (err) {
    console.error('[Event] Fetch error:', err.message);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

// GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    return res.json(event);
  } catch (err) {
    console.error('[Event] GetById error:', err.message);
    res.status(500).json({ message: 'Server error fetching event' });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const {
      category, name, coverImageUrl, coverImagePublicId, startingPrice,
      shortDescription, whatsIncluded, bookBefore, serviceLocation, duration, gallery,
    } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!coverImageUrl || !coverImagePublicId) {
      return res.status(400).json({ message: 'Cover image is required' });
    }

    const safeGallery = Array.isArray(gallery)
      ? gallery.filter((img) => img && img.url && img.publicId).slice(0, MAX_GALLERY)
      : [];

    const event = await Event.create({
      category: category?.trim() || undefined,
      name: name.trim(),
      coverImage: { url: coverImageUrl, publicId: coverImagePublicId },
      startingPrice: Number(startingPrice) || 0,
      shortDescription: shortDescription?.trim() || undefined,
      whatsIncluded: Array.isArray(whatsIncluded)
        ? whatsIncluded.map((w) => w.trim()).filter(Boolean)
        : [],
      bookBefore: bookBefore?.trim() || undefined,
      serviceLocation: serviceLocation?.trim() || undefined,
      duration: duration?.trim() || undefined,
      gallery: safeGallery,
    });

    await cache.invalidate(CACHE_KEY);
    return res.status(201).json(event);
  } catch (err) {
    console.error('[Event] Create error:', err.message);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category, name, coverImageUrl, coverImagePublicId, startingPrice,
      shortDescription, whatsIncluded, bookBefore, serviceLocation, duration, gallery,
    } = req.body;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Replace cover image — delete old from S3
    if (coverImageUrl && coverImagePublicId) {
      if (event.coverImage && event.coverImage.publicId) {
        try { await deleteFromS3(event.coverImage.publicId); } catch { /* ignore */ }
      }
      event.coverImage = { url: coverImageUrl, publicId: coverImagePublicId };
    }

    // Reconcile gallery — delete S3 images that were removed
    if (Array.isArray(gallery)) {
      const incomingIds = new Set(gallery.map((img) => img.publicId).filter(Boolean));
      for (const old of event.gallery) {
        if (!incomingIds.has(old.publicId)) {
          try { await deleteFromS3(old.publicId); } catch { /* ignore */ }
        }
      }
      event.gallery = gallery.filter((img) => img && img.url && img.publicId).slice(0, MAX_GALLERY);
    }

    if (category !== undefined)      event.category         = category?.trim() || undefined;
    if (name)                        event.name             = name.trim();
    if (startingPrice !== undefined) event.startingPrice    = Number(startingPrice) || 0;
    if (shortDescription !== undefined) event.shortDescription = shortDescription?.trim() || undefined;
    if (Array.isArray(whatsIncluded))   event.whatsIncluded  = whatsIncluded.map((w) => w.trim()).filter(Boolean);
    if (bookBefore !== undefined)    event.bookBefore       = bookBefore?.trim() || undefined;
    if (serviceLocation !== undefined) event.serviceLocation = serviceLocation?.trim() || undefined;
    if (duration !== undefined)      event.duration         = duration?.trim() || undefined;

    await event.save();
    await cache.invalidate(CACHE_KEY);
    return res.json(event);
  } catch (err) {
    console.error('[Event] Update error:', err.message);
    res.status(500).json({ message: 'Server error updating event' });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const images = [event.coverImage, ...(event.gallery || [])].filter((i) => i && i.publicId);
    for (const img of images) {
      try { await deleteFromS3(img.publicId); } catch { /* ignore */ }
    }

    await event.deleteOne();
    await cache.invalidate(CACHE_KEY);
    return res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('[Event] Delete error:', err.message);
    res.status(500).json({ message: 'Server error deleting event' });
  }
};
