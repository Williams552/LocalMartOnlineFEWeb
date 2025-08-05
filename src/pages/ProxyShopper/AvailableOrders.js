import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiUser, FiPackage, FiDollarSign, FiClock } from 'react-icons/fi';
import { FaBoxOpen } from 'react-icons/fa';
import proxyShopperService from '../../services/proxyShopperService';

const AvailableOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acceptingOrder, setAcceptingOrder] = useState(null);

    useEffect(() => {
        fetchAvailableOrders();
    }, []);

    const fetchAvailableOrders = async () => {
        try {
            setLoading(true);
            // Lấy access token từ localStorage giống các service khác
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5183/api/ProxyShopper/requests/available", {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json"
                },
            });
            if (!res.ok) throw new Error("Không thể lấy danh sách đơn hàng khả dụng");
            const data = await res.json();
            console.log('Available orders with market info:', data); // Debug log
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching available orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            setAcceptingOrder(orderId);
            // Lấy token giống fetchAvailableOrders
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5183/api/ProxyShopper/requests/${orderId}/accept`, {
                method: "POST",
                headers: {
                    "Authorization": token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json"
                },
            });
            if (!res.ok) {
                const errMsg = res.status === 401 ? "Bạn không có quyền nhận đơn hàng này." : "Có lỗi xảy ra khi nhận đơn hàng";
                alert(errMsg);
                return;
            }
            // Remove the accepted order from the list
            setOrders(orders.filter(order => order.id !== orderId));
            alert('Đã nhận đơn hàng thành công!');
        } catch (error) {
            console.error('Error accepting order:', error);
            alert('Có lỗi xảy ra khi nhận đơn hàng');
        } finally {
            setAcceptingOrder(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Vừa xong';

        try {
            const orderDate = new Date(dateString);
            const now = new Date();
            const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60));

            if (diffInMinutes < 1) return 'Vừa xong';
            if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
            if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
            return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
        } catch (error) {
            return 'Vừa xong';
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn hàng khả dụng</h1>
                <p className="text-gray-600">Tìm và nhận các đơn hàng từ những chợ bạn đã đăng ký.</p>
                <div className="mt-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-start">
                        <FiMapPin className="text-blue-500 mr-2 mt-0.5" size={16} />
                        <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">Cơ chế hoạt động:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Bạn chỉ thấy đơn hàng từ những chợ mà bạn đã đăng ký làm proxy shopper</li>
                                <li>Khách hàng phải chọn chợ cụ thể khi tạo yêu cầu đi chợ giùm</li>
                                <li>Hệ thống tự động lọc và hiển thị đúng đơn hàng phù hợp với bạn</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="mb-6">
                <button
                    onClick={fetchAvailableOrders}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                    <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Làm mới
                </button>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="p-6">
                                {/* Order Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Đơn hàng #{order.id?.slice(-8)}
                                        </h3>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                            🕐 Chờ nhận
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <FiClock className="mr-1" size={14} />
                                            {getTimeAgo(order.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <FiUser className="text-gray-600" size={16} />
                                        <span className="font-medium text-gray-700">Thông tin khách hàng</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Khách hàng:</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {order.buyerName || 'Khách hàng'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Địa chỉ giao hàng:</p>
                                            <p className="text-sm font-medium text-gray-900 flex items-start">
                                                <FiMapPin className="mr-1 mt-0.5 flex-shrink-0" size={14} />
                                                {order.deliveryAddress}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Market Info */}
                                {order.marketName && (
                                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <FiMapPin className="text-green-600" size={16} />
                                            <span className="font-medium text-green-700">Thông tin chợ</span>
                                        </div>
                                        <div className="flex items-center">
                                            <p className="text-sm text-green-600">Chợ yêu cầu:</p>
                                            <p className="text-sm font-medium text-green-800 ml-2">
                                                {order.marketName}
                                                {order.marketId && (
                                                    <span className="ml-1 text-xs text-green-600">(ID: {order.marketId})</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="mb-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <FiPackage className="text-gray-600" size={16} />
                                        <span className="font-medium text-gray-700">
                                            Danh sách sản phẩm ({order.items?.length || 0} sản phẩm)
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="space-y-3">
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                                                        <div className="flex items-center space-x-3">
                                                            {item.imageUrl && (
                                                                <img
                                                                    src={item.imageUrl}
                                                                    alt={item.name}
                                                                    className="w-12 h-12 object-cover rounded"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    Số lượng: {item.quantity || 1} {item.unit || 'sản phẩm'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">Không có sản phẩm nào</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {order.notes && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-800 mb-1">Ghi chú từ khách hàng:</p>
                                        <p className="text-sm text-blue-700">{order.notes}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">
                                            ⚡ Phí dịch vụ dự kiến: <span className="font-medium">{formatCurrency(order.estimatedFee || order.totalAmount * 0.1)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Link
                                            to={`/proxy-shopper/orders/${order.id}/detail`}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            Xem chi tiết
                                        </Link>
                                        <button
                                            onClick={() => handleAcceptOrder(order.id)}
                                            disabled={acceptingOrder === order.id}
                                            className="px-6 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm font-medium"
                                        >
                                            {acceptingOrder === order.id ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Đang nhận...
                                                </span>
                                            ) : (
                                                'Nhận đơn hàng'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                        <FaBoxOpen className="text-gray-400 text-6xl mb-4 mx-auto" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                            Hiện tại không có đơn hàng nào
                        </h3>
                        <div className="text-gray-500 mb-6 space-y-2">
                            <p>Chưa có đơn hàng mới từ các chợ bạn đã đăng ký.</p>
                            <div className="text-sm bg-gray-50 rounded-lg p-3 mt-4">
                                <p className="font-medium text-gray-700 mb-2">Có thể do:</p>
                                <ul className="text-left list-disc list-inside space-y-1">
                                    <li>Chưa có khách hàng tạo yêu cầu đi chợ từ các chợ bạn đã đăng ký</li>
                                    <li>Tất cả đơn hàng hiện tại đã được proxy shopper khác nhận</li>
                                    <li>Bạn cần đăng ký làm proxy shopper tại nhiều chợ hơn</li>
                                </ul>
                            </div>
                        </div>
                        <button
                            onClick={fetchAvailableOrders}
                            className="inline-flex items-center px-6 py-3 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Làm mới danh sách
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableOrders;
