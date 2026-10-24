const API_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Choose token based on context or explicit option
  const ownerToken = localStorage.getItem('sbi_owner_token');
  const customerToken = localStorage.getItem('sbi_customer_token');

  if (options.asOwner && ownerToken) {
    headers['Authorization'] = `Bearer ${ownerToken}`;
  } else if (customerToken && !options.noAuth) {
    headers['Authorization'] = `Bearer ${customerToken}`;
  } else if (ownerToken && options.asOwnerFallback) {
    headers['Authorization'] = `Bearer ${ownerToken}`;
  }

  const config = {
    ...options,
    headers
  };

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Public
  getProducts: (params = '') => request(`/api/products${params}`),
  getProduct: (id) => request(`/api/products/${id}`),
  getSettings: () => request('/api/settings'),
  previewOrder: (payload) => request('/api/orders/preview', { method: 'POST', body: JSON.stringify(payload) }),

  // Customer Auth
  customerRegister: (data) => request('/api/auth/customer/register', { method: 'POST', body: JSON.stringify(data) }),
  customerLogin: (data) => request('/api/auth/customer/login', { method: 'POST', body: JSON.stringify(data) }),
  getCustomerMe: () => request('/api/auth/customer/me'),
  saveCustomerAddress: (data) => request('/api/auth/customer/address', { method: 'POST', body: JSON.stringify(data) }),

  // Customer Orders & Custom Cakes
  createOrder: (data) => request('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => request('/api/orders/my-orders'),
  cancelOrder: (id, reason) => request(`/api/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  submitCustomCake: (formData) => request('/api/custom-cakes', { method: 'POST', body: formData }),
  getMyCustomRequests: () => request('/api/custom-cakes/my-requests'),
  acceptCustomQuote: (id, data) => request(`/api/custom-cakes/${id}/accept-quote`, { method: 'POST', body: JSON.stringify(data) }),
  getCustomerNotifications: () => request('/api/notifications/customer'),

  // Owner Auth & Management
  ownerLogin: (data) => request('/api/auth/owner/login', { method: 'POST', body: JSON.stringify(data) }),
  ownerChangePassword: (data) => request('/api/auth/owner/change-password', { method: 'POST', asOwner: true, body: JSON.stringify(data) }),
  getOwnerMe: () => request('/api/auth/owner/me', { asOwner: true }),

  // Owner Orders & Dashboard
  getDashboardStats: () => request('/api/orders/owner/stats', { asOwner: true }),
  getOwnerOrders: (query = '') => request(`/api/orders/owner/all${query}`, { asOwner: true }),
  ownerAcceptOrder: (id, note) => request(`/api/orders/owner/${id}/accept`, { method: 'POST', asOwner: true, body: JSON.stringify({ note }) }),
  ownerRejectOrder: (id, reason) => request(`/api/orders/owner/${id}/reject`, { method: 'POST', asOwner: true, body: JSON.stringify({ reason }) }),
  ownerUpdateOrderStatus: (id, status, note) => request(`/api/orders/owner/${id}/status`, { method: 'POST', asOwner: true, body: JSON.stringify({ status, note }) }),

  // Owner Custom Cakes
  getOwnerCustomRequests: (query = '') => request(`/api/custom-cakes/owner/all${query}`, { asOwner: true }),
  ownerReviewCustomCake: (id, data) => request(`/api/custom-cakes/owner/${id}/review`, { method: 'POST', asOwner: true, body: JSON.stringify(data) }),

  // Owner Products
  createProduct: (data) => request('/api/products', { method: 'POST', asOwner: true, body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/api/products/${id}`, { method: 'PUT', asOwner: true, body: JSON.stringify(data) }),
  uploadProductImage: (id, formData) => request(`/api/products/${id}/upload`, { method: 'POST', asOwner: true, body: formData }),

  // Owner Customer Database
  getCustomerDatabase: (query = '') => request(`/api/owner/customers${query}`, { asOwner: true }),
  getCustomerDetails: (id) => request(`/api/owner/customers/${id}`, { asOwner: true }),
  getExportCustomerCsvUrl: () => {
    const token = localStorage.getItem('sbi_owner_token');
    return `/api/owner/customers/export/csv?token=${token}`;
  },

  // Owner Notifications & Settings
  getOwnerNotifications: () => request('/api/notifications/owner', { asOwner: true }),
  markNotificationRead: (id) => request(`/api/notifications/owner/${id}/read`, { method: 'PUT', asOwner: true }),
  updateSettings: (data) => request('/api/settings', { method: 'PUT', asOwner: true, body: JSON.stringify(data) })
};
