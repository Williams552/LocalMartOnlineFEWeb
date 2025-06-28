import axios from 'axios';

// Base API URL từ backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5183';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API Service class
class ApiService {
    // User endpoints
    async getAllUsers() {
        try {
            const response = await apiClient.get('/api/User');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách người dùng');
        }
    }

    // Generic CRUD operations
    async get(endpoint) {
        try {
            const response = await apiClient.get(endpoint);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || `Lỗi khi gọi GET ${endpoint}`);
        }
    }

    async post(endpoint, data) {
        try {
            const response = await apiClient.post(endpoint, data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || `Lỗi khi gọi POST ${endpoint}`);
        }
    }

    async put(endpoint, data) {
        try {
            const response = await apiClient.put(endpoint, data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || `Lỗi khi gọi PUT ${endpoint}`);
        }
    }

    async delete(endpoint) {
        try {
            const response = await apiClient.delete(endpoint);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || `Lỗi khi gọi DELETE ${endpoint}`);
        }
    }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
