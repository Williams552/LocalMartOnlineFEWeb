// src/services/userService.js
import apiService from './apiService';

class UserService {
    // Get all users with pagination and filters (Admin only)

    async getAllUsers() {
        try {
            const response = await apiService.get('/api/User');

            if (!response || typeof response !== 'object') {
                throw new Error('Phản hồi từ API không hợp lệ');
            }

            // Nếu API không có trường data hoặc data không phải mảng hoặc object có Data
            if (!response.data) {
                return { success: false, data: [] };
            }

            return response;
        } catch (error) {
            console.error('❌ Lỗi khi gọi API getAllUsers:', error);
            throw new Error('Không thể tải danh sách người dùng');
        }
    }


    // Get user by ID
    async getUserById(id) {
        try {
            const response = await apiService.get(`/api/User/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw new Error(error.message || 'Lỗi khi lấy thông tin người dùng');
        }
    }

    // Create new user
    async createUser(userData) {
        try {
            // Map userData to RegisterDTO format
            const registerDto = {
                username: userData.username,
                password: userData.password,
                email: userData.email,
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber || '',
                address: userData.address || '',
                userToken: userData.userToken || null
            };

            const response = await apiService.post('/api/User', registerDto);
            return response;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error(error.message || 'Lỗi khi tạo người dùng mới');
        }
    }

    // Update user (Admin or self only)
    async updateUser(id, userData) {
        try {
            // Map userData to RegisterDTO format
            const updateDto = {
                username: userData.username,
                password: userData.password || '', // Password có thể để trống khi update
                email: userData.email,
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber || '',
                address: userData.address || '',
                userToken: userData.userToken || null
            };

            const response = await apiService.put(`/api/User/${id}`, updateDto);
            return response;
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error(error.message || 'Lỗi khi cập nhật người dùng');
        }
    }

    // Delete user
    async deleteUser(id) {
        try {
            const response = await apiService.delete(`/api/User/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error(error.message || 'Lỗi khi xóa người dùng');
        }
    }

    // Toggle user account status (Admin only)
    async toggleUserAccount(id) {
        try {
            const response = await apiService.patch(`/api/User/${id}/toggle`, {});
            return response;
        } catch (error) {
            console.error('Error toggling user account:', error);
            throw new Error(error.message || 'Lỗi khi chuyển đổi trạng thái tài khoản');
        }
    }

    // Update user language
    async updateUserLanguage(id, language) {
        try {
            const response = await apiService.put(`/api/User/${id}/language`, {
                preferredLanguage: language
            });
            return response;
        } catch (error) {
            console.error('Error updating user language:', error);
            throw new Error(error.message || 'Lỗi khi cập nhật ngôn ngữ');
        }
    }

    // Get user language
    async getUserLanguage(id) {
        try {
            const response = await apiService.get(`/api/User/${id}/language`);
            return response;
        } catch (error) {
            console.error('Error getting user language:', error);
            throw new Error(error.message || 'Lỗi khi lấy ngôn ngữ người dùng');
        }
    }

    // Update user theme
    async updateUserTheme(id, theme) {
        try {
            const response = await apiService.put(`/api/User/${id}/theme`, {
                preferredTheme: theme
            });
            return response;
        } catch (error) {
            console.error('Error updating user theme:', error);
            throw new Error(error.message || 'Lỗi khi cập nhật giao diện');
        }
    }

    // Get user theme
    async getUserTheme(id) {
        try {
            const response = await apiService.get(`/api/User/${id}/theme`);
            return response;
        } catch (error) {
            console.error('Error getting user theme:', error);
            throw new Error(error.message || 'Lỗi khi lấy giao diện người dùng');
        }
    }

    // Disable own account
    async disableOwnAccount() {
        try {
            const response = await apiService.patch('/api/User/disable-own', {});
            return response;
        } catch (error) {
            console.error('Error disabling own account:', error);
            throw new Error(error.message || 'Lỗi khi vô hiệu hóa tài khoản');
        }
    }

    // Get user statistics
    async getUserStatistics() {
        try {
            // Get all users to calculate statistics
            const response = await this.getAllUsers({ pageSize: 1000 });

            if (response.success && response.data) {
                const users = response.data.Data || [];

                const stats = {
                    totalUsers: users.length,
                    totalAdmins: users.filter(u => u.role === 'Admin').length,
                    totalBuyers: users.filter(u => u.role === 'Buyer').length,
                    totalSellers: users.filter(u => u.role === 'Seller').length,
                    totalProxyShoppers: users.filter(u => u.role === 'ProxyShopper').length,
                    activeUsers: users.filter(u => u.status === 'Active').length,
                    blockedUsers: users.filter(u => u.status === 'Disabled').length
                };

                return { success: true, data: stats };
            }

            return { success: false, message: 'Không thể lấy thống kê' };
        } catch (error) {
            console.error('Error getting user statistics:', error);
            throw new Error(error.message || 'Lỗi khi lấy thống kê người dùng');
        }
    }

    // Get seller profile by ID
    async getSellerById(sellerId) {
        try {
            const response = await apiService.get(`/api/User/${sellerId}`);

            if (!response || typeof response !== 'object') {
                throw new Error('Phản hồi từ API không hợp lệ');
            }

            if (!response.data) {
                return { success: false, data: null };
            }

            return response;
        } catch (error) {
            console.error('❌ Lỗi khi gọi API getSellerById:', error);
            throw new Error('Không thể tải thông tin người bán');
        }
    }

    // Get seller profile by username or email
    async getSellerByIdentifier(identifier) {
        try {
            // First try to get all users and find by username or email
            const response = await this.getAllUsers();

            if (response.success && response.data) {
                const seller = response.data.find(user =>
                    user.username === identifier ||
                    user.email === identifier ||
                    user.fullName === identifier
                );

                return { success: true, data: seller || null };
            }

            return { success: false, data: null };
        } catch (error) {
            console.error('❌ Lỗi khi gọi API getSellerByIdentifier:', error);
            throw new Error('Không thể tìm thông tin người bán');
        }
    }

    // Format user data for seller profile display
    formatSellerForProfile(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            address: user.address,
            avatar: user.avatar,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            // Add display fields
            displayName: user.fullName || user.username,
            contactInfo: user.phoneNumber || user.email,
        };
    }
}

// Export singleton instance
const userService = new UserService();
export default userService;

// Export individual functions for backward compatibility
export const getAllUsers = (params) => userService.getAllUsers(params);
export const getUserById = (id) => userService.getUserById(id);
export const createUser = (userData) => userService.createUser(userData);
export const updateUser = (id, userData) => userService.updateUser(id, userData);
export const deleteUser = (id) => userService.deleteUser(id);
export const toggleUserAccount = (id) => userService.toggleUserAccount(id);
export const updateUserLanguage = (id, language) => userService.updateUserLanguage(id, language);
export const getUserLanguage = (id) => userService.getUserLanguage(id);
export const updateUserTheme = (id, theme) => userService.updateUserTheme(id, theme);
export const getUserTheme = (id) => userService.getUserTheme(id);
export const disableOwnAccount = () => userService.disableOwnAccount();
export const getUserStatistics = () => userService.getUserStatistics();
export const getSellerById = (sellerId) => userService.getSellerById(sellerId);
export const getSellerByIdentifier = (identifier) => userService.getSellerByIdentifier(identifier);
export const formatSellerForProfile = (user) => userService.formatSellerForProfile(user);

