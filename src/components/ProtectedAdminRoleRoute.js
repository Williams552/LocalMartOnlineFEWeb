import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Result, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

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
        // Show access denied page instead of redirecting
        return (
            <div style={{ padding: '50px 24px', background: '#fff', minHeight: 'calc(100vh - 112px)' }}>
                <Result
                    icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                    title="Không có quyền truy cập"
                    subTitle={`Bạn không có quyền truy cập vào trang này. Vai trò hiện tại: ${user.role}`}
                    extra={
                        <Button type="primary" onClick={() => window.history.back()}>
                            Quay lại
                        </Button>
                    }
                />
            </div>
        );
    }

    // If all checks pass, render the protected component
    return children;
};

export default ProtectedAdminRoleRoute;
