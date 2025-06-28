// src/routes/AppRoutes.js (cập nhật)
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../components/AuthComponents/Login";
import Register from "../components/AuthComponents/Register";
import ForgotPassword from "../components/AuthComponents/ForgotPassword";
import ResetPassword from "../components/AuthComponents/ResetPassWord";
import EmailVerification from "../components/AuthComponents/EmailVerification";
import AuthLayout from "../layouts/AuthLayout";
import PublicRoute from "../components/AuthComponents/PublicRoute";
import ProtectedRoute from "../components/ProtectedRoute";
import Unauthorized from "../components/Unauthorized";
import ApiRedirectHandler from "../components/ApiRedirectHandler";
import HomePage from "../pages/Guest/HomePage";
import ProductDetail from "../pages/Guest/ProductDetail";
import SellerProfile from "../pages/Guest/SellerProfile";
import AboutPage from "../pages/Guest/AboutPage";
import ContactPage from "../pages/Guest/ContactPage";
import FAQPage from "../pages/Guest/FAQPage";
import App from "../App";
import Admin from "../components/Admin/Admin";
import FeatureUser from "../components/Admin/Content/FeatureComponent/FeatureUser";
import ManageUser from "../components/Admin/Content/User/AdminUser";
import ManageAccount from "../components/Admin/Content/User/AdminAccount";

import MarketAndStoreComponent from "../components/Admin/Content/FeatureComponent/FeatureMarketAndStores";
import ManageMarket from "../components/Admin/Content/Market/AdminMarket";
import ManageStore from "../components/Admin/Content/Store/AdminStore";
import Dashboard from "../components/Admin/Content/DashBoard/Dashboard";

import AdminContentManagement from "../components/Admin/Content/ContentManagement/AdminContentManagement";
import FAQManagement from "../components/Admin/Content/ContentManagement/FAQManagement";
import PolicyManagement from "../components/Admin/Content/ContentManagement/PolicyManagement";
import BuyerProfile from "../pages/Buyer/BuyerProfile";
import CartPage from "../pages/Buyer/CartPage";
import ProxyShopperList from "../pages/ProxyShopper/ProxyShopperList";
import RegisterProxyShopper from "../pages/ProxyShopper/RegisterProxyShopper";
import BuyerOrders from "../pages/Buyer/BuyerOrders";
import RegisterSeller from "../pages/Buyer/RegisterSeller";

// Seller pages
import SellerDashboard from "../pages/Seller/SellerDashboard";
import SellerProducts from "../pages/Seller/SellerProducts";
import SellerOrders from "../pages/Seller/SellerOrders";
import SellerProfileEdit from "../pages/Seller/SellerProfile";

const AppRoutes = () => {
    return (
        <Routes>
            {/* API Redirect Handlers - Handle Backend API endpoint redirects */}
            <Route path="/api/Auth/verify-email" element={<ApiRedirectHandler />} />
            <Route path="/api/Auth/reset-password" element={<ApiRedirectHandler />} />

            {/* Auth Routes - Wrapped by AuthLayout */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                <Route path="/verify-email" element={<EmailVerification />} />
            </Route>

            {/* Unauthorized Route */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Main App Routes - Wrapped by App component with AuthProvider */}
            <Route element={<App />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/proxy-shopper" element={<ProxyShopperList />} />
                <Route path="/register-seller" element={<ProtectedRoute><RegisterSeller /></ProtectedRoute>} />
                <Route path="/proxy-shopper/register" element={<ProtectedRoute><RegisterProxyShopper /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/buyer/profile" element={<ProtectedRoute><BuyerProfile /></ProtectedRoute>} />
                <Route path="/buyer/orders" element={<ProtectedRoute><BuyerOrders /></ProtectedRoute>} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/seller/:sellerId" element={<SellerProfile />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />

                {/* Seller Routes - Protected routes cho seller dashboard */}
                <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={['Seller']}><SellerDashboard /></ProtectedRoute>} />
                <Route path="/seller/products" element={<ProtectedRoute allowedRoles={['Seller']}><SellerProducts /></ProtectedRoute>} />
                <Route path="/seller/products/add" element={<ProtectedRoute allowedRoles={['Seller']}><SellerProducts /></ProtectedRoute>} />
                <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={['Seller']}><SellerOrders /></ProtectedRoute>} />
                <Route path="/seller/profile" element={<ProtectedRoute allowedRoles={['Seller']}><SellerProfileEdit /></ProtectedRoute>} />
                <Route path="/seller/analytics" element={<ProtectedRoute allowedRoles={['Seller']}><SellerDashboard /></ProtectedRoute>} />
            </Route>

            {/* Admin Routes - Protected with admin role */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><Admin /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="feature_users" element={<FeatureUser />} />
                <Route path="manage-users" element={<ManageUser />} />
                <Route path="manage-accounts" element={<ManageAccount />} />

                <Route path="feature_market_stores" element={<MarketAndStoreComponent />} />
                <Route path="manage-markets" element={<ManageMarket />} />
                <Route path="manage-stores" element={<ManageStore />} />

                <Route path="feature_content_management" element={<AdminContentManagement />} />
                <Route path="faq-management" element={<FAQManagement />} />
                <Route path="policy-management" element={<PolicyManagement />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;