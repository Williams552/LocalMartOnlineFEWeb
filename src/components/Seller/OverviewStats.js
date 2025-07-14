import React from 'react';
import {
    FaBoxOpen, FaShoppingCart, FaDollarSign, FaUsers,
    FaEye, FaClock, FaStar, FaHeart, FaChartLine,
    FaArrowUp, FaArrowDown
} from 'react-icons/fa';

const OverviewStats = ({ stats, loading = false }) => {
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

    const formatPercentage = (percentage) => {
        if (!percentage || percentage === 0) return '0%';
        return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
    };

    const statsConfig = [
        {
            id: 'totalProducts',
            title: 'Tổng sản phẩm',
            value: stats?.totalProducts || 0,
            icon: FaBoxOpen,
            color: 'blue',
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            description: 'Số lượng sản phẩm đang bán',
            trend: null
        },
        {
            id: 'totalOrders',
            title: 'Tổng đơn hàng',
            value: stats?.totalOrders || 0,
            icon: FaShoppingCart,
            color: 'green',
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            description: 'Số đơn hàng đã nhận',
            trend: stats?.orderGrowth || null
        },
        {
            id: 'totalRevenue',
            title: 'Doanh thu',
            value: formatCurrency(stats?.totalRevenue || 0),
            icon: FaDollarSign,
            color: 'yellow',
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            description: 'Tổng doanh thu',
            trend: stats?.revenueGrowth || null
        },
        {
            id: 'newFollowers',
            title: 'Người theo dõi mới',
            value: stats?.newFollowers || 0,
            icon: FaUsers,
            color: 'purple',
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
            description: 'Người theo dõi gian hàng',
            trend: null
        },
        {
            id: 'viewsThisWeek',
            title: 'Lượt xem',
            value: formatNumber(stats?.viewsThisWeek || 0),
            icon: FaEye,
            color: 'indigo',
            bgColor: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            description: 'Lượt xem sản phẩm trong tuần',
            trend: null
        },
        {
            id: 'pendingOrders',
            title: 'Đơn hàng chờ xử lý',
            value: stats?.pendingOrders || 0,
            icon: FaClock,
            color: 'orange',
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
            description: 'Đơn hàng cần được xử lý',
            urgent: (stats?.pendingOrders || 0) > 5
        },
        {
            id: 'averageRating',
            title: 'Đánh giá',
            value: (stats?.averageRating || 0).toFixed(1),
            icon: FaStar,
            color: 'pink',
            bgColor: 'bg-pink-100',
            iconColor: 'text-pink-600',
            description: 'Điểm đánh giá trung bình',
            suffix: '⭐'
        },
        {
            id: 'totalFollowers',
            title: 'Tổng người theo dõi',
            value: formatNumber(stats?.totalFollowers || 0),
            icon: FaHeart,
            color: 'red',
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600',
            description: 'Số người đang theo dõi',
            trend: null
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                            </div>
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Tổng quan Dashboard</h1>
                        <p className="text-gray-600 mt-1">Thống kê hiệu suất kinh doanh của bạn</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <FaChartLine className="text-green-500" />
                        <span>Cập nhật: {new Date().toLocaleString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.id}
                            className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow ${stat.urgent ? 'ring-2 ring-orange-200' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <p className="text-sm font-medium text-gray-600">
                                            {stat.title}
                                        </p>
                                        {stat.urgent && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                Cần xử lý
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-baseline space-x-2">
                                        <p className={`text-2xl font-bold ${stat.urgent ? 'text-orange-600' : 'text-gray-800'
                                            }`}>
                                            {stat.value}
                                            {stat.suffix && (
                                                <span className="text-lg ml-1">{stat.suffix}</span>
                                            )}
                                        </p>

                                        {stat.trend && (
                                            <div className={`flex items-center text-sm ${stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {stat.trend > 0 ? (
                                                    <FaArrowUp className="mr-1" size={12} />
                                                ) : (
                                                    <FaArrowDown className="mr-1" size={12} />
                                                )}
                                                <span>{formatPercentage(Math.abs(stat.trend))}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 mt-2">
                                        {stat.description}
                                    </p>
                                </div>

                                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                    <Icon className={stat.iconColor} size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Tóm tắt hiệu suất</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Sản phẩm hoạt động:</span>
                            <span className="font-medium">{stats?.activeProducts || 0}/{stats?.totalProducts || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Đơn hàng hoàn thành:</span>
                            <span className="font-medium">{stats?.completedOrders || 0}/{stats?.totalOrders || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Sản phẩm hết hàng:</span>
                            <span className={`font-medium ${(stats?.outOfStockProducts || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {stats?.outOfStockProducts || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Revenue Insights */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin doanh thu</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Doanh thu tháng này:</span>
                            <span className="font-medium text-green-600">
                                {formatCurrency(stats?.revenueThisMonth || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tăng trưởng:</span>
                            <span className={`font-medium ${(stats?.growthRate || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(stats?.growthRate || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Khách hàng thân thiết:</span>
                            <span className="font-medium">{stats?.loyalCustomers || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thao tác nhanh</h3>
                    <div className="space-y-2">
                        {(stats?.pendingOrders || 0) > 0 && (
                            <button className="w-full text-left p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition">
                                <div className="flex items-center justify-between">
                                    <span className="text-orange-800 font-medium">Xử lý đơn hàng</span>
                                    <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs">
                                        {stats.pendingOrders}
                                    </span>
                                </div>
                            </button>
                        )}

                        {(stats?.outOfStockProducts || 0) > 0 && (
                            <button className="w-full text-left p-3 rounded-lg bg-red-50 hover:bg-red-100 transition">
                                <div className="flex items-center justify-between">
                                    <span className="text-red-800 font-medium">Bổ sung hàng</span>
                                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs">
                                        {stats.outOfStockProducts}
                                    </span>
                                </div>
                            </button>
                        )}

                        <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
                            <span className="text-blue-800 font-medium">Thêm sản phẩm mới</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewStats;
