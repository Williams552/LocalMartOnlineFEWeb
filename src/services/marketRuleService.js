// src/services/marketRuleService.js
import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class MarketRuleService {
    // Get all market rules with filters
    async getAllMarketRules(params = {}) {
        try {
            const token = authService.getToken();
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.marketId) queryParams.append('marketId', params.marketId);
            if (params.category) queryParams.append('category', params.category);
            if (params.status) queryParams.append('status', params.status);
            if (params.search) queryParams.append('search', params.search);

            const response = await fetch(`${API_ENDPOINTS.MARKET_RULE.GET_ALL}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách quy tắc chợ');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching market rules:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get market rule by ID
    async getMarketRuleById(ruleId) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET_RULE.GET_BY_ID(ruleId), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không tìm thấy thông tin quy tắc');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching market rule:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Create new market rule
    async createMarketRule(ruleData) {
        try {
            const token = authService.getToken();
            
            const response = await fetch(API_ENDPOINTS.MARKET_RULE.CREATE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ruleData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể tạo quy tắc mới');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating market rule:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Update market rule
    async updateMarketRule(ruleId, ruleData) {
        try {
            const token = authService.getToken();
            
            const response = await fetch(API_ENDPOINTS.MARKET_RULE.UPDATE(ruleId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ruleData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể cập nhật quy tắc');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating market rule:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Delete market rule
    async deleteMarketRule(ruleId) {
        try {
            const token = authService.getToken();
            
            const response = await fetch(API_ENDPOINTS.MARKET_RULE.DELETE(ruleId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể xóa quy tắc');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting market rule:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get rules by market
    async getRulesByMarket(marketId, params = {}) {
        try {
            const token = authService.getToken();
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.category) queryParams.append('category', params.category);

            const response = await fetch(`${API_ENDPOINTS.MARKET_RULE.GET_BY_MARKET(marketId)}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách quy tắc của chợ');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching market rules by market:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Toggle rule status
    async toggleRuleStatus(ruleId) {
        try {
            const token = authService.getToken();
            
            const response = await fetch(API_ENDPOINTS.MARKET_RULE.TOGGLE_STATUS(ruleId), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể thay đổi trạng thái quy tắc');
            }

            return await response.json();
        } catch (error) {
            console.error('Error toggling rule status:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get public rules (for buyers/sellers to view)
    async getPublicMarketRules(marketId) {
        try {
            const response = await fetch(API_ENDPOINTS.MARKET_RULE.GET_PUBLIC(marketId), {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải quy tắc chợ');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching public market rules:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Search rules
    async searchMarketRules(keyword, params = {}) {
        try {
            const token = authService.getToken();
            const queryParams = new URLSearchParams();

            queryParams.append('keyword', keyword);
            if (params.marketId) queryParams.append('marketId', params.marketId);
            if (params.category) queryParams.append('category', params.category);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            const response = await fetch(`${API_ENDPOINTS.MARKET_RULE.SEARCH}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tìm kiếm quy tắc');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error searching market rules:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get rule statistics
    async getRuleStatistics(marketId) {
        try {
            const token = authService.getToken();
            const endpoint = marketId 
                ? API_ENDPOINTS.MARKET_RULE.STATISTICS_BY_MARKET(marketId)
                : API_ENDPOINTS.MARKET_RULE.STATISTICS;

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải thống kê quy tắc');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching rule statistics:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Validate rule before creation
    async validateRule(ruleData) {
        const errors = [];

        if (!ruleData.title || ruleData.title.trim().length < 5) {
            errors.push('Tiêu đề quy tắc phải có ít nhất 5 ký tự');
        }

        if (!ruleData.description || ruleData.description.trim().length < 20) {
            errors.push('Mô tả quy tắc phải có ít nhất 20 ký tự');
        }

        if (!ruleData.marketId) {
            errors.push('Vui lòng chọn chợ áp dụng quy tắc');
        }

        if (!ruleData.category) {
            errors.push('Vui lòng chọn phân loại quy tắc');
        }

        if (!ruleData.priority) {
            errors.push('Vui lòng chọn mức độ ưu tiên');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

const marketRuleService = new MarketRuleService();
export { marketRuleService };
export default marketRuleService;
