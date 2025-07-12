// src/services/storeService.js
import axios from 'axios';
import authService from './authService';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5183";
const API_BASE = `${API_BASE_URL}/api/store`;

export const storeService = {
    // Admin APIs - Quản lý tất cả cửa hàng
    getAllStores: async (params = {}) => {
        try {
            const token = authService.getToken();
            const config = {
                headers: {}
            };
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            console.log('🏪 StoreService - Getting all stores with params:', params);
            console.log('🏪 StoreService - Token present:', !!token);
            
            // Try admin API first, fallback to public API
            try {
                const response = await axios.get(API_ENDPOINTS.STORE.GET_ALL_ADMIN, { 
                    ...config,
                    params 
                });
                console.log('🏪 StoreService - Admin API response:', response.data);
                return response.data;
            } catch (adminError) {
                if (adminError.response?.status === 401 || adminError.response?.status === 403) {
                    console.log('🏪 StoreService - Admin API failed, trying public API');
                    return await storeService.getActiveStores(params);
                }
                throw adminError;
            }
        } catch (error) {
            console.error('❌ StoreService - Error getting all stores:', error);
            throw error;
        }
    },

    // Public API - Lấy cửa hàng đang hoạt động
    getActiveStores: async (params = {}) => {
        try {
            console.log('🏪 StoreService - Getting active stores with params:', params);
            const response = await axios.get(API_ENDPOINTS.STORE.GET_ALL, { params });
            console.log('🏪 StoreService - Active stores response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ StoreService - Error getting active stores:', error);
            throw error;
        }
    },

    // Lấy thông tin chi tiết cửa hàng
    getStoreById: async (id) => {
        try {
            console.log('🏪 StoreService - Getting store by ID:', id);
            const response = await axios.get(API_ENDPOINTS.STORE.GET_BY_ID(id));
            console.log('🏪 StoreService - Store details:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ StoreService - Error getting store by ID:', error);
            throw error;
        }
    },

    // === REMOVED FUNCTIONS ===
    // createStore - Removed as requested
    // updateStore - Removed as requested  
    // toggleStoreStatus - Removed as requested
    // These functions have been removed from the service

    // Tạm ngưng cửa hàng (Admin only)
    suspendStore: async (id, reason) => {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Bạn cần đăng nhập để tạm ngưng cửa hàng');
            }

            console.log('🏪 StoreService - Suspending store:', id, reason);
            const response = await axios.patch(API_ENDPOINTS.STORE.SUSPEND(id), 
                { Reason: reason }, // Backend expects { Reason: string }
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('✅ StoreService - Store suspended:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ StoreService - Error suspending store:', error);
            throw error;
        }
    },

    // Kích hoạt lại cửa hàng (Admin only)
    reactivateStore: async (id) => {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Bạn cần đăng nhập để kích hoạt lại cửa hàng');
            }

            console.log('🏪 StoreService - Reactivating store:', id);
            const response = await axios.patch(API_ENDPOINTS.STORE.REACTIVATE(id), {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('✅ StoreService - Store reactivated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ StoreService - Error reactivating store:', error);
            throw error;
        }
    },

    // Tìm kiếm cửa hàng
    searchStores: async (searchParams) => {
        try {
            console.log('🏪 StoreService - Searching stores:', searchParams);
            
            const token = authService.getToken();
            let endpoint = API_ENDPOINTS.STORE.SEARCH; // Default to public search
            const config = {};
            
            // If token exists and we're filtering by status, use admin search
            if (token && searchParams.status) {
                endpoint = API_ENDPOINTS.STORE.SEARCH_ADMIN;
                config.headers = {
                    Authorization: `Bearer ${token}`
                };
                console.log('🏪 StoreService - Using admin search for status filter');
            } else if (token) {
                // If token exists but no status filter, try admin search first
                try {
                    console.log('🏪 StoreService - Trying admin search first');
                    const response = await axios.post(API_ENDPOINTS.STORE.SEARCH_ADMIN, searchParams, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    console.log('🏪 StoreService - Admin search results:', response.data);
                    return response.data;
                } catch (adminError) {
                    if (adminError.response?.status === 401 || adminError.response?.status === 403) {
                        console.log('🏪 StoreService - Admin search failed, falling back to public search');
                        // Fall back to public search
                    } else {
                        throw adminError;
                    }
                }
            }
            
            const response = await axios.post(endpoint, searchParams, config);
            console.log('🏪 StoreService - Search results:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ StoreService - Error searching stores:', error);
            throw error;
        }
    },

    // Tìm cửa hàng gần đây
    findNearbyStores: async (latitude, longitude, maxDistance = 5, page = 1, pageSize = 20) => {
        try {
            console.log('🏪 StoreService - Finding nearby stores:', { latitude, longitude, maxDistance });
            // No token needed for nearby search as it's AllowAnonymous
            const response = await axios.get(API_ENDPOINTS.STORE.NEARBY, { 
                params: { 
                    latitude, 
                    longitude, 
                    maxDistance, 
                    page, 
                    pageSize 
                } 
            });
            console.log('🏪 StoreService - Nearby stores:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ StoreService - Error finding nearby stores:', error);
            throw error;
        }
    },

    // Lấy cửa hàng theo Market ID
    getStoresByMarket: async (marketId, params = {}) => {
        try {
            console.log('🏪 StoreService - Getting stores by market:', marketId, params);
            // No token needed as it's AllowAnonymous
            const response = await axios.get(API_ENDPOINTS.STORE.BY_MARKET(marketId), { 
                params 
            });
            console.log('🏪 StoreService - Market stores:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ StoreService - Error getting stores by market:', error);
            throw error;
        }
    }
};  

export default storeService;
