import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaHome, FaShoppingCart, FaHeart, FaShoppingBag,
    FaUser, FaStore, FaSearch, FaBell, FaComments
} from 'react-icons/fa';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const BuyerLayout = ({ children }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const buyerNavItems = [
        {
            path: '/',
            icon: FaHome,
            label: 'Trang chủ',
            color: 'text-blue-600'
        },
        {
            path: '/buyer/cart',
            icon: FaShoppingCart,
            label: 'Giỏ hàng',
            color: 'text-green-600'
        },
        {
            path: '/buyer/favorites',
            icon: FaHeart,
            label: 'Yêu thích',
            color: 'text-red-600'
        },
        {
            path: '/buyer/following',
            icon: FaStore,
            label: 'Theo dõi',
            color: 'text-pink-600'
        },
        {
            path: '/buyer/orders',
            icon: FaShoppingBag,
            label: 'Đơn hàng',
            color: 'text-orange-600'
        },
        {
            path: '/buyer/chat',
            icon: FaComments,
            label: 'Chat',
            color: 'text-blue-500'
        },
        {
            path: '/profile',
            icon: FaUser,
            label: 'Tài khoản',
            color: 'text-purple-600'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Header */}
            <Header />

            {/* Buyer Navigation */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="flex items-center justify-center space-x-8 py-3">
                        {buyerNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all hover:bg-gray-50 ${isActive(item.path)
                                        ? `${item.color} bg-gray-50`
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="min-h-screen">
                {children}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default BuyerLayout;
