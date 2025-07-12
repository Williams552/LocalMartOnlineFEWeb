// ✅ Updated userService.js with improved query support
import apiService from './apiService';

class UserService {
    // Get all users with pagination and filters (Admin only)
    async getAllUsers(params = {}) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Chưa đăng nhập hoặc phiên làm việc đã hết hạn');
            }

            const queryParams = {
                pageNumber: 1,
                pageSize: 10,
                sortOrder: 'asc',
                ...params
            };

            if (params.loadAll) {
                queryParams.pageNumber = 1;
                queryParams.pageSize = 1000;
            }

            console.log('🔄 Gọi API để lấy users với params:', queryParams);
            const response = await apiService.get('/api/User', { params: queryParams });

            if (!response || typeof response !== 'object') {
                throw new Error('Phản hồi từ API không hợp lệ');
            }

            const users = response.data?.data || [];
            const pagination = {
                total: response.data.total || users.length,
                pageNumber: response.data.pageNumber || queryParams.pageNumber,
                pageSize: response.data.pageSize || queryParams.pageSize,
                sortOrder: queryParams.sortOrder
            };

            return {
                success: true,
                data: users,
                pagination,
                message: response.message || 'Lấy danh sách thành công'
            };
        } catch (error) {
            console.error('❌ Lỗi khi gọi API getAllUsers:', error);

            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            throw new Error('Không thể tải danh sách người dùng: ' + error.message);
        }
    }

    async getUserById(id) {
        const response = await apiService.get(`/api/User/${id}`);
        return response;
    }

    async createUser(userData) {
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
    }

    async updateUser(id, userData) {
        const updateDto = {
            username: userData.username,
            password: userData.password || '',
            email: userData.email,
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            userToken: userData.userToken || null
        };
        const response = await apiService.put(`/api/User/${id}`, updateDto);
        return response;
    }

    async deleteUser(id) {
        const response = await apiService.delete(`/api/User/${id}`);
        return response;
    }

    async toggleUserAccount(id) {
        const response = await apiService.patch(`/api/User/${id}/toggle`, {});
        return response;
    }

    async updateUserLanguage(id, language) {
        const response = await apiService.put(`/api/User/${id}/language`, {
            preferredLanguage: language
        });
        return response;
    }

    async getUserLanguage(id) {
        const response = await apiService.get(`/api/User/${id}/language`);
        return response;
    }

    async updateUserTheme(id, theme) {
        const response = await apiService.put(`/api/User/${id}/theme`, {
            preferredTheme: theme
        });
        return response;
    }

    async getUserTheme(id) {
        const response = await apiService.get(`/api/User/${id}/theme`);
        return response;
    }

    async disableOwnAccount() {
        const response = await apiService.patch('/api/User/disable-own', {});
        return response;
    }

    async getUserStatistics() {
        try {
            const response = await this.getAllUsers({ pageSize: 1000 });

            if (response.success && response.data) {
                const users = response.data;

                const stats = {
                    totalUsers: users.length,
                    totalAdmins: users.filter(u => u.role === 'Admin').length,
                    totalBuyers: users.filter(u => u.role === 'Buyer').length,
                    totalSellers: users.filter(u => u.role === 'Seller').length,
                    totalProxyShoppers: users.filter(u => u.role === 'ProxyShopper').length,
                    activeUsers: users.filter(u => u.status === 'Active').length,
                    blockedUsers: users.filter(u => u.status !== 'Active').length
                };

                return { success: true, data: stats };
            }

            return { success: false, message: 'Không thể lấy thống kê' };
        } catch (error) {
            console.error('Error getting user statistics:', error);
            throw new Error(error.message || 'Lỗi khi lấy thống kê người dùng');
        }
    }
}

const userService = new UserService();
export default userService;

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
