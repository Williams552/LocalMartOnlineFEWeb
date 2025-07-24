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
    FaSpinner,
    FaFilter,
    FaSearch,
    FaSyncAlt,
    FaMoneyBillWave,
    FaBan
} from 'react-icons/fa';
import SellerLayout from '../../layouts/SellerLayout';
import orderService from '../../services/orderService';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const SellerOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        page: 1,
        limit: 20
    });

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                setError("Không tìm thấy thông tin người dùng");
                return;
            }

            console.log('🛒 Fetching orders for seller:', currentUser.id);

            const params = {
                ...filters,
                status: filters.status === 'all' ? undefined : filters.status
            };

            const result = await orderService.getSellerOrders(currentUser.id, params);

            if (result.success) {
                // result.data.items is the array of orders per new API
                const ordersData = Array.isArray(result.data?.items) ? result.data.items : [];
                console.log('✅ Orders loaded:', ordersData.length, 'orders');
                console.log('📋 Sample order structure:', ordersData[0]);
                setOrders(ordersData);
            } else {
                const ordersData = Array.isArray(result.data?.items) ? result.data.items : [];
                setOrders(ordersData);
                if (result.message && result.message.includes('mẫu')) {
                    toast.info(result.message);
                } else {
                    setError(result.message);
                }
            }

        } catch (error) {
            console.error('❌ Error fetching orders:', error);
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
                
                // Reload order list để lấy dữ liệu mới nhất từ server
                await fetchOrders();
                
                // Nếu đang xem chi tiết đơn hàng này, đóng modal để user thấy thay đổi
                if (selectedOrder?.id === orderId) {
                    setShowOrderDetail(false);
                    setSelectedOrder(null);
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

    const handleCompletePayment = async (orderId) => {
        try {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));

            const result = await orderService.completePayment(orderId);

            if (result.success) {
                toast.success('Xác nhận thanh toán thành công!');
                
                // Reload order list để lấy dữ liệu mới nhất từ server
                await fetchOrders();
                
                // Nếu đang xem chi tiết đơn hàng này, đóng modal để user thấy thay đổi
                if (selectedOrder?.id === orderId) {
                    setShowOrderDetail(false);
                    setSelectedOrder(null);
                }
            } else {
                toast.error(result.message || 'Không thể xác nhận thanh toán');
            }

        } catch (error) {
            console.error('Error completing payment:', error);
            toast.error('Có lỗi xảy ra khi xác nhận thanh toán');
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleCancelOrder = (orderId) => {
        setCancelOrderId(orderId);
        setCancelReason('');
        setShowCancelModal(true);
    };

    const submitCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error('Vui lòng nhập lý do hủy đơn hàng');
            return;
        }

        if (cancelReason.length < 10 || cancelReason.length > 500) {
            toast.error('Lý do hủy phải từ 10-500 ký tự');
            return;
        }

        try {
            setUpdatingStatus(prev => ({ ...prev, [cancelOrderId]: true }));

            const result = await orderService.cancelOrder(cancelOrderId, cancelReason);

            if (result.success) {
                toast.success('Hủy đơn hàng thành công!');
                
                // Reload order list để lấy dữ liệu mới nhất từ server
                await fetchOrders();
                
                // Đóng modal
                setShowCancelModal(false);
                setCancelOrderId(null);
                setCancelReason('');
                
                // Nếu đang xem chi tiết đơn hàng này, đóng modal để user thấy thay đổi
                if (selectedOrder?.id === cancelOrderId) {
                    setShowOrderDetail(false);
                    setSelectedOrder(null);
                }
            } else {
                toast.error(result.message || 'Không thể hủy đơn hàng');
            }

        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Có lỗi xảy ra khi hủy đơn hàng');
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [cancelOrderId]: false }));
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }));
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận' },
            'confirmed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận' },
            'preparing': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đang chuẩn bị' },
            'shipping': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đang giao hàng' },
            'delivered': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã giao hàng' },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
            'unknown': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Không xác định' }
        };

        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Không xác định' };

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

                {status === 'Pending' && (
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
                            onClick={() => handleCancelOrder(id)}
                            disabled={isUpdating}
                            title="Hủy đơn hàng"
                        >
                            {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaBan className="w-4 h-4" />}
                        </button>
                    </>
                )}

                {status === 'confirmed' && (
                    <>
                        <button
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded disabled:opacity-50"
                            onClick={() => handleUpdateStatus(id, 'preparing')}
                            disabled={isUpdating}
                            title="Bắt đầu chuẩn bị hàng"
                        >
                            {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaEdit className="w-4 h-4" />}
                        </button>
                        <button
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                            onClick={() => handleCancelOrder(id)}
                            disabled={isUpdating}
                            title="Hủy đơn hàng"
                        >
                            {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaBan className="w-4 h-4" />}
                        </button>
                    </>
                )}

                {status === 'preparing' && (
                    <>
                        <button
                            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded disabled:opacity-50"
                            onClick={() => handleUpdateStatus(id, 'shipping')}
                            disabled={isUpdating}
                            title="Bắt đầu giao hàng"
                        >
                            {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaTruck className="w-4 h-4" />}
                        </button>
                        <button
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                            onClick={() => handleCancelOrder(id)}
                            disabled={isUpdating}
                            title="Hủy đơn hàng"
                        >
                            {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaBan className="w-4 h-4" />}
                        </button>
                    </>
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

                {/* Button xác nhận thanh toán - hiển thị khi đơn hàng đã giao và chưa thanh toán */}
                {status === 'Pending' && order.paymentStatus !== 'Completed' && (
                    <button
                        className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded disabled:opacity-50"
                        onClick={() => handleCompletePayment(id)}
                        disabled={isUpdating}
                        title="Xác nhận thanh toán"
                    >
                        {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaMoneyBillWave className="w-4 h-4" />}
                    </button>
                )}
            </div>
        );
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order.id || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (order.customerName || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (order.customerPhone || '').includes(filters.search);
        const matchesStatus = filters.status === 'all' || order.status === filters.status;
        return matchesSearch && matchesStatus;
    });

    return (
        <SellerLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <FaShoppingCart className="mr-3 text-supply-primary" />
                                Quản lý đơn hàng
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Xem và quản lý tất cả đơn hàng của bạn
                            </p>
                        </div>
                        <button
                            onClick={fetchOrders}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                        >
                            <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Tải lại
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo mã đơn hàng, tên khách hàng..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Chờ xác nhận</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="preparing">Đang chuẩn bị</option>
                                <option value="shipping">Đang giao hàng</option>
                                <option value="delivered">Đã giao hàng</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>

                        {/* Order Count */}
                        <div className="flex items-end">
                            <div className="text-sm text-gray-600">
                                Hiển thị {filteredOrders.length} đơn hàng
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <FaSpinner className="animate-spin text-4xl text-supply-primary mx-auto mb-4" />
                                <div className="text-gray-600">Đang tải đơn hàng...</div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                                {error}
                            </div>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <FaShoppingCart className="text-gray-400 mb-4 mx-auto" size={48} />
                            <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mã đơn hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sản phẩm
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số lượng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thời gian
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order, index) => (
                                        <tr key={order.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-blue-600">{order.id || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium text-gray-900">{order.buyerName || 'Khách hàng'}</div>
                                                    <div className="text-sm text-gray-500">{order.buyerPhone || 'Chưa có SĐT'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    {order.items && order.items.length > 0 ? (
                                                        order.items.length === 1 ? (
                                                            <span className="text-sm text-gray-900">{order.items[0]?.productName || 'Sản phẩm không xác định'}</span>
                                                        ) : (
                                                            <div>
                                                                <span className="text-sm text-gray-900">{order.items[0]?.productName || 'Sản phẩm không xác định'}</span>
                                                                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                    +{order.items.length - 1} khác
                                                                </span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-gray-500">Không có sản phẩm</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.items && order.items.length > 0
                                                    ? order.items.reduce((total, item) => total + (item.quantity || 0), 0) + ' SP'
                                                    : '0 SP'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-green-600">
                                                    {orderService.formatCurrency(order.totalAmount || 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(order.status || 'unknown')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="text-sm text-gray-500"
                                                    title={orderService.formatDate(order.orderDate || order.createdAt)}
                                                >
                                                    {orderService.getTimeAgo(order.orderDate || order.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getActionButtons(order)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Order Detail Modal */}
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
                                            <p><strong>Tên:</strong> {selectedOrder.customerName || 'Chưa có tên'}</p>
                                            <p className="flex items-center">
                                                <FaPhone className="mr-2 text-gray-400" />
                                                {selectedOrder.customerPhone || 'Chưa có số điện thoại'}
                                            </p>
                                            <p className="flex items-start">
                                                <FaMapMarkerAlt className="mr-2 mt-1 text-gray-400 flex-shrink-0" />
                                                <span>{selectedOrder.customerAddress || 'Chưa có địa chỉ'}</span>
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
                                            <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status || 'unknown')}</p>
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
                                                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                    selectedOrder.items.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center">
                                                                    {item.productImage && (
                                                                        <img
                                                                            src={item.productImage}
                                                                            alt={item.productName || 'Sản phẩm'}
                                                                            className="w-10 h-10 rounded object-cover mr-3"
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {item.productName || 'Sản phẩm không xác định'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {item.quantity || 0} {item.unit || 'cái'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {orderService.formatCurrency(item.unitPrice || 0)}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                {orderService.formatCurrency(item.totalPrice || 0)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                                                            Không có sản phẩm trong đơn hàng này
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p><strong>Tạm tính:</strong> {orderService.formatCurrency(selectedOrder.subtotal || 0)}</p>
                                                <p><strong>Phí vận chuyển:</strong> {orderService.formatCurrency(selectedOrder.shippingFee || 0)}</p>
                                                {(selectedOrder.discount || 0) > 0 && (
                                                    <p><strong>Giảm giá:</strong> -{orderService.formatCurrency(selectedOrder.discount)}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <h5 className="text-xl font-bold text-green-600">
                                                    Tổng cộng: {orderService.formatCurrency(selectedOrder.totalAmount || 0)}
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

                {/* Cancel Order Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <FaBan className="mr-2 text-red-500" />
                                    Hủy đơn hàng
                                </h3>
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lý do hủy đơn hàng <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                        rows="4"
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Nhập lý do hủy đơn hàng (10-500 ký tự)..."
                                        maxLength={500}
                                    />
                                    <div className="text-right text-sm text-gray-500 mt-1">
                                        {cancelReason.length}/500 ký tự
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                    <div className="flex">
                                        <FaClock className="text-yellow-400 mr-2 mt-0.5" />
                                        <div className="text-sm text-yellow-800">
                                            <strong>Lưu ý:</strong> Việc hủy đơn hàng không thể hoàn tác. Khách hàng sẽ được thông báo về việc hủy này.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={submitCancelOrder}
                                    disabled={updatingStatus[cancelOrderId] || !cancelReason.trim() || cancelReason.length < 10}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {updatingStatus[cancelOrderId] ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Đang hủy...
                                        </>
                                    ) : (
                                        <>
                                            <FaBan className="mr-2" />
                                            Hủy đơn hàng
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
};

export default SellerOrdersPage;
