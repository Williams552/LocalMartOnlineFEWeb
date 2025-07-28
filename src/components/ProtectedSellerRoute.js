import React from 'react';
import { Navigate } from 'react-router-dom';
import useStoreStatus from '../hooks/useStoreStatus';
import { FaSpinner } from 'react-icons/fa';

const ProtectedSellerRoute = ({ children }) => {
    const { storeStatus, isLoading, isStoreSuspended } = useStoreStatus();

    // Show loading state while checking store status
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-supply-primary mx-auto mb-4" />
                    <p className="text-gray-600">Đang kiểm tra trạng thái cửa hàng...</p>
                </div>
            </div>
        );
    }

    // If store is suspended, redirect to homepage (toast shown in hook)
    if (isStoreSuspended) {
        return <Navigate to="/" replace />;
    }

    // If store status check failed or store not found, redirect to homepage
    if (!storeStatus) {
        return <Navigate to="/" replace />;
    }

    // If everything is fine, render the protected component
    return children;
};

export default ProtectedSellerRoute;
