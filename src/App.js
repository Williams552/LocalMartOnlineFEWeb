import { setupAutoTracking } from './services/interactionTracker';
import React, { useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { CartProvider } from './contexts/CartContext';
import { FavoriteProvider } from './contexts/FavoriteContext';
import { FollowStoreProvider } from './contexts/FollowStoreContext';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import UserIdFixer from './components/Common/UserIdFixer';
import SessionTimeoutWarning from './components/Common/SessionTimeoutWarning';
import ScrollToTop from './components/Common/ScrollToTop';
import SupportButton from './components/Support/SupportButton';

// Services
import authService from './services/authService';

// Hooks
import { useAuth } from './hooks/useAuth';

// Styles
import './App.css';

const AdminRedirectWrapper = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // If user has admin role and trying to access non-admin pages, redirect to admin
  const adminRoles = ['Admin', 'MS', 'MMBH', 'LGR'];
  if (user?.role && adminRoles.includes(user.role) && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const App = () => {
  // Setup auth service & auto tracking on app init
  useEffect(() => {
    console.log('🚀 App: Application initialized');
    console.log('🔐 App: Current auth state:', {
      isAuthenticated: authService.isAuthenticated(),
      user: authService.getCurrentUser(),
      userId: authService.getCurrentUserId()
    });
    setupAutoTracking();
  }, []);

  return (
    <div className="App">
      {/* Scroll to top on route change */}
      <ScrollToTop />

      {/* User ID Fixer - tự động sửa userId trong localStorage */}
      <UserIdFixer />

      {/* Session Timeout Warning - cảnh báo session sắp hết hạn */}
      <SessionTimeoutWarning />
      {/* Cart Provider - quản lý global cart state */}
      <CartProvider>
        {/* Favorite Provider - quản lý global favorite state */}
        <FavoriteProvider>
          {/* Follow Store Provider - quản lý global follow store state */}
          <FollowStoreProvider>
            {/* Admin Redirect Wrapper - chặn Admin truy cập trang không phải admin */}
            <AdminRedirectWrapper>
              <div className="app-layout">
                {/* Header - Navigation và user menu */}
                <Header />

                {/* Main Content Area */}
                <main className="main-content">
                  <Outlet />
                </main>

                {/* Footer */}
                <Footer />

                {/* Floating Support Button */}
                <SupportButton variant="floating" />
              </div>
            </AdminRedirectWrapper>
          </FollowStoreProvider>
        </FavoriteProvider>
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

export default App;
