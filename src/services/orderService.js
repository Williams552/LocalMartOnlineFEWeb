import apiService from './apiService';

class OrderService {
    // Lấy danh sách đơn hàng của buyer
    async getBuyerOrders(buyerId, page = 1, pageSize = 20) {
        try {
            console.log('🔍 Fetching buyer orders for:', buyerId);
            const response = await apiService.get(`/api/Order/buyer/${buyerId}?page=${page}&pageSize=${pageSize}`);
            console.log('📋 Raw response:', response);

            // Backend trả về {success: true, data: PagedResult}
            const responseData = response.data || response;
            const ordersData = responseData.data || responseData.items || responseData;

            console.log('📦 Orders data structure:', ordersData);

            // Enrich data for display
            let enrichedData = ordersData;
            if (Array.isArray(ordersData)) {
                // If direct array
                enrichedData = await this.enrichOrderData(ordersData);
            } else if (ordersData.items) {
                // If paginated result
                enrichedData = {
                    ...ordersData,
                    items: await this.enrichOrderData(ordersData.items)
                };
            }

            return {
                success: true,
                data: enrichedData,
                message: 'Lấy danh sách đơn hàng thành công'
            };
        } catch (error) {
            console.error('❌ Error getting buyer orders:', error);

            // Fallback với mock data cho testing
            if (process.env.NODE_ENV === 'development') {
                console.warn('🔄 Using mock data for development');
                return {
                    success: true,
                    data: this.getMockBuyerOrders(),
                    message: 'Sử dụng dữ liệu mẫu - API chưa sẵn sàng'
                };
            }

            throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đơn hàng');
        }
    }

    // Lọc đơn hàng của buyer
    async filterBuyerOrders(filterData) {
        try {
            console.log('🔍 Filtering buyer orders with:', filterData);
            const response = await apiService.post('/api/Order/filter', filterData);
            console.log('📋 Filter response:', response);

            // Backend trả về {success: true, data: PagedResult}
            const responseData = response.data || response;
            const ordersData = responseData.data || responseData.items || responseData;

            // Enrich data for display
            let enrichedData = ordersData;
            if (Array.isArray(ordersData)) {
                enrichedData = await this.enrichOrderData(ordersData);
            } else if (ordersData.items) {
                enrichedData = {
                    ...ordersData,
                    items: await this.enrichOrderData(ordersData.items)
                };
            }

            return {
                success: true,
                data: enrichedData,
                message: 'Lọc đơn hàng thành công'
            };
        } catch (error) {
            console.error('❌ Error filtering buyer orders:', error);

            // Fallback với mock data cho testing
            if (process.env.NODE_ENV === 'development') {
                console.warn('🔄 Using mock data for development');
                return {
                    success: true,
                    data: this.getMockBuyerOrders(),
                    message: 'Sử dụng dữ liệu mẫu - API chưa sẵn sàng'
                };
            }

            throw new Error(error.response?.data?.message || 'Không thể lọc đơn hàng');
        }
    }

