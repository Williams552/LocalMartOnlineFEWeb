import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class MarketService {
    // Get all markets with admin privileges
    async getAllMarkets(params = {}) {
        try {
            const token = authService.getToken();
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.search) queryParams.append('search', params.search);
            if (params.status) queryParams.append('status', params.status);

            const response = await fetch(`${API_ENDPOINTS.MARKET.GET_ALL}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách chợ');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching markets:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get all active markets for public use
    async getActiveMarkets() {
        try {
            const response = await fetch(API_ENDPOINTS.MARKET.GET_ALL);

            if (!response.ok) {
                throw new Error('Không thể tải danh sách chợ');
            }

            const result = await response.json();
            return result.data || result; // Handle different response formats
        } catch (error) {
            console.error('Error fetching markets:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get market by ID
    async getMarketById(marketId) {
        try {
            const response = await fetch(API_ENDPOINTS.MARKET.GET_BY_ID(marketId));

            if (!response.ok) {
                throw new Error('Không tìm thấy thông tin chợ');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching market:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Create new market (Admin only)
    async createMarket(marketData) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET.CREATE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(marketData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể tạo chợ mới');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating market:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Update market (Admin only)
    async updateMarket(marketId, marketData) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET.UPDATE(marketId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(marketData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể cập nhật chợ');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating market:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Delete market (Admin only)
    async deleteMarket(marketId) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET.DELETE(marketId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể xóa chợ');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting market:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }
}

const marketService = new MarketService();
export { marketService };
export default marketService;
