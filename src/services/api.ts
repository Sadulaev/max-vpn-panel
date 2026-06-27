import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor для добавления JWT токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обработки 401 ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Удаляем токен и перенаправляем на логин
      localStorage.removeItem('access_token');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface Subscription {
  // Fields stored in our DB
  id: string;
  username: string | null;
  maxId: string | null;
  source: string;
  /** Total purchased days */
  days: number;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  /** User-defined subscription name stored in DB */
  name: string | null;
  // Enriched from Remnawave (null if not yet synced)
  remnawaveStatus: string | null;
  /** Unix timestamp (seconds) of subscription expiry. null = unlimited. */
  remnawaveExpire: number | null;
  subscriptionUrl: string | null;
  note: string | null;
  usedTraffic: number | null;
}

export interface CreateSubscriptionDto {
  maxId?: string;
  days: number;
  source?: 'admin' | 'bot';
  note?: string;
}

export interface SendMessageDto {
  message: string;
  maxId?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data?: { sent: number; failed: number; errors: string[] }; // Для одиночного сообщения
  message?: string; // Для массовой рассылки в фоне
}

export interface SendTelegramMessageDto {
  maxId: string;
  message: string;
}

export interface PaymentSession {
  id: string;
  invId: string;
  maxId: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  period: number;
  amount: number;
  createdAt: string;
  expiresAt: string | null;
}

export interface GetPaidSessionsParams {
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface GetRandomPaidSessionsParams extends GetPaidSessionsParams {
  count: number;
}

export interface PaginatedPaymentSessions {
  data: PaymentSession[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
}

// API methods
export const authAPI = {
  login: (data: LoginDto) => api.post<AuthResponse>('/auth/login', data),
};

export const subscriptionsAPI = {
  getAll: (params?: { search?: string; source?: string }) => 
    api.get<Subscription[]>('/subscriptions', { params }),
  create: (data: CreateSubscriptionDto) => api.post('/subscriptions', data),
  processExpired: () => api.post('/subscriptions/process-expired'),
  getUrl: (id: string) => api.get<{ success: boolean; data: { subscriptionUrl: string } }>(`/subscriptions/${id}/url`),
  delete: (id: string) => api.post(`/subscriptions/${id}/delete`),
  sendMessage: (data: SendMessageDto, photo?: File) => {
    const formData = new FormData();
    formData.append('message', data.message);
    if (data.maxId) formData.append('maxId', data.maxId);
    if (photo) formData.append('photo', photo);
    return api.post<SendMessageResponse>('/subscriptions/send-message', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportCsv: (params?: { search?: string; source?: string }) =>
    api.get('/subscriptions/export-csv', { params, responseType: 'blob' }),
  exportUniqueTelegramIds: () =>
    api.get('/subscriptions/export-unique-max-ids', { responseType: 'blob' }),
  getUnsynced: () => api.get<Subscription[]>('/subscriptions/unsynced'),
  sync: () => api.post<{ success: boolean; data: { synced: number; failed: number; errors: string[] } }>('/subscriptions/sync'),
};

export const paymentsAPI = {
  getPaidSessions: (params?: GetPaidSessionsParams) => 
    api.get<PaginatedPaymentSessions>('/payment/paid-sessions', { params }),
  getRandomPaidSessions: (params: GetRandomPaidSessionsParams) => 
    api.get<PaymentSession[]>('/payment/paid-sessions/random', { params }),
  sendTelegramMessage: (data: SendTelegramMessageDto) => 
    api.post<{ success: boolean; message: string }>('/payment/send-message', data),
  exportCsv: (params?: { dateFrom?: string; dateTo?: string }) =>
    api.get('/payment/export-csv', { params, responseType: 'blob' }),
};

// Plans API
export interface Plan {
  id: number;
  planType: 'standard' | 'anti-throttling';
  label: string;
  months: number;
  price: number;
  dataLimitGB: number;
  description: string | null;
  isActive: boolean;
  isMain: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanDto {
  planType: 'standard' | 'anti-throttling';
  label: string;
  months: number;
  price: number;
  dataLimitGB?: number;
  description?: string;
  isActive?: boolean;
  isMain?: boolean;
  sortOrder?: number;
}

export type UpdatePlanDto = Partial<CreatePlanDto>;

export const plansAPI = {
  getAll: (planType?: 'standard' | 'anti-throttling') =>
    api.get<Plan[]>('/plans', { params: planType ? { planType } : undefined }),
  create: (data: CreatePlanDto) => api.post<Plan>('/plans', data),
  update: (id: number, data: UpdatePlanDto) => api.patch<Plan>(`/plans/${id}`, data),
  remove: (id: number) => api.delete(`/plans/${id}`),
};

// Device Slot Plans API
export interface DeviceSlotPlan {
  id: number;
  label: string;
  slotsCount: number;
  price: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceSlotPlanDto {
  label: string;
  slotsCount: number;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateDeviceSlotPlanDto = Partial<CreateDeviceSlotPlanDto>;

export const deviceSlotPlansAPI = {
  getAll: () => api.get<DeviceSlotPlan[]>('/device-slot-plans'),
  create: (data: CreateDeviceSlotPlanDto) => api.post<DeviceSlotPlan>('/device-slot-plans', data),
  update: (id: number, data: UpdateDeviceSlotPlanDto) => api.patch<DeviceSlotPlan>(`/device-slot-plans/${id}`, data),
  remove: (id: number) => api.delete(`/device-slot-plans/${id}`),
};

// Bot Pages API
export interface BotButton {
  text: string;
  callbackData?: string;
  url?: string;
}

export interface BotPage {
  id: number;
  key: string;
  title: string;
  description: string | null;
  text: string;
  mediaType: 'none' | 'photo' | 'video';
  mediaPath: string | null;
  mediaTelegramFileId: string | null;
  buttons: BotButton[][];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBotPageDto {
  key: string;
  title: string;
  text?: string;
  mediaType?: 'none' | 'photo' | 'video';
  buttons?: BotButton[][];
  sortOrder?: number;
  description?: string;
}

export type UpdateBotPageDto = Partial<CreateBotPageDto>;

export const botPagesAPI = {
  getAll: () => api.get<BotPage[]>('/bot-pages'),
  getOne: (id: number) => api.get<BotPage>(`/bot-pages/${id}`),
  create: (data: CreateBotPageDto) => api.post<BotPage>('/bot-pages', data),
  update: (id: number, data: UpdateBotPageDto) => api.put<BotPage>(`/bot-pages/${id}`, data),
  uploadMedia: (id: number, file: File, mediaType: 'photo' | 'video') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('mediaType', mediaType);
    return api.post<BotPage>(`/bot-pages/${id}/media`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteMedia: (id: number) => api.delete<BotPage>(`/bot-pages/${id}/media`),
  remove: (id: number) => api.delete(`/bot-pages/${id}`),
  reorder: (ids: number[]) => api.patch('/bot-pages/reorder', { ids }),
};

export default api;
