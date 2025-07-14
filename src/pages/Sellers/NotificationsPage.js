// Notifications Page
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SellerLayout from '../../layouts/SellerLayout';
import {
    FaBell, FaFilter, FaSearch, FaCog, FaCheck, FaCheckDouble,
    FaTrash, FaEye, FaEyeSlash, FaShoppingCart, FaCreditCard,
    FaCogs, FaComments, FaStar, FaBoxes, FaChevronDown,
    FaCalendarAlt, FaSortAmountDown, FaDownload, FaPrint, FaTimes
} from 'react-icons/fa';
import notificationService from '../../services/notificationService';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState(null);

    const notificationTypes = {
        all: { label: 'Tất cả', icon: FaBell, color: 'text-gray-600' },
        new_order: { label: 'Đơn hàng mới', icon: FaShoppingCart, color: 'text-green-600' },
        payment_update: { label: 'Cập nhật thanh toán', icon: FaCreditCard, color: 'text-blue-600' },
        system_message: { label: 'Thông báo hệ thống', icon: FaCogs, color: 'text-gray-600' },
        customer_message: { label: 'Tin nhắn khách hàng', icon: FaComments, color: 'text-purple-600' },
        product_review: { label: 'Đánh giá sản phẩm', icon: FaStar, color: 'text-yellow-600' },
        inventory_alert: { label: 'Cảnh báo tồn kho', icon: FaBoxes, color: 'text-red-600' }
    };

    useEffect(() => {
        fetchNotifications();
        fetchSettings();
    }, [filterType, filterStatus, sortBy]);

    useEffect(() => {
        // Filter notifications based on search term
        if (searchTerm) {
            const filtered = notifications.filter(n =>
                n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.message.toLowerCase().includes(searchTerm.toLowerCase())
            );
            // Note: In real implementation, search should be server-side
        }
    }, [searchTerm]);

    const fetchNotifications = async (pageNum = 1) => {
        try {
            setLoading(pageNum === 1);
            const response = await notificationService.getNotifications(pageNum, 20);

            let filteredData = response.data;

            // Apply filters
            if (filterType !== 'all') {
                filteredData = filteredData.filter(n => n.type === filterType);
            }

            if (filterStatus !== 'all') {
                filteredData = filteredData.filter(n =>
                    filterStatus === 'read' ? n.isRead : !n.isRead
                );
            }

            // Apply sorting
            filteredData.sort((a, b) => {
                switch (sortBy) {
                    case 'newest':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case 'oldest':
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    case 'priority':
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                    default:
                        return 0;
                }
            });

            if (pageNum === 1) {
                setNotifications(filteredData);
            } else {
                setNotifications(prev => [...prev, ...filteredData]);
            }

            setHasMore(response.pagination.hasNext);
            setPage(pageNum);

        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await notificationService.getSettings();
            setSettings(response);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleMarkAsRead = async (notificationIds) => {
        try {
            if (Array.isArray(notificationIds)) {
                // Batch mark as read
                await Promise.all(notificationIds.map(id => notificationService.markAsRead(id)));
                setNotifications(prev =>
                    prev.map(n =>
                        notificationIds.includes(n.id) ? { ...n, isRead: true } : n
                    )
                );
            } else {
                // Single mark as read
                await notificationService.markAsRead(notificationIds);
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationIds ? { ...n, isRead: true } : n
                    )
                );
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationIds) => {
        try {
            if (Array.isArray(notificationIds)) {
                // Batch delete
                await Promise.all(notificationIds.map(id => notificationService.deleteNotification(id)));
                setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
            } else {
                // Single delete
                await notificationService.deleteNotification(notificationIds);
                setNotifications(prev => prev.filter(n => n.id !== notificationIds));
            }
            setSelectedNotifications([]);
        } catch (error) {
            console.error('Error deleting notifications:', error);
        }
    };

    const handleSelectNotification = (notificationId) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const handleSelectAll = () => {
        const allIds = notifications.map(n => n.id);
        setSelectedNotifications(
            selectedNotifications.length === allIds.length ? [] : allIds
        );
    };

    const exportNotifications = () => {
        const data = {
            exported_at: new Date().toISOString(),
            total_notifications: notifications.length,
            filters: { type: filterType, status: filterStatus, sort: sortBy },
            notifications: notifications.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                created_at: n.createdAt,
                is_read: n.isRead,
                priority: n.priority
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notifications_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    const getPriorityBadge = (priority) => {
        const badges = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };

        const labels = {
            high: 'Cao',
            medium: 'Trung bình',
            low: 'Thấp'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[priority]}`}>
                {labels[priority]}
            </span>
        );
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <SellerLayout>
            <Helmet>
                <title>Thông báo | LocalMart Seller</title>
                <meta name="description" content="Quản lý thông báo và cập nhật từ hệ thống LocalMart" />
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <FaBell className="mr-3 text-supply-primary" />
                                Thông báo & Cập nhật
                                {unreadCount > 0 && (
                                    <span className="ml-3 bg-red-500 text-white text-sm rounded-full px-3 py-1">
                                        {unreadCount} chưa đọc
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý thông báo và cập nhật từ hệ thống LocalMart
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={exportNotifications}
                                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                                title="Xuất dữ liệu"
                            >
                                <FaDownload className="mr-2" />
                                Xuất
                            </button>

                            <button
                                onClick={() => window.print()}
                                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                                title="In danh sách"
                            >
                                <FaPrint className="mr-2" />
                                In
                            </button>

                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-700 transition"
                            >
                                <FaCog className="mr-2" />
                                Cài đặt
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="px-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm thông báo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                />
                            </div>

                            {/* Type Filter */}
                            <div className="relative">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent appearance-none"
                                >
                                    {Object.entries(notificationTypes).map(([key, type]) => (
                                        <option key={key} value={key}>{type.label}</option>
                                    ))}
                                </select>
                                <FaChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent appearance-none"
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="unread">Chưa đọc</option>
                                    <option value="read">Đã đọc</option>
                                </select>
                                <FaChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent appearance-none"
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                    <option value="priority">Độ ưu tiên</option>
                                </select>
                                <FaChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedNotifications.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Đã chọn {selectedNotifications.length} thông báo
                                    </span>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handleMarkAsRead(selectedNotifications)}
                                            className="flex items-center px-3 py-1 text-green-600 hover:text-green-800 text-sm"
                                        >
                                            <FaCheckDouble className="mr-1" />
                                            Đánh dấu đã đọc
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedNotifications)}
                                            className="flex items-center px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                                        >
                                            <FaTrash className="mr-1" />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                {unreadCount > 0 && (
                    <div className="px-6 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FaBell className="text-blue-600 mr-3" />
                                    <span className="text-blue-800 font-medium">
                                        Bạn có {unreadCount} thông báo chưa đọc
                                    </span>
                                </div>
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                >
                                    <FaCheckDouble className="mr-2" />
                                    Đánh dấu tất cả đã đọc
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications List */}
                <div className="px-6">
                    {loading ? (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="animate-pulse border-b border-gray-200 last:border-b-0 py-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <FaBell className="text-4xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">Không có thông báo</h3>
                            <p className="text-gray-500">
                                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                                    ? 'Không tìm thấy thông báo phù hợp với bộ lọc'
                                    : 'Chưa có thông báo nào được gửi đến'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm">
                            {/* Select All Header */}
                            <div className="p-4 border-b border-gray-200">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-supply-primary focus:ring-supply-primary"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                        Chọn tất cả ({notifications.length})
                                    </span>
                                </label>
                            </div>

                            {/* Notifications */}
                            {notifications.map((notification) => {
                                const typeConfig = notificationTypes[notification.type];
                                const IconComponent = typeConfig?.icon || FaBell;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50 transition ${!notification.isRead ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.includes(notification.id)}
                                                onChange={() => handleSelectNotification(notification.id)}
                                                className="mt-1 rounded border-gray-300 text-supply-primary focus:ring-supply-primary"
                                            />

                                            {/* Icon */}
                                            <div className={`p-2 rounded-full ${notification.color} flex-shrink-0`}>
                                                <IconComponent className="text-sm" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h3 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                                                }`}>
                                                                {notification.title}
                                                            </h3>
                                                            {getPriorityBadge(notification.priority)}
                                                            {!notification.isRead && (
                                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                            )}
                                                        </div>
                                                        <p className={`text-sm mb-2 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'
                                                            }`}>
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                                                            <span>{formatTimeAgo(notification.createdAt)}</span>
                                                            <span>•</span>
                                                            <span className={typeConfig?.color}>
                                                                {typeConfig?.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="p-1 text-gray-400 hover:text-green-600 transition"
                                                                title="Đánh dấu đã đọc"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(notification.id)}
                                                            className="p-1 text-gray-400 hover:text-red-600 transition"
                                                            title="Xóa thông báo"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Additional Data */}
                                                {notification.data && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border text-sm">
                                                        {notification.type === 'new_order' && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Mã đơn hàng:</span>
                                                                    <span className="ml-2 text-supply-primary">#{notification.data.orderId}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Khách hàng:</span>
                                                                    <span className="ml-2">{notification.data.customerName}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Giá trị:</span>
                                                                    <span className="ml-2 font-medium">
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(notification.data.amount)}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Số lượng:</span>
                                                                    <span className="ml-2">{notification.data.itemCount} sản phẩm</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {notification.type === 'payment_update' && (
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Đơn hàng:</span>
                                                                    <span className="ml-2 text-blue-600">#{notification.data.orderId}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Số tiền:</span>
                                                                    <span className="ml-2 font-medium">
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(notification.data.amount)}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${notification.data.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                        notification.data.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                            'bg-yellow-100 text-yellow-800'
                                                                        }`}>
                                                                        {notification.data.status === 'completed' ? 'Thành công' :
                                                                            notification.data.status === 'failed' ? 'Thất bại' : 'Hoàn tiền'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {notification.type === 'inventory_alert' && (
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Sản phẩm:</span>
                                                                    <span className="ml-2">{notification.data.productName}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Tồn kho:</span>
                                                                    <span className="ml-2 text-red-600 font-medium">
                                                                        {notification.data.currentStock} / {notification.data.threshold}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Load More */}
                            {hasMore && (
                                <div className="p-4 text-center border-t border-gray-200">
                                    <button
                                        onClick={() => fetchNotifications(page + 1)}
                                        disabled={loading}
                                        className="px-6 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {loading ? 'Đang tải...' : 'Tải thêm thông báo'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Statistics Footer */}
                <div className="px-6 py-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-4">📊 Thống kê thông báo</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-supply-primary">{notifications.length}</p>
                                <p className="text-sm text-gray-600">Tổng thông báo</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                                <p className="text-sm text-gray-600">Chưa đọc</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {notifications.filter(n => n.type === 'new_order').length}
                                </p>
                                <p className="text-sm text-gray-600">Đơn hàng mới</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">
                                    {notifications.filter(n => n.priority === 'high').length}
                                </p>
                                <p className="text-sm text-gray-600">Ưu tiên cao</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Cài đặt thông báo</h3>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {settings && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Phương thức nhận thông báo</h4>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.emailNotifications}
                                                    onChange={(e) => setSettings(prev => ({
                                                        ...prev,
                                                        emailNotifications: e.target.checked
                                                    }))}
                                                    className="rounded border-gray-300 text-supply-primary focus:ring-supply-primary"
                                                />
                                                <span className="ml-2 text-sm">Email</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.pushNotifications}
                                                    onChange={(e) => setSettings(prev => ({
                                                        ...prev,
                                                        pushNotifications: e.target.checked
                                                    }))}
                                                    className="rounded border-gray-300 text-supply-primary focus:ring-supply-primary"
                                                />
                                                <span className="ml-2 text-sm">Thông báo đẩy</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.smsNotifications}
                                                    onChange={(e) => setSettings(prev => ({
                                                        ...prev,
                                                        smsNotifications: e.target.checked
                                                    }))}
                                                    className="rounded border-gray-300 text-supply-primary focus:ring-supply-primary"
                                                />
                                                <span className="ml-2 text-sm">SMS</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Loại thông báo</h4>
                                        <div className="space-y-2">
                                            {Object.entries(settings.preferences).map(([key, value]) => (
                                                <label key={key} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={value}
                                                        onChange={(e) => setSettings(prev => ({
                                                            ...prev,
                                                            preferences: {
                                                                ...prev.preferences,
                                                                [key]: e.target.checked
                                                            }
                                                        }))}
                                                        className="rounded border-gray-300 text-supply-primary focus:ring-supply-primary"
                                                    />
                                                    <span className="ml-2 text-sm">
                                                        {notificationTypes[key.replace(/([A-Z])/g, '_$1').toLowerCase()]?.label || key}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await notificationService.updateSettings(settings);
                                                setShowSettings(false);
                                            }}
                                            className="px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-700 transition"
                                        >
                                            Lưu cài đặt
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
};

export default NotificationsPage;
