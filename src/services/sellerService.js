import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Create axios instance
const createApiClient = () => {
    const client = axios.create({
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

class SellerService {
    // Get current user ID from localStorage
    getCurrentUserId() {
        console.log('🔍 SellerService: Getting current user ID...');

        const directUserId = localStorage.getItem('userId');
        if (directUserId) {
            return directUserId;
        }

        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.id || userData.userId || userData.ID || userData.UserId || userData.user_id;
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    }

    // Get seller registration info
    async getSellerRegistration() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.SELLER_REGISTRATION.GET_MY);

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Không thể tải thông tin đăng ký seller',
                data: null
            };
        } catch (error) {
            console.error('Error fetching seller registration:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thông tin đăng ký seller',
                data: null
            };
        }
    }

    // Get seller profile
    async getSellerProfile(userId) {
        try {
            const targetUserId = userId || this.getCurrentUserId();
            if (!targetUserId) {
                throw new Error('User ID not found');
            }

            const response = await apiClient.get(API_ENDPOINTS.SELLER_REGISTRATION.GET_MY);

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                message: 'Không tìm thấy thông tin seller',
                data: null
            };
        } catch (error) {
            console.error('Error fetching seller profile:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải hồ sơ seller',
                data: null
            };
        }
    }

    // Get loyal customers statistics for dashboard
    async getLoyalCustomerStatistics() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.get(`${API_ENDPOINTS.API_BASE}/api/customer/statistics`, {
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
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thống kê khách hàng',
                data: null
            };
        }
    }

    // Get recent orders for dashboard
    async getRecentOrders(limit = 5) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Using order filter API with seller-specific filters
            const response = await apiClient.post(`${API_ENDPOINTS.API_BASE}/api/order/filter`, {
                sellerId: userId,
                page: 1,
                pageSize: limit,
                sortBy: 'CreatedAt',
                sortOrder: 'desc'
            });

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data?.items || []
                };
            }

            return {
                success: false,
                message: 'Không thể tải đơn hàng gần đây',
                data: []
            };
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải đơn hàng gần đây',
                data: []
            };
        }
    }

    // Get product statistics for dashboard  
    async getProductStatistics(storeId) {
        try {
            if (!storeId) {
                throw new Error('Store ID is required');
            }

            const response = await apiClient.get(`${API_ENDPOINTS.PRODUCT.SELLER_GET_ALL(storeId)}?page=1&pageSize=1000`);

            if (response.data?.success) {
                const products = response.data.data?.items || [];

                // Calculate statistics
                const totalProducts = products.length;
                const activeProducts = products.filter(p => p.isActive).length;
                const inactiveProducts = totalProducts - activeProducts;
                const outOfStockProducts = products.filter(p => p.stock === 0).length;

                // Get top selling products (mock calculation)
                const topProducts = products
                    .map(product => ({
                        ...product,
                        sold: Math.floor(Math.random() * 50) + 1, // Mock data
                        views: Math.floor(Math.random() * 200) + 20 // Mock data
                    }))
                    .sort((a, b) => b.sold - a.sold)
                    .slice(0, 5);

                return {
                    success: true,
                    data: {
                        totalProducts,
                        activeProducts,
                        inactiveProducts,
                        outOfStockProducts,
                        topProducts
                    }
                };
            }

            return {
                success: false,
                message: 'Không thể tải thống kê sản phẩm',
                data: null
            };
        } catch (error) {
            console.error('Error fetching product statistics:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thống kê sản phẩm',
                data: null
            };
        }
    }

    // Get dashboard overview data
    async getDashboardOverview() {
        try {
            console.log('🔍 SellerService: Getting dashboard overview...');

            // Get seller registration first to get store info
            const sellerResult = await this.getSellerRegistration();

            if (!sellerResult.success) {
                return {
                    success: false,
                    message: 'Không thể tải thông tin seller',
                    data: null
                };
            }

            const sellerData = sellerResult.data;

            // Prepare promises for parallel API calls
            const promises = [
                this.getLoyalCustomerStatistics(),
                this.getRecentOrders(5),
                // Note: We need storeId for product stats, but it might not be available in registration
                // We'll handle this separately
            ];

            const [customerStats, recentOrders] = await Promise.all(promises);

            // Mock data for now since we don't have all APIs implemented
            const mockStats = {
                totalProducts: 25,
                totalOrders: 128,
                totalRevenue: 15600000,
                newFollowers: 12,
                viewsThisWeek: 456,
                pendingOrders: 8,
                rating: 4.8,
                followers: 340
            };

            return {
                success: true,
                data: {
                    sellerInfo: {
                        name: sellerData?.storeName || "Gian hàng của tôi",
                        avatar: "https://i.pravatar.cc/100?img=1", // Mock avatar
                        rating: mockStats.rating,
                        followers: mockStats.followers,
                        joinDate: "Tham gia từ 2023",
                        status: sellerData?.status || "Active"
                    },
                    stats: mockStats,
                    customerStats: customerStats.success ? customerStats.data : null,
                    recentOrders: recentOrders.success ? recentOrders.data : [],
                    topProducts: [] // Will be populated when we have store ID
                }
            };
        } catch (error) {
            console.error('Error fetching dashboard overview:', error);
            return {
                success: false,
                message: 'Không thể tải dữ liệu dashboard',
                data: null
            };
        }
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Format number
    formatNumber(number) {
        return new Intl.NumberFormat('vi-VN').format(number);
    }

    // Get order status color
    getOrderStatusColor(status) {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'preparing': 'bg-purple-100 text-purple-800',
            'shipping': 'bg-indigo-100 text-indigo-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'returned': 'bg-gray-100 text-gray-800'
        };

        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    // Get order status text in Vietnamese
    getOrderStatusText(status) {
        const statusTexts = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang chuẩn bị',
            'shipping': 'Đang giao',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy',
            'returned': 'Đã trả hàng'
        };

        return statusTexts[status?.toLowerCase()] || status;
    }
}

export default new SellerService();
