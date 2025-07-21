import ProxyRegisterList from "../pages/Admin/User/ProxyRegisterList";
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
import StorePage from "../pages/Guest/StorePage";
import AboutPage from "../pages/Guest/AboutPage";
import ContactPage from "../pages/Guest/ContactPage";
import FAQPage from "../pages/Guest/FAQPage";
import App from "../App";
import SellerApp from "../SellerApp"; // New seller app without header/footer
// Admin pages
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/Dashboard/AdminDashboard";
import UserManagement from "../pages/Admin/User/UserManagement";
import UserAnalytics from "../pages/Admin/Analytics/UserAnalytics";
import CategoryManagement from "../pages/Admin/Category/CategoryManagement";
import CategoryRegistrationManagement from "../pages/Admin/CategoryRegistration/CategoryRegistrationManagement";
import MarketManagement from "../pages/Admin/Market/MarketManagement";
import MarketDashboard from "../pages/Admin/Market/MarketDashboard";
import MarketFeeManagement from "../pages/Admin/Market/MarketFeeManagement";
import MarketRuleManagement from "../pages/Admin/Market/MarketRuleManagement";
import StoreManagement from "../pages/Admin/Store/StoreManagement";
import StoreDashboard from "../pages/Admin/Store/StoreDashboard";
import StoreAnalytics from "../pages/Admin/Store/StoreAnalytics";
import ProductUnitManagement from "../pages/Admin/ProductUnit/ProductUnitManagement";
import { ProductManagement, PendingProducts, FastBargainProducts } from "../pages/Admin/Product";
import OrderManagement from "../pages/Admin/OrderManagement";
import ContentManagement from "../pages/Admin/ContentManagement";
import { FAQManagement } from "../pages/Admin/FAQ";
import Analytics from "../pages/Admin/Analytics";
import SupportManagement from "../pages/Admin/SupportManagement";
import CartPage from "../pages/Buyer/CartPage";
import FavoritesPage from "../pages/Buyer/FavoritesPage";
import FollowingStoresPage from "../pages/Buyer/FollowingStores";
import ProxyShopperList from "../pages/ProxyShopper/ProxyShopperList";
import RegisterProxyShopper from "../pages/ProxyShopper/RegisterProxyShopper";
import BuyerOrders from "../pages/Buyer/BuyerOrders";
import RegisterSeller from "../pages/Buyer/RegisterSeller";
import UserProfile from "../pages/User/UserProfile";
import ChatListPage from "../pages/Buyer/ChatListPage";
import ChatPage from "../pages/Buyer/ChatPage";
import FastBargainPage from "../pages/FastBargain/FastBargainPage";
import BargainDetail from "../pages/FastBargain/BargainDetail";
import SellerRegisterList from "../pages/Admin/User/SellerRegisterList";
import SupportRequestPage from "../pages/Support/SupportRequestPage";

// Seller pages
import SellerDashboard from "../pages/Sellers/SellerDashboard";
import SellerProducts from "../pages/Sellers/SellerProducts";
import SellerOrdersPage from "../pages/Sellers/SellerOrdersPage";
import StoreProfile from "../pages/Sellers/StoreProfile";
import CustomerManagement from "../pages/Sellers/CustomerManagement";
import PersonalShopping from "../pages/Sellers/PersonalShopping";
import QuickActionsPage from "../pages/Sellers/QuickActionsPage";
import ChartsAnalyticsPage from "../pages/Sellers/ChartsAnalyticsPage";
import NotificationsPage from "../pages/Sellers/NotificationsPage";
import PriorityActionsPage from "../pages/Sellers/PriorityActionsPage";

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
                <Route path="/buyer/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/buyer/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="/buyer/following" element={<ProtectedRoute><FollowingStoresPage /></ProtectedRoute>} />
                <Route path="/buyer/orders" element={<ProtectedRoute><BuyerOrders /></ProtectedRoute>} />
                <Route path="/buyer/chat" element={<ProtectedRoute><ChatListPage /></ProtectedRoute>} />
                <Route path="/buyer/chat/:sellerId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/fast-bargain" element={<ProtectedRoute><FastBargainPage /></ProtectedRoute>} />
                <Route path="/fast-bargain/:id" element={<ProtectedRoute><BargainDetail /></ProtectedRoute>} />
                <Route path="/buyer/bargains" element={<ProtectedRoute><FastBargainPage /></ProtectedRoute>} />
                <Route path="/support-requests" element={<ProtectedRoute><SupportRequestPage /></ProtectedRoute>} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/store/:storeId" element={<StorePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
            </Route>

            {/* Seller Routes - Separate layout without Header/Footer */}
            <Route element={<SellerApp />}>
                <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={['Seller']}><SellerDashboard /></ProtectedRoute>} />
                <Route path="/seller/products" element={<ProtectedRoute allowedRoles={['Seller']}><SellerProducts /></ProtectedRoute>} />
                <Route path="/seller/products/add" element={<ProtectedRoute allowedRoles={['Seller']}><SellerProducts /></ProtectedRoute>} />
                <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={['Seller']}><SellerOrdersPage /></ProtectedRoute>} />
                <Route path="/seller/profile" element={<ProtectedRoute allowedRoles={['Seller']}><StoreProfile /></ProtectedRoute>} />
                <Route path="/seller/analytics" element={<ProtectedRoute allowedRoles={['Seller']}><SellerDashboard /></ProtectedRoute>} />
                <Route path="/seller/customers" element={<ProtectedRoute allowedRoles={['Seller']}><CustomerManagement /></ProtectedRoute>} />
                <Route path="/seller/personal-shopping" element={<ProtectedRoute allowedRoles={['Seller']}><PersonalShopping /></ProtectedRoute>} />
                <Route path="/seller/quick-actions" element={<ProtectedRoute allowedRoles={['Seller']}><QuickActionsPage /></ProtectedRoute>} />
                <Route path="/seller/analytics" element={<ProtectedRoute allowedRoles={['Seller']}><ChartsAnalyticsPage /></ProtectedRoute>} />
                <Route path="/seller/notifications" element={<ProtectedRoute allowedRoles={['Seller']}><NotificationsPage /></ProtectedRoute>} />
                <Route path="/seller/priority-actions" element={<ProtectedRoute allowedRoles={['Seller']}><PriorityActionsPage /></ProtectedRoute>} />
                <Route path="/seller/payments" element={<ProtectedRoute allowedRoles={['Seller']}><SellerDashboard /></ProtectedRoute>} />
                <Route path="/seller/licenses" element={<ProtectedRoute allowedRoles={['Seller']}><SellerDashboard /></ProtectedRoute>} />
                <Route path="/seller/store" element={<ProtectedRoute allowedRoles={['Seller']}><StoreProfile /></ProtectedRoute>} />
            </Route>

            {/* Admin Routes - Protected with admin role */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />

                {/* User Management */}
                <Route path="users" element={<UserManagement />} />
                <Route path="users/edit/:id" element={<UserManagement />} />
                <Route path="users/:id" element={<UserManagement />} />
                <Route path="seller-register" element={<SellerRegisterList />} />
                <Route path="proxy-register" element={<ProxyRegisterList />} />
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
                <Route path="products" element={<ProductManagement />} />
                <Route path="products/pending" element={<PendingProducts />} />
                <Route path="products/fast-bargain" element={<FastBargainProducts />} />



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
                <Route path="faqs" element={<FAQManagement />} />
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