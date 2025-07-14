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

class CategoryService {
    // Get all categories
    async getAllCategories(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Add pagination parameters if provided
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);
            if (params.search) queryParams.append('search', params.search);
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

            const url = queryParams.toString()
                ? `${API_ENDPOINTS.CATEGORY.GET_ALL}?${queryParams}`
                : API_ENDPOINTS.CATEGORY.GET_ALL;

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
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    // Get only active categories for frontend
    async getActiveCategories() {
        try {
            const result = await this.getAllCategories({ isActive: true });
            return result.items.filter(category => category.isActive);
        } catch (error) {
            console.error('Error fetching active categories:', error);
            throw error;
        }
    }

    // Get category by ID
    async getCategoryById(id) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.CATEGORY.GET_BY_ID(id));

            if (response.data && response.data.success) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error(`Error fetching category ${id}:`, error);
            throw error;
        }
    }

    // Format category data for frontend use
    formatCategoryForFrontend(category) {
        return {
            id: category.id,
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            // Add compatibility fields
            categoryName: category.name,
        };
    }

    // Get formatted categories for frontend
    async getFormattedCategories(params = {}) {
        try {
            const result = await this.getAllCategories(params);

            return {
                ...result,
                items: result.items.map(category => this.formatCategoryForFrontend(category))
            };
        } catch (error) {
            console.error('Error getting formatted categories:', error);
            throw error;
        }
    }
}

export default new CategoryService();
