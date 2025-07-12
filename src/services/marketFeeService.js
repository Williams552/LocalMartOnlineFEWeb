// src/services/marketFeeService.js
import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class MarketFeeService {
    // Get all market fees with filters
    async getAllMarketFees(params = {}) {
        try {
            const token = authService.getToken();
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.marketId) queryParams.append('marketId', params.marketId);
            if (params.feeType) queryParams.append('feeType', params.feeType);
            if (params.status) queryParams.append('status', params.status);
            if (params.search) queryParams.append('search', params.search);

            const response = await fetch(`${API_ENDPOINTS.MARKET_FEE.GET_ALL}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách phí chợ');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching market fees:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get market fee by ID
    async getMarketFeeById(feeId) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET_FEE.GET_BY_ID(feeId), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không tìm thấy thông tin phí');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching market fee:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Create new market fee
    async createMarketFee(feeData) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET_FEE.CREATE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feeData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể tạo phí mới');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating market fee:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Update market fee
    async updateMarketFee(feeId, feeData) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET_FEE.UPDATE(feeId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feeData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể cập nhật phí');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating market fee:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Delete market fee
    async deleteMarketFee(feeId) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET_FEE.DELETE(feeId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể xóa phí');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting market fee:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get fees by market
    async getFeesByMarket(marketId, params = {}) {
        try {
            const token = authService.getToken();
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.feeType) queryParams.append('feeType', params.feeType);

            const response = await fetch(`${API_ENDPOINTS.MARKET_FEE.GET_BY_MARKET(marketId)}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách phí của chợ');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching market fees by market:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Pay market fee
    async payMarketFee(paymentData) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET_FEE.PAY, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể thanh toán phí');
            }

            return await response.json();
        } catch (error) {
            console.error('Error paying market fee:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get fee statistics
    async getFeeStatistics(marketId) {
        try {
            const token = authService.getToken();
            const endpoint = marketId 
                ? API_ENDPOINTS.MARKET_FEE.STATISTICS_BY_MARKET(marketId)
                : API_ENDPOINTS.MARKET_FEE.STATISTICS;

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải thống kê phí');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching fee statistics:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }
}

const marketFeeService = new MarketFeeService();
export { marketFeeService };
export default marketFeeService;
