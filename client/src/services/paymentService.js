import api from './api';

/**
 * Payment Service – PhonePe Standard Checkout
 *
 * All PhonePe logic lives on the backend; this service
 * simply talks to the /api/payment/* Express routes.
 */

/**
 * Initiate a payment + create order in one call.
 * @param {{ productId: string, size: string, startDate?: string, endDate?: string, notes?: string }} data
 * @returns {{ success: boolean, checkoutUrl: string, merchantOrderId: string, orderId: string }}
 */
export const createPayment = async ({ productId, size, startDate, endDate, notes }) => {
  const { data } = await api.post('/api/payment/create', {
    productId,
    size,
    startDate,
    endDate,
    notes,
  });
  return data;
};

/**
 * Get the current status of a payment.
 * @param {string} merchantOrderId
 */
export const getPaymentStatus = async (merchantOrderId) => {
  const { data } = await api.get(`/api/payment/status/${merchantOrderId}`);
  return data;
};

/**
 * Initiate a refund.
 * @param {{ merchantOrderId: string, refundId: string, amount: number }} payload
 *   amount – in rupees
 */
export const createRefund = async ({ merchantOrderId, refundId, amount }) => {
  const { data } = await api.post('/api/payment/refund', { merchantOrderId, refundId, amount });
  return data;
};

/**
 * Check the status of a refund.
 * @param {string} refundId
 */
export const getRefundStatus = async (refundId) => {
  const { data } = await api.get(`/api/payment/refund-status/${refundId}`);
  return data;
};
