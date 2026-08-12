import api from './api';
import { getIdToken } from './firebaseAuthService';

async function authHeader() {
  const token = await getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/** Public: fetch active store cities for the AddStore dropdown + product filter. */
export const getStoreCities = async () => {
  const { data } = await api.get('/api/store-cities');
  return data.cities; // [{ _id, name }]
};

/** Super admin: fetch ALL store cities (including inactive). */
export const getAllStoreCities = async () => {
  const headers = await authHeader();
  const { data } = await api.get('/api/superadmin/store-cities', { headers });
  return data.cities;
};

/** Super admin: create a new store city. */
export const createStoreCity = async ({ name }) => {
  const headers = await authHeader();
  const { data } = await api.post('/api/superadmin/store-cities', { name }, { headers });
  return data.city;
};

/** Super admin: update an existing store city. */
export const updateStoreCity = async (id, updates) => {
  const headers = await authHeader();
  const { data } = await api.put(`/api/superadmin/store-cities/${id}`, updates, { headers });
  return data.city;
};

/** Super admin: delete a store city. */
export const deleteStoreCity = async (id) => {
  const headers = await authHeader();
  const { data } = await api.delete(`/api/superadmin/store-cities/${id}`, { headers });
  return data;
};
