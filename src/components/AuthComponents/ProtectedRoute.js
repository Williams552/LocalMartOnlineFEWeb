import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
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

    // If not authenticated, redirect to login with the current location
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If roles are required, check if user has the required role
    if (requiredRoles.length > 0 && user) {
        const hasRequiredRole = requiredRoles.includes(user.role);
        if (!hasRequiredRole) {
            // Redirect to appropriate page based on user role
            const adminRoles = ['Admin', 'MS', 'MMBH', 'LGR'];
            if (user.role && adminRoles.includes(user.role)) {
                return <Navigate to="/admin" replace />;
            } else if (user.role === 'Seller') {
                return <Navigate to="/seller/dashboard" replace />;
            } else {
                return <Navigate to="/" replace />;
            }
        }
    }

    // If authenticated and has required role (if any), render the protected component
    return children;
};

export default ProtectedRoute;
