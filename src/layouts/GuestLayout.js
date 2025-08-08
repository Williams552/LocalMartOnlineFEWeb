// src/layouts/GuestLayout.js
import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { Outlet } from "react-router-dom";

const GuestLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 w-full">
                <Outlet /> {/* Đây là chỗ nội dung các page như HomePage sẽ xuất hiện */}
            </main>
            <Footer />
        </div>
    );
};

export default GuestLayout;
