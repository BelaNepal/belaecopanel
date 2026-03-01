import axios, { AxiosInstance } from 'axios';
// Detect if we are running server-side or client-side
const isServer = typeof window === 'undefined';

// Base URL
// Prefer separate server-side URL if needed, falling back to public URL, then default
const BASE_URL = isServer
  ? (process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api');

// Use 127.0.0.1 instead of localhost to avoid Node.js IPv4/IPv6 resolution issues during SSR
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
client.interceptors.request.use((config) => {
  if (!isServer) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') && 
          window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => client.post('/auth/register', data),
  login: (data: any) => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  getMe: () => client.get(`/auth/me?t=${new Date().getTime()}`),
};

export const productAPI = {
  getAll: (params?: any) => client.get('/products', { params }),
  getById: (id: string) => client.get(`/products/${id}`),
  create: (data: any) => client.post('/products', data),
  update: (id: string, data: any) => client.patch(`/products/${id}`, data),
  delete: (id: string) => client.delete(`/products/${id}`),
  getTrash: () => client.get('/products/trash/all'),
  restore: (id: string) => client.patch(`/products/${id}/restore`),
  permanentDelete: (id: string) => client.delete(`/products/${id}/permanent`),
};

export const dealerAPI = {
  apply: (data: any) => client.post('/dealers/apply', data),
  getAll: (params?: any) => client.get('/dealers', { params }),
  getById: (id: string) => client.get(`/dealers/${id}`),
  approve: (id: string) => client.patch(`/dealers/${id}/approve`),
  reject: (id: string) => client.patch(`/dealers/${id}/reject`),
  getDashboard: () => client.get('/dealers/dashboard'),
};

export const contractorAPI = {
  apply: (data: any) => client.post('/contractors/apply', data),
  getAll: (params?: any) => client.get('/contractors', { params }),
  getById: (id: string) => client.get(`/contractors/${id}`),
  approve: (id: string) => client.patch(`/contractors/${id}/approve`),
  reject: (id: string) => client.patch(`/contractors/${id}/reject`),
  getDashboard: () => client.get('/contractors/dashboard'),
};

export const orderAPI = {
  create: (data: any) => client.post('/orders', data),
  getMyOrders: (params?: any) => client.get('/orders/my-orders', { params }),
  getAll: (params?: any) => client.get('/orders', { params }),
  getById: (id: string) => client.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => client.patch(`/orders/${id}/status`, { status }),
  delete: (id: string) => client.delete(`/orders/${id}`),
  getTrash: (params?: any) => client.get('/orders/trash/all', { params }),
  restore: (id: string) => client.patch(`/orders/${id}/restore`),
  permanentDelete: (id: string) => client.delete(`/orders/${id}/permanent`),
};

export const projectAPI = {
  getAll: (params?: any) => client.get('/projects', { params }),
  getById: (id: string) => client.get(`/projects/${id}`),
  create: (data: any) => {
    if (data instanceof FormData) {
      return client.post('/projects', data, {
        headers: {
          'Content-Type': undefined,
        } as any,
      });
    }
    return client.post('/projects', data);
  },
  assign: (id: string) => client.patch(`/projects/${id}/assign`),
  uploadDocument: (id: string, data: FormData) => client.post(`/projects/${id}/documents`, data, {
    headers: {
      'Content-Type': undefined,
    } as any,
  }),
  approveDocument: (id: string, docId: string) => client.patch(`/projects/${id}/documents/${docId}/approve`),
  sendMessage: (id: string, data: any) => client.post(`/projects/${id}/messages`, data),
  updateStatus: (id: string, status: string) => client.patch(`/projects/${id}/status`, { status }),
  applyForProject: (id: string) => client.post(`/projects/${id}/apply`),
  approveApplication: (id: string, applicationId: string) => client.post(`/projects/${id}/approve-application`, { applicationId }),
  delete: (id: string) => client.delete(`/projects/${id}`),
  getTrash: () => client.get('/projects/trash'),
  restore: (id: string) => client.patch(`/projects/${id}/restore`),
  permanentDelete: (id: string) => client.delete(`/projects/${id}/permanent`),
};

export const notificationAPI = {
  getAll: (params?: any) => client.get('/notifications', { params }),
  markAsRead: (id: string) => client.patch(`/notifications/${id}/read`),
  markAllAsRead: () => client.patch('/notifications/read-all'),
  delete: (id: string) => client.delete(`/notifications/${id}`),
  deleteAll: () => client.delete('/notifications'),
};

export const quotationAPI = {
  create: (data: any) => client.post('/quotations', data),
  createGuest: (data: any) => client.post('/quotations/guest', data),
  getAll: (params?: any) => client.get('/quotations', { params }),
  getById: (id: string) => client.get(`/quotations/${id}`),
  delete: (id: string) => client.delete(`/quotations/${id}`),
  getTrash: (params?: any) => client.get('/quotations/trash/all', { params }),
  restore: (id: string) => client.patch(`/quotations/${id}/restore`),
  permanentDelete: (id: string) => client.delete(`/quotations/${id}/permanent`),
};

export const articleAPI = {
  getAll: (params?: any) => client.get('/articles', { params }),
  getBySlug: (slug: string) => client.get(`/articles/${slug}`),
  create: (data: any) => client.post('/articles', data),
  update: (id: string, data: any) => client.patch(`/articles/${id}`, data),
  delete: (id: string) => client.delete(`/articles/${id}`),
  getTrash: () => client.get('/articles/trash/all'),
  restore: (id: string) => client.patch(`/articles/${id}/restore`),
  permanentDelete: (id: string) => client.delete(`/articles/${id}/permanent`),
  // Interactions
  like: (id: string) => client.post(`/articles/${id}/like`),
  unlike: (id: string) => client.delete(`/articles/${id}/like`),
  comment: (id: string, content: string) => client.post(`/articles/${id}/comment`, { content }),
  deleteComment: (id: string, commentId: string) => client.delete(`/articles/${id}/comment/${commentId}`),
  share: (id: string) => client.post(`/articles/${id}/share`),
};

export const popupAPI = {
  getAll: (params?: any) => client.get('/popups', { params }),
  getActive: (params?: any) => client.get('/popups/active', { params }),
  create: (data: any) => client.post('/popups', data),
  update: (id: string, data: any) => client.patch(`/popups/${id}`, data),
  delete: (id: string) => client.delete(`/popups/${id}`),
};

export const newsletterAPI = {
  subscribe: (email: string) => client.post('/newsletter/subscribe', { email }),
  getAll: (params?: any) => client.get('/newsletter', { params }),
  delete: (id: string) => client.delete(`/newsletter/${id}`),
};

export const mailAPI = {
  getTemplates: (params?: any) => client.get('/mail/templates', { params }),
  createTemplate: (data: any) => client.post('/mail/templates', data),
  updateTemplate: (id: string, data: any) => client.patch(`/mail/templates/${id}`, data),
  deleteTemplate: (id: string) => client.delete(`/mail/templates/${id}`),
  send: (data: any) => client.post('/mail/send', data),
  getLogs: (params?: any) => client.get('/mail/logs', { params }),
  getUsers: (params?: any) => client.get('/mail/users', { params }),
};

export const testimonialAPI = {
  getAll: (params?: any) => client.get('/testimonials', { params }),
  create: (data: any) => client.post('/testimonials', data),
  update: (id: string, data: any) => client.patch(`/testimonials/${id}`, data),
  delete: (id: string) => client.delete(`/testimonials/${id}`),
};

export const faqAPI = {
  getAll: (params?: any) => client.get('/faqs', { params }),
  create: (data: any) => client.post('/faqs', data),
  update: (id: string, data: any) => client.patch(`/faqs/${id}`, data),
  delete: (id: string) => client.delete(`/faqs/${id}`),
};

export const leadAPI = {
  create: (data: any) => client.post('/leads', data),
  getAll: (params?: any) => client.get('/leads', { params }),
  getById: (id: string) => client.get(`/leads/${id}`),
  updateStatus: (id: string, status: string) => client.patch(`/leads/${id}/status`, { status }),
};

export const campaignAPI = {
  getAll: (params?: any) => client.get('/campaigns', { params }),
  create: (data: any) => client.post('/campaigns', data),
  update: (id: string, data: any) => client.patch(`/campaigns/${id}`, data),
  delete: (id: string) => client.delete(`/campaigns/${id}`),
};

export const logsAPI = {
  getAll: () => client.get('/logs'),
  create: (data: any) => client.post('/logs', data),
  delete: (id: string) => client.delete(`/logs/${id}`),
  clearAll: () => client.delete('/logs'),
};

export const systemAPI = {
  getHealth: () => client.get('/system/health'),
  getStats: () => client.get('/system/stats'),
  createBackup: (customPath?: string) => client.post('/system/backup', { customPath }),
  getBackups: () => client.get('/system/backups'),
  downloadBackup: (fileName: string) => client.get(`/system/backups/${fileName}/download`, { responseType: 'blob' }),
  restoreBackup: (fileName: string) => client.post('/system/restore', { fileName }),
  cleanup: (days: number) => client.post('/system/cleanup', { days }),
  runQuery: (query: string) => client.post('/system/query', { query }),
  getMigrations: () => client.get('/system/migrations'),
  getTables: () => client.get('/system/tables'),
  getSystemInfo: () => client.get('/system/info'),
};

export const auditAPI = {
  getLoginHistory: (params?: any) => client.get('/audit/logins', { params }),
};

export const dashboardAPI = {
  getEngineerStats: () => client.get('/dashboard/engineer/stats'),
};

export default client;
