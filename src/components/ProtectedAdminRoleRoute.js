import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AccessDenied from './AccessDenied';

const ProtectedAdminRoleRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has admin-like roles (Admin, MS, MMBH, LGR)
    const adminRoles = ['Admin', 'MS', 'MMBH', 'LGR'];
    if (!user || !adminRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // If specific roles are required, check if user has the required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Show access denied page with role-specific message
        const roleNames = {
            'MS': 'Market Staff - Nhân viên Thị trường',
            'MMBH': 'Market Management Board Head - Trưởng Ban Quản lý Thị trường', 
            'LGR': 'Local Government Representative - Đại diện Chính quyền địa phương',
            'Admin': 'Administrator - Quản trị viên hệ thống'
        };
        
        return (
            <div style={{ padding: '50px 24px', background: '#fff', minHeight: 'calc(100vh - 112px)' }}>
                <AccessDenied 
                    title="Không có quyền truy cập"
                    subtitle={`Trang này yêu cầu quyền: ${allowedRoles.map(role => roleNames[role] || role).join(', ')}. Vai trò hiện tại của bạn: ${roleNames[user.role] || user.role}`}
                />
            </div>
        );
    }

    // If all checks pass, render the protected component
    return children;
};

export default ProtectedAdminRoleRoute;
