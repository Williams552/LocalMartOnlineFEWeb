// Quick Actions Page - Dedicated page for all seller quick actions
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import QuickActions from '../../components/Seller/QuickActions';
import {
    FaRocket, FaTachometerAlt, FaSearch, FaFilter,
    FaClock, FaFire, FaBookmark, FaGift
} from 'react-icons/fa';

const QuickActionsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [recentActions, setRecentActions] = useState([]);

    useEffect(() => {
        // Load recent actions from localStorage or API
        const savedActions = JSON.parse(localStorage.getItem('recentQuickActions') || '[]');
        setRecentActions(savedActions.slice(0, 5));
    }, []);

    const handleActionClick = (actionName, actionPath) => {
        // Save to recent actions
        const newAction = {
            name: actionName,
            path: actionPath,
            timestamp: new Date().toISOString()
        };

        const updatedActions = [newAction, ...recentActions.filter(a => a.path !== actionPath)].slice(0, 5);
        setRecentActions(updatedActions);
        localStorage.setItem('recentQuickActions', JSON.stringify(updatedActions));
    };

    const popularActions = [
        { name: 'Thêm sản phẩm mới', path: '/seller/products/add', count: 45 },
        { name: 'Quản lý đơn hàng', path: '/seller/orders', count: 38 },
        { name: 'Giỏ hàng', path: '/cart', count: 32 },
        { name: 'Thống kê chi tiết', path: '/seller/analytics', count: 28 },
        { name: 'Hồ sơ cửa hàng', path: '/seller/profile', count: 25 }
    ];

    const categories = [
        { id: 'all', name: 'Tất cả', count: 10 },
        { id: 'store', name: 'Quản lý cửa hàng', count: 5 },
        { id: 'shopping', name: 'Hoạt động mua sắm', count: 5 }
    ];

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    return (
        <SellerLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="mb-4 lg:mb-0">
                                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <FaRocket className="mr-3 text-supply-primary" />
                                    Thao tác nhanh
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Trung tâm điều khiển cho tất cả hoạt động quản lý và mua sắm
                                </p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/seller/dashboard"
                                    className="flex items-center space-x-2 bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                                >
                                    <FaTachometerAlt />
                                    <span>Quản lý</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Search and Filter */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm thao tác..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-supply-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <FaFilter className="text-gray-400" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-supply-primary focus:border-supply-primary"
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name} ({category.count})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Thao tác hôm nay</p>
                                    <p className="text-2xl font-bold text-gray-900">24</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FaRocket className="text-blue-600 text-xl" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Thao tác phổ biến</p>
                                    <p className="text-2xl font-bold text-gray-900">Thêm SP</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <FaFire className="text-green-600 text-xl" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Thời gian tiết kiệm</p>
                                    <p className="text-2xl font-bold text-gray-900">2.5h</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <FaClock className="text-purple-600 text-xl" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Thao tác yêu thích</p>
                                    <p className="text-2xl font-bold text-gray-900">8</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <FaBookmark className="text-yellow-600 text-xl" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Actions */}
                    {recentActions.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FaClock className="mr-2 text-gray-600" />
                                Thao tác gần đây
                            </h3>
                            <div className="space-y-3">
                                {recentActions.map((action, index) => (
                                    <Link
                                        key={index}
                                        to={action.path}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                                        onClick={() => handleActionClick(action.name, action.path)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-supply-primary rounded-full"></div>
                                            <span className="font-medium text-gray-800">{action.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatTimeAgo(action.timestamp)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Popular Actions */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FaFire className="mr-2 text-orange-500" />
                            Thao tác phổ biến
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {popularActions.map((action, index) => (
                                <Link
                                    key={index}
                                    to={action.path}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                                    onClick={() => handleActionClick(action.name, action.path)}
                                >
                                    <div>
                                        <span className="font-medium text-gray-800">{action.name}</span>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {action.count} lần sử dụng
                                        </div>
                                    </div>
                                    <div className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                                        #{index + 1}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Main Quick Actions Component */}
                    <QuickActions showNotification={false} />

                    {/* Tips */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FaGift className="mr-2 text-blue-600" />
                            💡 Mẹo sử dụng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Tối ưu hóa thời gian</h4>
                                <p className="text-gray-600 text-sm">
                                    Sử dụng các thao tác nhanh để tiết kiệm thời gian quản lý cửa hàng và mua sắm.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Dual Role Management</h4>
                                <p className="text-gray-600 text-sm">
                                    Chuyển đổi dễ dàng giữa vai trò seller và buyer trong cùng một interface.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Theo dõi hiệu suất</h4>
                                <p className="text-gray-600 text-sm">
                                    Sử dụng thống kê để hiểu rõ hơn về hoạt động kinh doanh và mua sắm.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Tích hợp toàn diện</h4>
                                <p className="text-gray-600 text-sm">
                                    Tất cả tính năng được tích hợp liền mạch để trải nghiệm tốt nhất.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default QuickActionsPage;
