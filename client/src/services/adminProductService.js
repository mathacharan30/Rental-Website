// Admin product service – the Firebase token is attached automatically
// by the api.js interceptor; no manual token handling needed here.
import api from "./api";
import { mapProduct } from "./productService";

export async function listProducts(storeName) {
  // /mine returns only this store's products (auth token sent by api.js interceptor)
  // storeName is passed as a query param so super_admin can view a specific store
  const params = storeName ? { storeName } : {};
  const { data } = await api.get("/api/products/mine", { params });
  return Array.isArray(data) ? data.map(mapProduct) : [];
}

export async function createProduct(formData) {
  const { data } = await api.post("/api/products/createProduct", formData);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/api/products/${id}`);
  return data;
}

export default { listProducts, createProduct, deleteProduct };

