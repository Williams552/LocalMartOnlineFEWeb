import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class ProxyShopperRegistrationService {
    // Register as proxy shopper
    async registerProxyShopper(registrationData) {
        try {
            // Prepare the request data according to backend DTO
            const requestData = {
                operatingArea: registrationData.operatingArea,
                transportMethod: registrationData.transportMethod,
                paymentMethod: registrationData.paymentMethod
            };

            const response = await authService.makeAuthenticatedRequest(
                API_ENDPOINTS.PROXY_SHOPPER_REGISTRATION.REGISTER,
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
                    data: result.data || result,
                    message: result.message || 'Đăng ký proxy shopper thành công'
                };
            } else {
                throw new Error(result.message || 'Đăng ký thất bại');
            }
        } catch (error) {
            console.error('Error registering proxy shopper:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }

    // Get my registration status
    async getMyRegistration() {
        try {
            const response = await authService.makeAuthenticatedRequest(
                API_ENDPOINTS.PROXY_SHOPPER_REGISTRATION.GET_MY
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

    // Get all registrations (Admin only)
    async getAll() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.PROXY_SHOPPER_REGISTRATION.GET_ALL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (!res.ok) throw new Error('Không thể tải danh sách đăng ký proxy shopper');
            const result = await res.json();
            // Trả về đúng data gốc từ response
            return Array.isArray(result) ? result : (result.data || []);
        } catch (error) {
            console.error('Error getAll proxy shopper registrations:', error);
            throw error;
        }
    }

    // Approve/Reject registration (Admin only)
    async approveRegistration(registrationId, approve, rejectionReason = null) {
        try {
            const requestData = {
                registrationId,
                approve,
                rejectionReason
            };

            const response = await authService.makeAuthenticatedRequest(
                API_ENDPOINTS.PROXY_SHOPPER_REGISTRATION.APPROVE,
                {
                    method: 'PUT',
                    body: JSON.stringify(requestData)
                }
            );

            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({}));
                throw new Error(errorResult.message || 'Không thể cập nhật trạng thái đăng ký');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error approving registration:', error);
            throw new Error(error.message || 'Lỗi kết nối server');
        }
    }
}

const proxyShopperRegistrationService = new ProxyShopperRegistrationService();
export default proxyShopperRegistrationService;
