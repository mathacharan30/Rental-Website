import api from "./api";

export async function createOrder(payload) {
  // payload: { productId, size, startDate?, endDate?, notes? }
  const { data } = await api.post("/api/orders", payload);
  return data;
}

export async function getMyOrders() {
  const { data } = await api.get("/api/orders/mine");
  return Array.isArray(data) ? data : [];
}

export async function getStoreOrders(storeName) {
  const params = storeName ? { storeName } : {};
  const { data } = await api.get("/api/orders/store", { params });
  return Array.isArray(data) ? data : [];
}

export async function getAllOrders() {
  const { data } = await api.get("/api/orders/all");
  return Array.isArray(data) ? data : [];
}

export async function updateOrderStatus(orderId, status) {
  const { data } = await api.patch(`/api/orders/${orderId}/status`, { status });
  return data;
}

const orderService = { createOrder, getMyOrders, getStoreOrders, getAllOrders, updateOrderStatus };
export default orderService;
