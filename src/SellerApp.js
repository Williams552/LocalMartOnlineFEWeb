import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { CartProvider } from './contexts/CartContext';

// Components for Seller App only
import UserIdFixer from './components/Common/UserIdFixer';
import SessionTimeoutWarning from './components/Common/SessionTimeoutWarning';

// Services
import authService from './services/authService';

// Styles
import './App.css';

const SellerApp = () => {
    // Setup auth service on app init
    useEffect(() => {
        console.log('🏪 SellerApp: Seller application initialized');
        console.log('🔐 SellerApp: Current auth state:', {
            isAuthenticated: authService.isAuthenticated(),
            user: authService.getCurrentUser(),
            userId: authService.getCurrentUserId()
        });
    }, []);

    return (
        <div className="SellerApp">
            {/* User ID Fixer - tự động sửa userId trong localStorage */}
            <UserIdFixer />

            {/* Session Timeout Warning - cảnh báo session sắp hết hạn */}
            <SessionTimeoutWarning />

            {/* Cart Provider - quản lý global cart state */}
            <CartProvider>
                <div className="seller-app-layout min-h-screen bg-gray-50">
                    {/* Main Content Area - No Header/Footer for clean seller dashboard */}
                    <main className="seller-main-content h-full">
                        <Outlet />
                    </main>
                </div>
            </CartProvider>

            {/* Toast Notifications */}
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover
                limit={3}
                className="toast-container-custom"
                toastClassName="toast-custom"
                bodyClassName="toast-body-custom"
                style={{
                    fontSize: '14px',
                    fontWeight: '500'
                }}
            />
        </div>
    );
};

export default SellerApp;
