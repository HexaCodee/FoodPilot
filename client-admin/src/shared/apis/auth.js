import { axiosAuth } from './api.js';

export const login = async (data) => {
  return await axiosAuth.post('/auth/login', data);
};

export const getAllUsers = async () => {
  const { data } = await axiosAuth.get('/auth/users');
  return { users: data };
};

export const register = async (data) => {
  return await axiosAuth.post('/auth/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const verifyEmail = async (token) => {
  try {
    return await axiosAuth.post('/auth/verify-email', { token });
  } catch (err) {
    if (err.response) {
      return err.response;
    }
    return { status: 0, data: { message: 'Network error' } };
  }
};

export const forgotPassword = async (email) => {
  try {
    return await axiosAuth.post('/auth/forgot-password', { email });
  } catch (err) {
    if (err.response) {
      return err.response;
    }
    return { status: 0, data: { message: 'Network error' } };
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    return await axiosAuth.post('/auth/reset-password', { token, newPassword });
  } catch (err) {
    if (err.response) {
      return err.response;
    }
    return { status: 0, data: { message: 'Network error' } };
  }
};
