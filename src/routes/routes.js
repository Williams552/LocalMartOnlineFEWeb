// src/routes/AppRoutes.js (cập nhật)
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../components/AuthComponents/Login";
import Register from "../components/AuthComponents/Register";
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
import AdminContentManagement from "../components/Admin/Content/ContentManagement/AdminContentManagement";
import FAQManagement from "../components/Admin/Content/ContentManagement/FAQManagement";
import PolicyManagement from "../components/Admin/Content/ContentManagement/PolicyManagement";
import BuyerProfile from "../pages/Buyer/BuyerProfile";
import CartPage from "../pages/Buyer/CartPage";
import ProxyShopperList from "../pages/ProxyShopper/ProxyShopperList";
import RegisterProxyShopper from "../pages/ProxyShopper/RegisterProxyShopper";
import RegisterSeller from "../pages/Buyer/RegisterSeller";



const AppRoutes = () => {
    return (
        <Routes>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<App />}>

                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/proxy-shopper" element={<ProxyShopperList />} />
                <Route path="/register-seller" element={<RegisterSeller />} />
                <Route path="/proxy-shopper/register" element={<RegisterProxyShopper />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/buyer/profile" element={<BuyerProfile />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/seller/:sellerId" element={<SellerProfile />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
            </Route>

            <Route path="/system/admin" element={<Admin />}>
                <Route path="feature_users" element={<FeatureUser />} />
                <Route path="manage-users" element={<ManageUser />} />
                <Route path="manage-accounts" element={<ManageAccount />} />
                <Route path="feature_content_management" element={<AdminContentManagement />} />
                <Route path="faq-management" element={<FAQManagement />} />
                <Route path="policy-management" element={<PolicyManagement />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;