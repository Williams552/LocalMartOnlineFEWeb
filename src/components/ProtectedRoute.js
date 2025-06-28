import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
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

    // If specific roles are required
    if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
        // Redirect to unauthorized page or home
        return <Navigate to="/unauthorized" replace />;
    }

    // If all checks pass, render the protected component
    return children;
};

export default ProtectedRoute;
