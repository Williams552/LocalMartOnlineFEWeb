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

// Create public API client (no auth required)
const publicApiClient = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

class ProductUnitService {
    // Get all active units for public use
    async getActiveUnits() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PRODUCT_UNIT.GET_ACTIVE);
            
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching active units:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Get all units with pagination
    async getAllUnits(params = {}) {
        try {
            const queryParams = new URLSearchParams({
                page: params.page || 1,
                pageSize: params.pageSize || 20,
                ...params
            });

            const url = `${API_ENDPOINTS.PRODUCT_UNIT.GET_ALL_ADMIN}?${queryParams}`;
            console.log('🔍 ProductUnitService - Calling admin endpoint:', url);


            const response = await apiClient.get(url);
            console.log('🔍 ProductUnitService - Response:', response.data);


            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('❌ Error fetching all units:', error);
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.');
            }
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Get unit by ID
    async getUnitById(id) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PRODUCT_UNIT.GET_BY_ID(id));
            
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || null;
        } catch (error) {
            console.error('Error fetching unit:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Create new unit
    async createUnit(unitData) {
        try {

            const response = await apiClient.post(API_ENDPOINTS.PRODUCT_UNIT.CREATE, unitData);
            
            if (response.data && response.data.success) {
                return response.data.data || response.data;

            }
            return response.data;
        } catch (error) {
            console.error('Error creating unit:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Update unit
    async updateUnit(id, unitData) {
        try {

            const response = await apiClient.put(API_ENDPOINTS.PRODUCT_UNIT.UPDATE(id), unitData);
            
            if (response.data && response.data.success) {
                return response.data.data || response.data;

            }
            return response.data;
        } catch (error) {
            console.error('Error updating unit:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Delete unit
    async deleteUnit(id) {
        try {

            const response = await apiClient.delete(API_ENDPOINTS.PRODUCT_UNIT.DELETE(id));
            
            if (response.data && response.data.success) {
                return response.data.data || response.data;

            }
            return response.data;
        } catch (error) {
            console.error('Error deleting unit:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Toggle unit status
    async toggleUnitStatus(id) {
        try {

            const response = await apiClient.patch(API_ENDPOINTS.PRODUCT_UNIT.TOGGLE(id));
            
            if (response.data && response.data.success) {
                return response.data.data || response.data;

            }
            return response.data;
        } catch (error) {
            console.error('Error toggling unit status:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Search units
    async searchUnits(name, isAdmin = false) {
        try {
            const endpoint = isAdmin ? API_ENDPOINTS.PRODUCT_UNIT.SEARCH_ADMIN : API_ENDPOINTS.PRODUCT_UNIT.SEARCH;
            const params = { name };

            const response = isAdmin 
                ? await apiClient.get(endpoint, { params })
                : await publicApiClient.get(endpoint, { params });
            
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('Error searching units:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Get units by type
    async getUnitsByType(unitType, activeOnly = true) {
        try {
            const params = { activeOnly };
            const response = await publicApiClient.get(API_ENDPOINTS.PRODUCT_UNIT.GET_BY_TYPE(unitType), { params });

            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching units by type:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
        }
    }

    // Admin: Reorder units
    async reorderUnits(reorderList) {
        try {

            const response = await apiClient.post(API_ENDPOINTS.PRODUCT_UNIT.REORDER, reorderList);
            
            if (response.data && response.data.success) {
                return response.data.data || response.data;

            }
            return response.data;
        } catch (error) {
            console.error('Error reordering units:', error);
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
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
