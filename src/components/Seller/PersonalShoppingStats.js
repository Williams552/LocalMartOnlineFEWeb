// Personal Shopping Stats Component
import React from 'react';
import {
    FaShoppingCart, FaHeart, FaMoneyBillWave, FaCalendarCheck,
    FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClock,
    FaChartLine, FaReceipt, FaShoppingBag
} from 'react-icons/fa';

const PersonalShoppingStats = ({ statistics, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded"></div>
                            </div>
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <FaShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Không có dữ liệu</h3>
                <p className="text-gray-500">Chưa có thông tin hoạt động mua sắm</p>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatNumber = (number) => {
        if (!number || number === 0) return '0';
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa có';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getOrderStatusConfig = (status) => {
        const configs = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, label: 'Chờ xác nhận' },
            'confirmed': { color: 'bg-blue-100 text-blue-800', icon: FaCheckCircle, label: 'Đã xác nhận' },
            'preparing': { color: 'bg-purple-100 text-purple-800', icon: FaBox, label: 'Đang chuẩn bị' },
            'shipping': { color: 'bg-orange-100 text-orange-800', icon: FaTruck, label: 'Đang giao' },
            'delivered': { color: 'bg-green-100 text-green-800', icon: FaCheckCircle, label: 'Đã giao' },
            'cancelled': { color: 'bg-red-100 text-red-800', icon: FaTimesCircle, label: 'Đã hủy' }
        };
        return configs[status] || { color: 'bg-gray-100 text-gray-800', icon: FaClock, label: status };
    };

    return (
        <div className="space-y-6">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Orders */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng đơn hàng đã mua</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatNumber(statistics.totalOrders)}
                            </p>
                            <p className="text-sm text-gray-500">
                                Đơn hàng khi mua sắm
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FaShoppingCart className="text-blue-600 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng số tiền đã chi tiêu</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(statistics.totalSpent)}
                            </p>
                            <p className="text-sm text-gray-500">
                                TB: {formatCurrency(statistics.averageOrderValue)}/đơn
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FaMoneyBillWave className="text-green-600 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Favorite Products */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Sản phẩm yêu thích</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatNumber(statistics.favoriteProductsCount)}
                            </p>
                            <p className="text-sm text-gray-500">
                                Sản phẩm đã thích
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <FaHeart className="text-red-600 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Current Cart */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Giỏ hàng hiện tại</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatNumber(statistics.cartItemsCount)}
                            </p>
                            <p className="text-sm text-gray-500">
                                Sản phẩm trong giỏ
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <FaShoppingBag className="text-purple-600 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Đơn hàng theo trạng thái</h3>
                        <p className="text-sm text-gray-600">Phân loại đơn hàng đã mua</p>
                    </div>
                    <FaChartLine className="text-2xl text-blue-500" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(statistics.ordersByStatus || {}).map(([status, count]) => {
                        const config = getOrderStatusConfig(status);
                        const Icon = config.icon;
                        const percentage = statistics.totalOrders > 0
                            ? ((count / statistics.totalOrders) * 100).toFixed(1)
                            : 0;

                        return (
                            <div key={status} className="text-center">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${config.color} mb-3`}>
                                    <Icon className="text-lg" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{count}</div>
                                <div className="text-xs text-gray-500 mb-1">{config.label}</div>
                                <div className="text-xs text-gray-400">{percentage}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Đơn hàng gần đây</h3>
                        <p className="text-sm text-gray-600">5 đơn hàng mua sắm mới nhất</p>
                    </div>
                    <FaReceipt className="text-2xl text-indigo-500" />
                </div>

                <div className="space-y-4">
                    {(statistics.recentOrders || []).map((order, index) => {
                        const config = getOrderStatusConfig(order.status);
                        const Icon = config.icon;

                        return (
                            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${config.color}`}>
                                        <Icon className="text-sm" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">#{order.id}</div>
                                        <div className="text-sm text-gray-600">{order.sellerName}</div>
                                        <div className="text-xs text-gray-500">
                                            {formatDate(order.orderDate)} • {order.itemCount} sản phẩm
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900">
                                        {formatCurrency(order.totalAmount)}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
                                        {config.label}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {statistics.recentOrders && statistics.recentOrders.length === 0 && (
                    <div className="text-center py-8">
                        <FaShoppingCart className="text-4xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có đơn hàng nào</p>
                    </div>
                )}
            </div>

            {/* Shopping Insights */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Thông tin mua sắm</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Hoạt động mua sắm gần đây</h4>
                        <p className="text-gray-600">
                            Đơn hàng cuối: {formatDate(statistics.lastOrderDate)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Trải nghiệm kép</h4>
                        <p className="text-gray-600">
                            Vừa là seller vừa là khách hàng trên nền tảng
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalShoppingStats;
