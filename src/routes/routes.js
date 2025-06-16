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
import GuestLayout from "../layouts/GuestLayout";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<GuestLayout />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/seller/:sellerId" element={<SellerProfile />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;