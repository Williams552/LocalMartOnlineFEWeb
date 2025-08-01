// src/services/marketFeeTypeService.js
import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class MarketFeeTypeService {
    // Get all market fee types (active only)
    async getAllMarketFeeTypes() {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET_FEE_TYPE.GET_ALL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách loại phí chợ');
            }

            const result = await response.json();
            console.log('MarketFeeType - API Response:', result);
            
            return {
                success: true,
                data: result.marketFeeTypes || result,
                totalCount: result.totalCount || (result.marketFeeTypes ? result.marketFeeTypes.length : 0)
            };
        } catch (error) {
            console.error('Error fetching market fee types:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server',
                data: []
            };
        }
    }

    // Get market fee type by ID
    async getMarketFeeTypeById(feeTypeId) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET_FEE_TYPE.GET_BY_ID(feeTypeId), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Không tìm thấy loại phí');
                }
                throw new Error('Không thể tải thông tin loại phí');
            }

            const result = await response.json();
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Error fetching market fee type:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server'
            };
        }
    }

    // Create new market fee type
    async createMarketFeeType(feeTypeData) {
        try {
            const token = authService.getToken();
            
            // Validate required fields
            if (!feeTypeData.feeType || !feeTypeData.feeType.trim()) {
                throw new Error('Tên loại phí là bắt buộc');
            }

            const response = await fetch(API_ENDPOINTS.MARKET_FEE_TYPE.CREATE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feeType: feeTypeData.feeType.trim()
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Không thể tạo loại phí mới');
            }

            const result = await response.json();
            return {
                success: true,
                data: result,
                message: 'Tạo loại phí thành công'
            };
        } catch (error) {
            console.error('Error creating market fee type:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server'
            };
        }
    }

    // Update market fee type
    async updateMarketFeeType(feeTypeId, feeTypeData) {
        try {
            const token = authService.getToken();
            
            // Validate required fields
            if (!feeTypeData.feeType || !feeTypeData.feeType.trim()) {
                throw new Error('Tên loại phí là bắt buộc');
            }

            const response = await fetch(API_ENDPOINTS.MARKET_FEE_TYPE.UPDATE(feeTypeId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feeType: feeTypeData.feeType.trim()
                })
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Không tìm thấy loại phí');
                }
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Không thể cập nhật loại phí');
            }

            const result = await response.json();
            return {
                success: true,
                data: result,
                message: 'Cập nhật loại phí thành công'
            };
        } catch (error) {
            console.error('Error updating market fee type:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server'
            };
        }
    }

    // Delete market fee type (soft delete)
    async deleteMarketFeeType(feeTypeId) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET_FEE_TYPE.DELETE(feeTypeId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Không tìm thấy loại phí');
                }
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Không thể xóa loại phí');
            }

            const result = await response.json().catch(() => ({ message: 'Xóa loại phí thành công' }));
            return {
                success: true,
                message: result.message || 'Xóa loại phí thành công'
            };
        } catch (error) {
            console.error('Error deleting market fee type:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server'
            };
        }
    }

    // Restore market fee type
    async restoreMarketFeeType(feeTypeId) {
        try {
            const token = authService.getToken();
            const response = await fetch(API_ENDPOINTS.MARKET_FEE_TYPE.RESTORE(feeTypeId), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Không tìm thấy loại phí');
                }
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Không thể khôi phục loại phí');
            }

            const result = await response.json().catch(() => ({ message: 'Khôi phục loại phí thành công' }));
            return {
                success: true,
                message: result.message || 'Khôi phục loại phí thành công'
            };
        } catch (error) {
            console.error('Error restoring market fee type:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server'
            };
        }
    }

    // Format market fee type for display
    formatMarketFeeTypeForDisplay(feeType) {
        if (!feeType) return null;

        return {
            id: feeType.id,
            feeType: feeType.feeType,
            createdAt: feeType.createdAt,
            isDeleted: feeType.isDeleted || false,
            displayName: feeType.feeType,
            createdDate: feeType.createdAt ? new Date(feeType.createdAt).toLocaleDateString('vi-VN') : ''
        };
    }

    // Get market fee types for dropdown
    async getMarketFeeTypesForSelect() {
        try {
            const result = await this.getAllMarketFeeTypes();
            if (result.success) {
                return result.data.map(feeType => ({
                    value: feeType.id,
                    label: feeType.feeType,
                    key: feeType.id
                }));
            }
            return [];
        } catch (error) {
            console.error('Error getting market fee types for select:', error);
            return [];
        }
    }
}

const marketFeeTypeService = new MarketFeeTypeService();
export { marketFeeTypeService };
export default marketFeeTypeService;
