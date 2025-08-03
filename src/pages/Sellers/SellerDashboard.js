import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaStore, FaBoxOpen, FaShoppingCart, FaUsers, FaStar, FaEye,
    FaChartLine, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
    FaCalendarAlt, FaDollarSign, FaSyncAlt, FaSpinner, FaBox, FaRocket, FaBell
} from "react-icons/fa";
import SellerLayout from "../../layouts/SellerLayout";
import sellerDashboardService from "../../services/sellerDashboardService";
import RecentOrders from "../../components/Seller/RecentOrders";
import TopProducts from "../../components/Seller/TopProducts";
import QuickActions from "../../components/Seller/QuickActions";
import ChartsAnalytics from "../../components/Seller/ChartsAnalytics";
import PriorityActionWidgets from "../../components/Seller/PriorityActionWidgets";
import PaymentOptions from "../../components/Seller/PaymentOptions";
import notificationService from "../../services/notificationService";
import useStoreStatus from "../../hooks/useStoreStatus";
import { toast } from "react-toastify";

const SellerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Check store status - this will handle suspension automatically
    const { isStoreSuspended, storeInfo } = useStoreStatus();

    // Load dashboard data on component mount
    useEffect(() => {
        loadDashboardData();
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const [notificationsResult, unreadResult] = await Promise.all([
                notificationService.getNotifications(1, 5),
                notificationService.getUnreadCount()
            ]);

            setRecentNotifications(notificationsResult.data || []);
            setUnreadCount(unreadResult.count || 0);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📊 Loading seller dashboard data...');

            // Load overview statistics
            const statsResult = await sellerDashboardService.getSellerOverviewStats();

            if (statsResult.success) {
                setStats(statsResult.data);
                console.log('✅ Overview stats loaded:', statsResult.data);
            } else {
                setError(statsResult.message);
                setStats(statsResult.data); // Use fallback data
                toast.warn('Sử dụng dữ liệu mẫu: ' + statsResult.message);
            }

        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
            setError('Không thể tải dữ liệu dashboard');
            toast.error('Không thể tải dữ liệu dashboard');

            // Use fallback data
            setStats(sellerDashboardService.getMockStats());
        } finally {
            setLoading(false);
        }
    };

    const refreshDashboard = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
        toast.success('Dữ liệu đã được cập nhật');
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatNumber = (number) => {
        if (!number) return '0';
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;

        return notificationTime.toLocaleDateString('vi-VN');
    };

    // Loading state
    if (loading) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-supply-primary mx-auto mb-4" />
                        <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    // Error state (when no data at all)
    if (error && !stats) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Không thể tải dữ liệu</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={loadDashboardData}
                            className="px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Người Bán</h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">Quản lý cửa hàng và theo dõi hiệu suất kinh doanh</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={refreshDashboard}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm"
                            >
                                <FaSyncAlt className={refreshing ? 'animate-spin' : ''} />
                                <span className="hidden sm:inline">Làm mới</span>
                                <span className="sm:hidden">Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Total Products */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{formatNumber(stats?.totalProducts || 0)}</p>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                    Hoạt động: {formatNumber(stats?.activeProducts || 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                                <FaBox className="text-blue-600 text-lg sm:text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{formatNumber(stats?.totalOrders || 0)}</p>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                    Chờ xử lý: {formatNumber(stats?.pendingOrders || 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                                <FaShoppingCart className="text-green-600 text-lg sm:text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{formatCurrency(stats?.totalRevenue || 0)}</p>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                    Tháng này: {formatCurrency(stats?.revenueThisMonth || 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg flex-shrink-0">
                                <FaDollarSign className="text-yellow-600 text-lg sm:text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Total Followers */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-600">Người theo dõi</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{formatNumber(stats?.totalFollowers || 0)}</p>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                    Mới: +{formatNumber(stats?.newFollowers || 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                                <FaUsers className="text-purple-600 text-lg sm:text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Priority Action Widgets */}
                <PriorityActionWidgets />

                {/* Quick Actions */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                            <FaRocket className="mr-2 sm:mr-3 text-supply-primary" />
                            Thao tác nhanh
                        </h2>
                        <Link
                            to="/seller/quick-actions"
                            className="text-supply-primary hover:text-green-700 transition text-sm font-medium self-start sm:self-auto"
                        >
                            Xem tất cả →
                        </Link>
                    </div>
                    <QuickActions />
                </div>

                {/* Recent Notifications */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                            <FaBell className="mr-2 sm:mr-3 text-supply-primary" />
                            Thông báo mới nhất
                            {unreadCount > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs sm:text-sm rounded-full px-2 py-1">
                                    {unreadCount}
                                </span>
                            )}
                        </h2>
                        <Link
                            to="/seller/notifications"
                            className="text-supply-primary hover:text-green-700 transition text-sm font-medium self-start sm:self-auto"
                        >
                            Xem tất cả →
                        </Link>
                    </div>

                    {recentNotifications.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {recentNotifications.map((notification, index) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 sm:p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start space-x-2 sm:space-x-3">
                                        <div className={`p-2 rounded-full ${notification.color} flex-shrink-0`}>
                                            <span className="text-xs sm:text-sm">{notification.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                                                <h4 className={`font-medium text-sm ${notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                                    } flex items-center`}>
                                                    <span className="truncate">{notification.title}</span>
                                                    {!notification.isRead && (
                                                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                                    )}
                                                </h4>
                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'
                                                } line-clamp-2`}>
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
                            <FaBell className="text-2xl sm:text-3xl text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm sm:text-base">Không có thông báo mới</p>
                        </div>
                    )}
                </div>

                {/* Payment Options Section */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                            <FaCreditCard className="mr-2 sm:mr-3 text-supply-primary" />
                            Tùy chọn thanh toán
                        </h2>
                        <Link
                            to="/seller/payments"
                            className="text-supply-primary hover:text-green-700 transition text-sm font-medium self-start sm:self-auto"
                        >
                            Xem tất cả →
                        </Link>
                    </div>
                    <PaymentOptions sellerId={storeInfo?.sellerId} />
                </div>

                {/* Additional Information */}
                <div className="mb-6 sm:mb-8">
                    <RecentOrders limit={10} />
                </div>

                {/* Top Products Section */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">🏆 Sản phẩm bán chạy</h2>
                    <TopProducts limit={5} />
                </div>

                {stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Performance Metrics */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Hiệu suất</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm sm:text-base text-gray-600">Đánh giá trung bình</span>
                                    <div className="flex items-center gap-1">
                                        <FaStar className="text-yellow-500 text-sm" />
                                        <span className="font-medium text-sm sm:text-base">{(stats.averageRating || 0).toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm sm:text-base text-gray-600">Lượt xem tuần này</span>
                                    <span className="font-medium text-sm sm:text-base">{formatNumber(stats.viewsThisWeek || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm sm:text-base text-gray-600">Khách hàng thân thiết</span>
                                    <Link
                                        to="/seller/customers"
                                        className="font-medium text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base"
                                    >
                                        {formatNumber(stats.loyalCustomers || 0)}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Tình trạng kho</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm sm:text-base text-gray-600">Sản phẩm hoạt động</span>
                                    <span className="font-medium text-green-600 text-sm sm:text-base">{formatNumber(stats.activeProducts || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm sm:text-base text-gray-600">Hết hàng</span>
                                    <span className="font-medium text-red-600 text-sm sm:text-base">{formatNumber(stats.outOfStockProducts || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm sm:text-base text-gray-600">Tổng sản phẩm</span>
                                    <span className="font-medium text-sm sm:text-base">{formatNumber(stats.totalProducts || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Status */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm sm:text-base text-gray-600">Hoàn thành</span>
                                    <span className="font-medium text-green-600 text-sm sm:text-base">{formatNumber(stats.completedOrders || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm sm:text-base text-gray-600">Chờ xử lý</span>
                                    <span className="font-medium text-yellow-600 text-sm sm:text-base">{formatNumber(stats.pendingOrders || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm sm:text-base text-gray-600">Tổng đơn hàng</span>
                                    <span className="font-medium text-sm sm:text-base">{formatNumber(stats.totalOrders || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts & Visual Analytics */}
                <div className="mt-6 sm:mt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                            <FaChartLine className="mr-2 sm:mr-3 text-supply-primary" />
                            Biểu đồ & Thống kê trực quan
                        </h2>
                        <Link
                            to="/seller/analytics"
                            className="text-supply-primary hover:text-green-700 transition text-sm font-medium self-start sm:self-auto"
                        >
                            Xem chi tiết →
                        </Link>
                    </div>
                    <ChartsAnalytics />
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerDashboard;
