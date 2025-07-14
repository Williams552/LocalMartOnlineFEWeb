import { API_ENDPOINTS } from '../config/apiEndpoints';
import apiService from './apiService';

class FavoriteService {
    /**
     * Add product to favorites
     * @param {string} productId - Product ID to add to favorites
     * @returns {Promise} API response
     */    async addToFavorites(productId) {
        try {
            console.log('❤️ FavoriteService: Adding product to favorites:', productId);

            // Check authentication
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('❌ No token found for add to favorites');
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để sử dụng tính năng này'
                };
            }

            console.log('🔑 Token found for add favorites:', token.substring(0, 20) + '...');
            console.log('📦 Request data:', { productId });

            const response = await apiService.post(API_ENDPOINTS.FAVORITE.ADD, {
                productId: productId
            });

            console.log('✅ Add to favorites API response:', response);
            console.log('📊 Response success field:', response.success);
            console.log('💬 Response message:', response.message);

            return {
                success: response.success !== false,
                message: response.message || 'Đã thêm vào danh sách yêu thích',
                data: response
            };
        } catch (error) {
            console.error('❌ FavoriteService: Error adding to favorites:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);

            // Handle specific error cases
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để sử dụng tính năng này'
                };
            }

            return {
                success: false,
                message: error.message || 'Không thể thêm vào yêu thích. Vui lòng thử lại.'
            };
        }
    }

    /**
     * Remove product from favorites
     * @param {string} productId - Product ID to remove from favorites
     * @returns {Promise} API response
     */
    async removeFromFavorites(productId) {
        try {
            console.log('💔 FavoriteService: Removing product from favorites:', productId);

            // Check authentication
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để sử dụng tính năng này'
                };
            }

            const response = await apiService.delete(API_ENDPOINTS.FAVORITE.REMOVE(productId));

            console.log('✅ Product removed from favorites successfully:', response);
            return {
                success: response.success !== false,
                message: response.message || 'Đã xóa khỏi danh sách yêu thích',
                data: response
            };
        } catch (error) {
            console.error('❌ FavoriteService: Error removing from favorites:', error);

            // Handle specific error cases
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để sử dụng tính năng này'
                };
            }

            return {
                success: false,
                message: error.message || 'Không thể xóa khỏi yêu thích. Vui lòng thử lại.'
            };
        }
    }

    /**
     * Get all favorite products
     * @param {number} page - Page number (default: 1)
     * @param {number} pageSize - Page size (default: 20)
     * @returns {Promise} API response with favorite products
     */    async getFavoriteProducts(page = 1, pageSize = 20) {
        try {
            console.log('📋 FavoriteService: Getting favorite products, page:', page);

            // Check authentication
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('❌ No token found');
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để xem danh sách yêu thích',
                    data: [],
                    totalCount: 0,
                    currentPage: page,
                    pageSize: pageSize,
                    totalPages: 0
                };
            }

            console.log('🔑 Token found:', token.substring(0, 20) + '...');

            const endpoint = `${API_ENDPOINTS.FAVORITE.GET_ALL}?page=${page}&pageSize=${pageSize}`;
            console.log('🌐 Calling endpoint:', endpoint);

            const response = await apiService.get(endpoint);

            console.log('✅ Raw API response:', response);
            console.log('📊 Response type:', typeof response);
            console.log('📋 Response keys:', Object.keys(response || {}));

            // Map backend response to expected format
            const result = {
                success: true,
                data: response.favoriteProducts || response.data || [],
                totalCount: response.totalCount || 0,
                currentPage: response.currentPage || page,
                pageSize: response.pageSize || pageSize,
                totalPages: response.totalPages || Math.ceil((response.totalCount || 0) / pageSize)
            };

            console.log('🎯 Processed result:', result);
            console.log('📦 Number of favorites:', result.data?.length || 0);

            return result;
        } catch (error) {
            console.error('❌ FavoriteService: Error loading favorites:', error);
            console.error('❌ Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });

            // Handle specific error cases
            if (error.response?.status === 401 || error.message.includes('401') || error.message.includes('Unauthorized')) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để xem danh sách yêu thích',
                    data: [],
                    totalCount: 0,
                    currentPage: page,
                    pageSize: pageSize,
                    totalPages: 0
                };
            }

            return {
                success: false,
                message: `Error: ${error.message} | Status: ${error.response?.status || 'Unknown'} | Data: ${JSON.stringify(error.response?.data || {})}`,
                data: [],
                totalCount: 0,
                currentPage: page,
                pageSize: pageSize,
                totalPages: 0
            };
        }
    }

    /**
     * Check if product is in favorites
     * @param {string} productId - Product ID to check
     * @returns {Promise} Boolean indicating if product is favorited
     */
    async checkFavoriteStatus(productId) {
        try {
            console.log('🔍 FavoriteService: Checking favorite status for:', productId);

            // Check authentication
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    isFavorite: false,
                    message: 'Vui lòng đăng nhập để sử dụng tính năng này'
                };
            }

            const response = await apiService.get(API_ENDPOINTS.FAVORITE.CHECK(productId));

            console.log('✅ Favorite status checked:', response);
            return {
                success: true,
                isFavorite: response.isInFavorite || response.isFavorite || false
            };
        } catch (error) {
            console.error('❌ FavoriteService: Error checking favorite status:', error);

            // Handle specific error cases
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return {
                    success: false,
                    isFavorite: false,
                    message: 'Vui lòng đăng nhập để sử dụng tính năng này'
                };
            }

            return {
                success: false,
                isFavorite: false,
                message: error.message || 'Không thể kiểm tra trạng thái yêu thích'
            };
        }
    }

    /**
     * Toggle favorite status (add if not favorite, remove if favorite)
     * @param {string} productId - Product ID to toggle
     * @returns {Promise} API response
     */
    async toggleFavorite(productId) {
        try {
            console.log('🔄 FavoriteService: Toggling favorite for:', productId);

            // First check current status
            const statusResult = await this.checkFavoriteStatus(productId);

            if (statusResult.success) {
                if (statusResult.isFavorite) {
                    // Remove from favorites
                    return await this.removeFromFavorites(productId);
                } else {
                    // Add to favorites
                    return await this.addToFavorites(productId);
                }
            } else {
                return {
                    success: false,
                    message: 'Không thể kiểm tra trạng thái yêu thích'
                };
            }
        } catch (error) {
            console.error('❌ FavoriteService: Error toggling favorite:', error);
            return {
                success: false,
                message: 'Có lỗi khi cập nhật trạng thái yêu thích'
            };
        }
    }

    /**
     * Get favorite statistics for user
     * @returns {Promise} Favorite statistics
     */
    async getFavoriteStats() {
        try {
            console.log('📊 FavoriteService: Getting favorite statistics');

            // Check authentication
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    success: false,
                    data: {
                        totalFavorites: 0,
                        recentlyAdded: 0
                    },
                    message: 'Vui lòng đăng nhập để xem thống kê'
                };
            }

            // Get first page to get total count
            const favoritesResult = await this.getFavoriteProducts(1, 1);

            return {
                success: favoritesResult.success,
                data: {
                    totalFavorites: favoritesResult.totalCount || 0,
                    recentlyAdded: 0 // This would need additional API endpoint
                },
                message: favoritesResult.message
            };
        } catch (error) {
            console.error('❌ FavoriteService: Error getting stats:', error);
            return {
                success: false,
                data: {
                    totalFavorites: 0,
                    recentlyAdded: 0
                },
                message: error.message || 'Không thể lấy thống kê yêu thích'
            };
        }
    }
}

// Export singleton instance
const favoriteService = new FavoriteService();
export default favoriteService;
