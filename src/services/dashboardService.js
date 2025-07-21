import userService from './userService';
import storeService from './storeService';
import categoryService from './categoryService';
import productUnitService from './productUnitService';
import marketService from './marketService';

class DashboardService {
    async getDashboardStats() {
        try {
            console.log('Fetching dashboard stats...');
            
            // Lấy dữ liệu từ các API với pageSize nhỏ để có totalCount
            const [
                usersResponse,
                storesResponse,
                categoriesResponse,
                productUnitsResponse,
                marketsResponse
            ] = await Promise.allSettled([
                userService.getAllUsers({ pageNumber: 1, pageSize: 10 }), // Lấy 10 items để có totalCount
                storeService.getAllStores({ page: 1, pageSize: 10 }),
                categoryService.getAllCategories({ page: 1, pageSize: 10 }),
                productUnitService.getAllUnits({ page: 1, pageSize: 10 }),
                marketService.getAllMarkets({ page: 1, pageSize: 10 })
            ]);

            console.log('API Responses:', {
                users: usersResponse,
                stores: storesResponse,
                categories: categoriesResponse,
                productUnits: productUnitsResponse,
                markets: marketsResponse
            });

            // Extract totals từ responses với debugging
            let totalUsers = 0;
            if (usersResponse.status === 'fulfilled') {
                const userData = usersResponse.value;
                // UserService trả về { data: users, pagination: { total } }
                totalUsers = userData?.pagination?.total || userData?.totalCount || userData?.totalItems || userData?.total || 
                           (userData?.data ? userData.data.length : 0) || 0;
                console.log('Users data:', userData, 'Total:', totalUsers);
            }

            let totalStores = 0;
            if (storesResponse.status === 'fulfilled') {
                const storeData = storesResponse.value;
                // StoreService trả về { items, totalCount, page, pageSize }
                totalStores = storeData?.totalCount || storeData?.totalItems || storeData?.total || 
                            (storeData?.items ? storeData.items.length : 0) ||
                            (storeData?.data ? storeData.data.length : 0) || 0;
                console.log('Stores data:', storeData, 'Total:', totalStores);
            }

            let totalCategories = 0;
            if (categoriesResponse.status === 'fulfilled') {
                const categoryData = categoriesResponse.value;
                totalCategories = categoryData?.totalCount || categoryData?.totalItems || categoryData?.total || 
                                (categoryData?.data ? categoryData.data.length : 0) || 0;
                console.log('Categories data:', categoryData, 'Total:', totalCategories);
            }

            let totalProductUnits = 0;
            if (productUnitsResponse.status === 'fulfilled') {
                const unitData = productUnitsResponse.value;
                totalProductUnits = unitData?.totalCount || unitData?.totalItems || unitData?.total || 
                                  (unitData?.data ? unitData.data.length : 0) || 0;
                console.log('Product units data:', unitData, 'Total:', totalProductUnits);
            }

            let totalMarkets = 0;
            if (marketsResponse.status === 'fulfilled') {
                const marketData = marketsResponse.value;
                // marketService có thể trả về array trực tiếp hoặc object với data
                if (Array.isArray(marketData)) {
                    totalMarkets = marketData.length;
                } else {
                    totalMarkets = marketData?.totalCount || marketData?.totalItems || marketData?.total || 
                                 (marketData?.data ? marketData.data.length : 0) || 0;
                }
                console.log('Markets data:', marketData, 'Total:', totalMarkets);
            }

            const stats = {
                totalUsers,
                totalMarkets,
                totalStores,
                totalCategories,
                totalProductUnits,
                activeUsers: Math.floor(totalUsers * 0.85), // Ước tính 85% users active
                pendingApprovals: Math.floor(totalStores * 0.1), // Ước tính 10% stores pending
                totalOrders: 0, // Sẽ implement khi có order API
                totalRevenue: 0 // Sẽ implement khi có order API
            };

            console.log('Final dashboard stats:', stats);
            return stats;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Return default values khi có lỗi
            return {
                totalUsers: 0,
                totalMarkets: 0,
                totalCategories: 0,
                totalProductUnits: 0,
                activeUsers: 0,
                pendingApprovals: 0,
                totalOrders: 0,
                totalRevenue: 0
            };
        }
    }

    async getRecentUsers() {
        try {
            const response = await userService.getAllUsers({ 
                page: 1, 
                limit: 5,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });
            return response?.data || [];
        } catch (error) {
            console.error('Error fetching recent users:', error);
            return [];
        }
    }

    async getRecentActivities() {
        try {
            // Mock activities dựa trên timestamp thực
            const now = new Date();
            const activities = [
                {
                    id: 1,
                    type: 'user',
                    action: 'Người dùng mới đăng ký',
                    user: 'Hệ thống',
                    time: new Date(now - 5 * 60 * 1000).toLocaleString('vi-VN')
                },
                {
                    id: 2,
                    type: 'store',
                    action: 'Cửa hàng mới được tạo',
                    user: 'Admin',
                    time: new Date(now - 30 * 60 * 1000).toLocaleString('vi-VN')
                },
                {
                    id: 3,
                    type: 'order',
                    action: 'Đơn hàng mới được tạo',
                    user: 'Khách hàng',
                    time: new Date(now - 60 * 60 * 1000).toLocaleString('vi-VN')
                },
                {
                    id: 4,
                    type: 'support',
                    action: 'Yêu cầu hỗ trợ mới',
                    user: 'Người dùng',
                    time: new Date(now - 2 * 60 * 60 * 1000).toLocaleString('vi-VN')
                },
                {
                    id: 5,
                    type: 'report',
                    action: 'Báo cáo vi phạm',
                    user: 'Moderator',
                    time: new Date(now - 3 * 60 * 60 * 1000).toLocaleString('vi-VN')
                }
            ];
            return activities;
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            return [];
        }
    }
}

const dashboardService = new DashboardService();
export default dashboardService;
