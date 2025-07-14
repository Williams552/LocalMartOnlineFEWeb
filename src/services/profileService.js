// src/services/profileService.js
import apiService from './apiService';
import authService from './authService';

class ProfileService {
    // Get current user profile
    async getCurrentUserProfile() {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser || !currentUser.id) {
                throw new Error('Không tìm thấy thông tin người dùng đăng nhập');
            }

            const response = await apiService.get(`/api/User/${currentUser.id}`);
            return response;
        } catch (error) {
            console.error('Error fetching current user profile:', error);
            throw new Error(error.message || 'Lỗi khi lấy thông tin hồ sơ');
        }
    }

    // Update current user profile
    async updateCurrentUserProfile(profileData) {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser || !currentUser.id) {
                throw new Error('Không tìm thấy thông tin người dùng đăng nhập');
            }

            // Map profile data to RegisterDTO format for API
            const updateDto = {
                username: profileData.username || currentUser.username,
                password: '', // Không cập nhật password ở đây
                email: profileData.email,
                fullName: profileData.fullName,
                phoneNumber: profileData.phoneNumber || '',
                address: profileData.address || '',
                userToken: profileData.userToken || null
            };

            const response = await apiService.put(`/api/User/${currentUser.id}`, updateDto);

            // Update local storage with new data if successful
            if (response.success) {
                const updatedUser = {
                    ...currentUser,
                    fullName: profileData.fullName,
                    email: profileData.email,
                    phoneNumber: profileData.phoneNumber,
                    address: profileData.address
                };
                authService.updateCurrentUser(updatedUser);
            }

            return response;
        } catch (error) {
            console.error('Error updating current user profile:', error);
            throw new Error(error.message || 'Lỗi khi cập nhật hồ sơ');
        }
    }

    // Update user language preference
    async updateLanguage(language) {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser || !currentUser.id) {
                throw new Error('Không tìm thấy thông tin người dùng đăng nhập');
            }

            const response = await apiService.put(`/api/User/${currentUser.id}/language`, {
                preferredLanguage: language
            });
            return response;
        } catch (error) {
            console.error('Error updating language:', error);
            throw new Error(error.message || 'Lỗi khi cập nhật ngôn ngữ');
        }
    }

    // Get user language preference
    async getLanguage() {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser || !currentUser.id) {
                throw new Error('Không tìm thấy thông tin người dùng đăng nhập');
            }

            const response = await apiService.get(`/api/User/${currentUser.id}/language`);
            return response;
        } catch (error) {
            console.error('Error fetching language:', error);
            throw new Error(error.message || 'Lỗi khi lấy thông tin ngôn ngữ');
        }
    }

    // Update user theme preference
    async updateTheme(theme) {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser || !currentUser.id) {
                throw new Error('Không tìm thấy thông tin người dùng đăng nhập');
            }

            const response = await apiService.put(`/api/User/${currentUser.id}/theme`, {
                preferredTheme: theme
            });
            return response;
        } catch (error) {
            console.error('Error updating theme:', error);
            throw new Error(error.message || 'Lỗi khi cập nhật giao diện');
        }
    }

    // Get user theme preference
    async getTheme() {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser || !currentUser.id) {
                throw new Error('Không tìm thấy thông tin người dùng đăng nhập');
            }

            const response = await apiService.get(`/api/User/${currentUser.id}/theme`);
            return response;
        } catch (error) {
            console.error('Error fetching theme:', error);
            throw new Error(error.message || 'Lỗi khi lấy thông tin giao diện');
        }
    }

    // Disable own account
    async disableOwnAccount() {
        try {
            const response = await apiService.patch('/api/User/disable-own', {});

            // If successful, logout user
            if (response.success) {
                authService.logout();
            }

            return response;
        } catch (error) {
            console.error('Error disabling account:', error);
            throw new Error(error.message || 'Lỗi khi vô hiệu hóa tài khoản');
        }
    }

    // Helper method to format user data for display
    formatUserData(userData) {
        if (!userData) return null;

        // Handle boolean conversion more explicitly
        const isEmailVerified = userData.isEmailVerified === true || userData.isEmailVerified === 'true';
        const twoFactorEnabled = userData.twoFactorEnabled === true || userData.twoFactorEnabled === 'true';

        return {
            id: userData.id,
            username: userData.username || '',
            email: userData.email || '',
            fullName: userData.fullName || '',
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            role: userData.role || 'Buyer',
            status: userData.status || 'Active',
            isEmailVerified: isEmailVerified,
            twoFactorEnabled: twoFactorEnabled,
            avatarUrl: userData.avatarUrl || null,
            operatingArea: userData.operatingArea || '',
            preferredLanguage: userData.preferredLanguage || 'vi',
            preferredTheme: userData.preferredTheme || 'light',
            createdAt: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('vi-VN') : '',
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('vi-VN') : ''
        };
    }

    // Get role display name
    getRoleDisplayName(role) {
        const roleMap = {
            'Admin': 'Quản trị viên',
            'Seller': 'Người bán',
            'Buyer': 'Khách hàng',
            'ProxyShopper': 'Người đi chợ'
        };
        return roleMap[role] || role;
    }

    // Get status display name and color
    getStatusDisplay(status) {
        const statusMap = {
            'Active': { name: 'Hoạt động', color: 'text-green-600 bg-green-100' },
            'Inactive': { name: 'Không hoạt động', color: 'text-red-600 bg-red-100' },
            'Suspended': { name: 'Bị đình chỉ', color: 'text-yellow-600 bg-yellow-100' },
            'Pending': { name: 'Chờ xét duyệt', color: 'text-blue-600 bg-blue-100' }
        };
        return statusMap[status] || { name: status, color: 'text-gray-600 bg-gray-100' };
    }
}

const profileService = new ProfileService();
export default profileService;
