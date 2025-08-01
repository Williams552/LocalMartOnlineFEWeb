import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiClock, FiMapPin, FiUser, FiEye } from 'react-icons/fi';
import { FaBoxOpen } from 'react-icons/fa';
import proxyShopperService from '../../services/proxyShopperService';

const ProxyShopperOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Lấy token xác thực giống các service khác
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5183/api/ProxyShopper/requests/my-accepted", {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json"
                },
            });
            if (!res.ok) throw new Error("Không thể lấy danh sách đơn hàng đã nhận");
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
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
            'Pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý', icon: '⏳' },
            'Accepted': { color: 'bg-blue-100 text-blue-800', text: 'Đã nhận', icon: '📋' },
            'Completed': { color: 'bg-green-100 text-green-800', text: 'Hoàn thành', icon: '✅' },
            'Cancelled': { color: 'bg-red-100 text-red-800', text: 'Đã hủy', icon: '❌' }
        };

        const config = statusConfig[status] || {
            color: 'bg-gray-100 text-gray-800',
            text: status,
            icon: '❓'
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <span className="mr-1">{config.icon}</span>
                {config.text}
            </span>
        );
    };

    const getFilterTabs = () => [
        { key: 'all', label: 'Tất cả', count: orders.length },
        { key: 'Pending', label: 'Chờ xử lý', count: orders.filter(o => o.status === 'Pending').length },
        { key: 'Accepted', label: 'Đã nhận', count: orders.filter(o => o.status === 'Accepted').length },
        { key: 'Completed', label: 'Hoàn thành', count: orders.filter(o => o.status === 'Completed').length },
        { key: 'Cancelled', label: 'Đã hủy', count: orders.filter(o => o.status === 'Cancelled').length }
    ];

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(order => order.status === filter);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn hàng của tôi</h1>
                <p className="text-gray-600">Quản lý tất cả đơn hàng bạn đã nhận và thực hiện.</p>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {getFilterTabs().map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${filter === tab.key
                                        ? 'border-supply-primary text-supply-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${filter === tab.key
                                            ? 'bg-supply-primary text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="p-6">
                                {/* Order Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            Đơn hàng #{order.id?.slice(-8)}
                                        </h3>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiMapPin className="mr-2" size={16} />
                                            <span>Địa chỉ giao hàng:</span>
                                        </div>
                                        <p className="text-sm text-gray-900 ml-6">
                                            {order.deliveryAddress}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiPackage className="mr-2" size={16} />
                                            <span>Số lượng sản phẩm:</span>
                                        </div>
                                        <p className="text-sm text-gray-900 ml-6">
                                            {order.items?.length || 0} sản phẩm
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                {order.items && order.items.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Sản phẩm:</h4>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="space-y-2">
                                                {order.items.slice(0, 3).map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">
                                                            {item.name} x{item.quantity || 1}
                                                        </span>
                                                        <span className="font-medium">
                                                            {formatCurrency(item.price * (item.quantity || 1))}
                                                        </span>
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <p className="text-xs text-gray-500">
                                                        và {order.items.length - 3} sản phẩm khác...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Order Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">Tổng tiền:</span>
                                        <span className="text-lg font-bold text-supply-primary">
                                            {formatCurrency(order.totalAmount)}
                                        </span>
                                        {order.proxyFee && (
                                            <span className="text-sm text-gray-600">
                                                (Phí dịch vụ: {formatCurrency(order.proxyFee)})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Link
                                            to={`/proxy-shopper/orders/${order.id}`}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <FiEye className="mr-2" size={16} />
                                            Xem chi tiết
                                        </Link>
                                        {order.status === 'Accepted' && (
                                            <Link
                                                to={`/proxy-shopper/orders/${order.id}/manage`}
                                                className="inline-flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                            >
                                                Quản lý đơn hàng
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                        <FaBoxOpen className="text-gray-400 text-6xl mb-4 mx-auto" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                            {filter === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${getFilterTabs().find(tab => tab.key === filter)?.label.toLowerCase()}`}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'all'
                                ? 'Bạn chưa nhận đơn hàng nào. Hãy tìm kiếm đơn hàng mới để bắt đầu.'
                                : 'Thay đổi bộ lọc để xem các đơn hàng khác.'
                            }
                        </p>
                        {filter === 'all' && (
                            <Link
                                to="/proxy-shopper/available-orders"
                                className="inline-flex items-center px-6 py-3 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <FiPackage className="mr-2" size={18} />
                                Tìm đơn hàng mới
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProxyShopperOrders;
