import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class ProductUnitService {
    // Get all active units for public use
    async getActiveUnits() {
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCT_UNIT.GET_ACTIVE);

            if (!response.ok) {
                throw new Error('Không thể tải danh sách đơn vị');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching active units:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Get all units with pagination
    async getAllUnits(params = {}) {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Chưa đăng nhập');
            }

            const queryParams = new URLSearchParams({
                page: params.page || 1,
                pageSize: params.pageSize || 20,
                ...params
            });

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`${API_ENDPOINTS.PRODUCT_UNIT.GET_ALL_ADMIN}?${queryParams}`, {
                headers,
                
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Không thể tải danh sách đơn vị`);
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching all units:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get unit by ID
    async getUnitById(id) {
        try {
            const response = await fetch(API_ENDPOINTS.PRODUCT_UNIT.GET_BY_ID(id));

            if (!response.ok) {
                throw new Error('Không tìm thấy thông tin đơn vị');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching unit:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Create new unit
    async createUnit(unitData) {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Chưa đăng nhập');
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(API_ENDPOINTS.PRODUCT_UNIT.CREATE, {
                method: 'POST',
                headers,
                body: JSON.stringify(unitData),
                
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể tạo đơn vị mới');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error creating unit:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Update unit
    async updateUnit(id, unitData) {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Chưa đăng nhập');
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(API_ENDPOINTS.PRODUCT_UNIT.UPDATE(id), {
                method: 'PUT',
                headers,
                body: JSON.stringify(unitData),
                
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể cập nhật đơn vị');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating unit:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Delete unit
    async deleteUnit(id) {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Chưa đăng nhập');
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(API_ENDPOINTS.PRODUCT_UNIT.DELETE(id), {
                method: 'DELETE',
                headers,
                
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể xóa đơn vị');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error deleting unit:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Toggle unit status
    async toggleUnitStatus(id) {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Chưa đăng nhập');
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(API_ENDPOINTS.PRODUCT_UNIT.TOGGLE(id), {
                method: 'PATCH',
                headers,
                
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể thay đổi trạng thái đơn vị');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error toggling unit status:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Search units
    async searchUnits(name, isAdmin = false) {
        try {
            const endpoint = isAdmin ? API_ENDPOINTS.PRODUCT_UNIT.SEARCH_ADMIN : API_ENDPOINTS.PRODUCT_UNIT.SEARCH;
            const queryParams = new URLSearchParams({ name });

            const headers = { 'Content-Type': 'application/json' };
            
            if (isAdmin) {
                const token = authService.getToken();
                if (!token) {
                    throw new Error('Chưa đăng nhập');
                }
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${endpoint}?${queryParams}`, {
                headers,
                credentials: isAdmin ? 'include' : 'omit'
            });

            if (!response.ok) {
                throw new Error('Không thể tìm kiếm đơn vị');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error searching units:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get units by type
    async getUnitsByType(unitType, activeOnly = true) {
        try {
            const queryParams = new URLSearchParams({ activeOnly });
            const response = await fetch(`${API_ENDPOINTS.PRODUCT_UNIT.GET_BY_TYPE(unitType)}?${queryParams}`);

            if (!response.ok) {
                throw new Error('Không thể tải danh sách đơn vị theo loại');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching units by type:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Reorder units
    async reorderUnits(reorderList) {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Chưa đăng nhập');
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(API_ENDPOINTS.PRODUCT_UNIT.REORDER, {
                method: 'POST',
                headers,
                body: JSON.stringify(reorderList),
                
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể sắp xếp lại đơn vị');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error reordering units:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get all unit types
    async getUnitTypes() {
        try {
            // Return default types directly to avoid API issues
            return [
                { value: 0, displayName: 'Khối lượng' },
                { value: 1, displayName: 'Thể tích' },
                { value: 2, displayName: 'Số lượng' },
                { value: 3, displayName: 'Chiều dài' }
            ];
        } catch (error) {
            console.error('Error fetching unit types:', error);
            // Return default types if anything fails
            return [
                { value: 0, displayName: 'Khối lượng' },
                { value: 1, displayName: 'Thể tích' },
                { value: 2, displayName: 'Số lượng' },
                { value: 3, displayName: 'Chiều dài' }
            ];
        }
    }

    // Helper functions
    getUnitTypeDisplayName(unitType) {
        // Xử lý cả trường hợp unitType là số (enum) hoặc string
        const unitTypeMap = {
            // String values
            'Weight': 'Khối lượng',
            'Volume': 'Thể tích', 
            'Count': 'Số lượng',
            'Length': 'Chiều dài',
            // Enum values (numbers)
            0: 'Khối lượng',  // Weight
            1: 'Thể tích',    // Volume  
            2: 'Số lượng',    // Count
            3: 'Chiều dài'    // Length
        };
        
        // Always return a string
        const result = unitTypeMap[unitType];
        if (result) {
            return result;
        }
        
        // Fallback - convert to string safely
        return String(unitType || 'Không xác định');
    }

    getUnitTypeColor(unitType) {
        // Xử lý cả trường hợp unitType là số (enum) hoặc string
        const colorMap = {
            // String values
            'Weight': '#52c41a',
            'Volume': '#1890ff',
            'Count': '#faad14',
            'Length': '#722ed1',
            // Enum values (numbers)
            0: '#52c41a',  // Weight
            1: '#1890ff',  // Volume
            2: '#faad14',  // Count
            3: '#722ed1'   // Length
        };
        return colorMap[unitType] || '#d9d9d9';
    }

    // Format unit for display
    formatUnitDisplay(unit) {
        // Debug: log unit data to see what backend returns
        console.log('Raw unit data from backend:', unit);
        
        return {
            ...unit,
            unitTypeDisplay: this.getUnitTypeDisplayName(unit.unitType),
            unitTypeColor: this.getUnitTypeColor(unit.unitType),
            statusText: unit.isActive ? 'Hoạt động' : 'Không hoạt động',
            statusColor: unit.isActive ? 'success' : 'default'
        };
    }

    // Debug helper function
    debugUnitType(unitType) {
        console.log('UnitType value:', unitType, 'Type:', typeof unitType);
        console.log('Display name:', this.getUnitTypeDisplayName(unitType));
        console.log('Color:', this.getUnitTypeColor(unitType));
    }
}

const productUnitService = new ProductUnitService();
export default productUnitService;
