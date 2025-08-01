// src/services/marketFeeService.js
import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class MarketFeeService {
    // Get all market fees with filters
    async getAllMarketFees(params = {}) {
        try {
            const token = authService.getToken();
            const queryParams = new URLSearchParams();

            // Match với GetMarketFeeRequestDto - validate trước khi gửi
            if (params.marketId && typeof params.marketId === 'string' && params.marketId.trim()) {
                queryParams.append('MarketId', params.marketId.trim());
            }
            if (params.searchKeyword && typeof params.searchKeyword === 'string' && params.searchKeyword.trim()) {
                queryParams.append('SearchKeyword', params.searchKeyword.trim());
            }
            if (params.search && typeof params.search === 'string' && params.search.trim()) {
                queryParams.append('SearchKeyword', params.search.trim());
            }

            const finalUrl = `${API_ENDPOINTS.MARKET_FEE.GET_ALL}?${queryParams}`;
            console.log('MarketFeeService - API URL:', finalUrl);
            console.log('MarketFeeService - Params received:', params);
            console.log('MarketFeeService - Query params:', queryParams.toString());

            const response = await fetch(finalUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể tải danh sách phí chợ'}`);
            }

            const result = await response.json();
            
            // Format dữ liệu theo MarketFeeDto mới
            const formattedResult = {
                success: true,
                data: Array.isArray(result) ? result : (result.data || []),
                totalCount: result.totalCount || (Array.isArray(result) ? result.length : 0)
            };

            return formattedResult;
        } catch (error) {
            console.error('Error fetching market fees:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server',
                data: []
            };
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
                if (response.status === 404) {
                    throw new Error('Không tìm thấy thông tin phí');
                }
                throw new Error('Không thể tải thông tin phí');
            }

            const result = await response.json();
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Error fetching market fee:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server'
            };
        }
    }

    // Create new market fee
    async createMarketFee(feeData) {
        try {
            const token = authService.getToken();
            
            // Validate và format dữ liệu theo MarketFeeCreateDto - Backend expect string cho MarketId và MarketFeeTypeId
            const createDto = {
                marketId: feeData.marketId.toString(), // Backend expect string
                marketFeeTypeId: feeData.marketFeeTypeId.toString(), // Backend expect string
                name: feeData.name,
                amount: parseFloat(feeData.amount),
                description: feeData.description || '',
                paymentDay: parseInt(feeData.paymentDay)
            };

            console.log('MarketFeeService - CreateDto being sent:', createDto);

            const response = await fetch(API_ENDPOINTS.MARKET_FEE.CREATE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(createDto)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Không thể tạo phí mới');
            }

            const result = await response.json();
            return {
                success: true,
                data: result,
                message: 'Tạo phí thành công'
            };
        } catch (error) {
            console.error('Error creating market fee:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server'
            };
        }
    }

    // Update market fee
    async updateMarketFee(feeId, feeData) {
        try {
            const token = authService.getToken();
            
            // Format dữ liệu theo MarketFeeUpdateDto - Backend expect string cho MarketFeeTypeId
            const updateDto = {};
            if (feeData.marketFeeTypeId) updateDto.marketFeeTypeId = feeData.marketFeeTypeId.toString(); // Backend expect string
            if (feeData.name) updateDto.name = feeData.name;
            if (feeData.amount !== undefined) updateDto.amount = parseFloat(feeData.amount);
            if (feeData.description !== undefined) updateDto.description = feeData.description;
            if (feeData.paymentDay !== undefined) updateDto.paymentDay = parseInt(feeData.paymentDay);

            console.log('MarketFeeService - UpdateDto being sent:', updateDto);

            const response = await fetch(API_ENDPOINTS.MARKET_FEE.UPDATE(feeId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateDto)
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Không tìm thấy thông tin phí');
                }
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Không thể cập nhật phí');
            }

            // Kiểm tra xem response có content không
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return { success: true, message: 'Cập nhật phí thành công' };
            }

            const result = await response.json().catch(() => ({ success: true, message: 'Cập nhật phí thành công' }));
            return {
                success: true,
                data: result,
                message: 'Cập nhật phí thành công'
            };
        } catch (error) {
            console.error('Error updating market fee:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server'
            };
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
                if (response.status === 404) {
                    throw new Error('Không tìm thấy thông tin phí');
                }
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Không thể xóa phí');
            }

            // Kiểm tra xem response có content không
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return { success: true, message: 'Xóa phí thành công' };
            }

            const result = await response.json().catch(() => ({ message: 'Xóa phí thành công' }));
            return {
                success: true,
                message: result.message || 'Xóa phí thành công'
            };
        } catch (error) {
            console.error('Error deleting market fee:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server'
            };
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
            return {
                success: true,
                data: Array.isArray(result) ? result : (result.data || []),
                totalCount: result.totalCount || (Array.isArray(result) ? result.length : 0)
            };
        } catch (error) {
            console.error('Error fetching market fees by market:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server',
                data: []
            };
        }
    }

    // Format market fee for display
    formatMarketFeeForDisplay(fee) {
        if (!fee) return null;

        return {
            id: fee.id,
            marketId: fee.marketId,
            marketName: fee.marketName,
            marketFeeTypeId: fee.marketFeeTypeId,
            marketFeeTypeName: fee.marketFeeTypeName,
            name: fee.name,
            amount: fee.amount,
            description: fee.description,
            paymentDay: fee.paymentDay,
            createdAt: fee.createdAt,
            displayAmount: new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
            }).format(fee.amount),
            createdDate: fee.createdAt ? new Date(fee.createdAt).toLocaleDateString('vi-VN') : ''
        };
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
