
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

class StoreService {
    // Get all stores
    async getAllStores(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Add pagination parameters if provided
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);
            if (params.search) queryParams.append('search', params.search);
            if (params.marketId) queryParams.append('marketId', params.marketId);
            if (params.status) queryParams.append('status', params.status);

            const url = queryParams.toString()
                ? `${API_ENDPOINTS.STORE.GET_ALL}?${queryParams}`
                : API_ENDPOINTS.STORE.GET_ALL;

            const response = await apiClient.get(url);

            // Return the items from the API response
            if (response.data && response.data.success && response.data.data) {
                return {
                    items: response.data.data.items || [],
                    totalCount: response.data.data.totalCount || 0,
                    page: response.data.data.page || 1,
                    pageSize: response.data.data.pageSize || 20
                };
            }

            return {
                items: [],
                totalCount: 0,
                page: 1,
                pageSize: 20
            };
        } catch (error) {
            console.error('Error fetching stores:', error);
            throw error;
        }
    }

    // Get store by ID
    async getStoreById(storeId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.STORE.GET_BY_ID(storeId));

            if (response.data && response.data.success && response.data.data) {
                return {
                    success: true,
                    data: this.formatStoreForFrontend(response.data.data)
                };
            }

            return {
                success: false,
                message: 'Store not found'
            };
        } catch (error) {
            console.error(`Error fetching store ${storeId}:`, error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thông tin gian hàng'
            };
        }
    }    // Get stores by seller
    async getStoresBySeller(sellerId, params = {}) {
        try {
            console.log('Fetching stores for seller:', sellerId);

            // Check if token exists
            const token = localStorage.getItem('token');
            console.log('Auth token exists:', !!token);
            if (token) {
                console.log('Token preview:', token.substring(0, 20) + '...');
            }

            // The API endpoint /api/store/seller automatically gets sellerId from JWT token
            // No need to pass sellerId as query parameter
            const queryParams = new URLSearchParams(params);
            const url = queryParams.toString() ?
                `${API_ENDPOINTS.STORE.GET_BY_SELLER}?${queryParams}` :
                API_ENDPOINTS.STORE.GET_BY_SELLER;

            console.log('Making request to:', url);
            console.log('API Base URL:', API_ENDPOINTS.API_BASE);

            const response = await apiClient.get(url);

            console.log('Store API response status:', response.status);
            console.log('Store API response:', response.data);

            if (response.data && response.data.success) {
                const stores = Array.isArray(response.data.data) ? response.data.data : [];
                console.log('Stores from API:', stores);
                const formattedStores = stores.map(store => this.formatStoreForFrontend(store));
                console.log('Formatted stores:', formattedStores);
                return formattedStores;
            }

            console.log('No stores found or API response unsuccessful');
            return [];
        } catch (error) {
            console.error(`Error fetching stores by seller ${sellerId}:`, error);
            console.error('Error details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error config:', error.config);
            // Return empty array instead of throwing to prevent app crash
            return [];
        }
    }

    // Get active stores for public display
    async getActiveStores(params = {}) {
        try {
            const storeParams = {
                ...params,
                status: 'Open'
            };

            return await this.getAllStores(storeParams);
        } catch (error) {
            console.error('Error fetching active stores:', error);
            throw error;
        }
    }

    // Format store data for frontend use
    formatStoreForFrontend(store) {
        return {
            id: store.id,
            name: store.name,
            address: store.address,
            contactNumber: store.contactNumber,
            status: store.status,
            rating: store.rating || 0,
            storeImageUrl: store.storeImageUrl,
            latitude: store.latitude,
            longitude: store.longitude,
            sellerId: store.sellerId,
            marketId: store.marketId,
            createdAt: store.createdAt,
            updatedAt: store.updatedAt,
            // Add compatibility fields
            storeName: store.name,
            storeAddress: store.address,
        };
    }

    // Get formatted stores for frontend
    async getFormattedStores(params = {}) {
        try {
            const result = await this.getAllStores(params);

            return {
                ...result,
                items: result.items.map(store => this.formatStoreForFrontend(store))
            };
        } catch (error) {
            console.error('Error getting formatted stores:', error);
            throw error;
        }
    }

    // Create new store (for sellers)
    async createStore(storeData) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.STORE.CREATE, storeData);

            if (response.data && response.data.success) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error('Error creating store:', error);
            throw error;
        }
    }

    // Update store (for sellers)
    async updateStore(id, storeData) {
        try {
            const response = await apiClient.put(API_ENDPOINTS.STORE.UPDATE(id), storeData);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Cập nhật gian hàng thành công'
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Cập nhật gian hàng thất bại'
            };
        } catch (error) {
            console.error(`Error updating store ${id}:`, error);
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật gian hàng'
            };
        }
    }

    // Delete store (for sellers)
    async deleteStore(id) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.STORE.DELETE(id));

            if (response.data && response.data.success) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Error deleting store ${id}:`, error);
            throw error;
        }
    }

    // Get store statistics
    async getStoreStatistics(storeId) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.STORE.GET_STATISTICS(storeId));

            if (response.data && response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                message: 'Store statistics not found',
                data: null
            };
        } catch (error) {
            console.error(`Error fetching store statistics for ${storeId}:`, error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error fetching store statistics',
                data: null
            };
        }
    }
}

const storeService = new StoreService();

export default storeService;
