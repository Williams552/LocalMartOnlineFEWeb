import ProxyRegisterList from "../pages/Admin/User/ProxyRegisterList";
import ChangePassword from "../pages/User/ChangePassword";
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
import MarketFeeTypeManagement from "../pages/Admin/Market/MarketFeeTypeManagement";
import MarketRuleManagement from "../pages/Admin/Market/MarketRuleManagement";
import StoreManagement from "../pages/Admin/Store/StoreManagement";
import StoreDashboard from "../pages/Admin/Store/StoreDashboard";
import StoreAnalytics from "../pages/Admin/Store/StoreAnalytics";
import StorePaymentManagement from "../pages/Admin/Store/StorePaymentManagement";
import ProductUnitManagement from "../pages/Admin/ProductUnit/ProductUnitManagement";
import { ProductManagement, PendingProducts, FastBargainProducts } from "../pages/Admin/Product";
import OrderManagement from "../pages/Admin/OrderManagement";
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
import UserReportsPage from "../pages/Seller/UserReportsPage";
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
                            <StoreProfile />
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

                <Route path="category-registrations" element={<CategoryRegistrationManagement />} />




                {/* Market Management */}

                <Route path="markets" element={<MarketManagement />} />
                <Route path="markets/create" element={<MarketManagement />} />
                <Route path="markets/dashboard" element={<MarketDashboard />} />
                <Route path="market-fees" element={<MarketFeeManagement />} />
                <Route path="market-fee-types" element={<MarketFeeTypeManagement />} />
                <Route path="market-rules" element={<MarketRuleManagement />} />


                {/* Store Management */}
                <Route path="stores" element={<StoreManagement />} />
                <Route path="stores/dashboard" element={<StoreDashboard />} />
                <Route path="stores/create" element={<StoreManagement />} />
                <Route path="stores/analytics" element={<StoreAnalytics />} />
                <Route path="stores/payment" element={<StorePaymentManagement />} />
                <Route path="stores/sellers" element={<StoreManagement />} />
                <Route path="stores/reviews" element={<StoreManagement />} />



                {/* Product Management */}
                <Route path="products" element={<ProductManagement />} />
                <Route path="products/pending" element={<PendingProducts />} />
                <Route path="products/fast-bargain" element={<FastBargainProducts />} />
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
                <Route path="reports" element={<ReportManagement />} />

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