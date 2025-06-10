// src/routes/AppRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../components/AuthComponents/Login";
import Register from "../components/AuthComponents/Register";
import HomePage from "../pages/HomePage";
import ProductDetail from "../pages/ProductDetail";
import SellerProfile from "../pages/SellerProfile";
import DashBoard from "../pages/Admin/pages/DashBoard"

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/seller/:sellerId" element={<SellerProfile />} />
            <Route path="/admin/dashboard" element={<DashBoard />} />


            {/* Các routes khác sau này */}
        </Routes>
    );
};

export default AppRoutes;
