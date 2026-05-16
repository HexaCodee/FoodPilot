import { axiosAuth } from './api.js';

const BASE = '/users';

export const getUsers = ({ search, role, page = 1, limit = 20 } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (role && role !== 'all') params.role = role;
  params.page = page;
  params.limit = limit;
  return axiosAuth.get(BASE, { params });
};

export const updateUserRole = (id, roleName) =>
  axiosAuth.put(`${BASE}/${id}/role`, { roleName });

export const activateUser = (id) =>
  axiosAuth.put(`${BASE}/${id}/activate`);

export const deactivateUser = (id) =>
  axiosAuth.put(`${BASE}/${id}/deactivate`);
