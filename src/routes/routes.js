import ProxyRegisterList from "../pages/Admin/User/ProxyRegisterList";
import ChangePassword from "../pages/User/ChangePassword";
import AdminChangePassword from "../pages/Admin/User/AdminChangePassword";
import AdminProfile from "../pages/Admin/User/AdminProfile";
import AdminProfileEdit from "../pages/Admin/User/AdminProfileEdit";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/AuthComponents/Login";
import Register from "../components/AuthComponents/Register";
import ForgotPassword from "../components/AuthComponents/ForgotPassword";
import ResetPassword from "../components/AuthComponents/ResetPassWord";
import EmailVerification from "../components/AuthComponents/EmailVerification";
import AuthLayout from "../layouts/AuthLayout";
import PublicRoute from "../components/AuthComponents/PublicRoute";
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedSellerRoute from "../components/ProtectedSellerRoute";
import ProtectedAdminRoleRoute from "../components/ProtectedAdminRoleRoute";
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
import RevenueAnalytics from "../pages/Admin/Analytics/RevenueAnalytics";
import CategoryManagement from "../pages/Admin/Category/CategoryManagement";
import CategoryRegistrationManagement from "../pages/Admin/CategoryRegistration/CategoryRegistrationManagement";
import MarketManagement from "../pages/Admin/Market/MarketManagement";
import MarketDashboard from "../pages/Admin/Market/MarketDashboard";
import MarketFeeManagement from "../pages/Admin/Market/MarketFeeManagement";
import MarketFeeTypeManagement from "../pages/Admin/Market/MarketFeeTypeManagement";
import MarketRuleManagement from "../pages/Admin/Market/MarketRuleManagement";
import StoreManagement from "../pages/Admin/Store/StoreManagement";
import StoreDashboard from "../pages/Admin/Store/StoreDashboard";
import StoreAnalytics from "../pages/Admin/Store/StoreAnalytics";
import StorePaymentManagement from "../pages/Admin/Store/StorePaymentManagement";
import ProductUnitManagement from "../pages/Admin/ProductUnit/ProductUnitManagement";
import { ProductManagement, PendingProducts, FastBargainProducts } from "../pages/Admin/Product";
import OrderManagement from "../pages/Admin/OrderManagement";
import ProxyShoppingManagement from "../pages/Admin/ProxyShoppingManagement";
import ContentManagement from "../pages/Admin/ContentManagement";
import { FAQManagement } from "../pages/Admin/FAQ";
import Analytics from "../pages/Admin/Analytics";
import SupportManagement from "../pages/Admin/SupportManagement";
import ReportManagement from "../pages/Admin/Reports/ReportManagement";
import CartPage from "../pages/Buyer/CartPage";
import FavoritesPage from "../pages/Buyer/FavoritesPage";
import FollowingStoresPage from "../pages/Buyer/FollowingStores";
import ProxyShopperList from "../pages/ProxyShopper/ProxyShopperList";
import RegisterProxyShopper from "../pages/ProxyShopper/RegisterProxyShopper";
import ProxyShopperDashboard from "../pages/ProxyShopper/ProxyShopperDashboard";
import ProxyShopperOrders from "../pages/ProxyShopper/ProxyShopperOrders";
import AvailableOrders from "../pages/ProxyShopper/AvailableOrders";
import ProxyShopperProfile from "../pages/ProxyShopper/ProxyShopperProfile";
import ProxyShopperWelcome from "../pages/ProxyShopper/ProxyShopperWelcome";
import BuyerOrders from "../pages/Buyer/BuyerOrders";
import MyProxyRequests from "../pages/Buyer/MyProxyRequests";
import RegisterSeller from "../pages/Buyer/RegisterSeller";
import UserProfile from "../pages/User/UserProfile";
import MyReports from "../pages/User/MyReports";
import ChatListPage from "../pages/Buyer/ChatListPage";
import ChatPage from "../pages/Buyer/ChatPage";
import FastBargainPage from "../pages/FastBargain/FastBargainPage";
import BargainDetail from "../pages/FastBargain/BargainDetail";
import SellerRegisterList from "../pages/Admin/User/SellerRegisterList";
import SupportRequestPage from "../pages/Support/SupportRequestPage";

