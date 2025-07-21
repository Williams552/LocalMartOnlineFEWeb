import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Create axios instance
const createApiClient = () => {
    const client = axios.create({
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add request interceptor for auth token
    client.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Add response interceptor for error handling
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Don't auto redirect for public API calls
            }
            return Promise.reject(error);
        }
    );

    return client;
};

const apiClient = createApiClient();

class MarketService {
    // Get all markets with admin privileges
    async getAllMarkets(page = 1, pageSize = 20, params = {}) {
        try {

            const queryParams = new URLSearchParams();

           

            // Add pagination parameters
            queryParams.append('page', page.toString());
            queryParams.append('pageSize', pageSize.toString());
            
            // Add other parameters if provided
            if (params.search) queryParams.append('search', params.search);
            if (params.status) queryParams.append('status', params.status);

            // Use admin endpoint for MarketManagement
            const url = `${API_ENDPOINTS.MARKET.GET_ALL}?${queryParams}`;
            console.log('🔍 MarketService - Calling admin endpoint:', url);


            const response = await apiClient.get(url);
            console.log('🔍 MarketService - Response:', response.data);

            // Return the data from the API response
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error('❌ Error fetching markets:', error);
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Get all active markets for public use
    async getActiveMarkets() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MARKET.GET_ACTIVE);
            
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching active markets:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Get market by ID
    async getMarketById(marketId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.MARKET.GET_BY_ID(marketId));
            
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || null;
        } catch (error) {
            console.error('Error fetching market:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Create new market (Admin only)
    async createMarket(marketData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.MARKET.CREATE, marketData);
            
            if (response.data && response.data.success) {
                return response.data.data || response.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error creating market:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Update market (Admin only)
    async updateMarket(marketId, marketData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.MARKET.UPDATE(marketId), marketData);
            
            if (response.data && response.data.success) {
                return response.data.data || response.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error updating market:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Toggle market status (Admin only)
    async toggleMarketStatus(marketId) {
        try {
            const response = await apiClient.patch(API_ENDPOINTS.MARKET.TOGGLE_STATUS(marketId));
            
            if (response.data && response.data.success) {
                return response.data.data || response.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error toggling market status:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Delete market (Admin only)
    async deleteMarket(marketId) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.MARKET.DELETE(marketId));
            
            if (response.data && response.data.success) {
                return response.data.data || response.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error deleting market:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Search markets (Admin)
    async searchMarkets(keyword) {
        try {
            if (!keyword || keyword.trim() === '') {
                console.log('🔍 searchMarkets - No keyword provided, returning all markets');
                return this.getAllMarkets();
            }
            
            const queryParams = new URLSearchParams();
            queryParams.append('keyword', keyword.trim());
            
            const url = `${API_ENDPOINTS.MARKET.SEARCH_ADMIN}?${queryParams}`;
            console.log('🔍 searchMarkets - URL:', url);
            
            const response = await apiClient.get(url);
            console.log('🔍 searchMarkets - Response:', response.data);
            
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }

  

            return response.data || [];


        } catch (error) {
            console.error('❌ searchMarkets - Error:', error);
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Filter markets (Admin)
    async filterMarkets(filters = {}) {
        try {
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
            

            const response = await apiClient.get(url);
            console.log('🔍 filterMarkets - Response:', response.data);

            
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('❌ filterMarkets - Error:', error);
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }
}

const marketService = new MarketService();
export { marketService };
export default marketService;
