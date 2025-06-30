import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class SellerRegistrationService {
    // Register as seller
    async registerSeller(registrationData) {
        try {
            // Prepare the request data according to backend DTO
            const requestData = {
                storeName: registrationData.storeName,
                storeAddress: registrationData.storeAddress,
                marketId: registrationData.marketId,
                businessLicense: registrationData.businessLicense || null
            };

            const response = await authService.makeAuthenticatedRequest(
                API_ENDPOINTS.SELLER_REGISTRATION.REGISTER,
                {
                    method: 'POST',
                    body: JSON.stringify(requestData)
                }
            );

            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({}));
                throw new Error(errorResult.message || 'Đăng ký thất bại');
            }

            const result = await response.json();

            // Handle different response formats from backend
            if (result && (result.success === true || result.success === undefined)) {
                return {
                    success: true,
                    message: result.message || 'Đăng ký thành công',
                    data: result.data || result
                };
            } else {
                throw new Error(result.message || 'Đăng ký thất bại');
            }
        } catch (error) {
            console.error('Error registering seller:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get my registration status
    async getMyRegistration() {
        try {
            const response = await authService.makeAuthenticatedRequest(
                API_ENDPOINTS.SELLER_REGISTRATION.GET_MY
            );

            if (response.status === 404) {
                return null; // No registration found
            }

            if (!response.ok) {
                throw new Error('Không thể tải thông tin đăng ký');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error fetching registration:', error);
            if (error.message.includes('404') || error.message.includes('Không tìm thấy')) {
                return null;
            }
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Upload business license or contract file
    async uploadBusinessLicense(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Note: This endpoint might need to be implemented in the backend
            const response = await authService.makeAuthenticatedRequest(
                `${API_ENDPOINTS.SELLER_REGISTRATION.REGISTER}/upload-license`,
                {
                    method: 'POST',
                    headers: {
                        // Don't set Content-Type for FormData, let browser set it with boundary
                    },
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error('Tải file thất bại');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error(error.message || 'Lỗi tải file');
        }
    }
}

const sellerRegistrationService = new SellerRegistrationService();
export default sellerRegistrationService;
