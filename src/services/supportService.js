import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5183';

// Create axios instance
const createApiClient = () => {
    const client = axios.create({
        baseURL: API_URL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add request interceptor for auth token
    client.interceptors.request.use(
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

    // Add response interceptor for error handling
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return client;
};

const apiClient = createApiClient();

const SupportService = {
    // Tạo yêu cầu hỗ trợ mới
    createSupportRequest: async (userId, requestData) => {
        try {
            const response = await apiClient.post(`/api/supportrequest/user/${userId}`, requestData);
            return response.data;
        } catch (error) {
            console.error('Error creating support request:', error);
            throw error.response?.data || error.message;
        }
    },

    // Lấy danh sách yêu cầu hỗ trợ của user
    getUserSupportRequests: async (userId) => {
        try {
            const response = await apiClient.get(`/api/supportrequest/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user support requests:', error);
            throw error.response?.data || error.message;
        }
    },

    // Lấy chi tiết yêu cầu hỗ trợ
    getSupportRequestById: async (requestId) => {
        try {
            const response = await apiClient.get(`/api/supportrequest/${requestId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching support request:', error);
            throw error.response?.data || error.message;
        }
    },

    // Lấy tất cả yêu cầu hỗ trợ (cho admin/staff)
    getAllSupportRequests: async () => {
        try {
            const response = await apiClient.get('/api/supportrequest');
            return response.data;
        } catch (error) {
            console.error('Error fetching all support requests:', error);
            throw error.response?.data || error.message;
        }
    },

    // Lấy yêu cầu hỗ trợ theo trạng thái
    getSupportRequestsByStatus: async (status) => {
        try {
            const response = await apiClient.get(`/api/supportrequest/status/${status}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching support requests by status:', error);
            throw error.response?.data || error.message;
        }
    },

    // Phản hồi yêu cầu hỗ trợ (cho admin/staff)
    respondToSupportRequest: async (requestId, responseData) => {
        try {
            const response = await apiClient.put(`/api/supportrequest/${requestId}/respond`, responseData);
            return response.data;
        } catch (error) {
            console.error('Error responding to support request:', error);
            throw error.response?.data || error.message;
        }
    },

    // Cập nhật trạng thái yêu cầu hỗ trợ
    updateSupportRequestStatus: async (requestId, status) => {
        try {
            const response = await apiClient.put(`/api/supportrequest/${requestId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating support request status:', error);
            throw error.response?.data || error.message;
        }
    },

    // Xóa yêu cầu hỗ trợ (cho admin)
    deleteSupportRequest: async (requestId) => {
        try {
            const response = await apiClient.delete(`/api/supportrequest/${requestId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting support request:', error);
            throw error.response?.data || error.message;
        }
    }
};

export default SupportService;