    // Hủy đơn hàng
    async cancelOrder(orderId) {
        try {
            // Backend có thể có endpoint khác để hủy đơn hàng
            const response = await apiService.put(`/api/Order/${orderId}/cancel`);
            return {
                success: true,
                data: response.data || response,
                message: 'Hủy đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error canceling order:', error);
            throw new Error(error.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    }

    // Đặt lại đơn hàng
    async reorderOrder(orderId) {
        try {
            const response = await apiService.post(`/api/Order/${orderId}/reorder`);
            return {
                success: true,
                data: response.data || response,
                message: 'Đặt lại đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error reordering:', error);
            throw new Error(error.response?.data?.message || 'Không thể đặt lại đơn hàng');
        }
    }

    // Đánh giá đơn hàng
    async reviewOrder(orderId, reviewData) {
        try {
            const response = await apiService.post(`/api/Order/${orderId}/review`, reviewData);
            return {
                success: true,
                data: response.data || response,
                message: 'Đánh giá thành công'
            };
        } catch (error) {
            console.error('Error reviewing order:', error);
            throw new Error(error.response?.data?.message || 'Không thể gửi đánh giá');
        }
    }

    // Enrich order data với thông tin sản phẩm và cửa hàng
    async enrichOrderData(orders) {
        if (!orders || orders.length === 0) return orders;

        try {
            console.log('🔍 Enriching order data for', orders.length, 'orders');

            const enrichedOrders = await Promise.all(orders.map(async (order) => {
                // Lấy thông tin seller
                let sellerInfo = {};
                try {
                    console.log('👤 Fetching seller info for:', order.sellerId);
                    const sellerResponse = await apiService.get(`/api/User/${order.sellerId}`);
                    console.log('👤 Seller response:', sellerResponse);

                    // Backend trả về {success: true, data: UserDTO}
                    const sellerData = sellerResponse.data || sellerResponse;
                    const seller = sellerData.data || sellerData;

                    sellerInfo = {
                        sellerName: seller?.fullName || seller?.username || seller?.name || `Cửa hàng`,
                        sellerAvatar: seller?.avatar || seller?.profilePicture || `https://i.pravatar.cc/50?u=${order.sellerId}`
                    };
                    console.log('✅ Seller info loaded:', sellerInfo.sellerName);
                } catch (error) {
                    console.warn('⚠️ Could not fetch seller info for', order.sellerId, error.message);
                    sellerInfo = {
                        sellerName: `Cửa hàng ${order.sellerId.slice(-4)}`,
                        sellerAvatar: `https://i.pravatar.cc/50?u=${order.sellerId}`
                    };
                }

                // Enrich items với thông tin sản phẩm
                const enrichedItems = await Promise.all(order.items.map(async (item) => {
                    try {
                        console.log('📦 Fetching product info for:', item.productId);
                        const productResponse = await apiService.get(`/api/Product/${item.productId}`);
                        console.log('📦 Product response:', productResponse);

                        // Backend trả về {success: true, data: ProductDto}
                        const productData = productResponse.data || productResponse;
                        const product = productData.data || productData;

                        const enrichedItem = {
                            ...item,
                            name: product?.name || product?.productName || `Sản phẩm ${item.productId}`,
                            unit: product?.unit || product?.unitType || '',
                            total: item.quantity * item.priceAtPurchase
                        };
                        console.log('✅ Product info loaded:', enrichedItem.name);
                        return enrichedItem;
                    } catch (error) {
                        console.warn('⚠️ Could not fetch product info for', item.productId, error.message);
                        return {
                            ...item,
                            name: `Sản phẩm ${item.productId}`,
                            unit: '',
                            total: item.quantity * item.priceAtPurchase
                        };
                    }
                }));

                const enrichedOrder = {
                    ...order,
                    ...sellerInfo,
                    items: enrichedItems,
                    canReview: order.status === 'delivered' && !order.reviewed,
                    reviewed: order.reviewed || false
                };

                console.log('🎯 Enriched order:', enrichedOrder.id, 'with', enrichedItems.length, 'items');
                return enrichedOrder;
            }));

            console.log('✨ All orders enriched successfully');
            return enrichedOrders;
        } catch (error) {
            console.error('❌ Error enriching order data:', error);
            // Return original orders with fallback data if enrichment fails
            return orders.map(order => ({
                ...order,
                sellerName: `Cửa hàng ${order.sellerId.slice(-4)}`,
                sellerAvatar: `https://i.pravatar.cc/50?u=${order.sellerId}`,
                items: order.items.map(item => ({
                    ...item,
                    name: `Sản phẩm ${item.productId}`,
                    unit: '',
                    total: item.quantity * item.priceAtPurchase
                })),
                canReview: order.status === 'delivered' && !order.reviewed,
                reviewed: order.reviewed || false
            }));
        }
    }    // Mock data cho buyer orders
    getMockBuyerOrders() {
        return {
            items: [
                {
                    id: "DH001",
                    buyerId: "buyer1",
                    sellerId: "seller1",
                    totalAmount: 82500,
                    deliveryAddress: "123 Đường ABC, Quận Ninh Kiều, Cần Thơ",
                    status: "delivered",
                    paymentStatus: "paid",
                    notes: "Giao hàng sớm nhé shop",
                    createdAt: "2024-01-15T08:30:00",
                    updatedAt: "2024-01-15T10:30:00",
                    expectedDeliveryTime: "2024-01-15T16:00:00",
                    items: [
                        {
                            productId: "1",
                            quantity: 2,
                            priceAtPurchase: 15000,
                            name: "Rau muống",
                            unit: "kg",
                            total: 30000
                        },
                        {
                            productId: "2",
                            quantity: 1.5,
                            priceAtPurchase: 25000,
                            name: "Cà chua",
                            unit: "kg",
                            total: 37500
                        }
                    ],
                    // Extended properties for display
                    sellerName: "Gian hàng Cô Lan",
                    sellerAvatar: "https://i.pravatar.cc/50?img=1",
                    canReview: true,
                    reviewed: false
                },
                {
                    id: "DH002",
                    buyerId: "buyer1",
                    sellerId: "seller2",
                    totalAmount: 35000,
                    deliveryAddress: "456 Đường XYZ, Quận Cái Răng, Cần Thơ",
                    status: "shipping",
                    paymentStatus: "paid",
                    notes: "",
                    createdAt: "2024-01-16T14:20:00",
                    updatedAt: "2024-01-16T15:20:00",
                    expectedDeliveryTime: "2024-01-16T18:00:00",
                    items: [
                        {
                            productId: "3",
                            quantity: 1,
                            priceAtPurchase: 20000,
                            name: "Xà lách",
                            unit: "kg",
                            total: 20000
                        }
                    ],
                    sellerName: "Cửa hàng Anh Minh",
                    sellerAvatar: "https://i.pravatar.cc/50?img=2",
                    canReview: false,
                    reviewed: false
                },
                {
                    id: "DH003",
                    buyerId: "buyer1",
                    sellerId: "seller3",
                    totalAmount: 57000,
                    deliveryAddress: "789 Đường DEF, Quận Ô Môn, Cần Thơ",
                    status: "confirmed",
                    paymentStatus: "pending",
                    notes: "Gọi trước khi giao",
                    createdAt: "2024-01-17T09:15:00",
                    updatedAt: "2024-01-17T09:15:00",
                    expectedDeliveryTime: "2024-01-17T17:00:00",
                    items: [
                        {
                            productId: "4",
                            quantity: 2,
                            priceAtPurchase: 12000,
                            name: "Bắp cải",
                            unit: "kg",
                            total: 24000
                        },
                        {
                            productId: "5",
                            quantity: 1,
                            priceAtPurchase: 18000,
                            name: "Cải thảo",
                            unit: "kg",
                            total: 18000
                        }
                    ],
                    sellerName: "Gian hàng Chú Tám",
                    sellerAvatar: "https://i.pravatar.cc/50?img=3",
                    canReview: false,
                    reviewed: false
                }
            ],
            totalCount: 3,
            currentPage: 1,
            pageSize: 20,
            totalPages: 1
        };
    }
    // Get orders for seller (existing endpoint)
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

            // Always return data as array for FE compatibility
            const apiData = response.data || response || {};
            return {
                success: true,
                data: {
                    ...apiData,
                    items: Array.isArray(apiData.items) ? apiData.items : (Array.isArray(apiData) ? apiData : [])
                },
                message: 'Lấy danh sách đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error getting seller orders:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đơn hàng');
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
            const response = await apiService.get(`/api/Order/${orderId}`);
            return {
                success: true,
                data: response.data || response,
                message: 'Lấy thông tin đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error getting order:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy thông tin đơn hàng');
        }
    }

