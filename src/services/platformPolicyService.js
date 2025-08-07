import apiService from './apiService';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Platform Policy Service
export const platformPolicyService = {
    // Get all platform policies
    getAllPolicies: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            // Add search parameter if provided
            if (params.search) {
                queryParams.append('search', params.search);
            }
            
            // Add status filter if provided and not 'all'
            if (params.status && params.status !== 'all') {
                queryParams.append('isActive', params.status);
            }
            
            // Add pagination if provided
            if (params.page) {
                queryParams.append('page', params.page);
            }
            if (params.pageSize) {
                queryParams.append('pageSize', params.pageSize);
            }
            
            const url = queryParams.toString() 
                ? `${API_ENDPOINTS.PLATFORM_POLICY.GET_ALL}?${queryParams.toString()}`
                : API_ENDPOINTS.PLATFORM_POLICY.GET_ALL;
                
            const response = await apiService.get(url);
            
            // Wrap response in expected format if it's just an array
            if (Array.isArray(response)) {
                return {
                    success: true,
                    data: {
                        items: response,
                        totalCount: response.length
                    }
                };
            }
            
            return {
                success: true,
                data: response
            };
        } catch (error) {
            console.error('Error fetching platform policies:', error);
            return {
                success: false,
                message: error.message || 'Không thể tải danh sách chính sách'
            };
        }
    },

    // Get platform policy by ID
    getPolicyById: async (policyId) => {
        try {
            const response = await apiService.get(API_ENDPOINTS.PLATFORM_POLICY.GET_BY_ID(policyId));
            return {
                success: true,
                data: response
            };
        } catch (error) {
            console.error('Error fetching platform policy:', error);
            return {
                success: false,
                message: error.message || 'Không thể tải thông tin chính sách'
            };
        }
    },

    // Create new platform policy
    createPolicy: async (policyData) => {
        try {
            // Only send title and content as required by backend
            const cleanData = {
                title: policyData.title,
                content: policyData.content
            };
            
            const response = await apiService.post(API_ENDPOINTS.PLATFORM_POLICY.CREATE, cleanData);
            return {
                success: true,
                data: response,
                message: 'Tạo chính sách thành công'
            };
        } catch (error) {
            console.error('Error creating platform policy:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể tạo chính sách'
            };
        }
    },

    // Update platform policy
    updatePolicy: async (policyId, policyData) => {
        try {
            // Only send title and content as required by backend
            const cleanData = {
                title: policyData.title,
                content: policyData.content
            };
            
            const response = await apiService.put(API_ENDPOINTS.PLATFORM_POLICY.UPDATE(policyId), cleanData);
            return {
                success: true,
                data: response,
                message: 'Cập nhật chính sách thành công'
            };
        } catch (error) {
            console.error('Error updating platform policy:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể cập nhật chính sách'
            };
        }
    },

    // Toggle platform policy status
    togglePolicyStatus: async (policyId) => {
        try {
            const response = await apiService.put(API_ENDPOINTS.PLATFORM_POLICY.TOGGLE_STATUS(policyId));
            return {
                success: true,
                data: response,
                message: 'Thay đổi trạng thái chính sách thành công'
            };
        } catch (error) {
            console.error('Error toggling platform policy status:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể thay đổi trạng thái chính sách'
            };
        }
    },
};

export default platformPolicyService;
