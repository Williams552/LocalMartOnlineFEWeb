import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class MarketService {
    // Get all active markets
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
}

const marketService = new MarketService();
export default marketService;
