import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Set default Content-Type for JSON requests
api.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor to remove Content-Type for FormData
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Error handler - wraps error in proper structure
const wrapError = (error) => {
  console.error('API Error Details:', error);
  if (error.response && error.response.data) {
    return {
      success: false,
      message: error.response.data.message || error.response.statusText || 'API Error',
      error: error.response.data,
    };
  }
  if (error.message) {
    return {
      success: false,
      message: error.message,
    };
  }
  return {
    success: false,
    message: 'Network Error',
  };
};

// Users
export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

// Reports
export const getReports = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await api.get('/reports', { params });
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const getReportById = async (id) => {
  try {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const createReport = async (reportData) => {
  try {
    const response = await api.post('/reports', reportData);
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const updateReportStatus = async (id, statusData) => {
  try {
    const response = await api.put(`/reports/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const deleteReport = async (id, userId) => {
  try {
    const response = await api.delete(`/reports/${id}`, {
      data: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

// Schedules
export const getSchedules = async () => {
  try {
    const response = await api.get('/schedules');
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const getScheduleById = async (id) => {
  try {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const createSchedule = async (scheduleData) => {
  try {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const updateSchedule = async (id, scheduleData) => {
  try {
    const response = await api.put(`/schedules/${id}`, scheduleData);
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const updateScheduleStatus = async (id, statusData) => {
  try {
    const response = await api.put(`/schedules/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const confirmSchedule = async (id, confirmedBy) => {
  try {
    const response = await api.put(`/schedules/${id}/confirm`, { confirmed_by: confirmedBy });
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

export const deleteSchedule = async (id, userId) => {
  try {
    const response = await api.delete(`/schedules/${id}`, {
      data: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    return wrapError(error);
  }
};

// Upload
export const uploadPhoto = async (formData) => {
  try {
    // Don't set Content-Type header manually - axios will handle it with correct boundary
    const response = await api.post('/upload/photo', formData);
    console.log('uploadPhoto response:', response.data);
    return response.data;
  } catch (error) {
    console.error('uploadPhoto error:', error);
    return wrapError(error);
  }
};

export default api;
