import api from "./api";

/**
 * Get all favorites for the logged-in customer
 * @returns {Promise<Array>} Array of favorite objects with populated product data
 */
export async function getFavorites() {
  const response = await api.get("/api/favorites");
  return response.data;
}

/**
 * Add a product to favorites
 * @param {string} productId - The product ID to add
 * @returns {Promise<Object>} The created favorite object
 */
export async function addFavorite(productId) {
  const response = await api.post("/api/favorites", { productId });
  return response.data;
}

/**
 * Remove a product from favorites
 * @param {string} productId - The product ID to remove
 * @returns {Promise<Object>} Success message
 */
export async function removeFavorite(productId) {
  const response = await api.delete(`/api/favorites/${productId}`);
  return response.data;
}

/**
 * Check if a product is in favorites
 * @param {string} productId - The product ID to check
 * @returns {Promise<boolean>} True if product is favorited
 */
export async function checkFavorite(productId) {
  const response = await api.get(`/api/favorites/check/${productId}`);
  return response.data.isFavorite;
}

/**
 * Toggle favorite status for a product
 * @param {string} productId - The product ID to toggle
 * @param {boolean} currentStatus - Current favorite status
 * @returns {Promise<Object>} Result of add or remove operation
 */
export async function toggleFavorite(productId, currentStatus) {
  if (currentStatus) {
    return await removeFavorite(productId);
  } else {
    return await addFavorite(productId);
  }
}

