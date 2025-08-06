import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true, blockAdminFromNonAdmin = false }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-supply-primary"></div>
            </div>
        );
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Block Admin roles from accessing non-admin pages (except when explicitly accessing admin routes)
    const adminRoles = ['Admin', 'MS', 'MMBH', 'LGR'];
    if (user?.role && adminRoles.includes(user.role) && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/login') && !location.pathname.startsWith('/unauthorized')) {
        return <Navigate to="/admin" replace />;
    }

    // If specific roles are required
    if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
        // If user has admin role trying to access non-admin page, redirect to admin
        if (user?.role && adminRoles.includes(user.role)) {
            return <Navigate to="/admin" replace />;
        }
        // Otherwise redirect to unauthorized page
        return <Navigate to="/unauthorized" replace />;
    }

    // If all checks pass, render the protected component
    return children;
};

export default ProtectedRoute;
