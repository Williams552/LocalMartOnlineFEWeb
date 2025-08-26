
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
            console.log('🏷️ Fetching active categories...');
            const result = await this.getAllCategories({ 
                isActive: true, 
                pageSize: 1000 // Lấy tất cả danh mục thay vì chỉ 20 danh mục đầu
            });
            const activeCategories = result.items.filter(category => category.isActive);
            console.log('🏷️ Active categories found:', activeCategories);
            return activeCategories;
        } catch (error) {
            console.error('❌ Error fetching active categories:', error);
            throw error;
        }
    }

    // Get all categories for admin (including inactive ones)
    async getAllCategoriesAdmin(page = 1, pageSize = 20) {
        try {
            console.log('🔧 Admin - Fetching all categories (including inactive)...');
            
            const queryParams = new URLSearchParams();
            queryParams.append('page', page);
            queryParams.append('pageSize', pageSize);

            const url = `${API_ENDPOINTS.CATEGORY.GET_ALL_ADMIN}?${queryParams}`;
            const response = await apiClient.get(url);

            console.log('🔧 Admin - Categories response:', response);

            // Return the items from the API response
            if (response.data && response.data.success && response.data.data) {
                return {
                    items: response.data.data.items || [],
                    totalCount: response.data.data.totalCount || 0,
                    page: response.data.data.page || page,
                    pageSize: response.data.data.pageSize || pageSize
                };
            }

            return {
                items: [],
                totalCount: 0,
                page: page,
                pageSize: pageSize
            };
        } catch (error) {
            console.error('❌ Admin - Error fetching all categories:', error);
            throw error;
        }
    }

    // Search categories for admin (including inactive ones)
    async searchCategoriesAdmin(searchTerm) {
        try {
            console.log('🔍 Admin - Searching categories:', searchTerm);
            
            const response = await apiClient.get(API_ENDPOINTS.CATEGORY.SEARCH_ADMIN, {
                params: { name: searchTerm }
            });
            
            if (response.data && response.data.success) {
                return response.data.data || [];
            }
            
            return [];
        } catch (error) {
            console.error('❌ Admin - Error searching categories:', error);
            throw error;
        }
    }

    // Filter categories by alphabet for admin (including inactive ones)
    async filterCategoriesAdmin(alphabet) {
        try {
            console.log('🔤 Admin - Filtering categories by alphabet:', alphabet);
            
            const response = await apiClient.get(API_ENDPOINTS.CATEGORY.FILTER_ADMIN, {
                params: { alphabet }
            });
            
            if (response.data && response.data.success) {
                return response.data.data || [];
            }
            
            return [];
        } catch (error) {
            console.error('❌ Admin - Error filtering categories:', error);
            throw error;
        }
    }

    // Create new category (Admin only)
    async createCategory(categoryData) {
        try {
            console.log('➕ Admin - Creating category:', categoryData);
            
            const response = await apiClient.post(API_ENDPOINTS.CATEGORY.CREATE, categoryData);
            
            if (response.data && response.data.success) {
                console.log('✅ Admin - Category created successfully');
                return response.data.data;
            }
            
            throw new Error('Failed to create category');
        } catch (error) {
            console.error('❌ Admin - Error creating category:', error);
            throw error;
        }
    }

    // Update category (Admin only)
    async updateCategory(id, categoryData) {
        try {
            console.log('✏️ Admin - Updating category:', id, categoryData);
            
            const response = await apiClient.put(API_ENDPOINTS.CATEGORY.UPDATE(id), categoryData);
            
            if (response.data && response.data.success) {
                console.log('✅ Admin - Category updated successfully');
                return response.data.data;
            }
            
            throw new Error('Failed to update category');
        } catch (error) {
            console.error('❌ Admin - Error updating category:', error);
            throw error;
        }
    }

    // Delete category (Admin only)
    async deleteCategory(id) {
        try {
            console.log('🗑️ Admin - Deleting category:', id);
            
            const response = await apiClient.delete(API_ENDPOINTS.CATEGORY.DELETE(id));
            
            if (response.data && response.data.success) {
                console.log('✅ Admin - Category deleted successfully');
                return response.data.data;
            }
            
            throw new Error('Failed to delete category');
        } catch (error) {
            console.error('❌ Admin - Error deleting category:', error);
            throw error;
        }
    }

    // Toggle category status (Admin only)
    async toggleCategoryStatus(id) {
        try {
            console.log('🔄 Admin - Toggling category status:', id);
            
            const response = await apiClient.patch(API_ENDPOINTS.CATEGORY.TOGGLE(id));
            
            if (response.data && response.data.success) {
                console.log('✅ Admin - Category status toggled successfully');
                return response.data.data;
            }
            
            throw new Error('Failed to toggle category status');
        } catch (error) {
            console.error('❌ Admin - Error toggling category status:', error);
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

const categoryService = new CategoryService();

export { categoryService };
export default categoryService;