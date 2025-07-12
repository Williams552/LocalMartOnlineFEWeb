import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class CategoryService {
    // Get all categories with pagination (Admin)
    async getAllCategories(page = 1, pageSize = 20) {
        try {
            const token = authService.getToken();
            console.log('🔍 getAllCategories - Token:', token ? 'Present' : 'Missing');
            
            const url = `${API_ENDPOINTS.CATEGORY.GET_ALL_ADMIN}?page=${page}&pageSize=${pageSize}`;
            console.log('🔍 getAllCategories - URL:', url);

            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, { 
                headers,
                credentials: 'include'
            });

            console.log('🔍 getAllCategories - Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔍 getAllCategories - Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể tải danh sách danh mục'}`);
            }

            const result = await response.json();
            console.log('🔍 getAllCategories - Success result:', result);
            
            return result.data || result;
        } catch (error) {
            console.error('❌ getAllCategories - Error:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get category by ID
    async getCategoryById(id) {
        try {
            const response = await fetch(API_ENDPOINTS.CATEGORY.GET_BY_ID(id));

            if (!response.ok) {
                throw new Error('Không thể tải thông tin danh mục');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching category:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Create new category
    async createCategory(categoryData) {
        try {
            const token = authService.getToken();
            
            const response = await fetch(API_ENDPOINTS.CATEGORY.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify(categoryData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể tạo danh mục'}`);
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error creating category:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Update category
    async updateCategory(id, categoryData) {
        try {
            const token = authService.getToken();
            
            const response = await fetch(API_ENDPOINTS.CATEGORY.UPDATE(id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify(categoryData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể cập nhật danh mục'}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating category:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Delete category
    async deleteCategory(id) {
        try {
            const token = authService.getToken();
            
            const response = await fetch(API_ENDPOINTS.CATEGORY.DELETE(id), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể xóa danh mục'}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Toggle category status (Active/Inactive)
    async toggleCategoryStatus(id) {
        try {
            const token = authService.getToken();
            
            const response = await fetch(API_ENDPOINTS.CATEGORY.TOGGLE(id), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể thay đổi trạng thái danh mục'}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error toggling category status:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Search categories (Admin)
    async searchCategories(name) {
        try {
            const token = authService.getToken();
            
            if (!name || name.trim() === '') {
                console.log('🔍 searchCategories - No name provided, returning all categories');
                return this.getAllCategories();
            }
            
            const queryParams = new URLSearchParams();
            queryParams.append('name', name.trim());
            
            const url = `${API_ENDPOINTS.CATEGORY.SEARCH_ADMIN}?${queryParams}`;
            console.log('🔍 searchCategories - URL:', url);
            
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(url, { 
                method: 'GET',
                headers,
                credentials: 'include'
            });
            
            console.log('🔍 searchCategories - Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔍 searchCategories - Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể tìm kiếm danh mục'}`);
            }
            
            const result = await response.json();
            console.log('🔍 searchCategories - Success result:', result);
            
            return result.data || result;
        } catch (error) {
            console.error('❌ searchCategories - Error:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Filter categories by alphabet (Admin)
    async filterCategories(alphabet) {
        try {
            const token = authService.getToken();
            
            if (!alphabet) {
                console.log('🔍 filterCategories - No alphabet provided, returning all categories');
                return this.getAllCategories();
            }
            
            const queryParams = new URLSearchParams();
            queryParams.append('alphabet', alphabet);
            
            const url = `${API_ENDPOINTS.CATEGORY.FILTER_ADMIN}?${queryParams}`;
            console.log('🔍 filterCategories - URL:', url);
            
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(url, { 
                method: 'GET',
                headers,
                credentials: 'include'
            });
            
            console.log('🔍 filterCategories - Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔍 filterCategories - Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể lọc danh mục'}`);
            }
            
            const result = await response.json();
            console.log('🔍 filterCategories - Success result:', result);
            
            return result.data || result;
        } catch (error) {
            console.error('❌ filterCategories - Error:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }
}

const categoryService = new CategoryService();
export { categoryService };
export default categoryService;
