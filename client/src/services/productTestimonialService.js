import api from './api';

/**
 * Add a new product testimonial
 * @param {FormData} formData - Contains productId, rating, comment, and optionally image
 */
export const addProductTestimonial = async (formData) => {
  try {
    const response = await api.post(`/api/product-testimonials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Using FormData for image upload
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to add testimonial');
  }
};

/**
 * Get testimonials for a product
 * @param {string} productId - The product ID
 */
export const getProductTestimonials = async (productId) => {
  try {
    const response = await api.get(`/api/product-testimonials/product/${productId}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch testimonials');
  }
};
