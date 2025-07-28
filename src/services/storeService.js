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
    // Lấy thông tin gian hàng của user hiện tại
    async getMyStore() {
        try {
            const url = API_ENDPOINTS.STORE.MY_STORE;
            console.log('🏪 StoreService - Getting my store from:', url);
            
            const response = await apiClient.get(url);
            console.log('🏪 StoreService - My store response:', response);
            console.log('🏪 StoreService - Response data:', response.data);
            
            if (response.data && response.data.success && response.data.data) {
                console.log('🏪 StoreService - Store data details:', response.data.data);
                console.log('🏪 StoreService - MarketId:', response.data.data.marketId);
                console.log('🏪 StoreService - Store ID:', response.data.data.id);
                console.log('🏪 StoreService - Available fields:', Object.keys(response.data.data));
                
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || ''
                };
            }
            
            console.log('❌ StoreService - No valid data in response');
            return {
                success: false,
                message: response.data?.message || 'Không tìm thấy thông tin gian hàng',
                data: null
            };
        } catch (error) {
            console.error('❌ StoreService - Error fetching my store:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error data:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin gian hàng',
                data: null
            };
        }
    }
    // Get all stores (Admin only - shows all stores including inactive)
    async getAllStores(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Add pagination parameters if provided
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);
            if (params.search) queryParams.append('search', params.search);
            if (params.marketId) queryParams.append('marketId', params.marketId);
            if (params.status) queryParams.append('status', params.status);

            // Use admin endpoint to get all stores
            const url = queryParams.toString()
                ? `${API_ENDPOINTS.STORE.GET_ALL_ADMIN}?${queryParams}`
                : API_ENDPOINTS.STORE.GET_ALL_ADMIN;

            console.log('🔍 StoreService - Calling API:', url);
            const response = await apiClient.get(url);
            console.log('🔍 StoreService - Raw response:', response);

            // Return the items from the API response
            if (response.data && response.data.success && response.data.data) {
                const result = {
                    items: response.data.data.items || [],
                    totalCount: response.data.data.totalCount || 0,
                    page: response.data.data.page || 1,
                    pageSize: response.data.data.pageSize || 20
                };
                console.log('🔍 StoreService - Processed result:', result);
                return result;
            }

            console.log('🔍 StoreService - No data found, returning empty result');
            return {
                items: [],
                totalCount: 0,
                page: 1,
                pageSize: 20
            };
        } catch (error) {
            console.error('❌ StoreService - Error fetching stores:', error);
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
    // Lấy store của chính user hiện tại (dựa vào token)
    async getStoresBySellerId() {
        try {
            const url = API_ENDPOINTS.STORE.MY_STORE;
            console.log('📦 Fetching my store:', url);

            const response = await apiClient.get(url);

            if (response.data && response.data.success && response.data.data) {
                // Có thể trả về 1 object hoặc array
                const stores = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
                const formatted = stores.map(store => this.formatStoreForFrontend(store));

                // Lưu storeId đầu tiên vào sessionStorage
                if (formatted.length > 0 && formatted[0].id) {
                    sessionStorage.setItem('storeId', formatted[0].id);
                }

                return {
                    success: true,
                    data: formatted
                };
            }

            return {
                success: false,
                message: 'Không tìm thấy gian hàng'
            };
        } catch (error) {
            console.error(`❌ Error in getStoresBySellerId:`, error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi lấy danh sách gian hàng của bản thân'
            };
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

    // Toggle store status (open/close)
    async toggleStoreStatus(storeId) {
        try {
            const url = API_ENDPOINTS.STORE.TOGGLE_STATUS(storeId);
            const response = await apiClient.patch(url);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Trạng thái cửa hàng đã được cập nhật'
                };
            }
            return {
                success: false,
                message: response.data?.message || 'Không thể thay đổi trạng thái cửa hàng'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thay đổi trạng thái cửa hàng'
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

    // Search stores (Admin function)
    async searchStores(params = {}) {
        try {
            console.log('🔍 StoreService - Searching stores with params:', params);

            // Prepare search filter body for Backend (đúng theo StoreSearchFilterDto)
            const searchFilter = {
                keyword: params.keyword || '',
                status: params.status || null,
                marketId: params.marketId || null,
                page: params.page || 1,
                pageSize: params.pageSize || 20
            };

            console.log('🔍 StoreService - Search filter:', searchFilter);

            // Use admin search endpoint
            const response = await apiClient.post(API_ENDPOINTS.STORE.SEARCH_ADMIN, searchFilter);
            console.log('🔍 StoreService - Search response:', response);

            // Handle response structure
            if (response.data && response.data.success && response.data.data) {
                const result = {
                    items: response.data.data.items || response.data.data || [],
                    totalCount: response.data.data.totalCount || response.data.total || 0,
                    page: response.data.data.page || searchFilter.page,
                    pageSize: response.data.data.pageSize || searchFilter.pageSize
                };
                console.log('🔍 StoreService - Search result:', result);
                return result;
            }

            // Fallback for different response structure
            if (response.data && Array.isArray(response.data)) {
                return {
                    items: response.data,
                    totalCount: response.data.length,
                    page: searchFilter.page,
                    pageSize: searchFilter.pageSize
                };
            }

            console.log('🔍 StoreService - No search results found');
            return {
                items: [],
                totalCount: 0,
                page: searchFilter.page,
                pageSize: searchFilter.pageSize
            };
        } catch (error) {
            console.error('❌ StoreService - Error searching stores:', error);
            throw new Error(`Không thể tìm kiếm cửa hàng: ${error.response?.data?.message || error.message}`);
        }
    }

    // Suspend store (Admin only)
    async suspendStore(storeId, reason) {
        try {
            console.log('🚫 StoreService - Suspending store:', storeId, 'Reason:', reason);

            const response = await apiClient.patch(API_ENDPOINTS.STORE.SUSPEND(storeId), {
                reason: reason || 'Admin suspension'
            });

            console.log('🚫 StoreService - Suspend response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ StoreService - Error suspending store:', error);
            throw new Error(`Không thể tạm ngưng cửa hàng: ${error.response?.data?.message || error.message}`);
        }
    }

    // Reactivate store (Admin only)
    async reactivateStore(storeId) {
        try {
            console.log('✅ StoreService - Reactivating store:', storeId);

            const response = await apiClient.patch(API_ENDPOINTS.STORE.REACTIVATE(storeId));

            console.log('✅ StoreService - Reactivate response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ StoreService - Error reactivating store:', error);
            throw new Error(`Không thể kích hoạt lại cửa hàng: ${error.response?.data?.message || error.message}`);
        }
    }

    // Find nearby stores
    async findNearbyStores(latitude, longitude, radius = 10, page = 1, pageSize = 20) {
        try {
            console.log('🌍 StoreService - Finding nearby stores:', { latitude, longitude, radius });

            const queryParams = new URLSearchParams({
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                radius: radius.toString(),
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            const url = `${API_ENDPOINTS.STORE.NEARBY}?${queryParams}`;
            console.log('🌍 StoreService - Nearby URL:', url);

            const response = await apiClient.get(url);
            console.log('🌍 StoreService - Nearby response:', response);

            if (response.data && response.data.success && response.data.data) {
                const result = {
                    items: response.data.data.items || response.data.data || [],
                    totalCount: response.data.data.totalCount || response.data.total || 0,
                    page: response.data.data.page || page,
                    pageSize: response.data.data.pageSize || pageSize
                };
                console.log('🌍 StoreService - Nearby stores result:', result);
                return result;
            }

            // Fallback for different response structure
            if (response.data && Array.isArray(response.data)) {
                return {
                    items: response.data,
                    totalCount: response.data.length,
                    page: page,
                    pageSize: pageSize
                };
            }

            return {
                items: [],
                totalCount: 0,
                page: page,
                pageSize: pageSize
            };
        } catch (error) {
            console.error('❌ StoreService - Error finding nearby stores:', error);
            throw new Error(`Không thể tìm cửa hàng gần đây: ${error.response?.data?.message || error.message}`);
        }
    }
}

const storeService = new StoreService();

export { storeService };
export default storeService;
