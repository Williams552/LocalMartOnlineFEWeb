// src/pages/Admin/DashboardLayout.js
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
    FaTachometerAlt,
    FaUsers,
    FaKey,
    FaStore,
    FaBox,
    FaTags,
    FaExclamationTriangle,
    FaBell,
    FaChartBar,
    FaFileAlt,
    FaGavel,
    FaMapMarkerAlt,
    FaMoneyBill,
    FaPaintBrush,
    FaHeadset,
    FaEnvelope,
    FaUserCircle
} from "react-icons/fa";
import logo from "../../../assets/image/logo.jpg";

const sidebarItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { label: "User Management", path: "/admin/users", icon: <FaUsers /> },
    { label: "Authentication Management", path: "/admin/auth", icon: <FaKey /> },
    { label: "Store Management", path: "/admin/stores", icon: <FaStore /> },
    { label: "Product Management", path: "/admin/products", icon: <FaBox /> },
    { label: "Category Management", path: "/admin/categories", icon: <FaTags /> },
    { label: "Report Management", path: "/admin/reports", icon: <FaExclamationTriangle /> },
    { label: "Notification Management", path: "/admin/notifications", icon: <FaBell /> },
    { label: "Analytics Management", path: "/admin/analytics", icon: <FaChartBar /> },
    { label: "Content Management", path: "/admin/content", icon: <FaFileAlt /> },
    { label: "Rules Management", path: "/admin/rules", icon: <FaGavel /> },
    { label: "Market Management", path: "/admin/markets", icon: <FaMapMarkerAlt /> },
    { label: "Tax Management", path: "/admin/tax", icon: <FaMoneyBill /> },
    { label: "User Interface Management", path: "/admin/ui", icon: <FaPaintBrush /> },
    { label: "Support Management", path: "/admin/support", icon: <FaHeadset /> },
];

const DashboardLayout = () => {
    const location = useLocation();

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-full lg:w-80 xl:w-96 bg-white shadow-lg p-6 sticky top-0 h-auto lg:h-screen z-10">
                <div className="flex items-center gap-4 mb-8">
                    <img src={logo} alt="Logo" className="w-10 h-10 object-cover rounded-full" />
                    <h2 className="text-2xl font-bold text-supply-primary">LocalMart</h2>
                </div>
                <nav className="space-y-3">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-5 py-3 rounded-lg hover:bg-supply-primary hover:text-white transition ${location.pathname === item.path
                                ? "bg-supply-primary text-white"
                                : "text-gray-700"
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-base font-medium whitespace-nowrap">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="flex justify-between items-center bg-white shadow p-4 px-6 sticky top-0 z-10">
                    <h1 className="text-xl font-semibold text-supply-primary">Admin Dashboard</h1>
                    <div className="flex items-center gap-6">
                        <FaEnvelope className="text-xl text-gray-600 cursor-pointer hover:text-supply-primary" />
                        <FaBell className="text-xl text-gray-600 cursor-pointer hover:text-supply-primary" />
                        <FaUserCircle className="text-2xl text-gray-600 cursor-pointer hover:text-supply-primary" />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
