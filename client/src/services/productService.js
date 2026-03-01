import api from "./api";
import { findCategoryIdBySlug } from "./categoryService";

// Round to 2 decimal places and strip unnecessary trailing zeros
function formatPrice(n) {
  const rounded = Math.round((n + Number.EPSILON) * 100) / 100;
  return parseFloat(rounded.toFixed(2));
}

export function mapProduct(p = {}) {
  let images = [];
  if (Array.isArray(p.images)) {
    images = p.images
      .map((img) => {
        if (typeof img === "string") return img;
        return img?.url || "";
      })
      .filter(Boolean);
  }

  let mainImage = p.image || "";
  if (!mainImage && images.length > 0) {
    mainImage = images[0];
  }

  if (mainImage && !images.includes(mainImage)) {
    images.unshift(mainImage);
  }

  const categoryName =
    typeof p.category === "object" && p.category !== null
      ? p.category.name
      : p.category;

  const rentPrice = formatPrice(
    typeof p.rentPrice === "number" ? p.rentPrice : 0,
  );
  const commissionPrice = formatPrice(
    typeof p.commissionPrice === "number" ? p.commissionPrice : 0,
  );
  const advanceAmount = Math.round(
    typeof p.advanceAmount === "number" ? p.advanceAmount : 0,
  );
  const salePrice = formatPrice(
    typeof p.salePrice === "number" ? p.salePrice : 0,
  );
  const listingType = p.listingType === "sale" ? "sale" : "rent";
  const totalPrice = formatPrice(
    typeof p.price === "number"
      ? p.price
      : listingType === "sale"
        ? salePrice + commissionPrice
        : rentPrice + commissionPrice,
  );
  const priceDisplay = `₹${totalPrice}`;

  // Preserve raw image objects (with publicId) for admin editing
  let rawImages = [];
  if (Array.isArray(p.images)) {
    rawImages = p.images
      .map((img) => {
        if (typeof img === "string") return { url: img, publicId: "" };
        return img?.url ? { url: img.url, publicId: img.publicId || "" } : null;
      })
      .filter(Boolean);
  }

  return {
    id: p._id || p.id,
    title: p.name || p.title,
    image: mainImage,
    images: images,
    rawImages: rawImages,
    category: categoryName || "",
    price: priceDisplay || "",
    listingType,
    rentPrice,
    commissionPrice,
    salePrice,
    advanceAmount,
    description: p.description || "",
    rating: typeof p.rating === "number" ? p.rating : 0,
    sizes: p.sizes || ["XS", "S", "M", "L", "XL"],
    stock: p.stock !== undefined ? p.stock : 0,
  };
}

export async function getTopPicks() {
  const { data } = await api.get("/api/products/top-picks");
  return Array.isArray(data) ? data.map(mapProduct) : [];
}

export async function getAllProducts() {
  const { data } = await api.get("/api/products");
  return Array.isArray(data) ? data.map(mapProduct) : [];
}

export async function getProductById(id) {
  if (!id) throw new Error("product id is required");
  const { data } = await api.get(`/api/products/${id}`);
  return mapProduct(data || {});
}

export async function getProductsByCategorySlug(slug) {
  const catId = await findCategoryIdBySlug(slug);
  if (!catId) return [];
  const { data } = await api.get(`/api/categories/${catId}/products`);
  return Array.isArray(data) ? data.map(mapProduct) : [];
}
