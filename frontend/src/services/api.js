import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with defaults
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 with TOKEN_EXPIRED and we haven't retried yet
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === 'TOKEN_EXPIRED' &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the access token
                const expiredToken = localStorage.getItem('accessToken');
                const { data } = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    {
                        headers: {
                            Authorization: expiredToken ? `Bearer ${expiredToken}` : '',
                        },
                    }
                );

                const newToken = data.data.accessToken;
                localStorage.setItem('accessToken', newToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed — force logout
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ── Auth API calls ──────────────────────────────────────────────────

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    login: (data) => api.post('/auth/login', data),
    refresh: () => api.post('/auth/refresh'),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    resendOTP: (data) => api.post('/auth/resend-otp', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
};

export const resumeAPI = {
    create: (data) => api.post('/resume', data),
    getAll: () => api.get('/resume'),
    getById: (id) => api.get(`/resume/${id}`),
    update: (id, data) => api.put(`/resume/${id}`, data),
    delete: (id) => api.delete(`/resume/${id}`),
};

export default api;
