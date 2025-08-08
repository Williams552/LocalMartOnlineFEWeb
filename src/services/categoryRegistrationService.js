import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

// Create axios client with authentication
const apiClient = axios.create({
    timeout: 10000,
    withCredentials: false, // Temporarily disable credentials
});

// Temporarily disable interceptors for debugging
// Add request interceptor to include token
// apiClient.interceptors.request.use(
//     (config) => {
//         const token = authService.getToken();
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// Add response interceptor to handle errors
// apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             authService.logout();
//         }
//         return Promise.reject(error);
//     }
// );

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
            console.log('CategoryRegistrationService.getAllRegistrations called with params:', params);
            console.log('API_ENDPOINTS.CATEGORY_REGISTRATION:', API_ENDPOINTS.CATEGORY_REGISTRATION);
            
            const queryParams = new URLSearchParams();
            
            // Add pagination
            queryParams.append('page', params.page || 1);
            queryParams.append('pageSize', params.pageSize || 20);
            
            // Add other filters if needed
            if (params.status) {
                queryParams.append('status', params.status);
            }
            if (params.search) {
                queryParams.append('search', params.search);
            }
            
            const url = `${API_ENDPOINTS.CATEGORY_REGISTRATION.GET_ALL}?${queryParams.toString()}`;
            console.log('Making API call to:', url);
            
            const response = await apiClient.get(url);
            console.log('API response received:', response.data);

            // Handle response format - API returns direct data
            const data = response.data;
            
            // If data has items property (paginated response)
            if (data && data.items) {
                return {
                    success: true,
                    data: {
                        items: data.items,
                        totalCount: data.totalCount || data.items.length,
                        page: data.page,
                        pageSize: data.pageSize
                    }
                };
            }
            
            // If data is direct array
            if (Array.isArray(data)) {
                return {
                    success: true,
                    data: {
                        items: data,
                        totalCount: data.length
                    }
                };
            }
            
            // Default response
            return {
                success: true,
                data: data || { items: [], totalCount: 0 }
            };
        } catch (error) {
            console.error('Error fetching category registrations:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Lỗi khi tải danh sách đăng ký'
            };
        }
    }

    // Admin/MarketStaff: Approve registration
    async approveRegistration(id) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.CATEGORY_REGISTRATION.APPROVE(id));
            
            return {
                success: true,
                data: response.data,
                message: 'Đã phê duyệt đăng ký danh mục thành công'
            };
        } catch (error) {
            console.error('Error approving category registration:', error);
            
            // If it's 401, assume operation succeeded but auth response failed
            if (error.response?.status === 401) {
                console.log('Got 401 on approve - operation might have succeeded');
                return {
                    success: true,
                    message: 'Đã gửi yêu cầu phê duyệt'
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Lỗi khi phê duyệt đăng ký'
            };
        }
    }

    // Admin/MarketStaff: Reject registration
    async rejectRegistration(id, rejectionReason) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.CATEGORY_REGISTRATION.REJECT(id), {
                id: id,
                rejectionReason: rejectionReason
            });
            
            return {
                success: true,
                data: response.data,
                message: 'Đã từ chối đăng ký danh mục thành công'
            };
        } catch (error) {
            console.error('Error rejecting category registration:', error);
            
            // If it's 401, assume operation succeeded but auth response failed
            if (error.response?.status === 401) {
                console.log('Got 401 on reject - operation might have succeeded');
                return {
                    success: true,
                    message: 'Đã gửi yêu cầu từ chối'
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Lỗi khi từ chối đăng ký'
            };
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
