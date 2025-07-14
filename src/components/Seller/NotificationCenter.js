// Notifications Component
import React, { useState, useEffect, useRef } from 'react';
import {
    FaBell, FaCheck, FaCheckDouble, FaTrash, FaCog, FaFilter,
    FaShoppingCart, FaCreditCard, FaCogs, FaComments, FaStar,
    FaBoxes, FaExclamationTriangle, FaEllipsisH, FaTimes
} from 'react-icons/fa';
import notificationService from '../../services/notificationService';

const NotificationCenter = ({ isOpen, onClose, onUnreadCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const dropdownRef = useRef(null);

    const notificationTypes = {
        all: { label: 'Tất cả', icon: FaBell },
        new_order: { label: 'Đơn hàng mới', icon: FaShoppingCart },
        payment_update: { label: 'Thanh toán', icon: FaCreditCard },
        system_message: { label: 'Hệ thống', icon: FaCogs },
        customer_message: { label: 'Tin nhắn', icon: FaComments },
        product_review: { label: 'Đánh giá', icon: FaStar },
        inventory_alert: { label: 'Tồn kho', icon: FaBoxes }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, filter]);

    useEffect(() => {
        // Click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const fetchNotifications = async (pageNum = 1) => {
        try {
            setLoading(pageNum === 1);
            const response = await notificationService.getNotifications(pageNum, 15);

            let filteredData = response.data;
            if (filter !== 'all') {
                filteredData = response.data.filter(n => n.type === filter);
            }

            if (pageNum === 1) {
                setNotifications(filteredData);
            } else {
                setNotifications(prev => [...prev, ...filteredData]);
            }

            setHasMore(response.pagination.hasNext);
            setPage(pageNum);

            // Update unread count
            const unreadCount = filteredData.filter(n => !n.isRead).length;
            onUnreadCountChange(unreadCount);

        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );

            // Update unread count
            const unreadCount = notifications.filter(n => !n.isRead && n.id !== notificationId).length;
            onUnreadCountChange(unreadCount);

        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            onUnreadCountChange(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));

            // Update unread count
            const deletedNotification = notifications.find(n => n.id === notificationId);
            if (deletedNotification && !deletedNotification.isRead) {
                const unreadCount = notifications.filter(n => !n.isRead && n.id !== notificationId).length;
                onUnreadCountChange(unreadCount);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchNotifications(page + 1);
        }
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

    const getNotificationIcon = (type) => {
        const icons = {
            new_order: FaShoppingCart,
            payment_update: FaCreditCard,
            system_message: FaCogs,
            customer_message: FaComments,
            product_review: FaStar,
            inventory_alert: FaBoxes
        };

        const IconComponent = icons[type] || FaBell;
        return <IconComponent className="text-sm" />;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'border-l-red-500',
            medium: 'border-l-yellow-500',
            low: 'border-l-green-500'
        };
        return colors[priority] || 'border-l-gray-300';
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <FaBell className="mr-2 text-supply-primary" />
                        Thông báo
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {unreadCount}
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-1">
                    {Object.entries(notificationTypes).map(([key, type]) => {
                        const IconComponent = type.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`flex items-center px-2 py-1 text-xs rounded transition ${filter === key
                                        ? 'bg-supply-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <IconComponent className="mr-1" />
                                {type.label}
                            </button>
                        );
                    })}
                </div>

                {/* Actions */}
                {unreadCount > 0 && (
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-supply-primary hover:text-green-700 flex items-center"
                        >
                            <FaCheckDouble className="mr-1" />
                            Đánh dấu tất cả đã đọc
                        </button>
                    </div>
                )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
                {loading && notifications.length === 0 ? (
                    <div className="p-4">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="animate-pulse mb-3">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <FaBell className="text-3xl mx-auto mb-3 text-gray-300" />
                        <p>Không có thông báo nào</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group relative p-3 rounded-lg mb-2 transition border-l-4 ${getPriorityColor(notification.priority)
                                    } ${notification.isRead
                                        ? 'bg-gray-50 hover:bg-gray-100'
                                        : 'bg-blue-50 hover:bg-blue-100'
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    {/* Icon */}
                                    <div className={`p-2 rounded-full ${notification.color} flex-shrink-0`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-medium mb-1 ${notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                                    }`}>
                                                    {notification.title}
                                                </h4>
                                                <p className={`text-xs ${notification.isRead ? 'text-gray-500' : 'text-gray-700'
                                                    }`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="p-1 text-gray-400 hover:text-green-600 transition"
                                                        title="Đánh dấu đã đọc"
                                                    >
                                                        <FaCheck className="text-xs" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition"
                                                    title="Xóa thông báo"
                                                >
                                                    <FaTrash className="text-xs" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Additional Data */}
                                        {notification.data && (
                                            <div className="mt-2 text-xs">
                                                {notification.type === 'new_order' && (
                                                    <div className="bg-white rounded p-2 border">
                                                        <span className="font-medium">Đơn hàng: </span>
                                                        <span className="text-supply-primary">#{notification.data.orderId}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(notification.data.amount)}</span>
                                                    </div>
                                                )}
                                                {notification.type === 'payment_update' && (
                                                    <div className="bg-white rounded p-2 border">
                                                        <span className="font-medium">Thanh toán: </span>
                                                        <span className="text-blue-600">#{notification.data.orderId}</span>
                                                        <span className="mx-2">•</span>
                                                        <span className={`px-2 py-1 rounded text-xs ${notification.data.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                notification.data.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {notification.data.status === 'completed' ? 'Thành công' :
                                                                notification.data.status === 'failed' ? 'Thất bại' : 'Hoàn tiền'}
                                                        </span>
                                                    </div>
                                                )}
                                                {notification.type === 'inventory_alert' && (
                                                    <div className="bg-white rounded p-2 border">
                                                        <span className="font-medium">{notification.data.productName}</span>
                                                        <span className="mx-2">•</span>
                                                        <span className="text-red-600">Còn {notification.data.currentStock} sản phẩm</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Load More */}
                        {hasMore && (
                            <div className="text-center p-3">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="text-supply-primary hover:text-green-700 text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Đang tải...' : 'Xem thêm'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
