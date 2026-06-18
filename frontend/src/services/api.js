import axios from 'axios';

// In production (Render), VITE_API_BASE_URL points to the deployed backend.
// In development, it falls back to '/api' which is proxied by vite.config.js to localhost:8080.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT Bearer token
api.interceptors.request.use(config => {
  const url = config.url || '';
  // Use admin token for admin endpoints
  if (url.startsWith('/admin')) {
    const adminToken = localStorage.getItem('perfume_admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    const token = localStorage.getItem('perfume_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, Promise.reject);

// Response interceptor — handle 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path.startsWith('/admin') && !path.includes('/admin/login')) {
        localStorage.removeItem('perfume_admin_token');
        window.location.href = '/admin/login';
      } else if (!path.includes('/login') && !path.includes('/register')) {
        // Soft fail — let component handle
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

export const adminAuthAPI = {
  login: (data) => api.post('/admin/auth/login', data),
  logout: () => api.post('/admin/auth/logout'),
  me: () => api.get('/admin/auth/me'),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  search: (q, page = 0, size = 12) => api.get('/products/search', { params: { q, page, size } }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getBestSellers: () => api.get('/products/best-sellers'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getLuxury: () => api.get('/products/luxury'),
  getTrending: () => api.get('/products/trending'),
  getRelated: (id, limit = 6) => api.get(`/products/${id}/related`, { params: { limit } }),
  getRecommendations: (gender, fragranceFamily, maxBudget) =>
    api.get('/products/recommendations', { params: { gender, fragranceFamily, maxBudget } }),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  applyCoupon: (couponCode) => api.post('/cart/apply-coupon', { couponCode }),
  removeCoupon: () => api.delete('/cart/coupon'),
};

// Wishlist APIs
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  moveToCart: (productId) => api.post(`/wishlist/${productId}/move-to-cart`),
  check: (productId) => api.get(`/wishlist/${productId}/check`),
};

// Order APIs
export const orderAPI = {
  place: (data) => api.post('/orders', data),
  getAll: (page = 0, size = 10) => api.get('/orders', { params: { page, size } }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// Review APIs
export const reviewAPI = {
  getByProduct: (productId, page = 0, size = 10) =>
    api.get(`/products/${productId}/reviews`, { params: { page, size } }),
  add: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};

// Banner APIs
export const bannerAPI = {
  getActive: () => api.get('/banners'),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (formData) => api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id, formData) => api.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  deleteProductImage: (imageId) => api.delete(`/admin/products/images/${imageId}`),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Orders
  getOrders: (page = 0, size = 20) => api.get('/admin/orders', { params: { page, size } }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),

  // Customers
  getCustomers: (page = 0, size = 20) => api.get('/admin/customers', { params: { page, size } }),
  blockCustomer: (id) => api.put(`/admin/customers/${id}/block`),
  unblockCustomer: (id) => api.put(`/admin/customers/${id}/unblock`),

  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // Banners
  getBanners: () => api.get('/admin/banners'),
  createBanner: (formData) => api.post('/admin/banners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateBanner: (id, formData) => api.put(`/admin/banners/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),

  // Reviews
  getReviews: (page = 0, size = 20) => api.get('/admin/reviews', { params: { page, size } }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  // Inventory
  getInventory: () => api.get('/admin/inventory'),
  updateInventory: (id, data) => api.put(`/admin/inventory/${id}`, data),
};

export default api;
