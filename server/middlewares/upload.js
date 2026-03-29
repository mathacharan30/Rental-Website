const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { s3, S3_BUCKET } = require("../config/s3");

// Allowlisted safe image MIME types — SVG excluded (can embed JavaScript)
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

// Shared image file filter — validates both MIME type AND extension
const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpeg, png, webp, and gif images are allowed"), false);
  }
};

/**
 * Build a multer-s3 storage engine for a given S3 folder prefix.
 * Uploaded files are publicly readable; the URL is available at req.file.location
 * and the S3 key at req.file.key.
 */
const makeS3Storage = (folder) =>
  multerS3({
    s3,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || "";
      // path.basename strips directory traversal; then sanitize to safe chars only
      const rawBase = path.basename(file.originalname, path.extname(file.originalname));
      const baseName = rawBase.replace(/[^a-zA-Z0-9\-_]/g, "-").slice(0, 80);
      const key = `${folder}/${Date.now()}-${baseName}${ext}`;
      cb(null, key);
    },
  });

const categoryUpload = multer({
  storage: makeS3Storage("categories"),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const productUpload = multer({
  storage: makeS3Storage("products"),
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

const bannerUpload = multer({
  storage: makeS3Storage("banners"),
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

const productTestimonialUpload = multer({
  storage: makeS3Storage("product-testimonials"),
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

module.exports = { productUpload, bannerUpload, categoryUpload, productTestimonialUpload };
