import { axiosEvents } from './api.js';

// ── Events ────────────────────────────────────────────────────────────────────
export const getEvents = () => axiosEvents.get('/events');
export const getEventById = (id) => axiosEvents.get(`/events/${id}`);
export const createEvent = (data) => axiosEvents.post('/events', data);
export const updateEvent = (id, data) => axiosEvents.put(`/events/${id}`, data);
export const deleteEvent = (id) => axiosEvents.delete(`/events/${id}`);

// ── Sales Reports ─────────────────────────────────────────────────────────────
export const getSalesReports = () => axiosEvents.get('/sales-reports');
export const getSalesReportById = (id) => axiosEvents.get(`/sales-reports/${id}`);
export const createSalesReport = (data) => axiosEvents.post('/sales-reports', data);
export const updateSalesReport = (id, data) => axiosEvents.put(`/sales-reports/${id}`, data);
export const deleteSalesReport = (id) => axiosEvents.delete(`/sales-reports/${id}`);

// ── Usage Stats ───────────────────────────────────────────────────────────────
export const getUsageStats = () => axiosEvents.get('/usage-stats');
export const getUsageStatsById = (id) => axiosEvents.get(`/usage-stats/${id}`);
export const createUsageStats = (data) => axiosEvents.post('/usage-stats', data);
export const updateUsageStats = (id, data) => axiosEvents.put(`/usage-stats/${id}`, data);
export const deleteUsageStats = (id) => axiosEvents.delete(`/usage-stats/${id}`);
