import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    FaSearch, FaEye, FaStar, FaHeart, FaShoppingCart, FaMapMarkerAlt,
    FaClock, FaUser, FaPhone, FaCheckCircle, FaTimes, FaTruck, FaBox
} from "react-icons/fa";

const BuyerOrders = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    const orders = [
        {
            id: "DH001",
            sellerName: "Gian hàng Cô Lan",
            sellerAvatar: "https://i.pravatar.cc/50?img=1",
            orderDate: "2024-01-15T08:30:00",
            status: "delivered",
            paymentMethod: "cod",
            items: [
                { id: 1, name: "Rau muống", quantity: 2, unit: "kg", price: 15000, total: 30000 },
                { id: 2, name: "Cà chua", quantity: 1.5, unit: "kg", price: 25000, total: 37500 }
            ],
            totalAmount: 82500,
            deliveryAddress: "123 Đường ABC, Quận Ninh Kiều, Cần Thơ",
            notes: "Giao hàng sớm nhé shop",
            canReview: true,
            reviewed: false
        },
        {
            id: "DH002",
            sellerName: "Cửa hàng Anh Minh",
            sellerAvatar: "https://i.pravatar.cc/50?img=2",
            orderDate: "2024-01-16T14:20:00",
            status: "shipping",
            paymentMethod: "transfer",
            items: [
                { id: 3, name: "Xà lách", quantity: 1, unit: "kg", price: 20000, total: 20000 }
            ],
            totalAmount: 35000,
            deliveryAddress: "456 Đường XYZ, Quận Cái Răng, Cần Thơ",
            notes: "",
            canReview: false,
            reviewed: false
        },
        {
            id: "DH003",
            sellerName: "Gian hàng Chú Tám",
            sellerAvatar: "https://i.pravatar.cc/50?img=3",
            orderDate: "2024-01-17T09:15:00",
            status: "confirmed",
            paymentMethod: "cod",
            items: [
                { id: 4, name: "Bắp cải", quantity: 2, unit: "kg", price: 12000, total: 24000 },
                { id: 5, name: "Cải thảo", quantity: 1, unit: "kg", price: 18000, total: 18000 }
            ],
            totalAmount: 57000,
            deliveryAddress: "789 Đường DEF, Quận Ô Môn, Cần Thơ",
            notes: "Gọi trước khi giao",
            canReview: false,
            reviewed: false
        }
    ];

    const statusOptions = {
        all: "Tất cả",
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        shipping: "Đang giao",
        delivered: "Đã giao",
        cancelled: "Đã hủy"
    };

    const getStatusColor = (status) => {
        const colors = {
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
            order.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleViewOrderDetail = (order) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    const handleReorder = (orderId) => {
        console.log("Reorder:", orderId);
        // Logic đặt lại đơn hàng
    };

    const handleCancelOrder = (orderId) => {
        if (window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
            console.log("Cancel order:", orderId);
            // Logic hủy đơn hàng
        }
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
                                    onClick={() => setFilterStatus(value)}
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
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={order.sellerAvatar}
                                        alt={order.sellerName}
                                        className="w-12 h-12 rounded-full border-2 border-gray-200"
                                    />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">#{order.id}</h3>
                                        <p className="text-sm text-gray-600">{order.sellerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <span>{statusOptions[order.status]}</span>
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(order.orderDate)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">Sản phẩm:</h4>
                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center">
                                                <span className="text-gray-700">
                                                    {item.name} x {item.quantity}{item.unit}
                                                </span>
                                                <span className="font-medium text-gray-800">
                                                    {formatCurrency(item.total)}
                                                </span>
                                            </div>
                                        ))}
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

                                {order.status === "delivered" && order.canReview && !order.reviewed && (
                                    <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition">
                                        <FaStar />
                                        <span>Đánh giá</span>
                                    </button>
                                )}

                                {order.status === "delivered" && (
                                    <button
                                        onClick={() => handleReorder(order.id)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                                    >
                                        <FaShoppingCart />
                                        <span>Mua lại</span>
                                    </button>
                                )}

                                {(order.status === "pending" || order.status === "confirmed") && (
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
                    ))}
                </div>

                {filteredOrders.length === 0 && (
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
                                            src={selectedOrder.sellerAvatar}
                                            alt={selectedOrder.sellerName}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium">{selectedOrder.sellerName}</p>
                                            <Link
                                                to={`/seller/${encodeURIComponent(selectedOrder.sellerName)}`}
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
                                            <span>{formatDate(selectedOrder.orderDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trạng thái:</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                                                {statusOptions[selectedOrder.status]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-bold text-gray-800 mb-4">Sản phẩm đã đặt</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center py-3 border-b">
                                            <div>
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {item.quantity} {item.unit} × {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-800">{formatCurrency(item.total)}</p>
                                            </div>
                                        </div>
                                    ))}
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
        </div>
    );
};

export default BuyerOrders;
