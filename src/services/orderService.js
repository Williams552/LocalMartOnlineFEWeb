import apiService from './apiService';

class OrderService {
    // Get orders for seller (new endpoint)
    async getSellerOrders(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.status) queryParams.append('status', params.status);
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);
            if (params.fromDate) queryParams.append('fromDate', params.fromDate);
            if (params.toDate) queryParams.append('toDate', params.toDate);

            const url = `/api/Order/seller/my${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await apiService.get(url);

            // Always return data.items as array for FE compatibility
            const apiData = response.data || {};
            return {
                success: true,
                data: {
                    ...apiData,
                    items: Array.isArray(apiData.items) ? apiData.items : []
                },
                message: 'Lấy danh sách đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error getting seller orders:', error);

            // Return mock data for development
            if (process.env.NODE_ENV === 'development') {
                return {
                    success: false,
                    data: this.getMockOrders(),
                    message: 'Sử dụng dữ liệu mẫu - API chưa sẵn sàng'
                };
            }

            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Không thể lấy danh sách đơn hàng'
            };
        }
    }

    // Get recent orders (latest 5-10 orders)
    async getRecentOrders(sellerId, limit = 10) {
        return await this.getSellerOrders(sellerId, {
            limit,
            page: 1,
            // Sort by newest first (this would be handled by API)
            sortBy: 'createdAt',
            sortOrder: 'desc'
        });
    }

    // Get order by ID
    async getOrderById(orderId) {
        try {
            const response = await apiService.get(`/api/orders/${orderId}`);
            return {
                success: true,
                data: response.data,
                message: 'Lấy thông tin đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error getting order:', error);

            // Return mock data for development
            if (process.env.NODE_ENV === 'development') {
                const mockOrder = this.getMockOrders().find(order => order.id === orderId);
                return {
                    success: false,
                    data: mockOrder || null,
                    message: 'Sử dụng dữ liệu mẫu - API chưa sẵn sàng'
                };
            }

            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Không thể lấy thông tin đơn hàng'
            };
        }
    }

    // Update order status
    async updateOrderStatus(orderId, status, notes = '') {
        try {
            const response = await apiService.put(`/api/orders/${orderId}/status`, {
                status,
                notes
            });

            return {
                success: true,
                data: response.data,
                message: 'Cập nhật trạng thái đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error updating order status:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng'
            };
        }
    }

    // Get order statistics
    async getOrderStats(sellerId, period = 'month') {
        try {
            const response = await apiService.get(`/api/orders/seller/${sellerId}/stats?period=${period}`);
            return {
                success: true,
                data: response.data,
                message: 'Lấy thống kê đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error getting order stats:', error);

            // Return mock stats for development
            if (process.env.NODE_ENV === 'development') {
                return {
                    success: false,
                    data: this.getMockOrderStats(),
                    message: 'Sử dụng dữ liệu mẫu - API chưa sẵn sàng'
                };
            }

            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Không thể lấy thống kê đơn hàng'
            };
        }
    }

    // Mock data for development
    getMockOrders() {
        return [
            {
                id: "ORD001",
                customerId: "CUST001",
                customerName: "Nguyễn Thị Lan",
                customerPhone: "0123456789",
                customerEmail: "lan@email.com",
                customerAddress: "123 Đường ABC, Phường 1, Quận Ninh Kiều, Cần Thơ",
                orderDate: new Date().toISOString(),
                requiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                status: "pending",
                paymentMethod: "cod",
                paymentStatus: "pending",
                deliveryMethod: "delivery",
                items: [
                    {
                        id: 1,
                        productId: "PROD001",
                        productName: "Rau muống hữu cơ",
                        productImage: "https://via.placeholder.com/100x100?text=Rau+Muống",
                        quantity: 2,
                        unit: "kg",
                        unitPrice: 15000,
                        totalPrice: 30000
                    },
                    {
                        id: 2,
                        productId: "PROD002",
                        productName: "Cà chua cherry",
                        productImage: "https://via.placeholder.com/100x100?text=Cà+Chua",
                        quantity: 1.5,
                        unit: "kg",
                        unitPrice: 25000,
                        totalPrice: 37500
                    }
                ],
                subtotal: 67500,
                shippingFee: 15000,
                discount: 0,
                totalAmount: 82500,
                notes: "Giao hàng sớm nhé shop",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: "ORD002",
                customerId: "CUST002",
                customerName: "Trần Văn Minh",
                customerPhone: "0987654321",
                customerEmail: "minh@email.com",
                customerAddress: "456 Đường DEF, Phường 2, Quận Cái Răng, Cần Thơ",
                orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                requiredDate: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
                status: "confirmed",
                paymentMethod: "banking",
                paymentStatus: "paid",
                deliveryMethod: "delivery",
                items: [
                    {
                        id: 1,
                        productId: "PROD003",
                        productName: "Thịt heo ba chỉ",
                        productImage: "https://via.placeholder.com/100x100?text=Thịt+Heo",
                        quantity: 1,
                        unit: "kg",
                        unitPrice: 120000,
                        totalPrice: 120000
                    }
                ],
                subtotal: 120000,
                shippingFee: 20000,
                discount: 10000,
                totalAmount: 130000,
                notes: "",
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: "ORD003",
                customerId: "CUST003",
                customerName: "Lê Thị Hoa",
                customerPhone: "0345678912",
                customerEmail: "hoa@email.com",
                customerAddress: "789 Đường GHI, Phường 3, Quận Ô Môn, Cần Thơ",
                orderDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                requiredDate: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
                status: "preparing",
                paymentMethod: "cod",
                paymentStatus: "pending",
                deliveryMethod: "pickup",
                items: [
                    {
                        id: 1,
                        productId: "PROD004",
                        productName: "Gạo ST25",
                        productImage: "https://via.placeholder.com/100x100?text=Gạo+ST25",
                        quantity: 5,
                        unit: "kg",
                        unitPrice: 35000,
                        totalPrice: 175000
                    },
                    {
                        id: 2,
                        productId: "PROD005",
                        productName: "Nước mắm Phú Quốc",
                        productImage: "https://via.placeholder.com/100x100?text=Nước+Mắm",
                        quantity: 2,
                        unit: "chai",
                        unitPrice: 45000,
                        totalPrice: 90000
                    }
                ],
                subtotal: 265000,
                shippingFee: 0,
                discount: 15000,
                totalAmount: 250000,
                notes: "Khách tự đến lấy hàng",
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
                id: "ORD004",
                customerId: "CUST004",
                customerName: "Phạm Văn Đức",
                customerPhone: "0567891234",
                customerEmail: "duc@email.com",
                customerAddress: "321 Đường JKL, Phường 4, Quận Thốt Nốt, Cần Thơ",
                orderDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                requiredDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
                status: "shipping",
                paymentMethod: "banking",
                paymentStatus: "paid",
                deliveryMethod: "delivery",
                items: [
                    {
                        id: 1,
                        productId: "PROD006",
                        productName: "Cá tra fillet",
                        productImage: "https://via.placeholder.com/100x100?text=Cá+Tra",
                        quantity: 2,
                        unit: "kg",
                        unitPrice: 85000,
                        totalPrice: 170000
                    }
                ],
                subtotal: 170000,
                shippingFee: 25000,
                discount: 0,
                totalAmount: 195000,
                notes: "Gọi trước khi giao hàng",
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
                id: "ORD005",
                customerId: "CUST005",
                customerName: "Nguyễn Thị Mai",
                customerPhone: "0789123456",
                customerEmail: "mai@email.com",
                customerAddress: "654 Đường MNO, Phường 5, Quận Bình Thủy, Cần Thơ",
                orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                requiredDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                status: "delivered",
                paymentMethod: "cod",
                paymentStatus: "paid",
                deliveryMethod: "delivery",
                items: [
                    {
                        id: 1,
                        productId: "PROD007",
                        productName: "Xoài cát Hòa Lộc",
                        productImage: "https://via.placeholder.com/100x100?text=Xoài",
                        quantity: 3,
                        unit: "kg",
                        unitPrice: 60000,
                        totalPrice: 180000
                    }
                ],
                subtotal: 180000,
                shippingFee: 15000,
                discount: 20000,
                totalAmount: 175000,
                notes: "",
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    getMockOrderStats() {
        return {
            totalOrders: 45,
            pendingOrders: 8,
            confirmedOrders: 12,
            preparingOrders: 6,
            shippingOrders: 4,
            deliveredOrders: 15,
            totalRevenue: 2450000,
            averageOrderValue: 54444
        };
    }

    // Utility methods
    getStatusText(status) {
        const statusMap = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang chuẩn bị',
            'shipping': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    }

    getStatusColor(status) {
        const colorMap = {
            'pending': 'warning',
            'confirmed': 'info',
            'preparing': 'primary',
            'shipping': 'secondary',
            'delivered': 'success',
            'cancelled': 'danger'
        };
        return colorMap[status] || 'secondary';
    }

    getPaymentMethodText(method) {
        const methodMap = {
            'cod': 'Thanh toán khi nhận hàng',
            'banking': 'Chuyển khoản ngân hàng',
            'ewallet': 'Ví điện tử',
            'card': 'Thẻ tín dụng'
        };
        return methodMap[method] || method;
    }

    formatCurrency(amount) {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getTimeAgo(dateString) {
        if (!dateString) return 'N/A';

        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

        return this.formatDate(dateString);
    }
}

const orderService = new OrderService();
export default orderService;
