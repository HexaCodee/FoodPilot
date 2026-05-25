import { axiosAdmin } from './api.js';

/**
 * Upload a single image file to the restaurant-admin media server.
 * Returns the public URL string on success.
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axiosAdmin.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 60 s — los uploads necesitan más tiempo que las peticiones normales
  });
  if (!data?.url) throw new Error('El servidor no devolvió una URL de imagen');
  return data.url;
};