    // Update order status
    async updateOrderStatus(orderId, status, notes = '') {
        try {
            const response = await apiService.put(`/api/Order/${orderId}/status`, {
                status,
                notes
            });

            return {
                success: true,
                data: response.data || response,
                message: 'Cập nhật trạng thái đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error updating order status:', error);
            throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
        }
    }

    // Get order statistics
    async getOrderStats(sellerId, period = 'month') {
        try {
            const response = await apiService.get(`/api/Order/seller/${sellerId}/stats?period=${period}`);
            return {
                success: true,
                data: response.data || response,
                message: 'Lấy thống kê đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error getting order stats:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy thống kê đơn hàng');
        }
    }

    // Complete order (for seller)
    async completeOrder(orderId) {
        try {
            const response = await apiService.post(`/api/Order/${orderId}/complete`);
            return {
                success: true,
                data: response.data || response,
                message: 'Hoàn thành đơn hàng thành công'
            };
        } catch (error) {
            console.error('Error completing order:', error);
            throw new Error(error.response?.data?.message || 'Không thể hoàn thành đơn hàng');
        }
    }

    // Enrich order data with additional information for display
    async enrichOrderData(orders) {
        if (!Array.isArray(orders)) return orders;

        return orders.map(order => ({
            ...order,
            // Add display properties if not present
            sellerName: order.sellerName || order.seller?.name || 'Cửa hàng',
            sellerAvatar: order.sellerAvatar || order.seller?.avatar || 'https://i.pravatar.cc/50?img=1',
            canReview: order.canReview !== undefined ? order.canReview : (order.status === 'delivered'),
            reviewed: order.reviewed || false,
            items: (order.items || []).map(item => ({
                ...item,
                name: item.name || item.productName || `Sản phẩm ${item.productId}`,
                unit: item.unit || '',
                total: item.total || (item.quantity * item.priceAtPurchase)
            }))
        }));
    }

