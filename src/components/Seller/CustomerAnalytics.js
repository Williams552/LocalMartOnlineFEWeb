// Customer Analytics Component
import React from 'react';
import {
    FaUsers, FaMedal, FaChartLine, FaRedo,
    FaCrown, FaStar, FaGem, FaTrophy
} from 'react-icons/fa';

const CustomerAnalytics = ({ statistics, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
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
                <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Không có dữ liệu</h3>
                <p className="text-gray-500">Chưa có thông tin thống kê khách hàng</p>
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

    const tierData = [
        {
            tier: 'Bronze',
            count: statistics.bronzeCustomers || 0,
            icon: FaMedal,
            color: 'bg-orange-100',
            iconColor: 'text-orange-600',
            description: '0-399 điểm'
        },
        {
            tier: 'Silver',
            count: statistics.silverCustomers || 0,
            icon: FaStar,
            color: 'bg-gray-100',
            iconColor: 'text-gray-600',
            description: '400-599 điểm'
        },
        {
            tier: 'Gold',
            count: statistics.goldCustomers || 0,
            icon: FaCrown,
            color: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            description: '600-799 điểm'
        },
        {
            tier: 'Platinum',
            count: statistics.platinumCustomers || 0,
            icon: FaGem,
            color: 'bg-purple-100',
            iconColor: 'text-purple-600',
            description: '800+ điểm'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Loyal Customers */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Khách hàng thân thiết</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatNumber(statistics.totalLoyalCustomers)}
                            </p>
                            <p className="text-sm text-gray-500">
                                Doanh thu: {formatCurrency(statistics.totalRevenue)}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FaUsers className="text-blue-600 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Average Customer Value */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Giá trị TB/khách hàng</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(statistics.averageCustomerValue)}
                            </p>
                            <p className="text-sm text-gray-500">
                                Từ {formatNumber(statistics.totalLoyalCustomers)} khách hàng
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FaChartLine className="text-green-600 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Repeat Customer Rate */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tỷ lệ khách hàng quay lại</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {(statistics.repeatCustomerRate || 0).toFixed(1)}%
                            </p>
                            <p className="text-sm text-gray-500">
                                Khách hàng có 2+ đơn hàng
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <FaRedo className="text-purple-600 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Tiers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Khách hàng theo hạng thành viên</h3>
                        <p className="text-sm text-gray-600">Phân loại dựa trên điểm thành viên</p>
                    </div>
                    <FaTrophy className="text-2xl text-yellow-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tierData.map((tier, index) => {
                        const Icon = tier.icon;
                        const percentage = statistics.totalLoyalCustomers > 0
                            ? ((tier.count / statistics.totalLoyalCustomers) * 100).toFixed(1)
                            : 0;

                        return (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 ${tier.color} rounded-lg`}>
                                        <Icon className={`${tier.iconColor} text-lg`} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">{tier.count}</p>
                                        <p className="text-xs text-gray-500">{percentage}%</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 mb-1">{tier.tier}</p>
                                    <p className="text-xs text-gray-500">{tier.description}</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${tier.tier === 'Bronze' ? 'bg-orange-500' :
                                                    tier.tier === 'Silver' ? 'bg-gray-500' :
                                                        tier.tier === 'Gold' ? 'bg-yellow-500' :
                                                            'bg-purple-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Thông tin chi tiết</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Hạng thành viên phổ biến nhất</h4>
                        <p className="text-gray-600">
                            {tierData.reduce((prev, current) =>
                                prev.count > current.count ? prev : current
                            ).tier} chiếm {
                                statistics.totalLoyalCustomers > 0
                                    ? ((tierData.reduce((prev, current) =>
                                        prev.count > current.count ? prev : current
                                    ).count / statistics.totalLoyalCustomers) * 100).toFixed(1)
                                    : 0
                            }% tổng số khách hàng thân thiết
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Cơ hội tăng trưởng</h4>
                        <p className="text-gray-600">
                            {(100 - (statistics.repeatCustomerRate || 0)).toFixed(1)}% khách hàng mới
                            có thể trở thành khách hàng quay lại
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerAnalytics;
