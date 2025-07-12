import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class MarketService {
    // Get all markets with admin privileges
    async getAllMarkets() {
        try {
            const token = authService.getToken();
            console.log('🔍 getAllMarkets - Token:', token ? 'Present' : 'Missing');
            
            const url = API_ENDPOINTS.MARKET.GET_ALL;
            console.log('🔍 getAllMarkets - URL:', url);

            const headers = {
                'Content-Type': 'application/json',
            };

            // Only add Authorization header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                console.warn('🔍 getAllMarkets - No token found, trying public endpoint');
                // Fallback to public endpoint if no token
                const publicResponse = await fetch(API_ENDPOINTS.MARKET.GET_ACTIVE, { 
                    headers,
                    credentials: 'include'
                });
                console.log('🔍 getAllMarkets - Public response status:', publicResponse.status);
                
                if (publicResponse.ok) {
                    const result = await publicResponse.json();
                    console.log('🔍 getAllMarkets - Public success result:', result);
                    return result.data || result;
                }
            }

            console.log('🔍 getAllMarkets - Headers:', headers);

            const response = await fetch(url, { 
                headers,
                credentials: 'include'
            });

            console.log('🔍 getAllMarkets - Response status:', response.status);
            console.log('🔍 getAllMarkets - Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔍 getAllMarkets - Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể tải danh sách chợ'}`);
            }

            const result = await response.json();
            console.log('🔍 getAllMarkets - Success result:', result);
            
            return result.data || result;
        } catch (error) {
            console.error('❌ getAllMarkets - Error:', error);
            if (error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get all active markets for public use
    async getActiveMarkets() {
        try {
            const response = await fetch(API_ENDPOINTS.MARKET.GET_ACTIVE);

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

    // Toggle market status (Admin only)
    async toggleMarketStatus(marketId) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET.TOGGLE_STATUS(marketId), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể thay đổi trạng thái chợ');
            }

            return await response.json();
        } catch (error) {
            console.error('Error toggling market status:', error);
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

    // Search markets (Admin)
    async searchMarkets(keyword) {
        try {
            const token = authService.getToken();
            
            if (!keyword || keyword.trim() === '') {
                console.log('🔍 searchMarkets - No keyword provided, returning all markets');
                return this.getAllMarkets();
            }
            
            const queryParams = new URLSearchParams();
            queryParams.append('keyword', keyword.trim());
            
            const url = `${API_ENDPOINTS.MARKET.SEARCH_ADMIN}?${queryParams}`;
            console.log('🔍 searchMarkets - URL:', url);
            console.log('🔍 searchMarkets - Token:', token ? 'Present' : 'Missing');
            
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                console.warn('🔍 searchMarkets - No token found');
            }
            
            console.log('🔍 searchMarkets - Headers:', headers);
            
            const response = await fetch(url, { 
                method: 'GET',
                headers,
                credentials: 'include'
            });
            
            console.log('🔍 searchMarkets - Response status:', response.status);
            console.log('🔍 searchMarkets - Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔍 searchMarkets - Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể tìm kiếm chợ'}`);
            }
            
            const result = await response.json();
            console.log('🔍 searchMarkets - Success result:', result);
            
            return result.data || result;
        } catch (error) {
            console.error('❌ searchMarkets - Error:', error);
            if (error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Filter markets (Admin)
    async filterMarkets(filters = {}) {
        try {
            const token = authService.getToken();
            
            const queryParams = new URLSearchParams();
            
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.area) queryParams.append('area', filters.area);
            if (filters.minStalls) queryParams.append('minStalls', filters.minStalls);
            if (filters.maxStalls) queryParams.append('maxStalls', filters.maxStalls);
            
            // If no filters, return all markets
            if (queryParams.toString() === '') {
                console.log('🔍 filterMarkets - No filters provided, returning all markets');
                return this.getAllMarkets();
            }
            
            const url = `${API_ENDPOINTS.MARKET.FILTER_ADMIN}?${queryParams}`;
            console.log('🔍 filterMarkets - URL:', url);
            console.log('🔍 filterMarkets - Token:', token ? 'Present' : 'Missing');
            
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                console.warn('🔍 filterMarkets - No token found');
            }
            
            console.log('🔍 filterMarkets - Headers:', headers);
            
            const response = await fetch(url, { 
                method: 'GET',
                headers,
                credentials: 'include'
            });
            
            console.log('🔍 filterMarkets - Response status:', response.status);
            console.log('🔍 filterMarkets - Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔍 filterMarkets - Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể lọc chợ'}`);
            }
            
            const result = await response.json();
            console.log('🔍 filterMarkets - Success result:', result);
            
            return result.data || result;
        } catch (error) {
            console.error('❌ filterMarkets - Error:', error);
            if (error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }
}

const marketService = new MarketService();
export { marketService };
export default marketService;
