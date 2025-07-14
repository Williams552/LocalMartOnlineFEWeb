// Customer Service for API communication
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Create axios instance
const createApiClient = () => {
    const client = axios.create({
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5183',
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
                window.location.href = '/auth/login';
            }
            return Promise.reject(error);
        }
    );

    return client;
};

const apiClient = createApiClient();

class CustomerService {
    // Get current user ID from localStorage
    getCurrentUserId() {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                return userData.id || userData.userId || null;
            }
        } catch (error) {
            console.error('Error getting current user ID:', error);
        }
        return null;
    }

    // Get loyal customers list
    async getLoyalCustomers(params = {}) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const defaultParams = {
                minimumOrders: 5,
                minimumSpent: 0,
                daysRange: 365,
                page: 1,
                pageSize: 10,
                sortBy: 'totalSpent',
                sortOrder: 'desc'
            };

            const queryParams = { ...defaultParams, ...params };
            const queryString = Object.keys(queryParams)
                .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
                .join('&');

            const response = await apiClient.get(`${API_ENDPOINTS.SELLER.GET_LOYAL_CUSTOMERS}?${queryString}`, {
                headers: {
                    'userId': userId,
                    'userRole': 'Seller'
                }
            });

            if (response.data) {
                return {
                    success: true,
                    data: response.data
                };
            }

            return {
                success: false,
                message: 'Không thể tải danh sách khách hàng',
                data: null
            };
        } catch (error) {
            console.error('Error fetching loyal customers:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách khách hàng',
                data: null
            };
        }
    }

    // Get customer statistics
    async getCustomerStatistics() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.get(API_ENDPOINTS.SELLER.GET_CUSTOMER_STATS, {
                headers: {
                    'userId': userId,
                    'userRole': 'Seller'
                }
            });

            if (response.data) {
                return {
                    success: true,
                    data: response.data
                };
            }

            return {
                success: false,
                message: 'Không thể tải thống kê khách hàng',
                data: null
            };
        } catch (error) {
            console.error('Error fetching customer statistics:', error);
            // Return mock data for development
            return {
                success: false,
                message: 'Sử dụng dữ liệu mẫu - API chưa sẵn sàng',
                data: this.getMockStatistics()
            };
        }
    }

    // Get customer order summary
    async getCustomerOrderSummary(customerId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.get(API_ENDPOINTS.SELLER.GET_CUSTOMER_ORDERS(customerId), {
                headers: {
                    'userId': userId,
                    'userRole': 'Seller'
                }
            });

            if (response.data) {
                return {
                    success: true,
                    data: response.data
                };
            }

            return {
                success: false,
                message: 'Không thể tải lịch sử đơn hàng khách hàng',
                data: null
            };
        } catch (error) {
            console.error('Error fetching customer order summary:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải lịch sử đơn hàng khách hàng',
                data: null
            };
        }
    }

    // Get loyalty score information
    async getLoyaltyScoreInfo() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.SELLER.GET_LOYALTY_INFO, {
                headers: {
                    'userRole': 'Seller'
                }
            });

            if (response.data) {
                return {
                    success: true,
                    data: response.data
                };
            }

            return {
                success: false,
                message: 'Không thể tải thông tin điểm thành viên',
                data: null
            };
        } catch (error) {
            console.error('Error fetching loyalty score info:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thông tin điểm thành viên',
                data: null
            };
        }
    }

    // Mock data for development
    getMockStatistics() {
        return {
            totalLoyalCustomers: 45,
            totalRevenue: 18500000,
            averageCustomerValue: 411111,
            bronzeCustomers: 25,
            silverCustomers: 12,
            goldCustomers: 6,
            platinumCustomers: 2,
            repeatCustomerRate: 78.5
        };
    }

    // Get mock customer list
    getMockCustomers() {
        return {
            customers: [
                {
                    userId: "1",
                    fullName: "Nguyễn Văn A",
                    email: "customer1@example.com",
                    phoneNumber: "0901234567",
                    totalOrders: 15,
                    completedOrders: 14,
                    totalSpent: 2500000,
                    averageOrderValue: 178571,
                    firstOrderDate: "2023-01-15T00:00:00Z",
                    lastOrderDate: "2024-12-01T00:00:00Z",
                    daysSinceFirstOrder: 350,
                    daysSinceLastOrder: 5,
                    loyaltyScore: 850,
                    customerTier: "Platinum"
                },
                {
                    userId: "2",
                    fullName: "Trần Thị B",
                    email: "customer2@example.com",
                    phoneNumber: "0901234568",
                    totalOrders: 8,
                    completedOrders: 8,
                    totalSpent: 1200000,
                    averageOrderValue: 150000,
                    firstOrderDate: "2023-03-20T00:00:00Z",
                    lastOrderDate: "2024-11-15T00:00:00Z",
                    daysSinceFirstOrder: 280,
                    daysSinceLastOrder: 20,
                    loyaltyScore: 650,
                    customerTier: "Gold"
                },
                {
                    userId: "3",
                    fullName: "Lê Văn C",
                    email: "customer3@example.com",
                    phoneNumber: "0901234569",
                    totalOrders: 6,
                    completedOrders: 6,
                    totalSpent: 800000,
                    averageOrderValue: 133333,
                    firstOrderDate: "2023-06-10T00:00:00Z",
                    lastOrderDate: "2024-10-30T00:00:00Z",
                    daysSinceFirstOrder: 200,
                    daysSinceLastOrder: 35,
                    loyaltyScore: 480,
                    customerTier: "Silver"
                }
            ],
            totalCount: 45,
            currentPage: 1,
            pageSize: 10,
            totalPages: 5
        };
    }

    // Format currency
    formatCurrency(amount) {
        if (!amount || amount === 0) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    // Format number
    formatNumber(number) {
        if (!number || number === 0) return '0';
        return new Intl.NumberFormat('vi-VN').format(number);
    }

    // Get tier color
    getTierColor(tier) {
        const colors = {
            'Bronze': '#cd7f32',
            'Silver': '#c0c0c0',
            'Gold': '#ffd700',
            'Platinum': '#e5e4e2'
        };
        return colors[tier] || '#666';
    }

    // Get tier text color for contrast
    getTierTextColor(tier) {
        const colors = {
            'Bronze': '#ffffff',
            'Silver': '#000000',
            'Gold': '#000000',
            'Platinum': '#000000'
        };
        return colors[tier] || '#ffffff';
    }
}

const customerService = new CustomerService();
export default customerService;
