import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // Debug authentication state
    console.log('PublicRoute - Auth state:', { isAuthenticated, user: user?.username, loading });

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-supply-primary"></div>
            </div>
        );
    }

    // If authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
        console.log('PublicRoute - User is authenticated, redirecting to dashboard');
        // Admin roles should go to /admin
        const adminRoles = ['Admin', 'MS', 'MMBH', 'LGR'];
        if (user.role && adminRoles.includes(user.role)) {
            return <Navigate to="/admin" replace />;
        } else if (user.role === 'Seller') {
            return <Navigate to="/seller/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    // If not authenticated, render the public component (login, register, etc.)
    console.log('PublicRoute - User not authenticated, showing login form');
    return children;
};

export default PublicRoute;
