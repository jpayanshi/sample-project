import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error ?? err.message;
    return Promise.reject(new Error(message));
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/api/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data).then((r) => r.data),
  logout: () => api.post('/api/auth/logout').then((r) => r.data),
  me: () => api.get('/api/auth/me').then((r) => r.data),
  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put('/api/auth/profile', data).then((r) => r.data),
};

// Addresses
export const addressApi = {
  list: () => api.get('/api/addresses').then((r) => r.data),
  create: (data: { line1: string; line2?: string; city: string; postcode: string; country: string }) =>
    api.post('/api/addresses', data).then((r) => r.data),
  delete: (id: string) => api.delete(`/api/addresses/${id}`).then((r) => r.data),
};

// Products
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/api/products', { params }).then((r) => r.data),
  get: (slug: string) =>
    api.get(`/api/products/${slug}`).then((r) => r.data),
  create: (data: unknown) => api.post('/api/products', data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    api.put(`/api/products/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/api/products/${id}`).then((r) => r.data),
};

// Cart
export const cartApi = {
  get: () => api.get('/api/cart').then((r) => r.data),
  addItem: (variantId: string, quantity: number) =>
    api.post('/api/cart/items', { variantId, quantity }).then((r) => r.data),
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/api/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId: string) =>
    api.delete(`/api/cart/items/${itemId}`).then((r) => r.data),
};

// Orders
export const ordersApi = {
  create: (addressId: string) =>
    api.post('/api/orders', { addressId }).then((r) => r.data),
  list: () => api.get('/api/orders').then((r) => r.data),
  get: (id: string) => api.get(`/api/orders/${id}`).then((r) => r.data),
};

// Admin
export const adminApi = {
  listOrders: () => api.get('/api/admin/orders').then((r) => r.data),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/api/admin/orders/${id}`, { status }).then((r) => r.data),
};
