import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class SellerRegistrationService {
    // Lấy tất cả đăng ký (cho admin)
    async getAll() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.SELLER_REGISTRATION.GET_ALL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (!res.ok) throw new Error('Không thể tải danh sách đăng ký');
            const result = await res.json();
            const data = Array.isArray(result) ? result : (result.data || []);
            // Map về đúng SellerRegistrationResponseDTO
            return data.map(item => ({
                id: item.id,
                name: item.name,
                email: item.email,
                phoneNumber: item.phoneNumber,
                userId: item.userId,
                storeName: item.storeName,
                storeAddress: item.storeAddress,
                marketId: item.marketId,
                businessLicense: item.businessLicense,
                status: item.status,
                rejectionReason: item.rejectionReason,
                licenseEffectiveDate: item.licenseEffectiveDate ? new Date(item.licenseEffectiveDate) : null,
                licenseExpiryDate: item.licenseExpiryDate ? new Date(item.licenseExpiryDate) : null,
                createdAt: item.createdAt ? new Date(item.createdAt) : null,
                updatedAt: item.updatedAt ? new Date(item.updatedAt) : null
            }));
        } catch (error) {
            console.error('Error getAll seller registrations:', error);
            throw error;
        }
    }

    // Lấy đăng ký theo id (cho admin)
    async getById(id) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_ENDPOINTS.SELLER_REGISTRATION.GET_ALL}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (!res.ok) throw new Error('Không thể tải đăng ký');
            const result = await res.json();
            const item = result.data || result;
            return {
                id: item.id,
                name: item.name,
                email: item.email,
                phoneNumber: item.phoneNumber,
                userId: item.userId,
                storeName: item.storeName,
                storeAddress: item.storeAddress,
                marketId: item.marketId,
                businessLicense: item.businessLicense,
                status: item.status,
                rejectionReason: item.rejectionReason,
                licenseEffectiveDate: item.licenseEffectiveDate ? new Date(item.licenseEffectiveDate) : null,
                licenseExpiryDate: item.licenseExpiryDate ? new Date(item.licenseExpiryDate) : null,
                createdAt: item.createdAt ? new Date(item.createdAt) : null,
                updatedAt: item.updatedAt ? new Date(item.updatedAt) : null
            };
        } catch (error) {
            console.error('Error getById seller registration:', error);
            throw error;
        }
    }

    // Cập nhật đăng ký (duyệt/từ chối)
    async update(id, updateDto) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_ENDPOINTS.SELLER_REGISTRATION.GET_ALL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(updateDto)
            });
            if (!res.ok) throw new Error('Không thể cập nhật đăng ký');
            return await res.json();
        } catch (error) {
            console.error('Error update seller registration:', error);
            throw error;
        }
    }
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
            const item = result.data || result;
            return {
                id: item.id,
                name: item.name,
                email: item.email,
                phoneNumber: item.phoneNumber,
                userId: item.userId,
                storeName: item.storeName,
                storeAddress: item.storeAddress,
                marketId: item.marketId,
                businessLicense: item.businessLicense,
                status: item.status,
                rejectionReason: item.rejectionReason,
                licenseEffectiveDate: item.licenseEffectiveDate ? new Date(item.licenseEffectiveDate) : null,
                licenseExpiryDate: item.licenseExpiryDate ? new Date(item.licenseExpiryDate) : null,
                createdAt: item.createdAt ? new Date(item.createdAt) : null,
                updatedAt: item.updatedAt ? new Date(item.updatedAt) : null
            };
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

    async approve(approveDto) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.SELLER_REGISTRATION.APPROVE, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    RegistrationId: approveDto.RegistrationId,
                    Approve: approveDto.Approve,
                    RejectionReason: approveDto.RejectionReason,
                    LicenseEffectiveDate: approveDto.LicenseEffectiveDate,
                    LicenseExpiryDate: approveDto.LicenseExpiryDate
                })
            });
            const result = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(result.message || 'Lỗi duyệt/từ chối đăng ký');
            }
            return result;
        } catch (error) {
            throw error;
        }
    }
}

const sellerRegistrationService = new SellerRegistrationService();
export default sellerRegistrationService;
