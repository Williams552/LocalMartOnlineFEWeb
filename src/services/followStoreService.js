// Follow Store Service
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Create axios instance
const createApiClient = () => {
    const client = axios.create({
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5183',
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
                window.location.href = '/auth/login';
            }
            return Promise.reject(error);
        }
    );

    return client;
};

const apiClient = createApiClient();

class FollowStoreService {
    // Get current user ID from localStorage
    getCurrentUserId() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.id || user.Id;
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    }

    // Follow a store
    async followStore(storeId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.post(
                API_ENDPOINTS.STORE.FOLLOW(storeId),
                {},
                {
                    params: { userId }
                }
            );

            return {
                success: true,
                message: response.data?.message || 'Đã theo dõi gian hàng',
                data: response.data
            };
        } catch (error) {
            console.error('Error following store:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể theo dõi gian hàng',
                error: error.response?.data
            };
        }
    }

    // Unfollow a store
    async unfollowStore(storeId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.post(
                API_ENDPOINTS.STORE.UNFOLLOW(storeId),
                {},
                {
                    params: { userId }
                }
            );

            return {
                success: true,
                message: response.data?.message || 'Đã hủy theo dõi gian hàng',
                data: response.data
            };
        } catch (error) {
            console.error('Error unfollowing store:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể hủy theo dõi gian hàng',
                error: error.response?.data
            };
        }
    }

    // Check if user is following a store
    async checkFollowing(storeId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                return { success: true, isFollowing: false };
            }

            const response = await apiClient.get(
                API_ENDPOINTS.STORE.CHECK_FOLLOWING(storeId),
                {
                    params: { userId }
                }
            );

            return {
                success: true,
                isFollowing: response.data?.isFollowing || false,
                data: response.data
            };
        } catch (error) {
            console.error('Error checking follow status:', error);
            return {
                success: false,
                isFollowing: false,
                message: 'Không thể kiểm tra trạng thái theo dõi'
            };
        }
    }

    // Get list of stores user is following
    async getFollowingStores(page = 1, pageSize = 20) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.get(
                API_ENDPOINTS.STORE.GET_FOLLOWING,
                {
                    params: { userId, page, pageSize }
                }
            );

            return {
                success: true,
                data: response.data?.data || [],
                totalCount: response.data?.totalCount || 0,
                currentPage: page,
                pageSize: pageSize
            };
        } catch (error) {
            console.error('Error fetching following stores:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách gian hàng theo dõi',
                data: []
            };
        }
    }

    // Get followers of a store
    async getStoreFollowers(storeId, page = 1, pageSize = 20) {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.STORE.GET_FOLLOWERS(storeId),
                {
                    params: { page, pageSize }
                }
            );

            return {
                success: true,
                data: response.data?.data || [],
                totalCount: response.data?.totalCount || 0,
                currentPage: page,
                pageSize: pageSize
            };
        } catch (error) {
            console.error('Error fetching store followers:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách người theo dõi',
                data: []
            };
        }
    }

    // Toggle follow status
    async toggleFollow(storeId, currentlyFollowing) {
        try {
            if (currentlyFollowing) {
                return await this.unfollowStore(storeId);
            } else {
                return await this.followStore(storeId);
            }
        } catch (error) {
            console.error('Error toggling follow status:', error);
            return {
                success: false,
                message: 'Không thể thay đổi trạng thái theo dõi'
            };
        }
    }

    // Get follow statistics for a store
    async getFollowStats(storeId) {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.STORE.GET_STATISTICS(storeId)
            );

            return {
                success: true,
                followerCount: response.data?.followerCount || 0,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching follow stats:', error);
            return {
                success: false,
                followerCount: 0,
                message: 'Không thể tải thống kê theo dõi'
            };
        }
    }

    // Format follow count
    formatFollowCount(count) {
        if (!count || count === 0) return '0';
        if (count < 1000) return count.toString();
        if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
        return `${(count / 1000000).toFixed(1)}M`;
    }

    // Check user authentication
    isAuthenticated() {
        return !!this.getCurrentUserId();
    }
}

export default new FollowStoreService();
