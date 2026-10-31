import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zw_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      details: error.response?.data?.error?.details || null,
      code: error.response?.data?.error?.code,
    };
    return Promise.reject(customError);
  }
);

// Health check API
export interface HealthResponse {
  status: string;
  application: string;
  phase: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  system: {
    platform: string;
    nodeVersion: string;
    memory: {
      heapUsedMB: number;
      heapTotalMB: number;
    };
  };
  integrations: {
    firebaseAdmin: {
      initialized: boolean;
      projectIdConfigured: boolean;
      clientEmailConfigured: boolean;
      privateKeyConfigured: boolean;
    };
    database: string;
    storage: string;
    maps: string;
  };
  modules: Record<string, string>;
}

export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await axios.get<HealthResponse>('/api/health');
  return response.data;
};

// 1. Auth Service
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// 2. Donor Service
export const donorApi = {
  createListing: (data: any) => api.post('/donor/listings', data),
  getMyListings: () => api.get('/donor/listings'),
  updateListing: (id: string, data: any) => api.put(`/donor/listings/${id}`, data),
  deleteListing: (id: string) => api.delete(`/donor/listings/${id}`),
  getListingMatches: (id: string) => api.get(`/donor/listings/${id}/matches`),
  getListingAllocations: (id: string) => api.get(`/donor/listings/${id}/allocations`),
};

// 3. NGO Service
export const ngoApi = {
  registerOrg: (data: any) => api.post('/ngo/register-org', data),
  getProfile: () => api.get('/ngo/profile'),
  discoverFood: () => api.get('/ngo/discover'),
  claimAllocation: (data: { listingId: string; requestedServings: number }) => api.post('/ngo/claim', data),
  getMyAllocations: () => api.get('/ngo/allocations'),
  confirmIntake: (data: { deliveryId: string; discrepancyReported?: boolean; discrepancyNotes?: string }) =>
    api.post('/ngo/confirm-intake', data),
};

// 4. Volunteer Service
export const volunteerApi = {
  getAvailableTasks: () => api.get('/volunteer/tasks/available'),
  acceptTask: (taskId: string) => api.post(`/volunteer/tasks/${taskId}/accept`),
  getMyTasks: () => api.get('/volunteer/tasks/my'),
  verifyPickup: (data: { deliveryId: string; otp: string }) => api.post('/volunteer/verify/pickup', data),
  verifyDelivery: (data: { deliveryId: string; otp: string }) => api.post('/volunteer/verify/delivery', data),
  getStats: () => api.get('/volunteer/stats'),
};

// 5. Community Service
export const communityApi = {
  createListing: (data: any) => api.post('/community/listings', data),
  getListings: () => api.get('/community/listings'),
  createRequest: (data: any) => api.post('/community/requests', data),
  getRequests: () => api.get('/community/requests'),
  getMyRequests: () => api.get('/community/my-requests'),
  submitReport: (data: any) => api.post('/community/report', data),
};

// 6. Admin Service
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: { role?: string; status?: string }) => api.get('/admin/users', { params }),
  setUserStatus: (userId: string, data: { status: string; reason?: string }) =>
    api.patch(`/admin/users/${userId}/status`, data),
  getPendingNgos: () => api.get('/admin/ngos/pending'),
  verifyNgo: (ngoUid: string, data: { approved: boolean; rejectionReason?: string }) =>
    api.post(`/admin/ngos/${ngoUid}/verify`, data),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getReports: () => api.get('/admin/reports'),
  resolveReport: (reportId: string, data: { resolutionNotes?: string }) =>
    api.post(`/admin/reports/${reportId}/resolve`, data),
  getCreditRules: () => api.get('/admin/credit-rules'),
  updateCreditRules: (data: any) => api.put('/admin/credit-rules', data),
};
