import axios from 'axios';

const API = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (d) => API.post('/auth/login', d),
  register: (d) => API.post('/auth/register', d),
  registerTenant: (d) => API.post('/auth/register-tenant', d),
  getMe: () => API.get('/auth/me'),
  updateProfile: (d) => API.put('/auth/profile', d),
};

export const tenantAPI = {
  getAll: (p) => API.get('/tenants', { params: p }),
  getOne: (slug) => API.get(`/tenants/${slug}`),
  getCategories: () => API.get('/tenants/categories'),
  updateSettings: (slug, d) => API.put(`/tenants/${slug}/settings`, d),
};

export const productAPI = {
  getAll: (slug, p) => API.get(`/stores/${slug}/products`, { params: p }),
  getOne: (slug, id) => API.get(`/stores/${slug}/products/${id}`),
  create: (slug, d) => API.post(`/stores/${slug}/products`, d),
  update: (slug, id, d) => API.put(`/stores/${slug}/products/${id}`, d),
  delete: (slug, id) => API.delete(`/stores/${slug}/products/${id}`),
  adminGetAll: (slug, p) => API.get(`/stores/${slug}/products/admin/all`, { params: p }),
};

export const categoryAPI = {
  getAll: (slug) => API.get(`/stores/${slug}/categories`),
  create: (slug, d) => API.post(`/stores/${slug}/categories`, d),
  update: (slug, id, d) => API.put(`/stores/${slug}/categories/${id}`, d),
  delete: (slug, id) => API.delete(`/stores/${slug}/categories/${id}`),
};

export const orderAPI = {
  place: (slug, d) => API.post(`/stores/${slug}/orders`, d),
  getMyOrders: (slug, p) => API.get(`/stores/${slug}/orders/my`, { params: p }),
  getOne: (slug, id) => API.get(`/stores/${slug}/orders/${id}`),
  getAll: (slug, p) => API.get(`/stores/${slug}/orders`, { params: p }),
  updateStatus: (slug, id, d) => API.put(`/stores/${slug}/orders/${id}/status`, d),
  getAnalytics: (slug) => API.get(`/stores/${slug}/orders/analytics/summary`),
};

export const reviewAPI = {
  getByProduct: (slug, pid) => API.get(`/stores/${slug}/reviews/${pid}`),
  create: (slug, d) => API.post(`/stores/${slug}/reviews`, d),
};

export const searchAPI = { global: (p) => API.get('/search', { params: p }) };

export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getTenants: (p) => API.get('/admin/tenants', { params: p }),
  updateTenantStatus: (id, d) => API.put(`/admin/tenants/${id}/status`, d),
  deleteTenant: (id) => API.delete(`/admin/tenants/${id}`),
  getUsers: (p) => API.get('/admin/users', { params: p }),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
};

export default API;
