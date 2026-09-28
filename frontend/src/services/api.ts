import axios from 'axios';
import type { Meeting, User } from '../types/meeting';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('meetscribe_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('meetscribe_token');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/' &&
        !window.location.pathname.startsWith('/auth/callback')
      ) {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// Fallback Google OAuth URL in case of network proxy latency
const FALLBACK_CLIENT_ID = '1035685309303-p0pj409cvi77oo7ohks852en1dol4js8.apps.googleusercontent.com';
const FALLBACK_CALLBACK = 'http://localhost:5000/api/v1/auth/google/callback';
const FALLBACK_AUTH_URL =
  `https://accounts.google.com/o/oauth2/v2/auth?client_id=${FALLBACK_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    FALLBACK_CALLBACK
  )}&response_type=code&scope=openid%20email%20profile%20https://www.googleapis.com/auth/calendar.readonly&access_type=offline&prompt=consent`;

// Auth Endpoints
export const authService = {
  getGoogleAuthUrl: async (): Promise<string> => {
    try {
      const res = await api.get<{ url: string }>('/auth/google/url');
      if (res.data?.url) {
        return res.data.url;
      }
      return FALLBACK_AUTH_URL;
    } catch (err) {
      console.warn('API call to /auth/google/url failed, using direct OAuth endpoint:', err);
      // Fallback directly so user is never blocked from signing in
      return FALLBACK_AUTH_URL;
    }
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};

// Calendar Endpoints
export interface SyncResponse {
  status: string;
  message: string;
  totalProcessed: number;
  syncedCount: number;
  createdCount: number;
  updatedCount: number;
  meetings: Array<{
    meetingId: string;
    title: string;
    scheduledAt: string;
    duration: number;
    meetLink: string;
    status: string;
    participants: string[];
  }>;
}

export const calendarService = {
  syncMeetings: async (daysBack = 7, daysForward = 30): Promise<SyncResponse> => {
    const res = await api.post<SyncResponse>(
      `/calendar/sync?days_back=${daysBack}&days_forward=${daysForward}`
    );
    return res.data;
  },
};

// Meetings Endpoints
export interface MeetingListResult {
  total: number;
  skip: number;
  limit: number;
  items: Meeting[];
}

export const meetingService = {
  list: async (params?: {
    status?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<MeetingListResult> => {
    const res = await api.get<MeetingListResult>('/meetings/', { params });
    return res.data;
  },
  get: async (id: string): Promise<Meeting> => {
    const res = await api.get<Meeting>(`/meetings/${id}`);
    return res.data;
  },
  create: async (data: Partial<Meeting>): Promise<Meeting> => {
    const res = await api.post<Meeting>('/meetings/', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Meeting>): Promise<Meeting> => {
    const res = await api.patch<Meeting>(`/meetings/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/meetings/${id}`);
  },
};