// Seller pages
import SellerProducts from "../pages/Sellers/SellerProducts";
import SellerOrdersPage from "../pages/Sellers/SellerOrdersPage";
import SellerFastBargainPage from "../pages/Sellers/SellerFastBargainPage";
import StoreProfile from "../pages/Sellers/StoreProfile";
import CustomerManagement from "../pages/Sellers/CustomerManagement";
import PersonalShopping from "../pages/Sellers/PersonalShopping";
import QuickActionsPage from "../pages/Sellers/QuickActionsPage";
import ChartsAnalyticsPage from "../pages/Sellers/ChartsAnalyticsPage";
import NotificationsPage from "../pages/Sellers/NotificationsPage";
import SellerLicenses from "../pages/Sellers/SellerLicenses";
import SellerPayments from "../pages/Seller/SellerPayments";
import UserReportsPage from "../pages/Seller/UserReportsPage";
import MarketFees from "../pages/Seller/MarketFees";
import MarketRules from "../pages/Seller/MarketRules";
import CreateOrder from "../pages/ProxyShopper/CreateOrder";

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
                <Route path="/proxy-shopper/dashboard" element={<ProtectedRoute allowedRoles={['Proxy Shopper']}><ProxyShopperDashboard /></ProtectedRoute>} />
                <Route path="/proxy-shopper/welcome" element={<ProtectedRoute allowedRoles={['Proxy Shopper']}><ProxyShopperWelcome /></ProtectedRoute>} />
                <Route path="/proxy-shopper/orders" element={<ProtectedRoute allowedRoles={['Proxy Shopper']}><ProxyShopperOrders /></ProtectedRoute>} />
                <Route path="/proxy-shopper/orders/:id/create" element={<ProtectedRoute allowedRoles={['Proxy Shopper']}><CreateOrder /></ProtectedRoute>} />
                <Route path="/proxy-shopper/available-orders" element={<ProtectedRoute allowedRoles={['Proxy Shopper']}><AvailableOrders /></ProtectedRoute>} />
                <Route path="/proxy-shopper/profile" element={<ProtectedRoute allowedRoles={['Proxy Shopper']}><ProxyShopperProfile /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/buyer/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/buyer/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="/buyer/following" element={<ProtectedRoute><FollowingStoresPage /></ProtectedRoute>} />
                <Route path="/buyer/orders" element={<ProtectedRoute><BuyerOrders /></ProtectedRoute>} />
                <Route path="/buyer/proxy-requests" element={<ProtectedRoute><MyProxyRequests /></ProtectedRoute>} />
                <Route path="/buyer/chat" element={<ProtectedRoute><ChatListPage /></ProtectedRoute>} />
                <Route path="/buyer/chat/:sellerId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />

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
                <Route path="/seller" element={<Navigate to="/seller/products" replace />} />
                <Route path="/seller/dashboard" element={<Navigate to="/seller/products" replace />} />
                <Route path="/seller/products" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <SellerProducts />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/products/add" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <SellerProducts />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/orders" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <SellerOrdersPage />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/fast-bargains" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <SellerFastBargainPage />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/profile" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <StoreProfile />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/analytics" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <ChartsAnalyticsPage />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/customers" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <CustomerManagement />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/personal-shopping" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <PersonalShopping />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/quick-actions" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <QuickActionsPage />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/notifications" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <NotificationsPage />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/user-reports" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <UserReportsPage />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/payments" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <SellerPayments />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/market-fees" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <MarketFees />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/market-rules" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <MarketRules />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/licenses" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <SellerLicenses />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/seller/store" element={
                    <ProtectedRoute allowedRoles={['Seller']}>
                        <ProtectedSellerRoute>
                            <StoreProfile />
                        </ProtectedSellerRoute>
                    </ProtectedRoute>
                } />
            </Route>

            {/* Admin Routes - Protected with admin role */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin', 'MS', 'MMBH', 'LGR']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />

                {/* User Management - Only MS role */}
                <Route path="users" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><UserManagement /></ProtectedAdminRoleRoute>} />
                <Route path="users/edit/:id" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><UserManagement /></ProtectedAdminRoleRoute>} />
                <Route path="users/:id" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><UserManagement /></ProtectedAdminRoleRoute>} />
                <Route path="seller-register" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><SellerRegisterList /></ProtectedAdminRoleRoute>} />
                <Route path="proxy-register" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><ProxyRegisterList /></ProtectedAdminRoleRoute>} />
                <Route path="seller-registrations" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><UserManagement /></ProtectedAdminRoleRoute>} />
                <Route path="proxy-registrations" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><UserManagement /></ProtectedAdminRoleRoute>} />

                {/* Category Management - MMBH + Admin */}
                <Route path="categories" element={<ProtectedAdminRoleRoute allowedRoles={['MMBH', 'Admin']}><CategoryManagement /></ProtectedAdminRoleRoute>} />
                <Route path="category-registrations" element={<ProtectedAdminRoleRoute allowedRoles={['MMBH', 'Admin']}><CategoryRegistrationManagement /></ProtectedAdminRoleRoute>} />

                {/* Market Management - MMBH + Admin */}
                <Route path="markets" element={<ProtectedAdminRoleRoute allowedRoles={['MMBH', 'Admin']}><MarketManagement /></ProtectedAdminRoleRoute>} />
                <Route path="markets/create" element={<ProtectedAdminRoleRoute allowedRoles={['MMBH', 'Admin']}><MarketManagement /></ProtectedAdminRoleRoute>} />
                <Route path="markets/dashboard" element={<ProtectedAdminRoleRoute allowedRoles={['MMBH', 'Admin']}><MarketDashboard /></ProtectedAdminRoleRoute>} />
                <Route path="market-fees" element={<ProtectedAdminRoleRoute allowedRoles={['MMBH', 'Admin']}><MarketFeeManagement /></ProtectedAdminRoleRoute>} />
                <Route path="market-fee-types" element={<ProtectedAdminRoleRoute allowedRoles={['MMBH', 'Admin']}><MarketFeeTypeManagement /></ProtectedAdminRoleRoute>} />
                <Route path="market-rules" element={<ProtectedAdminRoleRoute allowedRoles={['MMBH', 'Admin']}><MarketRuleManagement /></ProtectedAdminRoleRoute>} />

                {/* Store Management - MS + Admin */}
                <Route path="stores" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><StoreManagement /></ProtectedAdminRoleRoute>} />
                <Route path="stores/dashboard" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><StoreDashboard /></ProtectedAdminRoleRoute>} />
                <Route path="stores/create" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><StoreManagement /></ProtectedAdminRoleRoute>} />
                <Route path="stores/analytics" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><StoreAnalytics /></ProtectedAdminRoleRoute>} />
                <Route path="stores/payment" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><StorePaymentManagement /></ProtectedAdminRoleRoute>} />
                <Route path="stores/sellers" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><StoreManagement /></ProtectedAdminRoleRoute>} />
                <Route path="stores/reviews" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><StoreManagement /></ProtectedAdminRoleRoute>} />

                {/* Product Management - MS + Admin */}
                <Route path="products" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><ProductManagement /></ProtectedAdminRoleRoute>} />
                <Route path="products/pending" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><PendingProducts /></ProtectedAdminRoleRoute>} />
                <Route path="products/fast-bargain" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><FastBargainProducts /></ProtectedAdminRoleRoute>} />
                <Route path="product-units" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><ProductUnitManagement /></ProtectedAdminRoleRoute>} />

                {/* Order Management - MS + Admin */}
                <Route path="orders" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><OrderManagement /></ProtectedAdminRoleRoute>} />
                <Route path="orders/disputes" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><OrderManagement /></ProtectedAdminRoleRoute>} />
                <Route path="fast-bargains" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><OrderManagement /></ProtectedAdminRoleRoute>} />

                {/* Proxy Shopping Management - MS + Admin */}
                <Route path="proxy-shopping" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><ProxyShoppingManagement /></ProtectedAdminRoleRoute>} />

                {/* Payment Management - MS + Admin */}
                <Route path="payments" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><OrderManagement /></ProtectedAdminRoleRoute>} />
                <Route path="market-fee-payments" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><OrderManagement /></ProtectedAdminRoleRoute>} />

                {/* Content Management - LGR + Admin */}
                <Route path="faqs" element={<ProtectedAdminRoleRoute allowedRoles={['LGR', 'Admin']}><FAQManagement /></ProtectedAdminRoleRoute>} />
                <Route path="policies" element={<ProtectedAdminRoleRoute allowedRoles={['LGR', 'Admin']}><ContentManagement /></ProtectedAdminRoleRoute>} />
                <Route path="notifications" element={<ProtectedAdminRoleRoute allowedRoles={['LGR', 'Admin']}><ContentManagement /></ProtectedAdminRoleRoute>} />

                {/* Support - MS + Admin */}
                <Route path="support-requests" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><SupportManagement /></ProtectedAdminRoleRoute>} />
                <Route path="chat" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><SupportManagement /></ProtectedAdminRoleRoute>} />
                <Route path="reports" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><ReportManagement /></ProtectedAdminRoleRoute>} />

                {/* Analytics - All admin roles can access */}
                <Route path="analytics/users" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'MMBH', 'LGR', 'Admin']}><UserAnalytics /></ProtectedAdminRoleRoute>} />
                <Route path="analytics/revenue" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'MMBH', 'LGR', 'Admin']}><RevenueAnalytics /></ProtectedAdminRoleRoute>} />
                <Route path="analytics/products" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'MMBH', 'LGR', 'Admin']}><Analytics /></ProtectedAdminRoleRoute>} />
                <Route path="analytics/orders" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'MMBH', 'LGR', 'Admin']}><Analytics /></ProtectedAdminRoleRoute>} />

                {/* System - All admin roles can access their profile */}
                <Route path="profile" element={<AdminProfile />} />
                <Route path="profile/edit" element={<AdminProfileEdit />} />
                <Route path="change-password" element={<AdminChangePassword />} />
                <Route path="licenses" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><ContentManagement /></ProtectedAdminRoleRoute>} />
                <Route path="devices" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><ContentManagement /></ProtectedAdminRoleRoute>} />
                <Route path="system-settings" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><ContentManagement /></ProtectedAdminRoleRoute>} />
                <Route path="approvals" element={<ProtectedAdminRoleRoute allowedRoles={['MS', 'Admin']}><UserManagement /></ProtectedAdminRoleRoute>} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;