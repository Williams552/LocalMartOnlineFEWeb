// src/services/marketFeeService.js
import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class MarketFeeService {
    // Get all market fees with filters
    async getAllMarketFees(params = {}) {
        try {
            const token = authService.getToken();
            const queryParams = new URLSearchParams();

            // Backend sử dụng các tên parameter khác
            if (params.marketId) queryParams.append('MarketFeeId', params.marketId); // MarketFeeId thay vì marketId
            if (params.name) queryParams.append('SearchKeyword', params.name); // SearchKeyword thay vì name
            if (params.search) queryParams.append('SearchKeyword', params.search); // SearchKeyword thay vì search

            const finalUrl = `${API_ENDPOINTS.MARKET_FEE.GET_ALL}?${queryParams}`;
            console.log('MarketFeeService - API URL:', finalUrl);
            console.log('MarketFeeService - Params received:', params);
            console.log('MarketFeeService - Query params sent:', Object.fromEntries(queryParams));

            const response = await fetch(finalUrl, {
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
                let errorMessage = 'Không thể cập nhật phí';
                try {
                    const error = await response.json();
                    errorMessage = error.message || errorMessage;
                } catch (e) {
                    // Response không có JSON, sử dụng status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            // Kiểm tra xem response có content không
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return { success: true, message: 'Cập nhật phí thành công' };
            }

            // Chỉ parse JSON nếu có content
            try {
                return await response.json();
            } catch (e) {
                // Nếu không parse được JSON, vẫn coi là thành công
                return { success: true, message: 'Cập nhật phí thành công' };
            }
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
                let errorMessage = 'Không thể xóa phí';
                try {
                    const error = await response.json();
                    errorMessage = error.message || errorMessage;
                } catch (e) {
                    // Response không có JSON, sử dụng status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            // Kiểm tra xem response có content không
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return { success: true, message: 'Xóa phí thành công' };
            }

            // Chỉ parse JSON nếu có content
            try {
                return await response.json();
            } catch (e) {
                // Nếu không parse được JSON, vẫn coi là thành công
                return { success: true, message: 'Xóa phí thành công' };
            }
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
