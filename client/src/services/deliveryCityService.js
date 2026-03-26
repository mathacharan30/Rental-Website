import api from './api';
import { getIdToken } from './firebaseAuthService';

async function authHeader() {
  const token = await getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/** Public: fetch active delivery cities for the checkout dropdown. */
export const getDeliveryCities = async () => {
  const { data } = await api.get('/api/cities');
  return data.cities; // [{ _id, name, deliveryCharge }]
};

/** Super admin: fetch ALL cities (including inactive). */
export const getAllDeliveryCities = async () => {
  const headers = await authHeader();
  const { data } = await api.get('/api/superadmin/cities', { headers });
  return data.cities;
};

/** Super admin: create a new delivery city. */
export const createDeliveryCity = async ({ name, deliveryCharge }) => {
  const headers = await authHeader();
  const { data } = await api.post('/api/superadmin/cities', { name, deliveryCharge }, { headers });
  return data.city;
};

/** Super admin: update an existing delivery city. */
export const updateDeliveryCity = async (id, updates) => {
  const headers = await authHeader();
  const { data } = await api.put(`/api/superadmin/cities/${id}`, updates, { headers });
  return data.city;
};

/** Super admin: delete a delivery city. */
export const deleteDeliveryCity = async (id) => {
  const headers = await authHeader();
  const { data } = await api.delete(`/api/superadmin/cities/${id}`, { headers });
  return data;
};

