// src/layouts/GuestLayout.js
import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { Outlet } from "react-router-dom";

const GuestLayout = () => {
    return (
        <>
            <Header />
            <main className="min-h-[70vh] px-4">
                <Outlet /> {/* Đây là chỗ nội dung các page như HomePage sẽ xuất hiện */}
            </main>
            <Footer />
        </>
    );
};

export default GuestLayout;
