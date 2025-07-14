import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { CartProvider } from './contexts/CartContext';
import { FavoriteProvider } from './contexts/FavoriteContext';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import UserIdFixer from './components/Common/UserIdFixer';
import SessionTimeoutWarning from './components/Common/SessionTimeoutWarning';

// Services
import authService from './services/authService';

// Styles
import './App.css';

const App = () => {
  // Setup auth service on app init
  useEffect(() => {
    console.log('🚀 App: Application initialized');
    console.log('🔐 App: Current auth state:', {
      isAuthenticated: authService.isAuthenticated(),
      user: authService.getCurrentUser(),
      userId: authService.getCurrentUserId()
    });
  }, []);

  return (
    <div className="App">
      {/* User ID Fixer - tự động sửa userId trong localStorage */}
      <UserIdFixer />

      {/* Session Timeout Warning - cảnh báo session sắp hết hạn */}
      <SessionTimeoutWarning />

      {/* Cart Provider - quản lý global cart state */}
      <CartProvider>
        {/* Favorite Provider - quản lý global favorite state */}
        <FavoriteProvider>
          <div className="app-layout">
            {/* Header - Navigation và user menu */}
            <Header />

            {/* Main Content Area */}
            <main className="main-content">
              <Outlet />
            </main>

            {/* Footer */}
            <Footer />          </div>
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
