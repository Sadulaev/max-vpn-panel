import axios from 'axios';

const ACCESS_TOKEN_KEY = 'hyper_vpn_access_token';

export const getStoredAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setStoredAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

const miniappClient = axios.create({
  baseURL: '/api',
});

miniappClient.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken();
  if (accessToken) {
    config.headers['X-Access-Token'] = accessToken;
  }
  return config;
});

export interface SubscriptionItem {
  id: string;
  marzbanUsername: string | null;
  isAntiThrottling: boolean;
  status: string | null;
  expire: number | null;
  subscriptionUrl: string | null;
  usedTraffic: number | null;
  dataLimit: number;
  days: number;
  startDate: string | null;
  createdAt: string;
  canDelete: boolean;
  note: string | null;
}

export interface NodeData {
  id: number;
  name: string;
  address: string;
  status: 'connected' | 'connecting' | 'error' | 'disabled';
  message: string | null;
  xrayVersion: string | null;
}

export interface NodesResponse {
  nodes: NodeData[];
  onlineUsers: number | null;
  totalUsers: number | null;
  activeUsers: number | null;
}

export interface SubscriptionPlan {
  months: number;
  price: number;
  label: string;
  dataLimitGB?: number;
  planType?: 'standard' | 'anti-throttling';
  description?: string;
}

export interface PaymentLinkResponse {
  paymentUrl: string;
  invId: string;
}

export const miniappAPI = {
  getSubscriptions: (): Promise<SubscriptionItem[]> =>
    miniappClient.get<SubscriptionItem[]>('/miniapp/subscriptions').then((r) => r.data),

  deleteSubscription: (id: string): Promise<void> =>
    miniappClient.delete(`/miniapp/subscriptions/${id}`).then(() => undefined),

  createPayment: (period: number, price: number, subscriptionId?: string, subscriptionName?: string): Promise<PaymentLinkResponse> =>
    miniappClient
      .post<PaymentLinkResponse>('/miniapp/pay', { period, price, subscriptionId, subscriptionName })
      .then((r) => r.data),

  getPlans: (): Promise<SubscriptionPlan[]> =>
    miniappClient.get<SubscriptionPlan[]>('/miniapp/plans').then((r) => r.data),

  getNodes: (): Promise<NodesResponse> =>
    miniappClient.get<NodesResponse>('/miniapp/nodes').then((r) => r.data),

  getAccessToken: (): Promise<{ accessToken: string }> =>
    miniappClient.get<{ accessToken: string }>('/miniapp/access-token').then((r) => r.data),

  getSettings: (): Promise<{ standardEnabled: boolean; antiThrottlingEnabled: boolean }> =>
    miniappClient.get<{ standardEnabled: boolean; antiThrottlingEnabled: boolean }>('/miniapp/settings').then((r) => r.data),

  verifyToken: (t: string): Promise<{ valid: boolean }> =>
    miniappClient.get<{ valid: boolean }>(`/miniapp/verify-token?t=${encodeURIComponent(t)}`).then((r) => r.data),
};
