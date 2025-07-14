// Personal Shopping Service - For sellers who also shop (dual role)
import { API_ENDPOINTS } from '../config/apiEndpoints';
import { getCurrentUser } from './authService';

class PersonalShoppingService {
    constructor() {
        this.apiUrl = API_ENDPOINTS.API_BASE;
    }

    // Get personal shopping statistics for sellers
    async getPersonalShoppingStats() {
        try {
            const user = getCurrentUser();
            if (!user || !user.id) {
                throw new Error('User not authenticated');
            }

            // Get data from multiple endpoints in parallel
            const [ordersResponse, cartResponse, favoritesResponse] = await Promise.all([
                this.getMyOrders(),
                this.getCartSummary(),
                this.getFavoriteProducts()
            ]);

            // Calculate statistics
            const totalOrders = ordersResponse.totalCount || 0;
            const totalSpent = ordersResponse.orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
            const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
            const cartItemsCount = cartResponse.itemCount || 0;
            const favoriteProductsCount = favoritesResponse.totalCount || 0;

            // Recent orders
            const recentOrders = ordersResponse.orders?.slice(0, 5) || [];

            // Order by status
            const ordersByStatus = ordersResponse.orders?.reduce((acc, order) => {
                const status = order.status || 'unknown';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {}) || {};

            return {
                totalOrders,
                totalSpent,
                averageOrderValue,
                cartItemsCount,
                favoriteProductsCount,
                recentOrders,
                ordersByStatus,
                lastOrderDate: ordersResponse.orders?.[0]?.orderDate || null
            };
        } catch (error) {
            console.error('Error fetching personal shopping stats:', error);

            // Return mock data for development
            return this.getMockShoppingStats();
        }
    }

    // Get user's orders as a buyer
    async getMyOrders(page = 1, pageSize = 50) {
        try {
            const user = getCurrentUser();
            if (!user || !user.id) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(
                API_ENDPOINTS.ORDER.GET_BY_USER + `?page=${page}&pageSize=${pageSize}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                        'userId': user.id,
                        'userRole': 'Buyer'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                orders: data.data || [],
                totalCount: data.totalCount || 0,
                currentPage: data.currentPage || 1,
                totalPages: data.totalPages || 1
            };
        } catch (error) {
            console.error('Error fetching orders:', error);
            return this.getMockOrders();
        }
    }

    // Get cart summary
    async getCartSummary() {
        try {
            const user = getCurrentUser();
            if (!user || !user.id) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(
                API_ENDPOINTS.CART.GET_SUMMARY(user.id),
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching cart summary:', error);
            return { itemCount: 3, totalValue: 125000 };
        }
    }

    // Get favorite products
    async getFavoriteProducts(page = 1, pageSize = 50) {
        try {
            const user = getCurrentUser();
            if (!user || !user.id) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(
                `${this.apiUrl}/api/favorite?page=${page}&pageSize=${pageSize}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                products: data.data || [],
                totalCount: data.totalCount || 0,
                currentPage: data.currentPage || 1,
                totalPages: data.totalPages || 1
            };
        } catch (error) {
            console.error('Error fetching favorite products:', error);
            return { products: [], totalCount: 8 };
        }
    }

    // Get cart items with details
    async getCartItems() {
        try {
            const user = getCurrentUser();
            if (!user || !user.id) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(
                API_ENDPOINTS.CART.GET_ITEMS(user.id),
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return this.getMockCartItems();
        }
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

    // Format date
    formatDate(dateString) {
        if (!dateString) return 'Chưa xác định';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Get time ago
    getTimeAgo(dateString) {
        if (!dateString) return 'Chưa xác định';

        const now = new Date();
        const date = new Date(dateString);
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays <= 7) return `${diffDays} ngày trước`;
        if (diffDays <= 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        if (diffDays <= 365) return `${Math.floor(diffDays / 30)} tháng trước`;
        return `${Math.floor(diffDays / 365)} năm trước`;
    }

    // Mock data for development
    getMockShoppingStats() {
        return {
            totalOrders: 24,
            totalSpent: 2850000,
            averageOrderValue: 118750,
            cartItemsCount: 3,
            favoriteProductsCount: 8,
            lastOrderDate: '2024-01-15T10:30:00',
            ordersByStatus: {
                'delivered': 18,
                'shipping': 2,
                'confirmed': 3,
                'cancelled': 1
            },
            recentOrders: [
                {
                    id: 'DH001',
                    orderDate: '2024-01-15T10:30:00',
                    totalAmount: 125000,
                    status: 'delivered',
                    sellerName: 'Cửa hàng Cô Lan',
                    itemCount: 3
                },
                {
                    id: 'DH002',
                    orderDate: '2024-01-14T14:20:00',
                    totalAmount: 89000,
                    status: 'delivered',
                    sellerName: 'Gian hàng Anh Minh',
                    itemCount: 2
                },
                {
                    id: 'DH003',
                    orderDate: '2024-01-13T09:15:00',
                    totalAmount: 156000,
                    status: 'shipping',
                    sellerName: 'Cửa hàng Chú Tám',
                    itemCount: 4
                },
                {
                    id: 'DH004',
                    orderDate: '2024-01-12T16:45:00',
                    totalAmount: 75000,
                    status: 'delivered',
                    sellerName: 'Cô Bảy Fresh',
                    itemCount: 2
                },
                {
                    id: 'DH005',
                    orderDate: '2024-01-11T11:20:00',
                    totalAmount: 98000,
                    status: 'confirmed',
                    sellerName: 'Cửa hàng Cô Lan',
                    itemCount: 3
                }
            ]
        };
    }

    getMockOrders() {
        return {
            orders: this.getMockShoppingStats().recentOrders,
            totalCount: 24,
            currentPage: 1,
            totalPages: 3
        };
    }

    getMockCartItems() {
        return [
            {
                id: '1',
                productName: 'Rau muống tươi',
                quantity: 2,
                price: 15000,
                total: 30000,
                image: '',
                seller: 'Cô Lan'
            },
            {
                id: '2',
                productName: 'Cà chua bi',
                quantity: 1,
                price: 25000,
                total: 25000,
                image: '',
                seller: 'Anh Minh'
            },
            {
                id: '3',
                productName: 'Hành lá',
                quantity: 3,
                price: 8000,
                total: 24000,
                image: '',
                seller: 'Cô Lan'
            }
        ];
    }
}

const personalShoppingService = new PersonalShoppingService();
export default personalShoppingService;
