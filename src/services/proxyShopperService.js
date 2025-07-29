import axios from 'axios';
import API_ENDPOINTS from '../config/apiEndpoints';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5183';

class ProxyShopperService {
    // Get analytics for dashboard (period-based)
    async getAnalytics(period = '30d') {
        try {
            const response = await axios.get(API_ENDPOINTS.PROXY_SHOPPER.ANALYTICS(period), {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }
    constructor() {
        this.baseURL = API_ENDPOINTS.PROXY_SHOPPER.API_BASE || `${API_URL}/api/ProxyShopper`;
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

    // Get available orders to accept
    async getAvailableOrders() {
        try {
            const response = await axios.get(API_ENDPOINTS.PROXY_SHOPPER.AVAILABLE_ORDERS, {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data.data || [] };
        } catch (error) {
            console.error('Error fetching available orders:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Accept an order
    async acceptOrder(orderId) {
        try {
            const response = await axios.post(API_ENDPOINTS.PROXY_SHOPPER.ACCEPT_ORDER(orderId), {}, {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error accepting order:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Send proposal for an order
    async sendProposal(orderId, proposal) {
        try {
            const response = await axios.post(`${this.baseURL}/orders/${orderId}/proposal`, proposal, {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error sending proposal:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Confirm order
    async confirmOrder(orderId) {
        try {
            const response = await axios.post(API_ENDPOINTS.PROXY_SHOPPER.CONFIRM_ORDER(orderId), {}, {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error confirming order:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Upload bought items
    async uploadBoughtItems(orderId, imageUrls, note) {
        try {
            const response = await axios.post(API_ENDPOINTS.PROXY_SHOPPER.UPLOAD_BOUGHT_ITEMS(orderId), imageUrls, {
                headers: this.getHeaders(),
                params: { note }
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error uploading bought items:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Confirm final price
    async confirmFinalPrice(orderId, finalPrice) {
        try {
            const response = await axios.post(API_ENDPOINTS.PROXY_SHOPPER.CONFIRM_FINAL_PRICE(orderId), {}, {
                headers: this.getHeaders(),
                params: { finalPrice }
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error confirming final price:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Confirm delivery
    async confirmDelivery(orderId) {
        try {
            const response = await axios.post(API_ENDPOINTS.PROXY_SHOPPER.CONFIRM_DELIVERY(orderId), {}, {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error confirming delivery:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Replace or remove product
    async replaceOrRemoveProduct(orderId, productId, replacementItem = null) {
        try {
            const response = await axios.put(API_ENDPOINTS.PROXY_SHOPPER.REPLACE_OR_REMOVE_PRODUCT(orderId, productId), replacementItem, {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error replacing/removing product:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Smart search products
    async smartSearchProducts(query, limit = 10) {
        try {
            const response = await axios.get(API_ENDPOINTS.PROXY_SHOPPER.SMART_SEARCH_PRODUCTS, {
                headers: this.getHeaders(),
                params: { q: query, limit }
            });
            return { success: true, data: response.data.data || [] };
        } catch (error) {
            console.error('Error searching products:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Get my orders
    async getMyOrders(status = null) {
        try {
            const params = status ? { status } : {};
            const response = await axios.get(API_ENDPOINTS.PROXY_SHOPPER.MY_ORDERS, {
                headers: this.getHeaders(),
                params
            });
            return { success: true, data: response.data.data || [] };
        } catch (error) {
            console.error('Error fetching my orders:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Get order detail
    async getOrderDetail(orderId) {
        try {
            const response = await axios.get(API_ENDPOINTS.PROXY_SHOPPER.ORDER_DETAIL(orderId), {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Error fetching order detail:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Get order history with pagination
    async getOrderHistory(page = 1, pageSize = 20) {
        try {
            const response = await axios.get(API_ENDPOINTS.PROXY_SHOPPER.ORDER_HISTORY, {
                headers: this.getHeaders(),
                params: { page, pageSize }
            });
            return { success: true, data: response.data.data || [] };
        } catch (error) {
            console.error('Error fetching order history:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Cancel order
    async cancelOrder(orderId, reason) {
        try {
            const response = await axios.post(API_ENDPOINTS.PROXY_SHOPPER.CANCEL_ORDER(orderId), { reason }, {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error cancelling order:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }

    // Get my statistics
    async getMyStats() {
        try {
            const response = await axios.get(API_ENDPOINTS.PROXY_SHOPPER.MY_STATS, {
                headers: this.getHeaders()
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Error fetching my stats:', error);
            return { success: false, error: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
    }
}

const proxyShopperService = new ProxyShopperService();
export default proxyShopperService;
