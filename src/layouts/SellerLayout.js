import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaStore, FaBoxOpen, FaShoppingCart, FaChartLine,
    FaUser, FaHome, FaBell, FaCog
} from "react-icons/fa";

const SellerLayout = ({ children }) => {
    const location = useLocation();

    const sidebarItems = [
        { path: '/seller/dashboard', icon: FaHome, label: 'Dashboard', color: 'text-blue-600' },
        { path: '/seller/products', icon: FaBoxOpen, label: 'Sản phẩm', color: 'text-green-600' },
        { path: '/seller/orders', icon: FaShoppingCart, label: 'Đơn hàng', color: 'text-orange-600' },
        { path: '/seller/analytics', icon: FaChartLine, label: 'Thống kê', color: 'text-purple-600' },
        { path: '/seller/profile', icon: FaStore, label: 'Hồ sơ cửa hàng', color: 'text-pink-600' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40">
                <div className="p-6 border-b">
                    <Link to="/seller/dashboard" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-supply-primary rounded-lg flex items-center justify-center">
                            <FaStore className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Seller Panel</h2>
                            <p className="text-sm text-gray-600">Quản lý cửa hàng</p>
                        </div>
                    </Link>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                                                ? 'bg-supply-primary text-white shadow-md'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon
                                            size={18}
                                            className={isActive(item.path) ? 'text-white' : item.color}
                                        />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Quick Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
                    <div className="space-y-2">
                        <Link
                            to="/"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                        >
                            <FaHome size={16} />
                            <span>Về trang chủ</span>
                        </Link>
                        <Link
                            to="/buyer/profile"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                        >
                            <FaUser size={16} />
                            <span>Hồ sơ buyer</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64">
                {children}
            </main>
        </div>
    );
};

export default SellerLayout;
