
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
    // Get all categories for admin
    async getAllCategories(page = 1, pageSize = 20, params = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Add pagination parameters
            queryParams.append('page', page.toString());
            queryParams.append('pageSize', pageSize.toString());
            
            // Add other parameters if provided
            if (params.search) queryParams.append('search', params.search);
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

            // Use admin endpoint for CategoryManagement
            const url = `${API_ENDPOINTS.CATEGORY.GET_ALL_ADMIN}?${queryParams}`;
            console.log('🔍 CategoryService - Calling admin endpoint:', url);

            const response = await apiClient.get(url);
            console.log('🔍 CategoryService - Response:', response.data);

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
            console.error('❌ Error fetching categories:', error);
            if (error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Get only active categories for frontend
    async getActiveCategories() {
        try {
            console.log('🏷️ Fetching active categories...');
            const result = await this.getAllCategories({ isActive: true });
            const activeCategories = result.items.filter(category => category.isActive);
            console.log('🏷️ Active categories found:', activeCategories);
            return activeCategories;
        } catch (error) {
            console.error('❌ Error fetching active categories:', error);
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

    // Search categories for admin
    async searchCategories(searchTerm) {
        try {
            console.log('🔍 CategoryService - Searching categories with term:', searchTerm);
            const response = await apiClient.get(`${API_ENDPOINTS.CATEGORY.SEARCH_ADMIN}?name=${encodeURIComponent(searchTerm)}`);
            console.log('🔍 CategoryService - Search response:', response.data);

            if (response.data && response.data.success) {
                // Return array format for consistency with getAllCategories
                return response.data.data || [];
            }

            return [];
        } catch (error) {
            console.error('❌ Error searching categories:', error);
            if (error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi tìm kiếm danh mục');
        }
    }

    // Filter categories for admin  
    async filterCategories(alphabet) {
        try {
            console.log('🔍 CategoryService - Filtering categories by alphabet:', alphabet);
            const response = await apiClient.get(`${API_ENDPOINTS.CATEGORY.FILTER_ADMIN}?letter=${alphabet}`);
            console.log('🔍 CategoryService - Filter response:', response.data);

            if (response.data && response.data.success) {
                // Return array format for consistency with getAllCategories
                return response.data.data || [];
            }

            return [];
        } catch (error) {
            console.error('❌ Error filtering categories:', error);
            if (error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi lọc danh mục');
        }
    }

    // Create category (Admin only)
    async createCategory(categoryData) {
        try {
            console.log('🔄 CategoryService - Creating category:', categoryData);
            const response = await apiClient.post(API_ENDPOINTS.CATEGORY.CREATE, categoryData);
            console.log('✅ CategoryService - Create response:', response.data);

            if (response.data && response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || 'Tạo danh mục thất bại');
        } catch (error) {
            console.error('❌ Error creating category:', error);
            if (error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi tạo danh mục');
        }
    }

    // Update category (Admin only)
    async updateCategory(id, categoryData) {
        try {
            console.log('🔄 CategoryService - Updating category:', id, categoryData);
            const response = await apiClient.put(API_ENDPOINTS.CATEGORY.UPDATE(id), categoryData);
            console.log('✅ CategoryService - Update response:', response.data);

            if (response.data && response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || 'Cập nhật danh mục thất bại');
        } catch (error) {
            console.error('❌ Error updating category:', error);
            if (error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi cập nhật danh mục');
        }
    }

    // Delete category (Admin only)
    async deleteCategory(id) {
        try {
            console.log('🔄 CategoryService - Deleting category:', id);
            const response = await apiClient.delete(API_ENDPOINTS.CATEGORY.DELETE(id));
            console.log('✅ CategoryService - Delete response:', response.data);

            return response.data;
        } catch (error) {
            console.error('❌ Error deleting category:', error);
            if (error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi xóa danh mục');
        }
    }

    // Toggle category status (Admin only)
    async toggleCategoryStatus(id) {
        try {
            console.log('🔄 CategoryService - Toggling category status:', id);
            const response = await apiClient.patch(API_ENDPOINTS.CATEGORY.TOGGLE(id));
            console.log('✅ CategoryService - Toggle response:', response.data);

            return response.data;
        } catch (error) {
            console.error('❌ Error toggling category status:', error);
            if (error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi thay đổi trạng thái danh mục');
        }
    }
}

const categoryService = new CategoryService();

export { categoryService };
export default categoryService;

