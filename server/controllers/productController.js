const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const Category = require("../models/Category");
const Store = require("../models/Store");
const mongoose = require("mongoose");

// GET /api/products  (public – all products for the storefront)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("[Products] Fetch error:", error.message);
    res.status(500).json({ message: "Server error fetching products" });
  }
};

// GET /api/products/mine  (store_owner – only their own products)
exports.getMyProducts = async (req, res) => {
  try {
    let storeId;

    if (req.user.role === "super_admin") {
      // super_admin visits a specific store – slug passed as ?storeName=<slug>
      const slug = req.query.storeName || null;
      if (!slug) return res.json([]);
      const store = await Store.findOne({ slug });
      if (!store) return res.json([]);
      storeId = store._id;
    } else {
      storeId = req.user.storeId || null;
      if (!storeId) return res.json([]);
    }

    const products = await Product.find({ store: storeId })
      .populate("category")
      .sort({ createdAt: -1 });
    console.log(
      `[Products] getMyProducts – storeId=${storeId} found=${products.length}`,
    );
    res.json(products);
  } catch (error) {
    console.error("[Products] GetMine error:", error.message);
    res.status(500).json({ message: "Server error fetching products" });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      listingType: listingTypeRaw,
      rentPrice: rentPriceRaw,
      commissionPrice: commissionPriceRaw,
      salePrice: salePriceRaw,
      advanceAmount: advanceAmountRaw,
      description,
      available,
      stock: stockRaw,
      rating: ratingRaw,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const listingType = listingTypeRaw === "sale" ? "sale" : "rent";

    // For sale listing: require salePrice + commissionPrice; for rent listing: require rentPrice + commissionPrice
    if (listingType === "sale") {
      if (salePriceRaw === undefined || salePriceRaw === "") {
        return res
          .status(400)
          .json({ message: "Sale price is required for sale listings" });
      }
      if (commissionPriceRaw === undefined || commissionPriceRaw === "") {
        return res
          .status(400)
          .json({ message: "Commission price is required" });
      }
    } else {
      if (rentPriceRaw === undefined || rentPriceRaw === "") {
        return res.status(400).json({ message: "Rent price is required" });
      }
      if (commissionPriceRaw === undefined || commissionPriceRaw === "") {
        return res
          .status(400)
          .json({ message: "Commission price is required" });
      }
    }

    // Normalize fields
    const rentPrice =
      rentPriceRaw !== undefined && rentPriceRaw !== ""
        ? Number(rentPriceRaw)
        : 0;
    const commissionPrice =
      commissionPriceRaw !== undefined && commissionPriceRaw !== ""
        ? Number(commissionPriceRaw)
        : 0;
    const salePrice =
      salePriceRaw !== undefined && salePriceRaw !== ""
        ? Number(salePriceRaw)
        : 0;
    const advanceAmount =
      advanceAmountRaw !== undefined && advanceAmountRaw !== ""
        ? Math.round(Number(advanceAmountRaw))
        : 0;

    if (!Number.isFinite(rentPrice) || rentPrice < 0) {
      return res.status(400).json({ message: "Invalid rent price" });
    }
    if (!Number.isFinite(commissionPrice) || commissionPrice < 0) {
      return res.status(400).json({ message: "Invalid commission price" });
    }
    if (!Number.isFinite(salePrice) || salePrice < 0) {
      return res.status(400).json({ message: "Invalid sale price" });
    }

    const availableBool =
      typeof available === "string" ? available === "true" : !!available;
    const stockNum =
      stockRaw === undefined || stockRaw === "" ? undefined : Number(stockRaw);
    const ratingNum =
      ratingRaw === undefined || ratingRaw === ""
        ? undefined
        : Number(ratingRaw);

    console.log("[Products] Create – req.user:", JSON.stringify(req.user));

    // storeId must be present for ownership tracking
    if (!req.user.storeId) {
      console.error(
        "[Products] storeId is missing on req.user – aborting product creation",
      );
      return res.status(400).json({
        message: "Your account has no linked store. Contact the super admin.",
      });
    }

    const images = [];
    if (req.files && req.files.length) {
      console.log(
        `[Products] Create – ${req.files.length} file(s) received for upload`,
      );
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        if (file.path && file.filename) {
          console.log(
            `[Products] Image ${i + 1} uploaded successfully → url: ${file.path} | publicId: ${file.filename}`,
          );
          images.push({ url: file.path, publicId: file.filename });
        } else {
          console.error(
            `[Products] Image ${i + 1} upload failed – missing url or publicId (originalname: ${file.originalname}, mimetype: ${file.mimetype})`,
          );
        }
      }
    } else {
      console.log("[Products] Create – no image files received");
    }

    const payload = {
      name,
      category,
      listingType,
      rentPrice,
      commissionPrice,
      salePrice,
      advanceAmount,
      // price is auto-computed by pre-save hook
      description,
      available: availableBool,
      images,
      store: req.user.storeId,
    };

    if (Number.isFinite(stockNum)) payload.stock = stockNum;
    if (Number.isFinite(ratingNum)) payload.rating = ratingNum;

    const product = await Product.create(payload);

    const populated = await product.populate("category");
    res.status(201).json(populated);
  } catch (error) {
    console.error("[Products] Create error:", error.message);
    res.status(500).json({ message: "Server error creating product" });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (
      req.user.role === "store_owner" &&
      String(product.store) !== String(req.user.storeId)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorised to update this product" });
    }

    const {
      name,
      category,
      listingType: listingTypeRaw,
      rentPrice: rentPriceRaw,
      commissionPrice: commissionPriceRaw,
      salePrice: salePriceRaw,
      advanceAmount: advanceAmountRaw,
      description,
      available,
      stock: stockRaw,
      rating: ratingRaw,
    } = req.body;

    const listingType = listingTypeRaw === "sale" ? "sale" : "rent";

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    product.listingType = listingType;
    if (rentPriceRaw !== undefined && rentPriceRaw !== "")
      product.rentPrice = Number(rentPriceRaw);
    if (commissionPriceRaw !== undefined && commissionPriceRaw !== "")
      product.commissionPrice = Number(commissionPriceRaw);
    if (salePriceRaw !== undefined && salePriceRaw !== "")
      product.salePrice = Number(salePriceRaw);
    if (advanceAmountRaw !== undefined && advanceAmountRaw !== "")
      product.advanceAmount = Math.round(Number(advanceAmountRaw));
    if (description !== undefined) product.description = description;
    if (available !== undefined)
      product.available =
        typeof available === "string" ? available === "true" : !!available;
    if (stockRaw !== undefined && stockRaw !== "")
      product.stock = Number(stockRaw);
    if (ratingRaw !== undefined && ratingRaw !== "")
      product.rating = Math.min(5, Math.max(0, Number(ratingRaw)));

    // Handle selective image deletion (deleteImages = JSON array of publicIds)
    if (req.body.deleteImages) {
      try {
        const deleteIds = JSON.parse(req.body.deleteImages);
        if (Array.isArray(deleteIds) && deleteIds.length) {
          for (const publicId of deleteIds) {
            try {
              await cloudinary.uploader.destroy(publicId);
              console.log(`[Cloudinary] Deleted image ${publicId}`);
            } catch (cloudErr) {
              console.error("[Cloudinary] Deletion error:", cloudErr.message);
            }
          }
          // Remove deleted images from product
          product.images = product.images.filter(
            (img) => !deleteIds.includes(img.publicId),
          );
        }
      } catch (parseErr) {
        console.error(
          "[Products] Failed to parse deleteImages:",
          parseErr.message,
        );
      }
    }

    // If new images uploaded, append them (not replace)
    if (req.files && req.files.length) {
      const newImages = req.files.map((f) => ({
        url: f.path,
        publicId: f.filename,
      }));
      product.images = [...product.images, ...newImages];
    }

    await product.save();
    const populated = await product.populate("category");
    res.json(populated);
  } catch (error) {
    console.error("[Products] Update error:", error.message);
    res.status(500).json({ message: "Server error updating product" });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ownership check: store_owners can only delete their own products
    if (
      req.user.role === "store_owner" &&
      String(product.store) !== String(req.user.storeId)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this product" });
    }

    // Delete all images from Cloudinary
    if (product.images && product.images.length) {
      for (const img of product.images) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
          console.log(`[Cloudinary] Deleted image ${img.publicId}`);
        } catch (cloudErr) {
          console.error("[Cloudinary] Deletion error:", cloudErr.message);
        }
      }
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("[Products] Delete error:", error.message);
    res.status(500).json({ message: "Server error deleting product" });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("[Products] GetById error:", error.message);
    res.status(500).json({ message: "Server error fetching product" });
  }
};

// Top picks = products with rating >= 4, sorted by rating desc, limited to 10
exports.getTopPicks = async (req, res) => {
  try {
    const products = await Product.find({ rating: { $gte: 4 } })
      .sort({ rating: -1 })
      .limit(10)
      .populate("category");
    return res.status(200).json(products);
  } catch (error) {
    console.error("[Products] Top picks error:", error.message);
    return res.status(500).json({ message: "Server error fetching top picks" });
  }
};