    // Utility methods for UI display
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

    // Admin Methods
    // Lấy tất cả đơn hàng (Admin)
    async getAllOrders(page = 1, pageSize = 20, filters = {}) {
        try {
            console.log('🔍 Fetching all orders (Admin):', { page, pageSize, filters });

            // Xây dựng query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            const response = await apiService.get(`/api/Order/admin/orders?${queryParams}`);
            console.log('📋 Admin orders response:', response);

            const responseData = response.data || response;
            const ordersData = responseData.data || responseData.items || responseData;

            // Enrich data for display
            let enrichedData = ordersData;
            if (Array.isArray(ordersData)) {
                enrichedData = await this.enrichOrderData(ordersData);
            } else if (ordersData.items) {
                enrichedData = {
                    ...ordersData,
                    items: await this.enrichOrderData(ordersData.items)
                };
            }

            return {
                success: true,
                data: enrichedData,
                message: 'Lấy danh sách đơn hàng thành công'
            };
        } catch (error) {
            console.error('❌ Error getting all orders:', error);

            // Fallback với mock data cho testing
            if (process.env.NODE_ENV === 'development') {
                console.warn('🔄 Using mock data for development');
                return {
                    success: true,
                    data: this.getMockAdminOrders(),
                    message: 'Sử dụng dữ liệu mẫu - API chưa sẵn sàng'
                };
            }

            throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đơn hàng');
        }
    }

