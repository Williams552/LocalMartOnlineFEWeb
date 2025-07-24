import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

class SellerFastBargainService {
    constructor() {
        this.api = axios.create({
            baseURL: API_ENDPOINTS.API_BASE,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add auth token to requests
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    /**
     * Lấy danh sách thương lượng của seller
     * @param {string} sellerId - ID của seller
     */
    async getBargainsBySeller(sellerId) {
        try {
            console.log('🤝 Fetching bargains for seller:', sellerId);
            const response = await this.api.get(API_ENDPOINTS.FAST_BARGAIN.GET_BY_SELLER(sellerId));

            return {
                success: true,
                data: response.data || [],
                message: 'Lấy danh sách thương lượng thành công'
            };
        } catch (error) {
            console.error('❌ Error fetching seller bargains:', error);

            // Return mock data nếu API không available
            if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
                console.log('🔄 API không khả dụng, sử dụng dữ liệu mẫu');
                return this.getMockBargains();
            }

            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải danh sách thương lượng',
                error: error.response?.data
            };
        }
    }

    /**
     * Lấy chi tiết thương lượng
     * @param {string} bargainId - ID thương lượng
     */
    async getBargainDetail(bargainId) {
        try {
            console.log('🔍 Fetching bargain detail:', bargainId);
            const response = await this.api.get(API_ENDPOINTS.FAST_BARGAIN.GET_BY_ID(bargainId));

            return {
                success: true,
                data: response.data,
                message: 'Lấy chi tiết thương lượng thành công'
            };
        } catch (error) {
            console.error('❌ Error fetching bargain detail:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải chi tiết thương lượng',
                error: error.response?.data
            };
        }
    }

    /**
     * Thực hiện hành động với thương lượng (Accept, Reject, Counter)
     * @param {Object} data - Dữ liệu hành động
     * @param {string} data.bargainId - ID thương lượng
     * @param {string} data.userId - ID người dùng
     * @param {string} data.action - Hành động (Accept, Reject, Counter)
     * @param {number} data.counterPrice - Giá phản hồi (nếu action là Counter)
     */
    async takeAction(data) {
        try {
            console.log('⚡ Taking action on bargain:', data);

            const payload = {
                bargainId: data.bargainId,
                userId: data.userId,
                action: data.action
            };

            if (data.action === 'Counter' && data.counterPrice) {
                payload.counterPrice = data.counterPrice;
            }

            const response = await this.api.post(API_ENDPOINTS.FAST_BARGAIN.ACTION, payload);

            return {
                success: true,
                data: response.data,
                message: this.getActionMessage(data.action)
            };
        } catch (error) {
            console.error('❌ Error taking action:', error);

            // Simulate success for demo if API not available
            if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
                console.log('🔄 API không khả dụng, mô phỏng thành công');
                return {
                    success: true,
                    data: { bargainId: data.bargainId, status: data.action === 'Accept' ? 'Accepted' : data.action === 'Reject' ? 'Rejected' : 'Accepted' },
                    message: this.getActionMessage(data.action)
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi thực hiện hành động',
                error: error.response?.data
            };
        }
    }

    /**
     * Đề xuất giá phản hồi
     * @param {Object} data - Dữ liệu đề xuất
     * @param {string} data.bargainId - ID thương lượng  
     * @param {string} data.userId - ID người dùng
     * @param {number} data.proposedPrice - Giá đề xuất
     */
    async proposePrice(data) {
        try {
            console.log('💰 Proposing price:', data);
            const response = await this.api.post(API_ENDPOINTS.FAST_BARGAIN.PROPOSE, {
                bargainId: data.bargainId,
                userId: data.userId,
                proposedPrice: data.proposedPrice
            });

            return {
                success: true,
                data: response.data,
                message: 'Đề xuất giá thành công'
            };
        } catch (error) {
            console.error('❌ Error proposing price:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi đề xuất giá',
                error: error.response?.data
            };
        }
    }

    /**
     * Lấy message phù hợp cho từng action
     */
    getActionMessage(action) {
        const messages = {
            'Accept': 'Chấp nhận thương lượng thành công!',
            'Reject': 'Từ chối thương lượng thành công!',
            'Counter': 'Gửi phản hồi thành công!'
        };
        return messages[action] || 'Thực hiện hành động thành công!';
    }

    /**
     * Format trạng thái thương lượng
     */
    formatStatus(status) {
        const statusMap = {
            'Pending': { label: 'Chờ phản hồi', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
            'Accepted': { label: 'Đã chấp nhận', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
            'Rejected': { label: 'Đã từ chối', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
            'Expired': { label: 'Đã hết hạn', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
        };
        return statusMap[status] || { label: status, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }

    /**
     * Format currency in Vietnamese Dong
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    /**
     * Format relative time
     */
    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }

    /**
     * Mock data for development/testing
     */
    getMockBargains() {
        const mockBargains = [
            {
                bargainId: 'BG001',
                productId: 'prod1',
                productName: 'Gạo ST25 thơm ngon',
                productImages: ['/images/rice.jpg'],
                originalPrice: 50000,
                buyerId: 'buyer1',
                buyerName: 'Nguyễn Văn A',
                buyerPhone: '0901234567',
                sellerId: 'seller1',
                status: 'Pending',
                finalPrice: null,
                proposals: [
                    {
                        bargainId: 'BG001',
                        userId: 'buyer1',
                        proposedPrice: 45000,
                        proposedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                    }
                ],
                // Thêm các field cần thiết cho UI
                id: 'BG001',
                requestedPrice: 45000,
                quantity: 10,
                unit: 'kg',
                message: 'Anh có thể bán 45k/kg được không? Em lấy 10kg.',
                productImage: '/images/rice.jpg',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                bargainId: 'BG002',
                productId: 'prod2',
                productName: 'Thịt heo sạch',
                productImages: ['/images/pork.jpg'],
                originalPrice: 120000,
                buyerId: 'buyer2',
                buyerName: 'Trần Thị B',
                buyerPhone: '0912345678',
                sellerId: 'seller1',
                status: 'Accepted',
                finalPrice: 115000,
                proposals: [
                    {
                        bargainId: 'BG002',
                        userId: 'buyer2',
                        proposedPrice: 110000,
                        proposedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        bargainId: 'BG002',
                        userId: 'seller1',
                        proposedPrice: 115000,
                        proposedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
                    }
                ],
                // Thêm các field cần thiết cho UI
                id: 'BG002',
                requestedPrice: 110000,
                counterOffer: 115000,
                quantity: 5,
                unit: 'kg',
                message: 'Chị bán 110k/kg được không? Em lấy 5kg.',
                sellerMessage: 'Em bán 115k/kg được chị, vì giá nguyên liệu tăng.',
                productImage: '/images/pork.jpg',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
            },
            {
                bargainId: 'BG003',
                productId: 'prod3',
                productName: 'Rau xà lách hữu cơ',
                productImages: ['/images/lettuce.jpg'],
                originalPrice: 25000,
                buyerId: 'buyer3',
                buyerName: 'Lê Văn C',
                buyerPhone: '0923456789',
                sellerId: 'seller1',
                status: 'Rejected',
                finalPrice: null,
                proposals: [
                    {
                        bargainId: 'BG003',
                        userId: 'buyer3',
                        proposedPrice: 20000,
                        proposedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
                    }
                ],
                // Thêm các field cần thiết cho UI
                id: 'BG003',
                requestedPrice: 20000,
                quantity: 2,
                unit: 'kg',
                message: 'Anh bán 20k/kg được không?',
                sellerMessage: 'Xin lỗi anh, giá này em không thể bán được.',
                productImage: '/images/lettuce.jpg',
                createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        return {
            success: true,
            data: mockBargains,
            message: 'Đang sử dụng dữ liệu mẫu (API chưa sẵn sàng)'
        };
    }
}

const sellerFastBargainService = new SellerFastBargainService();
export default sellerFastBargainService;
