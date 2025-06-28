import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';

const ApiRedirectHandler = () => {
    const location = useLocation();

    useEffect(() => {
        // This component handles redirects from backend API endpoints to frontend routes
        console.log('API Redirect Handler - Location:', location.pathname, location.search);
    }, [location]);

    // Handle API endpoint redirects
    if (location.pathname.startsWith('/api/Auth/verify-email')) {
        // Redirect from /api/Auth/verify-email?token=xyz to /verify-email?token=xyz
        return <Navigate to={`/verify-email${location.search}`} replace />;
    }

    if (location.pathname.startsWith('/api/Auth/reset-password')) {
        // Redirect from /api/Auth/reset-password?token=xyz to /reset-password?token=xyz
        return <Navigate to={`/reset-password${location.search}`} replace />;
    }

    // If no matching redirect pattern, go to home
    return <Navigate to="/" replace />;
};

export default ApiRedirectHandler;
