import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from '../components/Common/ScrollToTop';

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <ScrollToTop />
            <Outlet />
            {/* Toast Container for auth pages */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default AuthLayout;
