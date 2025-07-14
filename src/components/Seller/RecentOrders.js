import React, { useState, useEffect } from 'react';
import {
    FaShoppingCart,
    FaEye,
    FaCheck,
    FaTimes,
    FaTruck,
    FaClock,
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaMoneyBill,
    FaCalendarAlt,
    FaEdit,
    FaSpinner
} from 'react-icons/fa';
import orderService from '../../services/orderService';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const RecentOrders = ({ limit = 10 }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState({});

    useEffect(() => {
        fetchRecentOrders();
    }, [limit]);

    const fetchRecentOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                setError("Không tìm thấy thông tin người dùng");
                return;
            }

            console.log('🛒 Fetching recent orders for seller:', currentUser.id);
            const result = await orderService.getRecentOrders(currentUser.id, limit);

            if (result.success) {
                setOrders(result.data);
                console.log('✅ Recent orders loaded:', result.data.length, 'orders');
            } else {
                setOrders(result.data || []);
                if (result.message.includes('mẫu')) {
                    toast.info(result.message);
                } else {
                    setError(result.message);
                }
            }

        } catch (error) {
            console.error('❌ Error fetching recent orders:', error);
            setError('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));

            const result = await orderService.updateOrderStatus(orderId, newStatus);

            if (result.success) {
                toast.success('Cập nhật trạng thái đơn hàng thành công!');
                // Update local state
                setOrders(prev => prev.map(order =>
                    order.id === orderId
                        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
                        : order
                ));
                // Update selected order if it's the one being updated
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => ({
                        ...prev,
                        status: newStatus,
                        updatedAt: new Date().toISOString()
                    }));
                }
            } else {
                toast.error(result.message || 'Không thể cập nhật trạng thái đơn hàng');
            }

        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận' },
            'confirmed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận' },
            'preparing': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đang chuẩn bị' },
            'shipping': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đang giao hàng' },
            'delivered': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã giao hàng' },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' }
        };

        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getActionButtons = (order) => {
        const { status, id } = order;
        const isUpdating = updatingStatus[id];

        return (
            <div className="flex gap-1">
                <button
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    onClick={() => handleViewOrder(order)}
                    title="Xem chi tiết"
                >
                    <FaEye className="w-4 h-4" />
                </button>

                {status === 'pending' && (
                    <>
                        <button
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:opacity-50"
                            onClick={() => handleUpdateStatus(id, 'confirmed')}
                            disabled={isUpdating}
                            title="Xác nhận đơn hàng"
                        >
                            {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaCheck className="w-4 h-4" />}
                        </button>
                        <button
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                            onClick={() => handleUpdateStatus(id, 'cancelled')}
                            disabled={isUpdating}
                            title="Hủy đơn hàng"
                        >
                            {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaTimes className="w-4 h-4" />}
                        </button>
                    </>
                )}

                {status === 'confirmed' && (
                    <button
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded disabled:opacity-50"
                        onClick={() => handleUpdateStatus(id, 'preparing')}
                        disabled={isUpdating}
                        title="Bắt đầu chuẩn bị hàng"
                    >
                        {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaEdit className="w-4 h-4" />}
                    </button>
                )}

                {status === 'preparing' && (
                    <button
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded disabled:opacity-50"
                        onClick={() => handleUpdateStatus(id, 'shipping')}
                        disabled={isUpdating}
                        title="Bắt đầu giao hàng"
                    >
                        {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaTruck className="w-4 h-4" />}
                    </button>
                )}

                {status === 'shipping' && (
                    <button
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:opacity-50"
                        onClick={() => handleUpdateStatus(id, 'delivered')}
                        disabled={isUpdating}
                        title="Hoàn thành giao hàng"
                    >
                        {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaCheck className="w-4 h-4" />}
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                <div className="flex items-center p-4 border-b border-gray-200">
                    <FaShoppingCart className="mr-2 text-gray-600" />
                    <span className="font-medium text-gray-800">Đơn hàng gần đây</span>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-supply-primary mx-auto mb-4" />
                        <div className="text-gray-600">Đang tải đơn hàng...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                <div className="flex items-center p-4 border-b border-gray-200">
                    <FaShoppingCart className="mr-2 text-gray-600" />
                    <span className="font-medium text-gray-800">Đơn hàng gần đây</span>
                </div>
                <div className="p-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <FaShoppingCart className="mr-2 text-gray-600" />
                        <span className="font-medium text-gray-800">Đơn hàng gần đây</span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {orders.length}
                        </span>
                    </div>
                    <button
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        onClick={() => window.location.href = '/seller/orders'}
                    >
                        Xem tất cả
                    </button>
                </div>

                <div className="p-0">
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <FaShoppingCart className="text-gray-400 mb-4 mx-auto" size={48} />
                            <p className="text-gray-500">Chưa có đơn hàng nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mã đơn hàng
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sản phẩm
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số lượng
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thời gian
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="font-medium text-blue-600">{order.id}</span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium text-gray-900">{order.customerName}</div>
                                                    <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="max-w-xs">
                                                    {order.items.length === 1 ? (
                                                        <span className="text-sm text-gray-900">{order.items[0].productName}</span>
                                                    ) : (
                                                        <div>
                                                            <span className="text-sm text-gray-900">{order.items[0].productName}</span>
                                                            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                +{order.items.length - 1} sản phẩm khác
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.items.reduce((total, item) => total + item.quantity, 0)} sản phẩm
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="font-medium text-green-600">
                                                    {orderService.formatCurrency(order.totalAmount)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span
                                                    className="text-sm text-gray-500"
                                                    title={orderService.formatDate(order.orderDate)}
                                                >
                                                    {orderService.getTimeAgo(order.orderDate)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {getActionButtons(order)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Detail Modal - Tailwind equivalent would be needed here */}
            {showOrderDetail && selectedOrder && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <FaShoppingCart className="mr-2" />
                                Chi tiết đơn hàng: {selectedOrder.id}
                            </h3>
                            <button
                                onClick={() => setShowOrderDetail(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Customer Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                        <FaUser className="mr-2" />
                                        Thông tin khách hàng
                                    </h4>
                                    <div className="space-y-2">
                                        <p><strong>Tên:</strong> {selectedOrder.customerName}</p>
                                        <p className="flex items-center">
                                            <FaPhone className="mr-2 text-gray-400" />
                                            {selectedOrder.customerPhone}
                                        </p>
                                        <p className="flex items-start">
                                            <FaMapMarkerAlt className="mr-2 mt-1 text-gray-400 flex-shrink-0" />
                                            <span>{selectedOrder.customerAddress}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Order Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                        <FaCalendarAlt className="mr-2" />
                                        Thông tin đơn hàng
                                    </h4>
                                    <div className="space-y-2">
                                        <p><strong>Ngày đặt:</strong> {orderService.formatDate(selectedOrder.orderDate)}</p>
                                        <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</p>
                                        <p><strong>Thanh toán:</strong> {orderService.getPaymentMethodText(selectedOrder.paymentMethod)}</p>
                                        <p><strong>Ghi chú:</strong> {selectedOrder.notes || 'Không có'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <FaShoppingCart className="mr-2" />
                                    Sản phẩm đã đặt
                                </h4>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedOrder.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center">
                                                            {item.productImage && (
                                                                <img
                                                                    src={item.productImage}
                                                                    alt={item.productName}
                                                                    className="w-10 h-10 rounded object-cover mr-3"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            )}
                                                            <span className="text-sm font-medium text-gray-900">{item.productName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{item.quantity} {item.unit}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{orderService.formatCurrency(item.unitPrice)}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{orderService.formatCurrency(item.totalPrice)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Order Summary */}
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p><strong>Tạm tính:</strong> {orderService.formatCurrency(selectedOrder.subtotal)}</p>
                                            <p><strong>Phí vận chuyển:</strong> {orderService.formatCurrency(selectedOrder.shippingFee)}</p>
                                            {selectedOrder.discount > 0 && (
                                                <p><strong>Giảm giá:</strong> -{orderService.formatCurrency(selectedOrder.discount)}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <h5 className="text-xl font-bold text-green-600">
                                                Tổng cộng: {orderService.formatCurrency(selectedOrder.totalAmount)}
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                {getActionButtons(selectedOrder)}
                            </div>
                            <button
                                onClick={() => setShowOrderDetail(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RecentOrders;
