import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5183';

class AdminProxyShoppingService {
    constructor() {
        this.baseURL = `${API_URL}/api/proxyshopper`;
    }

    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('token');
    }

    // Get headers with authorization
    getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    /**
     * Get all proxy requests (Admin only)
     * @returns {Promise} - Promise resolving to array of proxy requests
     */
    async getAllProxyRequests() {
        try {
            const response = await axios.get(API_ENDPOINTS.ADMIN_PROXY_SHOPPING.GET_ALL_PROXY_REQUESTS, {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data.data || response.data || [] };
        } catch (error) {
            console.error('Error fetching all proxy requests:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách yêu cầu' };
        }
    }

    /**
     * Get proxy request detail by ID (Admin only)
     * @param {string} id - Proxy request ID
     * @returns {Promise} - Promise resolving to proxy request detail
     */
    async getProxyRequestDetail(id) {
        try {
            const response = await axios.get(API_ENDPOINTS.ADMIN_PROXY_SHOPPING.GET_PROXY_REQUEST_DETAIL(id), {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error(`Error fetching proxy request detail for ID ${id}:`, error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra khi lấy chi tiết yêu cầu' };
        }
    }

    /**
     * Update proxy request status (Admin only)
     * @param {string} id - Proxy request ID
     * @param {string} status - New status (Open | Locked | Completed | Cancelled | Expired)
     * @returns {Promise} - Promise resolving to updated request
     */
    async updateProxyRequestStatus(id, status) {
        try {
            const response = await axios.patch(
                API_ENDPOINTS.ADMIN_PROXY_SHOPPING.UPDATE_PROXY_REQUEST_STATUS(id),
                { status },
                { headers: this.getHeaders() }
            );
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error(`Error updating proxy request status for ID ${id}:`, error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái yêu cầu' };
        }
    }

    /**
     * Update proxy order status (Admin only)
     * @param {string} id - Proxy order ID
     * @param {string} status - New status (Draft | Proposed | Paid | InProgress | Completed | Cancelled | Expired)
     * @returns {Promise} - Promise resolving to updated order
     */
    async updateProxyOrderStatus(id, status) {
        try {
            const response = await axios.patch(
                API_ENDPOINTS.ADMIN_PROXY_SHOPPING.UPDATE_PROXY_ORDER_STATUS(id),
                { status },
                { headers: this.getHeaders() }
            );
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error(`Error updating proxy order status for ID ${id}:`, error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng' };
        }
    }

    /**
     * Get status options for proxy requests
     * @returns {Array} - Array of status options
     */
    getProxyRequestStatusOptions() {
        return [
            { value: 'Open', label: 'Mở', color: 'blue' },
            { value: 'Locked', label: 'Đã khóa', color: 'orange' },
            { value: 'Completed', label: 'Hoàn thành', color: 'green' },
            { value: 'Cancelled', label: 'Đã hủy', color: 'red' },
            { value: 'Expired', label: 'Hết hạn', color: 'gray' }
        ];
    }

    /**
     * Get status options for proxy orders
     * @returns {Array} - Array of status options
     */
    getProxyOrderStatusOptions() {
        return [
            { value: 'Draft', label: 'Nháp', color: 'gray' },
            { value: 'Proposed', label: 'Đã đề xuất', color: 'blue' },
            { value: 'Paid', label: 'Đã thanh toán', color: 'green' },
            { value: 'InProgress', label: 'Đang thực hiện', color: 'orange' },
            { value: 'Completed', label: 'Hoàn thành', color: 'green' },
            { value: 'Cancelled', label: 'Đã hủy', color: 'red' },
            { value: 'Expired', label: 'Hết hạn', color: 'gray' }
        ];
    }

    /**
     * Get Vietnamese label for request status
     * @param {string} status - Status value
     * @returns {string} - Vietnamese label
     */
    getRequestStatusLabel(status) {
        const statusMap = {
            'Open': 'Mở',
            'Locked': 'Đã khóa',
            'Completed': 'Hoàn thành',
            'Cancelled': 'Đã hủy',
            'Expired': 'Hết hạn'
        };
        return statusMap[status] || status;
    }

    /**
     * Get Vietnamese label for order status
     * @param {string} status - Status value
     * @returns {string} - Vietnamese label
     */
    getOrderStatusLabel(status) {
        const statusMap = {
            'Draft': 'Nháp',
            'Proposed': 'Đã đề xuất',
            'Paid': 'Đã thanh toán',
            'InProgress': 'Đang thực hiện',
            'Completed': 'Hoàn thành',
            'Cancelled': 'Đã hủy',
            'Expired': 'Hết hạn'
        };
        return statusMap[status] || status;
    }

    /**
     * Get color for status
     * @param {string} status - Status value
     * @param {string} type - Type of status ('request' or 'order')
     * @returns {string} - Color class
     */
    getStatusColor(status, type = 'request') {
        const options = type === 'request' ? this.getProxyRequestStatusOptions() : this.getProxyOrderStatusOptions();
        const option = options.find(opt => opt.value === status);
        return option ? option.color : 'gray';
    }
}

export default new AdminProxyShoppingService();