    // Lọc đơn hàng (Admin)
    async filterAllOrders(filterData) {
        try {
            console.log('🔍 Filtering all orders (Admin):', filterData);
            const response = await apiService.post('/api/Order/filter', filterData);
            console.log('📋 Admin filter response:', response);

            const responseData = response.data || response;
            const ordersData = responseData.data || responseData.items || responseData;

            // Enrich data for display
            let enrichedData = ordersData;
            if (Array.isArray(ordersData)) {
                enrichedData = await this.enrichOrderData(ordersData);
            } else if (ordersData.items) {
                enrichedData = {
                    ...ordersData,
                    items: await this.enrichOrderData(ordersData.items)
                };
            }

            return {
                success: true,
                data: enrichedData,
                message: 'Lọc đơn hàng thành công'
            };
        } catch (error) {
            console.error('❌ Error filtering all orders:', error);

            // Fallback với mock data cho testing
            if (process.env.NODE_ENV === 'development') {
                console.warn('🔄 Using mock data for development');
                return {
                    success: true,
                    data: this.getMockAdminOrders(),
                    message: 'Sử dụng dữ liệu mẫu - API chưa sẵn sàng'
                };
            }

            throw new Error(error.response?.data?.message || 'Không thể lọc đơn hàng');
        }
    }

