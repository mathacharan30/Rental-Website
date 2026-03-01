const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Shared image file filter
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

// Product storage configuration
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "products",
    resource_type: "image",
    format: undefined, // allow auto format
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

// Banner storage configuration (single folder)
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "banners",
    resource_type: "image",
    format: undefined,
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

// Category storage configuration
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "categories",
    resource_type: "image",
    format: undefined,
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

const productUpload = multer({
  storage: productStorage,
  fileFilter: imageFileFilter,
});
const bannerUpload = multer({
  storage: bannerStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

module.exports = { productUpload, bannerUpload, categoryUpload };
