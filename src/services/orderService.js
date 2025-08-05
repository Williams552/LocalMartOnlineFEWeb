import apiService from './apiService';
import { API_ENDPOINTS } from '../config/apiEndpoints';

class OrderService {
    // Lấy danh sách đơn hàng của buyer
    async getBuyerOrders(buyerId, page = 1, pageSize = 20) {
        try {
            console.log('🔍 Fetching buyer orders for:', buyerId);
            const endpoint = `${API_ENDPOINTS.ORDER.GET_BUYER_ORDERS(buyerId)}?page=${page}&pageSize=${pageSize}`;
            const response = await apiService.get(endpoint);
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
            const response = await apiService.post(API_ENDPOINTS.ORDER.FILTER_ORDERS, filterData);
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

    // Hủy đơn hàng với lý do (POST /api/order/{orderId}/cancel)
    async cancelOrder(orderId, cancelReason) {
        try {
            console.log('🚫 Cancelling order:', orderId, 'Reason:', cancelReason);
            const response = await apiService.post(API_ENDPOINTS.ORDER.CANCEL(orderId), {
                cancelReason
            });

            return {
                success: true,
                data: response.data || response,
                message: 'Hủy đơn hàng thành công'
            };
        } catch (error) {
            console.error('❌ Error cancelling order:', error);
            
            // Fallback với mock response cho testing
            if (process.env.NODE_ENV === 'development') {
                console.warn('🔄 Using mock response for development');
                return {
                    success: true,
                    data: {
                        orderId: orderId,
                        status: 'Cancelled',
                        cancelReason: cancelReason,
                        updatedAt: new Date().toISOString()
                    },
                    message: 'Hủy đơn hàng thành công (Mock)'
                };
            }
            
            throw new Error(error.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    }

    // Đặt lại đơn hàng
    async reorderOrder(orderId) {
        try {
            const response = await apiService.post(API_ENDPOINTS.ORDER.REORDER(orderId));
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
            const response = await apiService.post(API_ENDPOINTS.ORDER.REVIEW(orderId), reviewData);
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
                    const sellerResponse = await apiService.get(API_ENDPOINTS.USER.GET_BY_ID(order.sellerId));
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
                        const productResponse = await apiService.get(API_ENDPOINTS.PRODUCT.GET_BY_ID(item.productId));
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
                    canReview: order.status === 'Completed' && !order.reviewed,
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
                canReview: order.status === 'Completed' && !order.reviewed,
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
                    status: "Completed",
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
                    status: "Paid",
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
                    status: "Confirmed",
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

            const url = API_ENDPOINTS.ORDER.GET_SELLER_ORDERS + (queryParams.toString() ? '?' + queryParams.toString() : '');
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
            const response = await apiService.get(API_ENDPOINTS.ORDER.GET_BY_ID(orderId));
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
            const response = await apiService.put(API_ENDPOINTS.ORDER.UPDATE_STATUS(orderId), {
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

    // Complete payment for order - DEPRECATED (use markOrderAsPaid instead)
    async completePayment(orderId) {
        console.warn('⚠️ completePayment is deprecated, use markOrderAsPaid instead');
        return this.markOrderAsPaid(orderId);
    }

    // Seller xác nhận còn hàng (POST /api/order/{orderId}/confirm)
    async confirmOrder(orderId) {
        try {
            console.log('✅ Confirming order:', orderId);
            const response = await apiService.post(API_ENDPOINTS.ORDER.CONFIRM(orderId));

            return {
                success: true,
                data: response.data || response,
                message: 'Xác nhận đơn hàng thành công'
            };
        } catch (error) {
            console.error('❌ Error confirming order:', error);
            console.error('❌ Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.response?.data?.message || error.message
            });
            
            // Check for specific error types
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền xác nhận đơn hàng này.');
            }
            
            if (error.response?.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
            
            if (error.response?.status === 404) {
                throw new Error('Không tìm thấy đơn hàng này.');
            }
            
            // Fallback với mock response cho testing (chỉ khi không phải lỗi authorization/validation)
            if (process.env.NODE_ENV === 'development' && !error.response?.status) {
                console.warn('🔄 Using mock response for development (network error)');
                return {
                    success: true,
                    data: {
                        orderId: orderId,
                        status: 'Confirmed',
                        confirmedAt: new Date().toISOString()
                    },
                    message: 'Xác nhận đơn hàng thành công (Mock)'
                };
            }
            
            throw new Error(error.response?.data?.message || 'Không thể xác nhận đơn hàng');
        }
    }

    // Seller xác nhận đã nhận tiền (POST /api/order/{orderId}/mark-paid)
    async markOrderAsPaid(orderId) {
        try {
            console.log('💰 Marking order as paid:', orderId);
            const response = await apiService.post(API_ENDPOINTS.ORDER.MARK_PAID(orderId));

            return {
                success: true,
                data: response.data || response,
                message: 'Xác nhận đã nhận tiền thành công'
            };
        } catch (error) {
            console.error('❌ Error marking order as paid:', error);
            console.error('❌ Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.response?.data?.message || error.message
            });
            
            // Check for specific error types
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền xác nhận thanh toán cho đơn hàng này.');
            }
            
            if (error.response?.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
            
            if (error.response?.status === 404) {
                throw new Error('Không tìm thấy đơn hàng này.');
            }
            
            // Fallback với mock response cho testing (chỉ khi không phải lỗi authorization/validation)
            if (process.env.NODE_ENV === 'development' && !error.response?.status) {
                console.warn('🔄 Using mock response for development (network error)');
                return {
                    success: true,
                    data: {
                        orderId: orderId,
                        paymentStatus: 'Paid',
                        paidAt: new Date().toISOString()
                    },
                    message: 'Xác nhận đã nhận tiền thành công (Mock)'
                };
            }
            
            throw new Error(error.response?.data?.message || 'Không thể xác nhận đã nhận tiền');
        }
    }

    // Buyer xác nhận đã nhận hàng (POST /api/order/{orderId}/complete)
    async completeOrderByBuyer(orderId) {
        try {
            console.log('📦 Buyer completing order:', orderId);
            
            // Get current user to include buyer ID for authorization
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const buyerId = user.id || user._id;
            const token = localStorage.getItem('token');
            
            console.log('👤 Current user info:', {
                userId: buyerId,
                userRole: user.role || user.userType,
                hasToken: !!token,
                tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
            });
            
            if (!buyerId) {
                throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            }
            
            console.log('📤 Sending complete order request...');
            const response = await apiService.post(API_ENDPOINTS.ORDER.COMPLETE(orderId));

            return {
                success: true,
                data: response.data || response,
                message: 'Xác nhận đã nhận hàng thành công'
            };
        } catch (error) {
            console.error('❌ Error completing order by buyer:', error);
            console.error('❌ Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.response?.data?.message || error.message
            });
            
            // Check if it's an authorization error
            if (error.response?.status === 403) {
                throw new Error('Bạn không có quyền hoàn thành đơn hàng này. Vui lòng kiểm tra lại thông tin đăng nhập.');
            }
            
            if (error.response?.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
            
            if (error.response?.status === 404) {
                throw new Error('Không tìm thấy đơn hàng này.');
            }
            
            if (error.response?.status === 400) {
                throw new Error(error.response?.data?.message || 'Yêu cầu không hợp lệ.');
            }
            
            // Fallback với mock response cho testing (chỉ khi không phải lỗi authorization/validation)
            if (process.env.NODE_ENV === 'development' && !error.response?.status) {
                console.warn('🔄 Using mock response for development (network error)');
                return {
                    success: true,
                    data: {
                        orderId: orderId,
                        status: 'Completed',
                        completedAt: new Date().toISOString()
                    },
                    message: 'Xác nhận đã nhận hàng thành công (Mock)'
                };
            }
            
            throw new Error(error.response?.data?.message || 'Không thể xác nhận đã nhận hàng');
        }
    }

    // Cancel order
    async cancelOrder(orderId, cancelReason) {
        try {
            console.log('🚫 Cancelling order:', orderId, 'Reason:', cancelReason);
            const response = await apiService.post(API_ENDPOINTS.ORDER.CANCEL(orderId), {
                cancelReason
            });

            return {
                success: true,
                data: response.data || response,
                message: 'Hủy đơn hàng thành công'
            };
        } catch (error) {
            console.error('❌ Error cancelling order:', error);
            
            // Fallback với mock response cho testing
            if (process.env.NODE_ENV === 'development') {
                console.warn('🔄 Using mock response for development');
                return {
                    success: true,
                    data: {
                        orderId: orderId,
                        status: 'Cancelled',
                        cancelReason: cancelReason,
                        updatedAt: new Date().toISOString()
                    },
                    message: 'Hủy đơn hàng thành công (Mock)'
                };
            }
            
            throw new Error(error.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    }

    // Get order statistics
    async getOrderStats(sellerId, period = 'month') {
        try {
            const endpoint = `${API_ENDPOINTS.ORDER.GET_ORDER_STATS(sellerId)}?period=${period}`;
            const response = await apiService.get(endpoint);
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
            const response = await apiService.post(API_ENDPOINTS.ORDER.COMPLETE(orderId));
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
            canReview: order.canReview !== undefined ? order.canReview : (order.status === 'Completed'),
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
            'Pending': 'Chờ xác nhận',        // Người mua mới đặt hàng
            'Confirmed': 'Đã xác nhận hàng',  // Người bán xác nhận còn hàng
            'Paid': 'Đã nhận tiền',           // Người bán xác nhận đã nhận được tiền
            'Completed': 'Hoàn thành',        // Người mua xác nhận đã nhận đúng hàng
            'Cancelled': 'Đã hủy',            // Đơn hàng bị hủy
            // Legacy support (lowercase)
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận hàng',
            'paid': 'Đã nhận tiền',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    }

    getStatusColor(status) {
        const colorMap = {
            'Pending': 'warning',     // Vàng - chờ xử lý
            'Confirmed': 'info',      // Xanh dương - đã xác nhận
            'Paid': 'primary',        // Xanh đậm - đã thanh toán
            'Completed': 'success',   // Xanh lá - hoàn thành
            'Cancelled': 'danger',    // Đỏ - đã hủy
            // Legacy support (lowercase)
            'pending': 'warning',
            'confirmed': 'info',
            'paid': 'primary',
            'completed': 'success',
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

            const response = await apiService.get(`${API_ENDPOINTS.ORDER.GET_ALL_ADMIN}?${queryParams}`);
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
            const response = await apiService.post(API_ENDPOINTS.ORDER.FILTER_ORDERS, filterData);
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

    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, status) {
        try {
            console.log('🔄 Updating order status:', { orderId, status });
            const response = await apiService.put(API_ENDPOINTS.ORDER.UPDATE_STATUS(orderId), { status });
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
            const response = await apiService.post(API_ENDPOINTS.ORDER.BULK_COMPLETE, { orderIds });
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
            const response = await apiService.post(API_ENDPOINTS.ORDER.BULK_CANCEL, { orderIds });
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

            // Lọc đơn hàng đã thanh toán (bao gồm Paid, Completed)
            const paidOrders = orders.filter(o => ['Paid', 'Completed'].includes(o.status));
            
            // Tính doanh thu theo thời gian
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Doanh thu hôm nay
            const todayRevenue = paidOrders
                .filter(o => {
                    const orderDate = new Date(o.createdAt);
                    return orderDate >= startOfToday;
                })
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            // Doanh thu tháng này
            const monthlyRevenue = paidOrders
                .filter(o => {
                    const orderDate = new Date(o.createdAt);
                    return orderDate >= startOfMonth;
                })
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            // Tổng doanh thu tất cả thời gian
            const totalRevenue = paidOrders
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            // Phân loại doanh thu theo loại phí (giả sử có thông tin về phí trong đơn hàng)
            const revenueBreakdown = {
                productRevenue: 0,      // Doanh thu từ sản phẩm
                shippingFee: 0,         // Phí vận chuyển
                serviceFee: 0,          // Phí dịch vụ
                platformFee: 0,         // Phí nền tảng
                other: 0                // Phí khác
            };

            // Tính phân loại doanh thu (tạm thời ước tính)
            paidOrders.forEach(order => {
                const orderAmount = order.totalAmount || 0;
                
                // Ước tính phân bổ (có thể thay đổi theo logic thực tế)
                revenueBreakdown.productRevenue += Math.round(orderAmount * 0.85); // 85% là tiền hàng
                revenueBreakdown.shippingFee += Math.round(orderAmount * 0.08);    // 8% phí ship
                revenueBreakdown.serviceFee += Math.round(orderAmount * 0.05);     // 5% phí dịch vụ
                revenueBreakdown.platformFee += Math.round(orderAmount * 0.02);    // 2% phí nền tảng
            });

            const stats = {
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => ['Pending', 'Confirmed', 'Preparing', 'Delivering'].includes(o.status)).length,
                completedOrders: orders.filter(o => o.status === 'Completed').length,
                cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
                paidOrders: paidOrders.length,
                
                // Doanh thu
                totalRevenue,
                monthlyRevenue,
                todayRevenue,
                averageOrderValue: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
                
                // Phân loại doanh thu
                revenueBreakdown,
                
                // Tỷ lệ
                completionRate: orders.length > 0 ? Math.round((orders.filter(o => o.status === 'Completed').length / orders.length) * 100) : 0,
                paymentRate: orders.length > 0 ? Math.round((paidOrders.length / orders.length) * 100) : 0
            };

            console.log('📊 Statistics calculated:', stats);

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
                    paidOrders: 110,
                    totalRevenue: 15600000,
                    monthlyRevenue: 8500000,
                    todayRevenue: 2850000,
                    averageOrderValue: 141818,
                    revenueBreakdown: {
                        productRevenue: 13260000,
                        shippingFee: 1248000,
                        serviceFee: 780000,
                        platformFee: 312000,
                        other: 0
                    },
                    completionRate: 63,
                    paymentRate: 71
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
                    status: 'Completed',
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

    // Đặt hàng từ giỏ hàng
    async placeOrdersFromCart(orderData) {
        try {
            console.log('🛒 Placing orders from cart:', orderData);
            
            // Validate dữ liệu đầu vào
            if (!orderData.buyerId) {
                throw new Error('Thiếu thông tin người mua');
            }
            
            if (!orderData.cartItems || orderData.cartItems.length === 0) {
                throw new Error('Giỏ hàng trống');
            }

            // Validate từng sản phẩm trong giỏ hàng
            for (const item of orderData.cartItems) {
                if (!item.quantity || item.quantity <= 0) {
                    throw new Error(`Số lượng sản phẩm "${item.product?.name || 'Unknown'}" phải lớn hơn 0`);
                }
                
                if (!item.product?.price || item.product.price <= 0) {
                    throw new Error(`Giá sản phẩm "${item.product?.name || 'Unknown'}" không hợp lệ`);
                }

                // Kiểm tra stock quantity
                if (item.product.stockQuantity > 0 && item.quantity > item.product.stockQuantity) {
                    throw new Error(`Sản phẩm "${item.product.name}" chỉ còn ${item.product.stockQuantity} ${item.product.unit} trong kho`);
                }

                // Kiểm tra minimum quantity
                if (item.product.minimumQuantity && item.quantity < item.product.minimumQuantity) {
                    throw new Error(`Số lượng tối thiểu cho "${item.product.name}" là ${item.product.minimumQuantity} ${item.product.unit}`);
                }
            }

            const response = await apiService.post(API_ENDPOINTS.ORDER.PLACE_FROM_CART, orderData);
            
            if (response.success) {
                console.log('✅ Orders placed successfully:', response.data);
                return {
                    success: true,
                    data: response.data,
                    message: response.message || `Đã tạo thành công ${response.data.orderCount} đơn hàng`
                };
            } else {
                throw new Error(response.message || 'Không thể đặt hàng');
            }
        } catch (error) {
            console.error('❌ Error placing orders from cart:', error);
            
            // Fallback với mock data cho testing
            if (process.env.NODE_ENV === 'development' && error.message.includes('Network Error')) {
                console.warn('🔄 Using mock response for development');
                return this.getMockPlaceOrderResponse(orderData);
            }
            
            throw new Error(error.message || 'Có lỗi xảy ra khi đặt hàng');
        }
    }

    // Mock response cho development
    getMockPlaceOrderResponse(orderData) {
        // Nhóm cart items theo store
        const groupedByStore = orderData.cartItems.reduce((acc, item) => {
            const storeId = item.product.storeId || 'store_1';
            const storeName = item.product.storeName || 'Unknown Store';
            
            if (!acc[storeId]) {
                acc[storeId] = {
                    storeId,
                    storeName,
                    items: [],
                    totalAmount: 0
                };
            }
            
            acc[storeId].items.push(item);
            acc[storeId].totalAmount += item.product.price * item.quantity;
            
            return acc;
        }, {});

        const stores = Object.values(groupedByStore);
        const totalAmount = stores.reduce((sum, store) => sum + store.totalAmount, 0);
        
        const mockOrders = stores.map((store, index) => ({
            id: `mock_order_${Date.now()}_${index}`,
            buyerId: orderData.buyerId,
            sellerId: `seller_${store.storeId}`,
            storeName: store.storeName,
            totalAmount: store.totalAmount,
            status: 'Pending',
            paymentStatus: 'Pending',
            notes: orderData.notes || '',
            createdAt: new Date().toISOString(),
            items: store.items.map(item => ({
                productId: item.productId,
                productName: item.product.name,
                productImageUrl: item.product.images?.split(',')[0] || '',
                productUnitName: item.product.unit,
                quantity: item.quantity,
                priceAtPurchase: item.product.price
            }))
        }));

        return {
            success: true,
            message: `Đã tạo thành công ${stores.length} đơn hàng từ ${stores.length} cửa hàng khác nhau (Mock)`,
            data: {
                orderCount: stores.length,
                totalAmount: totalAmount,
                orders: mockOrders
            }
        };
    }
}

const orderService = new OrderService();
export default orderService;
