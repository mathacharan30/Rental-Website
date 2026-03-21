const Product = require("../models/Product");
const { s3, S3_BUCKET, deleteFromS3 } = require("../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const Category = require("../models/Category");
const Store = require("../models/Store");
const mongoose = require("mongoose");

// GET /api/products  (public – all products for the storefront)
exports.getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      
      // Find categories matching the search term
      const matchingCategories = await Category.find({ name: searchRegex }).select("_id");
      const categoryIds = matchingCategories.map((c) => c._id);

      query = {
        $or: [
          { name: searchRegex },
          { category: { $in: categoryIds } },
        ],
      };
    }

    const products = await Product.find(query)
      .populate("category")
      .sort({ createdAt: -1 });
    res.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
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
      // multer-s3 path: images uploaded to S3, file.location is URL, file.key is S3 key
      console.log(
        `[Products] Create – ${req.files.length} file(s) received via multer-s3`,
      );
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        if (file.location && file.key) {
          console.log(
            `[Products] Image ${i + 1} uploaded successfully → url: ${file.location} | publicId: ${file.key}`,
          );
          images.push({ url: file.location, publicId: file.key });
        } else {
          console.error(
            `[Products] Image ${i + 1} upload failed – missing location or key (originalname: ${file.originalname}, mimetype: ${file.mimetype})`,
          );
        }
      }
    } else if (req.body.images) {
      // Direct-to-S3 path: browser uploaded images directly via presigned URL;
      // body contains a JSON array of { url, publicId } already on S3.
      try {
        const parsed =
          typeof req.body.images === "string"
            ? JSON.parse(req.body.images)
            : req.body.images;
        if (Array.isArray(parsed)) {
          parsed.forEach((img) => {
            if (img.url && img.publicId)
              images.push({ url: img.url, publicId: img.publicId });
          });
          console.log(`[Products] Create – ${images.length} image(s) received via direct-S3 path`);
        }
      } catch (parseErr) {
        console.error("[Products] Failed to parse images JSON:", parseErr.message);
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

    // Handle selective image deletion (deleteImages = JSON array of S3 keys)
    if (req.body.deleteImages) {
      try {
        const deleteIds = JSON.parse(req.body.deleteImages);
        if (Array.isArray(deleteIds) && deleteIds.length) {
          for (const publicId of deleteIds) {
            try {
              await deleteFromS3(publicId);
              console.log(`[S3] Deleted image ${publicId}`);
            } catch (s3Err) {
              console.error("[S3] Deletion error:", s3Err.message);
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

    // If new images provided, append them (not replace)
    if (req.files && req.files.length) {
      // multer-s3 path
      const newImages = req.files.map((f) => ({
        url: f.location,
        publicId: f.key,
      }));
      product.images = [...product.images, ...newImages];
    } else if (req.body.images) {
      // Direct-to-S3 path
      try {
        const parsed =
          typeof req.body.images === "string"
            ? JSON.parse(req.body.images)
            : req.body.images;
        if (Array.isArray(parsed) && parsed.length) {
          const newImages = parsed.filter((img) => img.url && img.publicId);
          product.images = [...product.images, ...newImages];
          console.log(`[Products] Update – ${newImages.length} image(s) added via direct-S3 path`);
        }
      } catch (parseErr) {
        console.error("[Products] Failed to parse images JSON:", parseErr.message);
      }
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

    // Delete all images from S3
    if (product.images && product.images.length) {
      for (const img of product.images) {
        try {
          await deleteFromS3(img.publicId);
          console.log(`[S3] Deleted image ${img.publicId}`);
        } catch (s3Err) {
          console.error("[S3] Deletion error:", s3Err.message);
        }
      }
    }

    // Remove product from all users' favorites
    const Favorite = require("../models/Favorite");
    const deletedFavorites = await Favorite.deleteMany({ product: id });
    if (deletedFavorites.deletedCount > 0) {
      console.log(`[Favorites] Removed product from ${deletedFavorites.deletedCount} users' favorites`);
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("[Products] Delete error:", error.message);
    res.status(500).json({ message: "Server error deleting product" });
  }
};

// GET /api/products/sign-upload  (protected – store_owner / super_admin)
// Returns a short-lived presigned S3 PUT URL so the browser can upload directly
// to S3.  No image bytes ever pass through this server.
exports.signUpload = async (req, res) => {
  try {
    const { filename, contentType } = req.query;
    if (!filename) {
      return res.status(400).json({ message: "filename query param is required" });
    }

    const ext = filename.includes(".") ? filename.substring(filename.lastIndexOf(".")) : "";
    const baseName = filename.replace(/\.[^.]+$/, "").replace(/\s+/g, "-");
    const key = `products/${Date.now()}-${baseName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType || "image/jpeg",
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({
      presignedUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("[Products] signUpload error:", error.message);
    res.status(500).json({ message: "Failed to generate presigned upload URL" });
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
    res.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
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
    res.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json(products);
  } catch (error) {
    console.error("[Products] Top picks error:", error.message);
    return res.status(500).json({ message: "Server error fetching top picks" });
  }
};

// PATCH /api/products/:id/availability  (store_owner / super_admin)
// Toggles or explicitly sets the product's 'available' field.
exports.toggleAvailability = async (req, res) => {
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

    // If an explicit value is provided in body, use it; otherwise just toggle
    const body = req.body || {};
    if (body.available !== undefined) {
      product.available =
        typeof body.available === "string"
          ? body.available === "true"
          : !!body.available;
    } else {
      product.available = !product.available;
    }

    await product.save();
    return res.json({ id: product._id, available: product.available });
  } catch (error) {
    console.error("[Products] toggleAvailability error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error updating availability" });
  }
};
