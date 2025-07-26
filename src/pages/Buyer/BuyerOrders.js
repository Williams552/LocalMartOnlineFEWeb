import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaSearch, FaEye, FaStar, FaHeart, FaShoppingCart, FaMapMarkerAlt,
    FaClock, FaUser, FaPhone, FaCheckCircle, FaTimes, FaTruck, FaBox
} from "react-icons/fa";
import orderService from "../../services/orderService";
import ReviewModal from "../../components/ReviewModal";
import OrderReviewModal from "../../components/Order/OrderReviewModal";
import OrderCompletionNotification from "../../components/Order/OrderCompletionNotification";
import { toast } from "react-toastify";

const BuyerOrders = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
    const [showOrderReviewModal, setShowOrderReviewModal] = useState(false);
    const [selectedOrderForOrderReview, setSelectedOrderForOrderReview] = useState(null);
    const [showCompletionNotification, setShowCompletionNotification] = useState(false);
    const [completedOrderInfo, setCompletedOrderInfo] = useState(null);

    // Fetch orders from API
    useEffect(() => {
        fetchOrders();
    }, [currentPage, filterStatus]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Get current user from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const buyerId = user.id || user._id;

            if (!buyerId) {
                throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            }

            let result;
            if (filterStatus === "all") {
                result = await orderService.getBuyerOrders(buyerId, currentPage, 20);
            } else {
                result = await orderService.filterBuyerOrders({
                    buyerId,
                    status: filterStatus,
                    page: currentPage,
                    pageSize: 20
                });
            }

            if (result.success && result.data) {
                const ordersData = result.data.items || result.data || [];
                setOrders(ordersData);
                setTotalPages(result.data.totalPages || 1);
            } else {
                setOrders([]);
                toast.error(result.message || "Không thể tải danh sách đơn hàng");
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error(error.message || "Lỗi khi tải danh sách đơn hàng");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = {
        all: "Tất cả",
        Pending: "Chờ xác nhận",
        Confirmed: "Đã xác nhận hàng",
        Paid: "Đã nhận tiền",
        Completed: "Hoàn thành",
        Cancelled: "Đã hủy"
    };

    const getStatusColor = (status) => {
        const colors = {
            // New 5-state workflow
            'Pending': "bg-yellow-100 text-yellow-800",
            'Confirmed': "bg-blue-100 text-blue-800",
            'Paid': "bg-purple-100 text-purple-800",
            'Completed': "bg-green-100 text-green-800",
            'Cancelled': "bg-red-100 text-red-800",
            // Legacy support
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            shipping: "bg-purple-100 text-purple-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status) => {
        const icons = {
            // New 5-state workflow
            'Pending': <FaClock className="text-yellow-600" />,
            'Confirmed': <FaCheckCircle className="text-blue-600" />,
            'Paid': <FaTruck className="text-purple-600" />,
            'Completed': <FaBox className="text-green-600" />,
            'Cancelled': <FaTimes className="text-red-600" />,
            // Legacy support
            pending: <FaClock className="text-yellow-600" />,
            confirmed: <FaCheckCircle className="text-blue-600" />,
            shipping: <FaTruck className="text-purple-600" />,
            delivered: <FaBox className="text-green-600" />,
            cancelled: <FaTimes className="text-red-600" />
        };
        return icons[status] || <FaClock className="text-gray-600" />;
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');
    const formatCurrency = (amount) => amount.toLocaleString('vi-VN') + 'đ';

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.sellerName && order.sellerName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleViewOrderDetail = (order) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    const handleReorder = async (orderId) => {
        try {
            const result = await orderService.reorderOrder(orderId);

            if (result && result.success) {
                toast.success(result.message || "Đặt lại đơn hàng thành công!");
                fetchOrders(); // Refresh orders list
            } else {
                toast.error(result?.message || "Không thể đặt lại đơn hàng. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error('Error in handleReorder:', error);
            toast.error(error.message || "Lỗi khi đặt lại đơn hàng");
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
            try {
                const result = await orderService.cancelOrder(orderId, "Buyer hủy đơn hàng");

                if (result && result.success) {
                    toast.success(result.message || "Hủy đơn hàng thành công!");
                    fetchOrders(); // Refresh orders list
                } else {
                    toast.error(result?.message || "Không thể hủy đơn hàng. Vui lòng thử lại.");
                }
            } catch (error) {
                console.error('Error in handleCancelOrder:', error);
                toast.error(error.message || "Lỗi khi hủy đơn hàng");
            }
        }
    };

    // Buyer xác nhận đã nhận hàng (Paid -> Completed)
    const handleCompleteOrder = async (orderId) => {
        if (window.confirm("Bạn có chắc đã nhận được hàng và muốn hoàn thành đơn hàng này?")) {
            try {
                const result = await orderService.completeOrderByBuyer(orderId);

                // Kiểm tra kết quả trả về
                if (result && result.success) {
                    // Tìm order vừa hoàn thành
                    const completedOrder = orders.find(order => order.id === orderId);
                    if (completedOrder) {
                        // Hiện notification thành công trước
                        setCompletedOrderInfo(completedOrder);
                        setShowCompletionNotification(true);

                        // Auto hide notification sau 8 giây và hiện review modal
                        setTimeout(() => {
                            setShowCompletionNotification(false);
                            setSelectedOrderForOrderReview(completedOrder);
                            setShowOrderReviewModal(true);
                        }, 8000);
                    }

                    toast.success(result.message || "Xác nhận hoàn thành đơn hàng thành công!");
                    fetchOrders(); // Refresh orders list
                } else {
                    // Trường hợp API trả về nhưng success = false
                    toast.error(result?.message || "Không thể hoàn thành đơn hàng. Vui lòng thử lại.");
                }
            } catch (error) {
                console.error('Error in handleCompleteOrder:', error);
                toast.error(error.message || "Lỗi khi hoàn thành đơn hàng");
            }
        }
    };

    const handleFilterStatusChange = (status) => {
        setFilterStatus(status);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleReviewOrder = (order) => {
        setSelectedOrderForReview(order);
        setShowReviewModal(true);
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            const result = await orderService.reviewOrder(reviewData.orderId, {
                rating: reviewData.rating,
                comment: reviewData.comment
            });

            if (result && result.success) {
                toast.success(result.message || 'Đánh giá thành công!');
                fetchOrders(); // Refresh orders to update review status
            } else {
                toast.error(result?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error in handleSubmitReview:', error);
            toast.error(error.message || 'Lỗi khi gửi đánh giá');
        }
    };

    const handleOrderReviewSubmitSuccess = (reviewResults) => {
        // Update orders list to reflect that reviews have been submitted
        setOrders(prev => prev.map(order =>
            order.id === selectedOrderForOrderReview?.id
                ? { ...order, reviewed: true, canReview: false }
                : order
        ));

        // Reset modal state
        setSelectedOrderForOrderReview(null);
        setShowOrderReviewModal(false);
    };

    // Handlers for completion notification
    const handleReviewNow = () => {
        setShowCompletionNotification(false);
        if (completedOrderInfo) {
            setSelectedOrderForOrderReview(completedOrderInfo);
            setShowOrderReviewModal(true);
        }
    };

    const handleReviewLater = () => {
        setShowCompletionNotification(false);
        setCompletedOrderInfo(null);
    };

    const handleCloseNotification = () => {
        setShowCompletionNotification(false);
        setCompletedOrderInfo(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h1>
                            <p className="text-gray-600">Theo dõi và quản lý các đơn hàng đã đặt</p>
                        </div>
                        <Link
                            to="/"
                            className="flex items-center space-x-2 bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                        >
                            <FaShoppingCart />
                            <span>Tiếp tục mua sắm</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo mã đơn hàng hoặc tên cửa hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-supply-primary"
                            />
                        </div>

                        <div className="flex space-x-2">
                            {Object.entries(statusOptions).map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => handleFilterStatusChange(value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === value
                                        ? 'bg-supply-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-supply-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải danh sách đơn hàng...</p>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={order.sellerAvatar || "https://i.pravatar.cc/50?img=1"}
                                            alt={order.sellerName || "Seller"}
                                            className="w-12 h-12 rounded-full border-2 border-gray-200"
                                        />
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">#{order.id}</h3>
                                            <p className="text-sm text-gray-600">{order.sellerName || "Cửa hàng"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span>{statusOptions[order.status] || order.status}</span>
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(order.createdAt || order.orderDate)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">Sản phẩm:</h4>
                                        <div className="space-y-2">
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, index) => (
                                                    <div key={item.productId || index} className="flex justify-between items-center">
                                                        <span className="text-gray-700">
                                                            {item.name || `Sản phẩm ${item.productId}`} x {item.quantity}{item.unit || ""}
                                                        </span>
                                                        <span className="font-medium text-gray-800">
                                                            {formatCurrency(item.total || (item.quantity * item.priceAtPurchase))}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm">Không có thông tin sản phẩm</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                            <FaMapMarkerAlt />
                                            <span>Giao đến: {order.deliveryAddress}</span>
                                        </div>
                                        {order.notes && (
                                            <div className="text-sm text-gray-600 mb-2">
                                                <span className="font-medium">Ghi chú:</span> {order.notes}
                                            </div>
                                        )}
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-supply-primary">
                                                Tổng: {formatCurrency(order.totalAmount)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                                    <button
                                        onClick={() => handleViewOrderDetail(order)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                    >
                                        <FaEye />
                                        <span>Xem chi tiết</span>
                                    </button>

                                    {/* Nút đánh giá - hiển thị cho đơn hàng đã hoàn thành */}
                                    {(order.status === "Completed" || order.status === "completed" || order.status === "delivered") && (
                                        <>
                                            {!order.reviewed ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrderForOrderReview(order);
                                                        setShowOrderReviewModal(true);
                                                    }}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
                                                >
                                                    <FaStar />
                                                    <span>Đánh giá</span>
                                                </button>
                                            ) : (
                                                <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg">
                                                    <FaStar />
                                                    <span>Đã đánh giá</span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Nút xác nhận hoàn thành - chỉ hiển thị khi trạng thái là Paid */}
                                    {(order.status === "Paid" || order.status === "paid") && (
                                        <button
                                            onClick={() => handleCompleteOrder(order.id)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                                        >
                                            <FaCheckCircle />
                                            <span>Đã nhận hàng</span>
                                        </button>
                                    )}

                                    {/* Nút đánh giá cũ đã được thay thế bằng modal tự động hiện sau khi hoàn thành đơn hàng */}
                                    {/* Nút đánh giá hiện đã được di chuyển lên trên, kế bên nút "Xem chi tiết" */}

                                    {/* Nút mua lại - hiển thị khi đã hoàn thành */}
                                    {(order.status === "Completed" || order.status === "completed" || order.status === "delivered") && (
                                        <button
                                            onClick={() => handleReorder(order.id)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                                        >
                                            <FaShoppingCart />
                                            <span>Mua lại</span>
                                        </button>
                                    )}

                                    {/* Nút hủy đơn - chỉ hiển thị khi chờ xác nhận hoặc đã xác nhận */}
                                    {((order.status === "Pending" || order.status === "pending") ||
                                        (order.status === "Confirmed" || order.status === "confirmed")) && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                            >
                                                <FaTimes />
                                                <span>Hủy đơn</span>
                                            </button>
                                        )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🛍️</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có đơn hàng nào</h3>
                            <p className="text-gray-500 mb-4">Hãy khám phá và đặt hàng những sản phẩm tươi ngon</p>
                            <Link
                                to="/"
                                className="inline-flex items-center space-x-2 bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                            >
                                <FaShoppingCart />
                                <span>Bắt đầu mua sắm</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && filteredOrders.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Trước
                        </button>

                        <div className="flex space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-2 border rounded-lg ${currentPage === pageNum
                                            ? 'bg-supply-primary text-white border-supply-primary'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>

            {/* Modal chi tiết đơn hàng */}
            {showOrderDetail && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng #{selectedOrder.id}</h2>
                                <button
                                    onClick={() => setShowOrderDetail(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-3">Thông tin cửa hàng</h3>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <img
                                            src={selectedOrder.sellerAvatar || "https://i.pravatar.cc/50?img=1"}
                                            alt={selectedOrder.sellerName || "Seller"}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium">{selectedOrder.sellerName || "Cửa hàng"}</p>
                                            <Link
                                                to={`/seller/${encodeURIComponent(selectedOrder.sellerName || selectedOrder.sellerId)}`}
                                                className="text-supply-primary hover:underline text-sm"
                                            >
                                                Xem cửa hàng
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-800 mb-3">Thông tin đơn hàng</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ngày đặt:</span>
                                            <span>{formatDate(selectedOrder.createdAt || selectedOrder.orderDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trạng thái:</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                                                {statusOptions[selectedOrder.status] || selectedOrder.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Thanh toán:</span>
                                            <span className={`px-2 py-1 rounded text-xs ${selectedOrder.paymentStatus === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-bold text-gray-800 mb-4">Sản phẩm đã đặt</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        selectedOrder.items.map((item, index) => (
                                            <div key={item.productId || index} className="flex justify-between items-center py-3 border-b">
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {item.name || `Sản phẩm ${item.productId}`}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.quantity} {item.unit || ""} × {formatCurrency(item.priceAtPurchase || item.price)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-800">
                                                        {formatCurrency(item.total || (item.quantity * item.priceAtPurchase))}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">Không có thông tin sản phẩm</p>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Tổng cộng:</span>
                                        <span className="text-supply-primary">{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-bold text-gray-800 mb-3">Thông tin giao hàng</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-start space-x-2">
                                        <FaMapMarkerAlt className="text-gray-400 mt-1" />
                                        <span>{selectedOrder.deliveryAddress}</span>
                                    </div>
                                    {selectedOrder.expectedDeliveryTime && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="flex items-center space-x-2">
                                                <FaClock className="text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    Dự kiến giao: {formatDate(selectedOrder.expectedDeliveryTime)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedOrder.notes && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Ghi chú:</span> {selectedOrder.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <ReviewModal
                order={selectedOrderForReview}
                isOpen={showReviewModal}
                onClose={() => {
                    setShowReviewModal(false);
                    setSelectedOrderForReview(null);
                }}
                onSubmit={handleSubmitReview}
            />

            {/* Order Review Modal - hiện sau khi hoàn thành đơn hàng */}
            <OrderReviewModal
                order={selectedOrderForOrderReview}
                isOpen={showOrderReviewModal}
                onClose={() => {
                    setShowOrderReviewModal(false);
                    setSelectedOrderForOrderReview(null);
                }}
                onSubmitSuccess={handleOrderReviewSubmitSuccess}
            />

            {/* Order Completion Notification */}
            <OrderCompletionNotification
                isOpen={showCompletionNotification}
                onClose={handleCloseNotification}
                onReviewNow={handleReviewNow}
                onReviewLater={handleReviewLater}
                orderInfo={completedOrderInfo}
            />
        </div>
    );
};

export default BuyerOrders;
