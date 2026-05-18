import { axiosAdmin } from './api.js';

const BASE = '/tables';

export const getTables = ({ restaurant, page = 1, limit = 50, isAvailable = 'all' } = {}) =>
  axiosAdmin.get(BASE, { params: { restaurant, page, limit, isAvailable } });

export const createTable = (data) => axiosAdmin.post(BASE, data);

export const updateTable = (id, data) => axiosAdmin.put(`${BASE}/${id}`, data);

export const activateTable  = (id) => axiosAdmin.patch(`${BASE}/${id}/activate`);
export const deactivateTable = (id) => axiosAdmin.patch(`${BASE}/${id}/deactivate`);
