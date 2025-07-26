// Charts & Visual Analytics Component
import React, { useState, useEffect } from 'react';
import {
    FaChartLine, FaChartBar, FaCalendarAlt, FaArrowUp, FaArrowDown,
    FaEye, FaShoppingCart, FaStar, FaBoxes, FaTrophy, FaPercentage
} from 'react-icons/fa';
import analyticsService from '../../services/analyticsService';

const ChartsAnalytics = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('30d');
    const [revenue, setRevenue] = useState(null);
    const [orders, setOrders] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChart, setActiveChart] = useState('revenue');

    const periods = [
        { value: '7d', label: '7 ngày qua', days: 7 },
        { value: '30d', label: '30 ngày qua', days: 30 },
        { value: '90d', label: '3 tháng qua', days: 90 }
    ];

    useEffect(() => {
        fetchAnalytics();
    }, [selectedPeriod]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [revenueRes, ordersRes, productsRes, categoriesRes] = await Promise.all([
                analyticsService.getRevenue(selectedPeriod),
                analyticsService.getOrders(selectedPeriod),
                analyticsService.getProducts(selectedPeriod),
                analyticsService.getCategories(selectedPeriod)
            ]);
            setRevenue(revenueRes);
            setOrders(ordersRes);
            setProducts(productsRes?.data ?? []);
            setCategories(categoriesRes?.data ?? []);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

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
        return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Loading skeleton */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                        <div className="h-64 bg-gray-200 rounded mt-6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!revenue || !orders) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <FaChartLine className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Không có dữ liệu</h3>
                <p className="text-gray-500">Chưa có thông tin thống kê</p>
            </div>
        );
    }

    const SimpleLineChart = ({ data, dataKey, color = '#10B981', height = 200 }) => {
        if (!data || data.length === 0) return null;

        const maxValue = Math.max(...data.map(item => item[dataKey]));
        const minValue = Math.min(...data.map(item => item[dataKey]));
        const range = maxValue - minValue || 1;

        const points = data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item[dataKey] - minValue) / range) * 80 - 10;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="relative" style={{ height: `${height}px` }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />

                    {/* Area fill */}
                    <path
                        d={`M 0,100 L ${points} L 100,100 Z`}
                        fill={`${color}20`}
                        stroke="none"
                    />

                    {/* Line */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                    />

                    {/* Data points */}
                    {data.map((item, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y = 100 - ((item[dataKey] - minValue) / range) * 80 - 10;
                        return (
                            <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="1.5"
                                fill={color}
                            />
                        );
                    })}
                </svg>

                {/* Tooltip on hover */}
                <div className="absolute inset-0 flex items-end justify-between px-2 pb-2 pointer-events-none">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="text-xs text-gray-500 text-center"
                            style={{ width: `${100 / data.length}%` }}
                        >
                            {index % Math.ceil(data.length / 5) === 0 && (
                                <span>{new Date(item.date).getDate()}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const SimpleBarChart = ({ data, height = 200 }) => {
        if (!data || data.length === 0) return null;

        const maxValue = Math.max(...data.map(item => item.revenue));

        return (
            <div className="space-y-3">
                {data.slice(0, 6).map((item, index) => {
                    const percentage = (item.revenue / maxValue) * 100;
                    return (
                        <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 truncate">
                                        {item.icon} {item.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {formatCurrency(item.revenue)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: item.color
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{formatNumber(item.orders)} đơn</span>
                                    <span className={`flex items-center ${item.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.growthRate >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                                        {formatPercentage(item.growthRate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FaChartLine className="mr-3 text-supply-primary" />
                            Biểu đồ & Thống kê trực quan
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Phân tích dữ liệu kinh doanh chi tiết</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <FaCalendarAlt className="text-gray-400" />
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {periods.map((period) => (
                                <button
                                    key={period.value}
                                    onClick={() => setSelectedPeriod(period.value)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${selectedPeriod === period.value
                                            ? 'bg-supply-primary text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(revenue?.totalRevenue || 0)}
                            </p>
                            {/* Nếu có growthRate thì hiển thị, nếu không thì bỏ */}
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FaChartLine className="text-green-600 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(orders?.totalOrders || 0)}
                            </p>
                            {/* Nếu có averageOrdersPerDay thì hiển thị, nếu không thì bỏ */}
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FaShoppingCart className="text-blue-600 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Average Order Value */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Giá trị TB/đơn</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(revenue?.averageOrderValue || 0)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Từ {formatNumber(orders?.totalOrders || 0)} đơn
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <FaBoxes className="text-purple-600 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(orders?.completionRate ?? 0).toFixed(1)}%
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {formatNumber(orders?.completedOrders || 0)} đơn thành công
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <FaPercentage className="text-orange-600 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue & Orders Chart */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Xu hướng doanh thu & đơn hàng</h3>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveChart('revenue')}
                                className={`px-3 py-1 text-xs font-medium rounded transition ${activeChart === 'revenue'
                                        ? 'bg-green-500 text-white'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Doanh thu
                            </button>
                            <button
                                onClick={() => setActiveChart('orders')}
                                className={`px-3 py-1 text-xs font-medium rounded transition ${activeChart === 'orders'
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Đơn hàng
                            </button>
                        </div>
                    </div>

                    {activeChart === 'revenue' ? (
                        <SimpleLineChart
                            data={revenue?.data || []}
                            dataKey="revenue"
                            color="#10B981"
                            height={250}
                        />
                    ) : (
                        <SimpleLineChart
                            data={orders?.data || []}
                            dataKey="totalOrders"
                            color="#3B82F6"
                            height={250}
                        />
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-gray-600">Cao nhất</p>
                            <p className="font-bold text-gray-900">
                                {activeChart === 'revenue'
                                    ? formatCurrency(Math.max(...(revenue?.data || []).map(d => d.revenue || 0)))
                                    : formatNumber(Math.max(...(orders?.data || []).map(d => d.totalOrders || 0))) + ' đơn'
                                }
                            </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-gray-600">Trung bình</p>
                            <p className="font-bold text-gray-900">
                                {activeChart === 'revenue'
                                    ? formatCurrency((revenue?.data || []).reduce((sum, d) => sum + (d.revenue || 0), 0) / Math.max((revenue?.data || []).length, 1))
                                    : formatNumber(Math.floor((orders?.data || []).reduce((sum, d) => sum + (d.totalOrders || 0), 0) / Math.max((orders?.data || []).length, 1))) + ' đơn'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Category Performance */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Hiệu suất theo danh mục</h3>
                        <FaChartBar className="text-gray-400" />
                    </div>

                    <SimpleBarChart data={categories} height={300} />
                </div>
            </div>

            {/* Product Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Top sản phẩm bán chạy</h3>
                    <FaTrophy className="text-yellow-500 text-xl" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-200">
                                <th className="pb-3 text-sm font-medium text-gray-600">Sản phẩm</th>
                                <th className="pb-3 text-sm font-medium text-gray-600">Doanh thu</th>
                                <th className="pb-3 text-sm font-medium text-gray-600">Đơn hàng</th>
                                <th className="pb-3 text-sm font-medium text-gray-600">Lượt xem</th>
                                <th className="pb-3 text-sm font-medium text-gray-600">Tỷ lệ chuyển đổi</th>
                                <th className="pb-3 text-sm font-medium text-gray-600">Đánh giá</th>
                                <th className="pb-3 text-sm font-medium text-gray-600">Tồn kho</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(products ?? []).slice(0, 8).map((product, index) => (
                                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                                    index === 1 ? 'bg-gray-400' :
                                                        index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-gray-700">{formatCurrency(product.revenue)}</td>
                                    <td className="py-3 text-gray-700">{formatNumber(product.orders)}</td>
                                    <td className="py-3 text-gray-700">
                                        <div className="flex items-center">
                                            <FaEye className="text-gray-400 mr-1" />
                                            {formatNumber(product.views)}
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.conversionRate >= 15 ? 'bg-green-100 text-green-800' :
                                                product.conversionRate >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {product.conversionRate.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center">
                                            <FaStar className="text-yellow-400 mr-1" />
                                            <span className="text-gray-700">{product.rating.toFixed(1)}</span>
                                            <span className="text-gray-500 ml-1">({product.reviews})</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.stock >= 50 ? 'bg-green-100 text-green-800' :
                                                product.stock >= 20 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {formatNumber(product.stock)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Insights & Khuyến nghị</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">📈 Xu hướng doanh thu</h4>
                        <p className="text-sm text-gray-600">
                            Doanh thu {(revenue?.growthRate ?? 0) >= 0 ? 'tăng' : 'giảm'} {formatPercentage(Math.abs(revenue?.growthRate ?? 0))}
                            so với kỳ trước. {(revenue?.growthRate ?? 0) >= 0 ? 'Đang có xu hướng tích cực!' : 'Cần xem xét chiến lược kinh doanh.'}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">🏆 Danh mục nổi bật</h4>
                        <p className="text-sm text-gray-600">
                            {(categories?.[0]?.name || 'Không có dữ liệu')} đang dẫn đầu với {formatCurrency(categories?.[0]?.revenue || 0)} doanh thu.
                            Nên tập trung phát triển danh mục này.
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">⚡ Hiệu suất đơn hàng</h4>
                        <p className="text-sm text-gray-600">
                            Tỷ lệ hoàn thành {(orders?.completionRate ?? 0).toFixed(1)}% là {
                                (orders?.completionRate ?? 0) >= 90 ? 'rất tốt' :
                                    (orders?.completionRate ?? 0) >= 80 ? 'tốt' : 'cần cải thiện'
                            }.
                            {(orders?.completionRate ?? 0) < 90 && ' Nên tối ưu quy trình xử lý đơn hàng.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartsAnalytics;
