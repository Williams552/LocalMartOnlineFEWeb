import { useAuth } from './useAuth';

/**
 * Custom hook để kiểm tra quyền truy cập dựa trên role
 * @returns {Object} Object chứa các function kiểm tra quyền
 */
export const usePermissions = () => {
    const { user } = useAuth();
    
    const userRole = user?.role;

    /**
     * Kiểm tra xem user có quyền truy cập vào các chức năng không
     */
    const permissions = {
        // Dashboard - tất cả admin roles đều có quyền
        canAccessDashboard: () => ['Admin', 'MS', 'MMBH', 'LGR'].includes(userRole),

        // User Management - MMBH và Admin
        canAccessUserManagement: () => ['MMBH', 'Admin'].includes(userRole),
        canManageUsers: () => ['MMBH', 'Admin'].includes(userRole),
        canManageSellerRegistrations: () => ['MMBH', 'Admin'].includes(userRole),
        canManageProxyRegistrations: () => ['MMBH', 'Admin'].includes(userRole),

        // Store Management - MMBH và Admin  
        canAccessStoreManagement: () => ['MMBH', 'Admin'].includes(userRole),
        canManageStores: () => ['MMBH', 'Admin'].includes(userRole),
        canManageStorePayments: () => ['MMBH', 'Admin'].includes(userRole),

        // Product Management - chỉ Admin (không gán cho role cụ thể)
        canAccessProductManagement: () => ['Admin'].includes(userRole),
        canManageProducts: () => ['Admin'].includes(userRole),

        // Product Unit Management - MS và Admin
        canAccessProductUnitManagement: () => ['MS', 'Admin'].includes(userRole),
        canManageProductUnits: () => ['MS', 'Admin'].includes(userRole),

        // Order Management - chỉ Admin (không gán cho role cụ thể)
        canAccessOrderManagement: () => ['Admin'].includes(userRole),
        canManageOrders: () => ['Admin'].includes(userRole),
        canManageProxyShoppingOrders: () => ['Admin'].includes(userRole),

        // Market Management - LGR và Admin
        canAccessMarketManagement: () => ['LGR', 'Admin'].includes(userRole),
        canManageMarkets: () => ['LGR', 'Admin'].includes(userRole),
        canManageMarketRules: () => ['LGR', 'Admin'].includes(userRole),

        // Market Fee Management - MMBH và Admin
        canAccessMarketFeeManagement: () => ['MMBH', 'Admin'].includes(userRole),
        canManageMarketFees: () => ['MMBH', 'Admin'].includes(userRole),

        // Category Management - MS và Admin
        canAccessCategoryManagement: () => ['MS', 'Admin'].includes(userRole),
        canManageCategories: () => ['MS', 'Admin'].includes(userRole),
        canManageCategoryRegistrations: () => ['MS', 'Admin'].includes(userRole),

        // Content Management - LGR và Admin
        canAccessContentManagement: () => ['LGR', 'Admin'].includes(userRole),
        canManageFAQs: () => ['LGR', 'Admin'].includes(userRole),
        canManagePlatformPolicies: () => ['LGR', 'Admin'].includes(userRole),

        // Support Management - MS và Admin
        canAccessSupportManagement: () => ['MS', 'Admin'].includes(userRole),
        canManageSupportRequests: () => ['MS', 'Admin'].includes(userRole),
        canManageReports: () => ['MS', 'Admin'].includes(userRole),

        // Analytics - tất cả admin roles
        canAccessAnalytics: () => ['MS', 'MMBH', 'LGR', 'Admin'].includes(userRole),
        canViewUserAnalytics: () => ['MMBH', 'LGR', 'Admin'].includes(userRole),
        canViewRevenueAnalytics: () => ['MMBH', 'LGR', 'Admin'].includes(userRole),
        canViewStoreRevenue: () => ['MMBH', 'Admin'].includes(userRole),
        canViewMarketRevenue: () => ['LGR', 'Admin'].includes(userRole),

        // System Settings - chỉ Admin
        canAccessSystemSettings: () => ['Admin'].includes(userRole),

        // Profile - tất cả admin roles
        canAccessProfile: () => ['MS', 'MMBH', 'LGR', 'Admin'].includes(userRole),
    };

    /**
     * Kiểm tra xem user có một trong các role được chỉ định không
     * @param {Array} allowedRoles - Mảng các role được phép
     * @returns {boolean}
     */
    const hasAnyRole = (allowedRoles = []) => {
        return allowedRoles.includes(userRole);
    };

    /**
     * Kiểm tra xem user có role cụ thể không
     * @param {string} role - Role cần kiểm tra
     * @returns {boolean}
     */
    const hasRole = (role) => {
        return userRole === role;
    };

    /**
     * Lấy tên hiển thị của role
     * @returns {string}
     */
    const getRoleDisplayName = () => {
        const roleNames = {
            'MS': 'Market Staff - Nhân viên Thị trường',
            'MMBH': 'Market Management Board Head - Trưởng Ban Quản lý Thị trường',
            'LGR': 'Local Government Representative - Đại diện Chính quyền địa phương',
            'Admin': 'Administrator - Quản trị viên hệ thống'
        };
        return roleNames[userRole] || userRole;
    };

    /**
     * Kiểm tra xem user có phải là admin không
     * @returns {boolean}
     */
    const isAdmin = () => {
        return userRole === 'Admin';
    };

    /**
     * Kiểm tra xem user có quyền admin cơ bản không (bao gồm tất cả admin roles)
     * @returns {boolean}
     */
    const isAdminUser = () => {
        return ['MS', 'MMBH', 'LGR', 'Admin'].includes(userRole);
    };

    return {
        userRole,
        permissions,
        hasAnyRole,
        hasRole,
        getRoleDisplayName,
        isAdmin,
        isAdminUser,
    };
};

export default usePermissions;
