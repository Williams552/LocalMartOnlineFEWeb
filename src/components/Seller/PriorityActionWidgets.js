// Priority Action Widgets Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaExclamationTriangle, FaClipboardList, FaBoxOpen,
    FaCreditCard, FaCertificate, FaClock, FaArrowRight,
    FaCheckCircle, FaTimesCircle, FaPlus, FaMoneyBill
} from 'react-icons/fa';
import priorityActionService from '../../services/priorityActionService';

const PriorityActionWidgets = () => {
    const [priorityData, setPriorityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchPriorityActions();
    }, []);

    const fetchPriorityActions = async () => {
        try {
            setLoading(true);
            const response = await priorityActionService.getPriorityActions();
            setPriorityData(response.data);
        } catch (error) {
            console.error('Error fetching priority actions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = async (actionType, itemId) => {
        setProcessing(prev => ({ ...prev, [itemId]: true }));

        try {
            let result;
            switch (actionType) {
                case 'processOrder':
                    result = await priorityActionService.processOrder(itemId);
                    break;
                case 'restockProduct':
                    result = await priorityActionService.restockProduct(itemId, 10);
                    break;
                case 'payFee':
                    result = await priorityActionService.payFee(itemId);
                    break;
                case 'renewLicense':
                    result = await priorityActionService.renewLicense(itemId);
                    break;
                default:
                    throw new Error('Unknown action type');
            }

            if (result.success) {
                // Refresh data after successful action
                await fetchPriorityActions();
                // You could add a toast notification here
            }
        } catch (error) {
            console.error('Error performing quick action:', error);
        } finally {
            setProcessing(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Vừa xong';
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        return `${Math.floor(diffInHours / 24)} ngày trước`;
    };

    const formatDaysLeft = (daysLeft) => {
        if (daysLeft <= 0) return 'Đã hết hạn';
        if (daysLeft === 1) return '1 ngày';
        return `${daysLeft} ngày`;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                        <div className="h-8 bg-gray-200 rounded mb-2 w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!priorityData) return null;

    const widgets = [
        {
            id: 'pendingOrders',
            title: 'Đơn hàng chờ xử lý',
            icon: FaClipboardList,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            count: priorityData.pendingOrders.count,
            urgentCount: priorityData.pendingOrders.urgent,
            subtitle: `${priorityData.pendingOrders.urgent} đơn cần xử lý gấp`,
            action: 'Xử lý ngay',
            route: '/seller/orders',
            items: priorityData.pendingOrders.items.slice(0, 3),
            quickAction: 'processOrder'
        },
        {
            id: 'outOfStock',
            title: 'Sản phẩm hết hàng',
            icon: FaBoxOpen,
            iconColor: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            count: priorityData.outOfStock.count,
            urgentCount: priorityData.outOfStock.critical,
            subtitle: `${priorityData.outOfStock.critical} sản phẩm tồn kho = 0`,
            action: 'Nhập hàng',
            route: '/seller/products',
            items: priorityData.outOfStock.items.slice(0, 3),
            quickAction: 'restockProduct'
        },
        {
            id: 'pendingPayments',
            title: 'Phí chợ cần thanh toán',
            icon: FaCreditCard,
            iconColor: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            count: priorityData.pendingPayments.count,
            urgentCount: priorityData.pendingPayments.overdue,
            subtitle: `${priorityData.pendingPayments.overdue} khoản quá hạn`,
            action: 'Thanh toán',
            route: '/seller/payments',
            items: priorityData.pendingPayments.items,
            quickAction: 'payFee'
        },
        {
            id: 'licenseExpiration',
            title: 'Giấy phép sắp hết hạn',
            icon: FaCertificate,
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            count: priorityData.licenseExpiration.count,
            urgentCount: priorityData.licenseExpiration.expiringSoon,
            subtitle: `${priorityData.licenseExpiration.expiringSoon} giấy phép cần gia hạn`,
            action: 'Gia hạn',
            route: '/seller/licenses',
            items: priorityData.licenseExpiration.items,
            quickAction: 'renewLicense'
        }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <FaExclamationTriangle className="mr-2 text-red-500" />
                        Hành động ưu tiên
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Các vấn đề cần xử lý ngay lập tức
                    </p>
                </div>
                <button
                    onClick={fetchPriorityActions}
                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                    🔄 Làm mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {widgets.map((widget) => (
                    <div
                        key={widget.id}
                        className={`bg-white rounded-lg shadow-sm border-l-4 ${widget.borderColor} p-6 hover:shadow-md transition-shadow`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-full ${widget.bgColor}`}>
                                <widget.icon className={`text-xl ${widget.iconColor}`} />
                            </div>
                            {widget.urgentCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {widget.urgentCount}
                                </span>
                            )}
                        </div>

                        {/* Title and Count */}
                        <div className="mb-3">
                            <h3 className="font-bold text-gray-800 text-sm mb-1">
                                {widget.title}
                            </h3>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-bold text-gray-900">
                                    {widget.count}
                                </span>
                                {widget.urgentCount > 0 && (
                                    <span className="text-red-600 text-sm font-medium">
                                        cấp bách
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-500 text-xs mt-1">
                                {widget.subtitle}
                            </p>
                        </div>

                        {/* Quick Preview */}
                        {widget.items && widget.items.length > 0 && (
                            <div className="mb-4 space-y-2">
                                {widget.items.slice(0, 2).map((item, index) => (
                                    <div key={index} className="text-xs bg-gray-50 rounded p-2">
                                        {widget.id === 'pendingOrders' && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">#{item.id}</span>
                                                <span className="text-gray-500">
                                                    {formatTimeAgo(item.createdAt)}
                                                </span>
                                            </div>
                                        )}
                                        {widget.id === 'outOfStock' && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-red-600">
                                                    {item.currentStock} tồn
                                                </span>
                                            </div>
                                        )}
                                        {widget.id === 'pendingPayments' && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{item.description}</span>
                                                <span className={item.isOverdue ? 'text-red-600' : 'text-gray-600'}>
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(item.amount)}
                                                </span>
                                            </div>
                                        )}
                                        {widget.id === 'licenseExpiration' && (
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-purple-600">
                                                    {formatDaysLeft(item.daysLeft)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {widget.items.length > 2 && (
                                    <div className="text-xs text-gray-500 text-center">
                                        +{widget.items.length - 2} mục khác
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={() => navigate(widget.route)}
                                className={`w-full flex items-center justify-center px-3 py-2 ${widget.iconColor.replace('text-', 'bg-').replace('-600', '-100')} ${widget.iconColor} rounded-lg hover:${widget.iconColor.replace('text-', 'bg-').replace('-600', '-200')} transition text-sm font-medium`}
                            >
                                {widget.action}
                                <FaArrowRight className="ml-2 text-xs" />
                            </button>

                            {/* Quick Action for first urgent item */}
                            {widget.urgentCount > 0 && widget.items && widget.items[0] && (
                                <button
                                    onClick={() => handleQuickAction(widget.quickAction, widget.items[0].id)}
                                    disabled={processing[widget.items[0].id]}
                                    className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-xs disabled:opacity-50"
                                >
                                    {processing[widget.items[0].id] ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle className="mr-2" />
                                            Xử lý nhanh
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <FaExclamationTriangle className="text-red-500 mr-3" />
                        <div>
                            <h3 className="font-bold text-gray-800">Tổng quan ưu tiên</h3>
                            <p className="text-sm text-gray-600">
                                {priorityData.pendingOrders.urgent +
                                    priorityData.outOfStock.critical +
                                    priorityData.pendingPayments.overdue +
                                    priorityData.licenseExpiration.expiringSoon} vấn đề cần xử lý ngay
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="text-center">
                                <div className="font-bold text-blue-600">
                                    {priorityData.pendingOrders.urgent}
                                </div>
                                <div className="text-gray-500">Đơn hàng</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-red-600">
                                    {priorityData.outOfStock.critical}
                                </div>
                                <div className="text-gray-500">Hết hàng</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-orange-600">
                                    {priorityData.pendingPayments.overdue}
                                </div>
                                <div className="text-gray-500">Quá hạn</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-purple-600">
                                    {priorityData.licenseExpiration.expiringSoon}
                                </div>
                                <div className="text-gray-500">Hết hạn</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriorityActionWidgets;
