import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5183';

class FastBargainService {
    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
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
     * Bắt đầu thương lượng mua hộ nhanh
     * @param {Object} data - Dữ liệu thương lượng
     * @param {string} data.productId - ID sản phẩm
     * @param {string} data.buyerId - ID người mua
     * @param {number} data.quantity - Số lượng
     * @param {number} data.initialOfferPrice - Giá đề xuất ban đầu
     */
    async startBargain(data) {
        try {
            const response = await this.api.post('/api/fastbargain/start', {
                productId: data.productId,
                buyerId: data.buyerId,
                quantity: data.quantity,
                initialOfferPrice: data.initialOfferPrice
            });

            return {
                success: true,
                data: response.data,
                message: 'Bắt đầu thương lượng thành công'
            };
        } catch (error) {
            console.error('Start bargain error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi bắt đầu thương lượng',
                error: error.response?.data
            };
        }
    }

    /**
     * Đề xuất giá mới
     * @param {Object} data - Dữ liệu đề xuất
     * @param {string} data.bargainId - ID thương lượng
     * @param {string} data.userId - ID người dùng
     * @param {number} data.proposedPrice - Giá đề xuất
     */
    async proposePrice(data) {
        try {
            const response = await this.api.post('/api/fastbargain/propose', {
                bargainId: data.bargainId,
                userId: data.userId,
                proposedPrice: data.proposedPrice,
                proposedAt: new Date().toISOString()
            });

            return {
                success: true,
                data: response.data,
                message: 'Đề xuất giá thành công'
            };
        } catch (error) {
            console.error('Propose price error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi đề xuất giá',
                error: error.response?.data
            };
        }
    }

    /**
     * Thực hiện hành động (Accept, Reject, Counter)
     * @param {Object} data - Dữ liệu hành động
     * @param {string} data.bargainId - ID thương lượng
     * @param {string} data.userId - ID người dùng
     * @param {string} data.action - Hành động (Accept, Reject, Counter)
     * @param {number} [data.counterPrice] - Giá phản đề xuất (nếu action = Counter)
     */
    async takeAction(data) {
        try {
            const payload = {
                bargainId: data.bargainId,
                userId: data.userId,
                action: data.action
            };

            if (data.action === 'Counter' && data.counterPrice) {
                payload.counterPrice = data.counterPrice;
            }

            const response = await this.api.post('/api/fastbargain/action', payload);

            return {
                success: true,
                data: response.data,
                message: this.getActionMessage(data.action)
            };
        } catch (error) {
            console.error('Take action error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi thực hiện hành động',
                error: error.response?.data
            };
        }
    }

    /**
     * Lấy thông tin thương lượng theo ID
     * @param {string} bargainId - ID thương lượng
     */
    async getBargainById(bargainId) {
        try {
            console.log('Getting bargain by ID:', bargainId);
            const response = await this.api.get(`/api/FastBargain/${bargainId}`);
            console.log('Bargain response:', response.data);

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get bargain error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thông tin thương lượng',
                error: error.response?.data
            };
        }
    }

    /**
     * Lấy lịch sử thương lượng của người dùng
     * @param {string} userId - ID người dùng
     */
    async getBargainHistory(userId) {
        try {
            console.log('Getting bargain history for user:', userId);
            const response = await this.api.get(`/api/FastBargain/user/${userId}`);
            console.log('Bargain history response:', response.data);

            return {
                success: true,
                data: response.data || []
            };
        } catch (error) {
            console.error('Get bargain history error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải lịch sử thương lượng',
                data: [],
                error: error.response?.data
            };
        }
    }

    /**
     * Lấy tất cả thương lượng cho admin
     */
    async getAllBargainsForAdmin() {
        try {
            console.log('Getting all bargains for admin');
            const response = await this.api.get('/api/FastBargain/admin');
            console.log('Admin bargains response:', response.data);

            return {
                success: true,
                data: response.data || []
            };
        } catch (error) {
            console.error('Get admin bargains error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách thương lượng',
                data: [],
                error: error.response?.data
            };
        }
    }

    /**
     * Định dạng trạng thái thương lượng
     * @param {string} status - Trạng thái
     */
    formatStatus(status) {
        const statusMap = {
            'Pending': { name: 'Đang chờ', color: 'text-yellow-600 bg-yellow-100', icon: '⏳' },
            'Accepted': { name: 'Đã chấp nhận', color: 'text-green-600 bg-green-100', icon: '✅' },
            'Rejected': { name: 'Đã từ chối', color: 'text-red-600 bg-red-100', icon: '❌' },
            'Expired': { name: 'Đã hết hạn', color: 'text-gray-600 bg-gray-100', icon: '⏰' }
        };

        return statusMap[status] || statusMap['Pending'];
    }

    /**
     * Định dạng tiền VND
     * @param {number} amount - Số tiền
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    /**
     * Tính thời gian còn lại
     * @param {string} expiresAt - Thời gian hết hạn
     */
    getTimeRemaining(expiresAt) {
        if (!expiresAt) return null;

        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const difference = expiry - now;

        if (difference <= 0) return 'Đã hết hạn';

        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    }

    /**
     * Lấy thông báo cho hành động
     * @param {string} action - Hành động
     */
    getActionMessage(action) {
        const messages = {
            'Accept': 'Đã chấp nhận đề xuất',
            'Reject': 'Đã từ chối đề xuất',
            'Counter': 'Đã phản đề xuất giá mới'
        };

        return messages[action] || 'Thực hiện hành động thành công';
    }

    /**
     * Kiểm tra quyền thực hiện hành động
     * @param {Object} bargain - Thông tin thương lượng
     * @param {string} currentUserId - ID người dùng hiện tại
     */
    canTakeAction(bargain, currentUserId) {
        if (!bargain || bargain.status !== 'Pending') {
            return { canAct: false, reason: 'Thương lượng đã kết thúc' };
        }

        if (bargain.expiresAt && new Date(bargain.expiresAt) < new Date()) {
            return { canAct: false, reason: 'Thương lượng đã hết hạn' };
        }

        // Kiểm tra lượt của ai
        const lastProposal = bargain.proposals?.[bargain.proposals.length - 1];
        if (lastProposal && lastProposal.userId === currentUserId) {
            return { canAct: false, reason: 'Đang chờ phản hồi từ bên kia' };
        }

        return { canAct: true };
    }
}

const fastBargainService = new FastBargainService();
export default fastBargainService;
