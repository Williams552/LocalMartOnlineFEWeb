import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import { FaBoxOpen, FaUser, FaStar } from 'react-icons/fa';
import proxyShopperService from '../../services/proxyShopperService';

const ProxyShopperDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [analyticsResponse, ordersResponse] = await Promise.all([
                proxyShopperService.getAnalytics('30d'),
                proxyShopperService.getMyOrders()
            ]);

            if (analyticsResponse.success) {
                setStats(analyticsResponse.data);
            }

            if (ordersResponse.success) {
                // Get latest 5 orders
                setRecentOrders(ordersResponse.data.slice(0, 5));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' },
            'Accepted': { color: 'bg-blue-100 text-blue-800', text: 'Đã nhận' },
            'Completed': { color: 'bg-green-100 text-green-800', text: 'Hoàn thành' },
            'Cancelled': { color: 'bg-red-100 text-red-800', text: 'Đã hủy' }
        };

        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Proxy Shopper</h1>
                <p className="text-gray-600">Chào mừng bạn quay trở lại! Quản lý đơn hàng và theo dõi thu nhập từ các chợ đã đăng ký.</p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center">
                        <FiPackage className="text-blue-500 mr-2" size={16} />
                        <p className="text-sm text-blue-700">
                            <strong>Hệ thống mới:</strong> Bạn chỉ nhận đơn hàng từ những chợ mà bạn đã đăng ký.
                            Khách hàng sẽ chọn chợ cụ thể khi tạo yêu cầu mua hộ.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders ?? 0}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FiPackage className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                            <p className="text-2xl font-bold text-green-600">{stats?.completedOrders ?? 0}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FiCheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
                            <p className="text-2xl font-bold text-supply-primary">{formatCurrency(stats?.totalSpent ?? 0)}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FiDollarSign className="text-supply-primary" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
                            <div className="flex items-center space-x-2">
                                <p className="text-2xl font-bold text-yellow-500">{stats?.averageRating ?? 0}</p>
                                <FaStar className="text-yellow-500" size={16} />
                            </div>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <FiTrendingUp className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
                        <Link
                            to="/proxy-shopper/orders"
                            className="text-supply-primary hover:text-green-600 font-medium text-sm"
                        >
                            Xem tất cả →
                        </Link>
                    </div>
                </div>
                <div className="divide-y divide-gray-200">
                    {recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4 mb-2">
                                            <span className="font-medium text-gray-900">#{order.id?.slice(-8)}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            📍 {order.deliveryAddress}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {order.items?.length || 0} sản phẩm • {formatCurrency(order.totalAmount)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                        <Link
                                            to={`/proxy-shopper/orders/${order.id}`}
                                            className="text-supply-primary hover:text-green-600 text-sm font-medium"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <FaBoxOpen className="text-gray-400 text-4xl mb-4 mx-auto" />
                            <p className="text-gray-500">Chưa có đơn hàng nào</p>
                            <Link
                                to="/proxy-shopper/available-orders"
                                className="mt-4 inline-block bg-supply-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Tìm đơn hàng mới
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/proxy-shopper/available-orders"
                    className="bg-supply-primary hover:bg-green-600 text-white p-6 rounded-lg transition-colors text-center"
                >
                    <FiPackage className="text-3xl mb-3 mx-auto" />
                    <h3 className="font-bold text-lg mb-2">Đơn hàng khả dụng</h3>
                    <p className="text-sm opacity-90">Tìm và nhận đơn hàng mới</p>
                </Link>

                <Link
                    to="/proxy-shopper/orders"
                    className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg transition-colors text-center"
                >
                    <FiClock className="text-3xl mb-3 mx-auto" />
                    <h3 className="font-bold text-lg mb-2">Đơn hàng của tôi</h3>
                    <p className="text-sm opacity-90">Quản lý các đơn đã nhận</p>
                </Link>
            </div>
        </div>
    );
};

export default ProxyShopperDashboard;
