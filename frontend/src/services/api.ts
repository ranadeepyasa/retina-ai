import axios from 'axios';
import {
  User, Patient, Screening, QualityCheckResponse,
  DashboardStats, AdminAnalytics, ModelPerformanceMetrics
} from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export const resolveImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  if (API_BASE_URL.startsWith('http')) {
    const origin = API_BASE_URL.replace(/\/api$/, '');
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('retina_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear and optionally redirect if on authenticated page
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/app') || currentPath.startsWith('/admin')) {
        localStorage.removeItem('retina_token');
        localStorage.removeItem('retina_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  async register(data: { name: string; email: string; password: string; role?: string; facility?: string }): Promise<{ access_token: string; user: User }> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const patientService = {
  async list(search?: string): Promise<Patient[]> {
    const res = await api.get('/patients', { params: { search } });
    return res.data;
  },
  async get(id: number): Promise<Patient & { timeline: any[] }> {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },
  async create(data: { patient_code: string; age: number; sex: string; diabetes_duration?: string; notes?: string }): Promise<Patient> {
    const res = await api.post('/patients', data);
    return res.data;
  }
};

export const screeningService = {
  async checkQuality(file: File): Promise<QualityCheckResponse> {
    const formData = new FormData();
    formData.append('fundus_image', file);
    const res = await api.post('/screenings/quality-check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  async analyze(formData: FormData): Promise<any> {
    const res = await api.post('/screenings/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  async list(params?: { severity?: number; status?: string; search?: string }): Promise<Screening[]> {
    const res = await api.get('/screenings', { params });
    return res.data;
  },
  async get(id: number): Promise<Screening> {
    const res = await api.get(`/screenings/${id}`);
    return res.data;
  },
  async update(id: number, data: { status?: string; referral_urgency?: string; reviewer_notes?: string }) {
    const res = await api.patch(`/screenings/${id}`, data);
    return res.data;
  },
  getReportUrl(id: number): string {
    return `${API_BASE_URL}/screenings/${id}/report`;
  }
};

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await api.get('/dashboard/stats');
    return res.data;
  }
};

export const adminService = {
  async getUsers(): Promise<User[]> {
    const res = await api.get('/admin/users');
    return res.data;
  },
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data;
  },
  async getAnalytics(): Promise<AdminAnalytics> {
    const res = await api.get('/admin/analytics');
    return res.data;
  },
  async getModelPerformance(): Promise<ModelPerformanceMetrics> {
    const res = await api.get('/admin/model-performance');
    return res.data;
  },
  async clearDemoData(): Promise<{ message: string; deleted_count: number }> {
    const res = await api.post('/admin/clear-demo-data');
    return res.data;
  }
};

export default api;
