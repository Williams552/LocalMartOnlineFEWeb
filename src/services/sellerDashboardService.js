// Services for Seller Dashboard Statistics
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

class SellerDashboardService {
    // Get current user ID from localStorage
    getCurrentUserId() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.id || user.Id;
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    }

    // Get seller overview statistics
    async getSellerOverviewStats() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Get seller registration to get store info
            const sellerResponse = await apiClient.get(`${API_ENDPOINTS.SELLER.GET_MY_REGISTRATION}`);
            let storeId = null;

            if (sellerResponse.data?.success && sellerResponse.data?.data?.storeId) {
                storeId = sellerResponse.data.data.storeId;
            }

            // Parallel API calls for dashboard data
            const promises = [
                this.getProductStats(storeId),
                this.getOrderStats(userId),
                this.getRevenueStats(userId),
                this.getFollowerStats(storeId),
                this.getViewStats(storeId),
                this.getCustomerStats(userId)
            ];

            const [
                productStats,
                orderStats,
                revenueStats,
                followerStats,
                viewStats,
                customerStats
            ] = await Promise.all(promises);

            return {
                success: true,
                data: {
                    // Main stats
                    totalProducts: productStats.totalProducts || 0,
                    activeProducts: productStats.activeProducts || 0,
                    totalOrders: orderStats.totalOrders || 0,
                    pendingOrders: orderStats.pendingOrders || 0,
                    totalRevenue: revenueStats.totalRevenue || 0,
                    revenueThisMonth: revenueStats.monthlyRevenue || 0,
                    totalFollowers: followerStats.totalFollowers || 0,
                    newFollowers: followerStats.newFollowers || 0,
                    viewsThisWeek: viewStats.weeklyViews || 0,
                    averageRating: customerStats.averageRating || 0,

                    // Additional metrics
                    outOfStockProducts: productStats.outOfStockProducts || 0,
                    completedOrders: orderStats.completedOrders || 0,
                    growthRate: revenueStats.growthRate || 0,
                    loyalCustomers: customerStats.loyalCustomers || 0
                }
            };
        } catch (error) {
            console.error('Error fetching seller overview stats:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thống kê tổng quan',
                data: this.getMockStats()
            };
        }
    }

    // Get product statistics
    async getProductStats(storeId) {
        try {
            if (!storeId) {
                return { totalProducts: 0, activeProducts: 0, outOfStockProducts: 0 };
            }

            const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT.SELLER_GET_ALL(storeId)}?page=1&pageSize=1000`);

            if (response.data?.success) {
                const products = response.data.data?.items || [];

                return {
                    totalProducts: products.length,
                    activeProducts: products.filter(p => p.isActive).length,
                    outOfStockProducts: products.filter(p => p.stockQuantity === 0).length
                };
            }

            return { totalProducts: 0, activeProducts: 0, outOfStockProducts: 0 };
        } catch (error) {
            console.error('Error fetching product stats:', error);
            return { totalProducts: 0, activeProducts: 0, outOfStockProducts: 0 };
        }
    }

    // Get order statistics
    async getOrderStats(userId) {
        try {
            const response = await apiClient.post(`${API_ENDPOINTS.ORDER.FILTER}`, {
                sellerId: userId,
                page: 1,
                pageSize: 1000
            });

            if (response.data?.success) {
                const orders = response.data.data?.items || [];

                return {
                    totalOrders: orders.length,
                    pendingOrders: orders.filter(o => ['Pending', 'Confirmed'].includes(o.status)).length,
                    completedOrders: orders.filter(o => o.status === 'Delivered').length
                };
            }

            return { totalOrders: 0, pendingOrders: 0, completedOrders: 0 };
        } catch (error) {
            console.error('Error fetching order stats:', error);
            return { totalOrders: 0, pendingOrders: 0, completedOrders: 0 };
        }
    }

    // Get revenue statistics (mock - needs real API)
    async getRevenueStats(userId) {
        try {
            // Mock calculation - in real implementation, would call revenue API
            const currentMonth = new Date().getMonth();
            const mockRevenue = {
                totalRevenue: 15600000,
                monthlyRevenue: 2400000,
                growthRate: 12.5
            };

            return mockRevenue;
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
            return { totalRevenue: 0, monthlyRevenue: 0, growthRate: 0 };
        }
    }

    // Get follower statistics
    async getFollowerStats(storeId) {
        try {
            if (!storeId) {
                return { totalFollowers: 0, newFollowers: 0 };
            }

            // Get store statistics which includes follower count
            const response = await apiClient.get(`${API_ENDPOINTS.STORE.GET_STATISTICS(storeId)}`);

            if (response.data?.success) {
                const followerCount = response.data.data?.followerCount || 0;

                // Calculate new followers (followers from last 7 days)
                // This would need a specific API endpoint for time-based follower stats
                const newFollowers = Math.floor(followerCount * 0.1); // Mock calculation

                return {
                    totalFollowers: followerCount,
                    newFollowers: newFollowers
                };
            }

            return { totalFollowers: 0, newFollowers: 0 };
        } catch (error) {
            console.error('Error fetching follower stats:', error);
            return { totalFollowers: 0, newFollowers: 0 };
        }
    }

    // Get view statistics (mock - needs real API)
    async getViewStats(storeId) {
        try {
            // Mock data - in real implementation, would call analytics API
            return {
                weeklyViews: 456,
                dailyViews: 65
            };
        } catch (error) {
            console.error('Error fetching view stats:', error);
            return { weeklyViews: 0, dailyViews: 0 };
        }
    }

    // Get customer statistics
    async getCustomerStats(userId) {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.SELLER.GET_CUSTOMER_STATS}`, {
                headers: {
                    'userId': userId,
                    'userRole': 'Seller'
                }
            });

            if (response.data) {
                return {
                    averageRating: response.data.averageRating || 4.5,
                    loyalCustomers: response.data.totalLoyalCustomers || 0
                };
            }

            return { averageRating: 0, loyalCustomers: 0 };
        } catch (error) {
            console.error('Error fetching customer stats:', error);
            return { averageRating: 0, loyalCustomers: 0 };
        }
    }

    // Mock data fallback
    getMockStats() {
        return {
            totalProducts: 25,
            activeProducts: 23,
            totalOrders: 128,
            pendingOrders: 8,
            totalRevenue: 15600000,
            revenueThisMonth: 2400000,
            totalFollowers: 340,
            newFollowers: 12,
            viewsThisWeek: 456,
            averageRating: 4.8,
            outOfStockProducts: 2,
            completedOrders: 112,
            growthRate: 12.5,
            loyalCustomers: 45
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

    // Format percentage
    formatPercentage(percentage) {
        if (!percentage || percentage === 0) return '0%';
        return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
    }
}

export default new SellerDashboardService();
