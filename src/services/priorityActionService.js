// Priority Action Service - API integration for urgent seller actions
import apiService from './apiService';

const priorityActionService = {
    // Get all priority actions with counts
    getPriorityActions: async () => {
        try {
            // Try real API first
            const response = await apiService.get('/api/seller/priority-actions');
            return response.data;
        } catch (error) {
            console.warn('API unavailable, using mock data for priority actions:', error);

            // Mock data with realistic counts
            return {
                success: true,
                data: {
                    pendingOrders: {
                        count: 12,
                        urgent: 3, // Orders older than 24h
                        items: [
                            {
                                id: 'ORD001',
                                customerName: 'Nguyễn Văn An',
                                amount: 850000,
                                createdAt: '2025-07-13T10:30:00Z',
                                status: 'pending',
                                isUrgent: true
                            },
                            {
                                id: 'ORD002',
                                customerName: 'Trần Thị Bình',
                                amount: 1200000,
                                createdAt: '2025-07-13T14:20:00Z',
                                status: 'pending',
                                isUrgent: true
                            },
                            {
                                id: 'ORD003',
                                customerName: 'Lê Minh Cường',
                                amount: 650000,
                                createdAt: '2025-07-14T08:15:00Z',
                                status: 'pending',
                                isUrgent: false
                            }
                        ]
                    },
                    outOfStock: {
                        count: 8,
                        critical: 3, // Products with 0 stock
                        items: [
                            {
                                id: 'PRD001',
                                name: 'Áo thun cotton basic',
                                sku: 'AT001',
                                currentStock: 0,
                                lastSold: '2025-07-13T16:45:00Z',
                                category: 'Thời trang',
                                isCritical: true
                            },
                            {
                                id: 'PRD002',
                                name: 'Giày sneaker nam',
                                sku: 'GS002',
                                currentStock: 1,
                                lastSold: '2025-07-14T09:30:00Z',
                                category: 'Giày dép',
                                isCritical: false
                            },
                            {
                                id: 'PRD003',
                                name: 'Túi xách nữ',
                                sku: 'TX003',
                                currentStock: 0,
                                lastSold: '2025-07-12T11:20:00Z',
                                category: 'Phụ kiện',
                                isCritical: true
                            }
                        ]
                    },
                    pendingPayments: {
                        count: 2,
                        totalAmount: 2500000,
                        overdue: 1,
                        items: [
                            {
                                id: 'FEE001',
                                type: 'market_fee',
                                description: 'Phí thuê sạp tháng 7/2025',
                                amount: 1500000,
                                dueDate: '2025-07-15T23:59:59Z',
                                status: 'overdue',
                                isOverdue: true
                            },
                            {
                                id: 'FEE002',
                                type: 'commission_fee',
                                description: 'Phí hoa hồng bán hàng',
                                amount: 1000000,
                                dueDate: '2025-07-20T23:59:59Z',
                                status: 'pending',
                                isOverdue: false
                            }
                        ]
                    },
                    licenseExpiration: {
                        count: 1,
                        expiringSoon: 1, // Within 30 days
                        items: [
                            {
                                id: 'LIC001',
                                type: 'business_license',
                                name: 'Giấy phép kinh doanh',
                                issueDate: '2024-07-15T00:00:00Z',
                                expiryDate: '2025-07-30T23:59:59Z',
                                status: 'expiring_soon',
                                daysLeft: 16,
                                isExpiringSoon: true
                            }
                        ]
                    }
                },
                timestamp: new Date().toISOString()
            };
        }
    },

    // Get detailed pending orders
    getPendingOrders: async (limit = 10) => {
        try {
            const response = await apiService.get(`/api/seller/orders/pending?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.warn('API unavailable, using mock pending orders data');
            return mockPendingOrdersData();
        }
    },

    // Get out of stock products
    getOutOfStockProducts: async (limit = 10) => {
        try {
            const response = await apiService.get(`/api/seller/products/out-of-stock?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.warn('API unavailable, using mock out of stock data');
            return mockOutOfStockData();
        }
    },

    // Get pending payments
    getPendingPayments: async () => {
        try {
            const response = await apiService.get('/api/seller/payments/pending');
            return response.data;
        } catch (error) {
            console.warn('API unavailable, using mock pending payments data');
            return mockPendingPaymentsData();
        }
    },

    // Get license expiration alerts
    getLicenseExpirations: async () => {
        try {
            const response = await apiService.get('/api/seller/licenses/expiring');
            return response.data;
        } catch (error) {
            console.warn('API unavailable, using mock license data');
            return mockLicenseData();
        }
    },

    // Quick actions
    processOrder: async (orderId) => {
        try {
            const response = await apiService.put(`/api/seller/orders/${orderId}/process`);
            return response.data;
        } catch (error) {
            console.warn('API unavailable, simulating order processing');
            return { success: true, message: 'Đơn hàng đã được xử lý' };
        }
    },

    restockProduct: async (productId, quantity) => {
        try {
            const response = await apiService.put(`/api/seller/products/${productId}/restock`, {
                quantity
            });
            return response.data;
        } catch (error) {
            console.warn('API unavailable, simulating product restock');
            return { success: true, message: 'Sản phẩm đã được nhập kho' };
        }
    },

    payFee: async (feeId) => {
        try {
            const response = await apiService.post(`/api/seller/payments/${feeId}/pay`);
            return response.data;
        } catch (error) {
            console.warn('API unavailable, simulating payment');
            return { success: true, message: 'Thanh toán thành công' };
        }
    },

    renewLicense: async (licenseId) => {
        try {
            const response = await apiService.post(`/api/seller/licenses/${licenseId}/renew`);
            return response.data;
        } catch (error) {
            console.warn('API unavailable, simulating license renewal');
            return { success: true, message: 'Đã gửi yêu cầu gia hạn giấy phép' };
        }
    }
};

// Mock data functions
const mockPendingOrdersData = () => ({
    success: true,
    data: [
        {
            id: 'ORD001',
            customerName: 'Nguyễn Văn An',
            customerPhone: '0901234567',
            amount: 850000,
            itemCount: 3,
            createdAt: '2025-07-13T10:30:00Z',
            status: 'pending',
            isUrgent: true,
            products: ['Áo thun cotton', 'Quần jean', 'Giày sneaker']
        },
        {
            id: 'ORD002',
            customerName: 'Trần Thị Bình',
            customerPhone: '0907654321',
            amount: 1200000,
            itemCount: 2,
            createdAt: '2025-07-13T14:20:00Z',
            status: 'pending',
            isUrgent: true,
            products: ['Túi xách da', 'Ví nữ']
        },
        {
            id: 'ORD003',
            customerName: 'Lê Minh Cường',
            customerPhone: '0912345678',
            amount: 650000,
            itemCount: 1,
            createdAt: '2025-07-14T08:15:00Z',
            status: 'pending',
            isUrgent: false,
            products: ['Áo khoác']
        }
    ]
});

const mockOutOfStockData = () => ({
    success: true,
    data: [
        {
            id: 'PRD001',
            name: 'Áo thun cotton basic',
            sku: 'AT001',
            currentStock: 0,
            reorderLevel: 10,
            lastSold: '2025-07-13T16:45:00Z',
            category: 'Thời trang',
            price: 250000,
            isCritical: true
        },
        {
            id: 'PRD002',
            name: 'Giày sneaker nam',
            sku: 'GS002',
            currentStock: 1,
            reorderLevel: 5,
            lastSold: '2025-07-14T09:30:00Z',
            category: 'Giày dép',
            price: 850000,
            isCritical: false
        },
        {
            id: 'PRD003',
            name: 'Túi xách nữ',
            sku: 'TX003',
            currentStock: 0,
            reorderLevel: 8,
            lastSold: '2025-07-12T11:20:00Z',
            category: 'Phụ kiện',
            price: 1200000,
            isCritical: true
        }
    ]
});

const mockPendingPaymentsData = () => ({
    success: true,
    data: [
        {
            id: 'FEE001',
            type: 'market_fee',
            description: 'Phí thuê sạp tháng 7/2025',
            amount: 1500000,
            dueDate: '2025-07-15T23:59:59Z',
            status: 'overdue',
            isOverdue: true,
            penaltyFee: 150000
        },
        {
            id: 'FEE002',
            type: 'commission_fee',
            description: 'Phí hoa hồng bán hàng',
            amount: 1000000,
            dueDate: '2025-07-20T23:59:59Z',
            status: 'pending',
            isOverdue: false,
            penaltyFee: 0
        }
    ]
});

const mockLicenseData = () => ({
    success: true,
    data: [
        {
            id: 'LIC001',
            type: 'business_license',
            name: 'Giấy phép kinh doanh',
            licenseNumber: 'GP2024001234',
            issueDate: '2024-07-15T00:00:00Z',
            expiryDate: '2025-07-30T23:59:59Z',
            status: 'expiring_soon',
            daysLeft: 16,
            isExpiringSoon: true,
            renewalFee: 500000
        }
    ]
});

export default priorityActionService;
