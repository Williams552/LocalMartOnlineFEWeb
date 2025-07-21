import axios from 'axios';
import API_ENDPOINTS from '../config/apiEndpoints';
import authService from './authService';

// Create axios client with authentication
const apiClient = axios.create({
    timeout: 10000,
    withCredentials: true,
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authService.logout();
        }
        return Promise.reject(error);
    }
);

class CategoryRegistrationService {
    // Seller: Register new category
    async createRegistration(registrationData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.CATEGORY_REGISTRATION.CREATE, registrationData);
            
            if (response.data && response.data.success !== false) {
                return response.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error creating category registration:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi đăng ký danh mục');
        }
    }

    // Admin/MarketStaff: Get all registrations with pagination
    async getAllRegistrations(params = {}) {
        try {
            const queryParams = {
                page: 1,
                pageSize: 20,
                ...params
            };

            const response = await apiClient.get(API_ENDPOINTS.CATEGORY_REGISTRATION.GET_ALL, {
                params: queryParams
            });

            if (response.data && response.data.success !== false) {
                return {
                    success: true,
                    data: response.data.data || response.data,
                    pagination: response.data.pagination || {
                        page: queryParams.page,
                        pageSize: queryParams.pageSize,
                        total: response.data.data?.length || 0
                    }
                };
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching category registrations:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi tải danh sách đăng ký');
        }
    }

    // Admin/MarketStaff: Approve registration
    async approveRegistration(id) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.CATEGORY_REGISTRATION.APPROVE(id));
            
            if (response.status === 204 || response.data?.success !== false) {
                return { success: true, message: 'Đã phê duyệt đăng ký danh mục' };
            }
            return response.data;
        } catch (error) {
            console.error('Error approving category registration:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi phê duyệt đăng ký');
        }
    }

    // Admin/MarketStaff: Reject registration
    async rejectRegistration(id, rejectionReason) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.CATEGORY_REGISTRATION.REJECT(id), {
                rejectionReason
            });
            
            if (response.status === 204 || response.data?.success !== false) {
                return { success: true, message: 'Đã từ chối đăng ký danh mục' };
            }
            return response.data;
        } catch (error) {
            console.error('Error rejecting category registration:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi từ chối đăng ký');
        }
    }

    // Helper: Get status display name
    getStatusDisplayName(status) {
        const statusMap = {
            'Pending': 'Chờ duyệt',
            'Approved': 'Đã duyệt',
            'Rejected': 'Đã từ chối',
            0: 'Chờ duyệt', // Enum value
            1: 'Đã duyệt',
            2: 'Đã từ chối'
        };
        return statusMap[status] || 'Không xác định';
    }

    // Helper: Get status color
    getStatusColor(status) {
        const colorMap = {
            'Pending': 'gold',
            'Approved': 'green',
            'Rejected': 'red',
            0: 'gold', // Enum value
            1: 'green',
            2: 'red'
        };
        return colorMap[status] || 'default';
    }

    // Helper: Format registration for display
    formatRegistrationDisplay(registration) {
        return {
            ...registration,
            statusDisplay: this.getStatusDisplayName(registration.status),
            statusColor: this.getStatusColor(registration.status),
            createdAtDisplay: registration.createdAt ? new Date(registration.createdAt).toLocaleDateString('vi-VN') : 'Không rõ',
            updatedAtDisplay: registration.updatedAt ? new Date(registration.updatedAt).toLocaleDateString('vi-VN') : 'Không rõ'
        };
    }
}

const categoryRegistrationService = new CategoryRegistrationService();
export default categoryRegistrationService;
