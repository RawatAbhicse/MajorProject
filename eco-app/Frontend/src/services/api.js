import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  signup: (username, email, password, fullName, phone = '', location = '', bio = '') =>
    api.post('/auth/register', { username, email, password, fullName, phone, location, bio }),
  logout: () => {
    localStorage.removeItem('token'); // Client-side logout
    return Promise.resolve({ success: true }); // Mock response
  },
};

// User endpoints (to be implemented backend if needed)
export const userApi = {
  me: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
};

// Trek endpoints
export const trekApi = {
  getAll: () => api.get('/treks'),
  getById: (id) => api.get(`/treks/${id}`),
  getReviews: (id) => api.get(`/treks/${id}/reviews`),
  addReview: (id, data) => api.post(`/treks/${id}/reviews`, data),
  create: (data) => api.post('/treks', data),
  update: (id, data) => api.put(`/treks/${id}`, data),
  delete: (id) => api.delete(`/treks/${id}`),
};

// Guide endpoints
export const guideApi = {
  getAll: () => api.get('/guides'),
  getById: (id) => api.get(`/guides/${id}`),
  create: (data) => api.post('/guides', data),
  update: (id, data) => api.put(`/guides/${id}`, data),
  delete: (id) => api.delete(`/guides/${id}`),
  restore: (id) => api.post(`/guides/${id}/restore`, {}),
};

// Chat endpoints
export const chatApi = {
  getAll: () => api.get('/chats'),
  getById: (id) => api.get(`/chats/${id}`),
  getOrCreate: (guideId, trekId = null) => api.post(`/chats/get-or-create/${guideId}`, { trekId }),
  sendMessage: (chatId, content) => api.post(`/chats/${chatId}/message`, { content }),
  sendAudio: (chatId, formData) => api.post(`/chats/${chatId}/audio`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  markAsRead: (chatId) => api.put(`/chats/${chatId}/read`, {}),
  delete: (chatId) => api.delete(`/chats/${chatId}`),
};

// Booking endpoints
export const bookingApi = {
  createOrder:   (data) => api.post('/bookings/create-order', data),
  verifyPayment: (data) => api.post('/bookings/verify-payment', data),
  getAll:        ()     => api.get('/bookings'),
  getById:       (id)   => api.get(`/bookings/${id}`),
};

// Weather helper
export const getWeather = async (lat, lon) => {
  try {
    const res = await api.get('/weather', { params: { lat, lon } });
    return res.data;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};
 
export default api;
