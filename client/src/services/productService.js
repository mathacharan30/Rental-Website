import api from "./api";
import { findCategoryIdBySlug } from "./categoryService";

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
  const priceDisplay = typeof p.price === "number" ? `₹${p.price}` : p.price;

  return {
    id: p._id || p.id,
    title: p.name || p.title,
    image: mainImage,
    images: images,
    category: categoryName || "",
    price: priceDisplay || "",
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
