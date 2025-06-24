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
import MarketAndStoreComponent from "../components/Admin/Content/FeatureComponent/FeatureMarketAndStores";
import ManageMarket from "../components/Admin/Content/Market/AdminMarket";
import ManageStore from "../components/Admin/Content/Store/AdminStore";
import Dashboard from "../components/Admin/Content/DashBoard/Dashboard";


const AppRoutes = () => {
    return (
        <Routes>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<App />}>

                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/seller/:sellerId" element={<SellerProfile />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
            </Route>

            <Route path="/system/admin" element={<Admin />}>
                <Route index element={<Dashboard />} />
                <Route path="feature_users" element={<FeatureUser />} />
                <Route path="manage-users" element={<ManageUser />} />
                <Route path="manage-accounts" element={<ManageAccount />} />
                <Route path="feature_market_stores" element={<MarketAndStoreComponent />} />
                <Route path="manage-markets" element={<ManageMarket />} />
                <Route path="manage-stores" element={<ManageStore />} />

            </Route>
        </Routes>
    );
};

export default AppRoutes;