    // Hủy đơn hàng (Admin/Seller)
    async cancelOrder(orderId) {
        try {
            console.log('❌ Cancelling order:', orderId);
            const response = await apiService.put(`/api/Order/${orderId}/cancel`);
            console.log('❌ Cancel order response:', response);

            return {
                success: true,
                data: response.data,
                message: 'Đơn hàng đã được hủy'
            };
        } catch (error) {
            console.error('❌ Error cancelling order:', error);
            throw new Error(error.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    }

    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, status) {
        try {
            console.log('🔄 Updating order status:', { orderId, status });
            const response = await apiService.put(`/api/Order/${orderId}/status`, { status });
            console.log('🔄 Update status response:', response);

            return {
                success: true,
                data: response.data,
                message: 'Cập nhật trạng thái thành công'
            };
        } catch (error) {
            console.error('❌ Error updating order status:', error);
            throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    }

    // Xử lý hàng loạt - Hoàn thành nhiều đơn hàng
    async bulkCompleteOrders(orderIds) {
        try {
            console.log('✅ Bulk completing orders:', orderIds);
            const response = await apiService.post('/api/Order/bulk/complete', { orderIds });
            console.log('✅ Bulk complete response:', response);

            return {
                success: true,
                data: response.data,
                message: `Đã hoàn thành ${orderIds.length} đơn hàng`
            };
        } catch (error) {
            console.error('❌ Error bulk completing orders:', error);
            throw new Error(error.response?.data?.message || 'Không thể hoàn thành hàng loạt');
        }
    }

    // Xử lý hàng loạt - Hủy nhiều đơn hàng
    async bulkCancelOrders(orderIds) {
        try {
            console.log('❌ Bulk cancelling orders:', orderIds);
            const response = await apiService.post('/api/Order/bulk/cancel', { orderIds });
            console.log('❌ Bulk cancel response:', response);

            return {
                success: true,
                data: response.data,
                message: `Đã hủy ${orderIds.length} đơn hàng`
            };
        } catch (error) {
            console.error('❌ Error bulk cancelling orders:', error);
            throw new Error(error.response?.data?.message || 'Không thể hủy hàng loạt');
        }
    }

    // Thống kê đơn hàng (Admin)
    async getOrderStatistics() {
        try {
            console.log('📊 Fetching order statistics');

            // Vì backend có thể chưa có endpoint thống kê, ta tính từ dữ liệu hiện có
            const allOrdersResponse = await this.getAllOrders(1, 1000); // Lấy nhiều để tính toán
            const orders = allOrdersResponse.data.items || allOrdersResponse.data || [];

            const stats = {
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => ['Pending', 'Preparing'].includes(o.status)).length,
                completedOrders: orders.filter(o => o.status === 'Completed').length,
                cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
                totalRevenue: orders
                    .filter(o => o.status === 'Completed')
                    .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
                todayRevenue: orders
                    .filter(o => {
                        const today = new Date().toDateString();
                        const orderDate = new Date(o.createdAt).toDateString();
                        return orderDate === today && o.status === 'Completed';
                    })
                    .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            };

            return {
                success: true,
                data: stats,
                message: 'Lấy thống kê thành công'
            };
        } catch (error) {
            console.error('❌ Error getting order statistics:', error);

            // Fallback với mock stats
            return {
                success: true,
                data: {
                    totalOrders: 156,
                    pendingOrders: 23,
                    completedOrders: 98,
                    cancelledOrders: 12,
                    totalRevenue: 15600000,
                    todayRevenue: 2850000
                },
                message: 'Sử dụng dữ liệu thống kê mẫu'
            };
        }
    }

    // Mock data cho Admin
    getMockAdminOrders() {
        return {
            items: [
                {
                    id: '1',
                    buyerId: 'buyer1',
                    sellerId: 'seller1',
                    buyerName: 'Nguyễn Văn A',
                    buyerPhone: '0912345678',
                    sellerName: 'Cửa hàng ABC',
                    totalAmount: 250000,
                    deliveryAddress: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
                    status: 'Processing',
                    paymentStatus: 'Paid',
                    createdAt: '2024-01-15T10:30:00Z',
                    updatedAt: '2024-01-15T11:00:00Z',
                    items: [
                        {
                            productId: 'prod1',
                            productName: 'Cà chua',
                            productImageUrl: '/images/tomato.jpg',
                            productUnitName: 'kg',
                            quantity: 2,
                            priceAtPurchase: 25000
                        },
                        {
                            productId: 'prod2',
                            productName: 'Cà rốt',
                            productImageUrl: '/images/carrot.jpg',
                            productUnitName: 'kg',
                            quantity: 1,
                            priceAtPurchase: 30000
                        }
                    ]
                },
                {
                    id: '2',
                    buyerId: 'buyer2',
                    sellerId: 'seller2',
                    buyerName: 'Trần Thị B',
                    buyerPhone: '0987654321',
                    sellerName: 'Cửa hàng XYZ',
                    totalAmount: 180000,
                    deliveryAddress: '456 Lê Văn Việt, Quận 9, TP.HCM',
                    status: 'Delivered',
                    paymentStatus: 'Paid',
                    createdAt: '2024-01-14T14:20:00Z',
                    updatedAt: '2024-01-15T09:15:00Z',
                    items: [
                        {
                            productId: 'prod3',
                            productName: 'Thịt bò',
                            productImageUrl: '/images/beef.jpg',
                            productUnitName: 'kg',
                            quantity: 1,
                            priceAtPurchase: 180000
                        }
                    ]
                },
                {
                    id: '3',
                    buyerId: 'buyer3',
                    sellerId: 'seller1',
                    buyerName: 'Lê Văn C',
                    buyerPhone: '0345678901',
                    sellerName: 'Cửa hàng ABC',
                    totalAmount: 95000,
                    deliveryAddress: '789 Võ Văn Tần, Quận 3, TP.HCM',
                    status: 'Pending',
                    paymentStatus: 'Pending',
                    createdAt: '2024-01-15T16:45:00Z',
                    updatedAt: '2024-01-15T16:45:00Z',
                    items: [
                        {
                            productId: 'prod4',
                            productName: 'Rau muống',
                            productImageUrl: '/images/spinach.jpg',
                            productUnitName: 'bó',
                            quantity: 5,
                            priceAtPurchase: 8000
                        },
                        {
                            productId: 'prod5',
                            productName: 'Cải ngọt',
                            productImageUrl: '/images/cabbage.jpg',
                            productUnitName: 'bó',
                            quantity: 7,
                            priceAtPurchase: 5000
                        }
                    ]
                }
            ],
            totalCount: 156,
            page: 1,
            pageSize: 20,
            totalPages: 8,
            hasPrevious: false,
            hasNext: true
        };
    }
}

const orderService = new OrderService();
export default orderService;
