import api from './apiService';

const ENDPOINTS = {
    CREATE_LICENSE: '/api/SellerLicense',
    GET_MY_LICENSES: '/api/SellerLicense/my-licenses',
    GET_LICENSE_BY_ID: '/api/SellerLicense',
    UPDATE_LICENSE: '/api/SellerLicense',
    DELETE_LICENSE: '/api/SellerLicense',
    GET_STATISTICS: '/api/SellerLicense/statistics'
};

const licenseService = {
    // Create a new license
    createLicense: async (licenseData) => {
        try {
            const response = await api.post(ENDPOINTS.CREATE_LICENSE, licenseData);
            return response.data;
        } catch (error) {
            console.error('Error creating license:', error);
            throw error;
        }
    },

    // Get my licenses with pagination and filters
    getMyLicenses: async (params = {}) => {
        try {
            const response = await api.get(ENDPOINTS.GET_MY_LICENSES, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching my licenses:', error);
            throw error;
        }
    },

    // Get license by ID
    getLicenseById: async (licenseId) => {
        try {
            const response = await api.get(`${ENDPOINTS.GET_LICENSE_BY_ID}/${licenseId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching license by ID:', error);
            throw error;
        }
    },

    // Update license (only for Pending status)
    updateLicense: async (licenseId, updateData) => {
        try {
            const response = await api.put(`${ENDPOINTS.UPDATE_LICENSE}/${licenseId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating license:', error);
            throw error;
        }
    },

    // Delete license
    deleteLicense: async (licenseId) => {
        try {
            const response = await api.delete(`${ENDPOINTS.DELETE_LICENSE}/${licenseId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting license:', error);
            throw error;
        }
    },

    // Get license statistics (for admin/management)
    getLicenseStatistics: async () => {
        try {
            const response = await api.get(ENDPOINTS.GET_STATISTICS);
            return response.data;
        } catch (error) {
            console.error('Error fetching license statistics:', error);
            throw error;
        }
    },

    // Upload license file (if you have file upload endpoint)
    uploadLicenseFile: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/api/upload/license', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading license file:', error);
            throw error;
        }
    },

    // Helper methods for license types
    getLicenseTypes: () => {
        return [
            { value: 'BusinessLicense', label: 'Giấy phép kinh doanh' },
            { value: 'FoodSafetyCertificate', label: 'Chứng nhận an toàn thực phẩm' },
            { value: 'TaxRegistration', label: 'Đăng ký thuế' },
            { value: 'EnvironmentalPermit', label: 'Giấy phép môi trường' },
            { value: 'Other', label: 'Khác' }
        ];
    },

    // Helper methods for status
    getStatusTypes: () => {
        return [
            { value: 'Pending', label: 'Chờ duyệt', color: 'yellow' },
            { value: 'Verified', label: 'Đã duyệt', color: 'green' },
            { value: 'Rejected', label: 'Bị từ chối', color: 'red' }
        ];
    },

    // Check if license is expired
    isLicenseExpired: (expiryDate) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    },

    // Check if license is expiring soon (within days)
    isLicenseExpiringSoon: (expiryDate, days = 30) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const now = new Date();
        const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        return expiry > now && expiry <= futureDate;
    },

    // Get days until expiry
    getDaysUntilExpiry: (expiryDate) => {
        if (!expiryDate) return null;
        const expiry = new Date(expiryDate);
        const now = new Date();
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
};

export default licenseService;
