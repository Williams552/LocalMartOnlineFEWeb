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
// Admin pages
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/Dashboard/AdminDashboard";
import UserManagement from "../pages/Admin/User/UserManagement";
import CreateUser from "../pages/Admin/User/CreateUser";
import UserAnalytics from "../pages/Admin/Analytics/UserAnalytics";
import CategoryManagement from "../pages/Admin/Category/CategoryManagement";
import MarketManagement from "../pages/Admin/Market/MarketManagement";
import MarketDashboard from "../pages/Admin/Market/MarketDashboard";
import MarketFeeManagement from "../pages/Admin/Market/MarketFeeManagement";
import MarketRuleManagement from "../pages/Admin/Market/MarketRuleManagement";
import StoreManagement from "../pages/Admin/Store/StoreManagement";
import StoreDashboard from "../pages/Admin/Store/StoreDashboard";
import StoreAnalytics from "../pages/Admin/Store/StoreAnalytics";
import ProductUnitManagement from "../pages/Admin/ProductUnit/ProductUnitManagement";
import OrderManagement from "../pages/Admin/OrderManagement";
import ContentManagement from "../pages/Admin/ContentManagement";
import Analytics from "../pages/Admin/Analytics";
import SupportManagement from "../pages/Admin/SupportManagement";
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
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />

                {/* User Management */}
                <Route path="users" element={<UserManagement />} />
                <Route path="users/create" element={<CreateUser />} />
                <Route path="users/edit/:id" element={<UserManagement />} />
                <Route path="users/:id" element={<UserManagement />} />
                <Route path="seller-registrations" element={<UserManagement />} />
                <Route path="proxy-registrations" element={<UserManagement />} />

                {/* Category Management */}
                <Route path="categories" element={<CategoryManagement />} />

                {/* Market Management */}
                <Route path="markets" element={<MarketManagement />} />
                <Route path="markets/create" element={<MarketManagement />} />
                <Route path="markets/dashboard" element={<MarketDashboard />} />
                <Route path="market-fees" element={<MarketFeeManagement />} />
                <Route path="market-rules" element={<MarketRuleManagement />} />
                

                {/* Store Management */}
                <Route path="stores" element={<StoreManagement />} />
                <Route path="stores/dashboard" element={<StoreDashboard />} />
                <Route path="stores/create" element={<StoreManagement />} />
                <Route path="stores/analytics" element={<StoreAnalytics />} />
                <Route path="stores/sellers" element={<StoreManagement />} />
                <Route path="stores/reviews" element={<StoreManagement />} />

                {/* Product Management */}
                <Route path="products" element={<UserManagement />} />
                <Route path="categories" element={<ContentManagement />} />
                <Route path="category-registrations" element={<ContentManagement />} />
                <Route path="product-units" element={<ProductUnitManagement />} />

                {/* Order Management */}
                <Route path="orders" element={<OrderManagement />} />
                <Route path="orders/disputes" element={<OrderManagement />} />
                <Route path="fast-bargains" element={<OrderManagement />} />

                {/* Payment Management */}
                <Route path="payments" element={<OrderManagement />} />
                <Route path="market-fee-payments" element={<OrderManagement />} />

                {/* Content Management */}
                <Route path="faqs" element={<ContentManagement />} />
                <Route path="policies" element={<ContentManagement />} />
                <Route path="notifications" element={<ContentManagement />} />

                {/* Support */}
                <Route path="support-requests" element={<SupportManagement />} />
                <Route path="chat" element={<SupportManagement />} />
                <Route path="reports" element={<SupportManagement />} />

                {/* Analytics */}
                <Route path="analytics/users" element={<UserAnalytics />} />
                <Route path="analytics/revenue" element={<Analytics />} />
                <Route path="analytics/products" element={<Analytics />} />
                <Route path="analytics/orders" element={<Analytics />} />

                {/* System */}
                <Route path="licenses" element={<ContentManagement />} />
                <Route path="devices" element={<ContentManagement />} />
                <Route path="system-settings" element={<ContentManagement />} />
                <Route path="approvals" element={<UserManagement />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;