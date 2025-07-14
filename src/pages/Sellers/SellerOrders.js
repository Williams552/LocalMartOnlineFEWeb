import React, { useState } from "react";
import {
    FaSearch,
    FaFilter,
    FaEye,
    FaEdit,
    FaCheck,
    FaTimes,
    FaTruck,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
    FaUser,
    FaCalendarAlt,
    FaMoneyBill
} from "react-icons/fa";
import SellerLayout from "../../layouts/SellerLayout";

const SellerOrders = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    const orders = [
        {
            id: "DH001",
            customerName: "Nguyễn Thị Lan",
            customerPhone: "0123456789",
            customerEmail: "lan@email.com",
            customerAddress: "123 Đường ABC, Phường 1, Quận Ninh Kiều, Cần Thơ",
            orderDate: "2024-01-15T08:30:00",
            requiredDate: "2024-01-16T09:00:00",
            status: "pending",
            paymentMethod: "cod",
            deliveryMethod: "self",
            items: [
                { id: 1, name: "Rau muống", quantity: 2, unit: "kg", price: 15000, total: 30000 },
                { id: 2, name: "Cà chua", quantity: 1.5, unit: "kg", price: 25000, total: 37500 }
            ],
            subtotal: 67500,
            shippingFee: 15000,
            discount: 0,
            finalAmount: 82500,
            notes: "Giao hàng sớm nhé shop"
        },
        {
            id: "DH002",
            customerName: "Trần Văn Minh",
            customerPhone: "0987654321",
            customerEmail: "minh@email.com",
            customerAddress: "456 Đường XYZ, Phường 2, Quận Cái Răng, Cần Thơ",
            orderDate: "2024-01-15T10:15:00",
            requiredDate: "2024-01-16T14:00:00",
            status: "confirmed",
            paymentMethod: "transfer",
            deliveryMethod: "proxy",
            items: [
                { id: 3, name: "Xà lách", quantity: 1, unit: "kg", price: 20000, total: 20000 },
                { id: 4, name: "Cải thảo", quantity: 2, unit: "kg", price: 18000, total: 36000 }
            ],
            subtotal: 56000,
            shippingFee: 20000,
            discount: 5000,
            finalAmount: 71000,
            notes: ""
        },
        {
            id: "DH003",
            customerName: "Lê Thị Hoa",
            customerPhone: "0369852147",
            customerEmail: "hoa@email.com",
            customerAddress: "789 Đường DEF, Phường 3, Quận Ô Môn, Cần Thơ",
            orderDate: "2024-01-14T16:45:00",
            requiredDate: "2024-01-15T08:00:00",
            status: "delivered",
            paymentMethod: "cod",
            deliveryMethod: "self",
            items: [
                { id: 5, name: "Bắp cải", quantity: 3, unit: "kg", price: 12000, total: 36000 }
            ],
            subtotal: 36000,
            shippingFee: 10000,
            discount: 0,
            finalAmount: 46000,
            notes: "Cảm ơn shop"
        }
    ];

    const statusOptions = {
        all: "Tất cả",
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        preparing: "Đang chuẩn bị",
        shipping: "Đang giao",
        delivered: "Đã giao",
        cancelled: "Đã hủy"
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            preparing: "bg-purple-100 text-purple-800",
            shipping: "bg-orange-100 text-orange-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getPaymentMethodText = (method) => method === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản";
    const getDeliveryMethodText = (method) => method === "self" ? "Tự giao hàng" : "Người đi chợ dùm";
    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');
    const formatCurrency = (amount) => amount.toLocaleString('vi-VN') + 'đ';

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleUpdateStatus = (orderId, newStatus) => {
        console.log(`Update order ${orderId} to status ${newStatus}`);
        // Gọi API ở đây nếu cần
    };

    const handleViewOrderDetail = (order) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    return (
        <SellerLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
                                <p className="text-gray-600">Theo dõi và xử lý đơn hàng từ khách hàng</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                                    <span className="text-sm text-blue-600 font-medium">
                                        {orders.filter(o => o.status === "pending").length} đơn chờ xử lý
                                    </span>
                                </div>
                            </div>
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
                                    placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-supply-primary"
                                />
                            </div>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-supply-primary"
                            >
                                {Object.entries(statusOptions).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 pt-6 border-t">
                            {Object.entries(statusOptions).slice(1).map(([status, label]) => {
                                const count = orders.filter(o => o.status === status).length;
                                return (
                                    <div key={status} className="text-center">
                                        <div className="text-2xl font-bold text-gray-800">{count}</div>
                                        <div className="text-sm text-gray-600">{label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">#{order.id}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {statusOptions[order.status]}
                                            </span>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                                    <FaUser />
                                                    <span>{order.customerName}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                                    <FaPhone />
                                                    <span>{order.customerPhone}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <FaMapMarkerAlt />
                                                    <span className="line-clamp-1">{order.customerAddress}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                                    <FaCalendarAlt />
                                                    <span>Đặt: {formatDate(order.orderDate)}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                                    <FaClock />
                                                    <span>Giao: {formatDate(order.requiredDate)}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">Sản phẩm: </span>
                                                    {order.items.map(item => item.name).join(", ")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:items-end space-y-3">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-supply-primary">
                                                {formatCurrency(order.finalAmount)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {getPaymentMethodText(order.paymentMethod)}
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewOrderDetail(order)}
                                                className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm"
                                            >
                                                <FaEye />
                                                <span>Xem</span>
                                            </button>
                                            {order.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, "confirmed")}
                                                        className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm"
                                                    >
                                                        <FaCheck />
                                                        <span>Xác nhận</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                                        className="flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                                                    >
                                                        <FaTimes />
                                                        <span>Hủy</span>
                                                    </button>
                                                </>
                                            )}
                                            {order.status === "confirmed" && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, "preparing")}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm"
                                                >
                                                    <FaEdit />
                                                    <span>Chuẩn bị</span>
                                                </button>
                                            )}
                                            {order.status === "preparing" && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, "shipping")}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition text-sm"
                                                >
                                                    <FaTruck />
                                                    <span>Giao hàng</span>
                                                </button>
                                            )}
                                            {order.status === "shipping" && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, "delivered")}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm"
                                                >
                                                    <FaCheck />
                                                    <span>Hoàn thành</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không có đơn hàng</h3>
                            <p className="text-gray-500">Chưa có đơn hàng nào phù hợp với bộ lọc của bạn</p>
                        </div>
                    )}
                </div>

                {/* Modal chi tiết đơn hàng */}
                {showOrderDetail && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
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
                                <div className="flex items-center space-x-3 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                        {statusOptions[selectedOrder.status]}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        Đặt hàng: {formatDate(selectedOrder.orderDate)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Thông tin khách hàng */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                                            <FaUser className="mr-2" />
                                            Thông tin khách hàng
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-600">Tên:</span>
                                                <span>{selectedOrder.customerName}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <FaPhone className="text-gray-400" />
                                                <span>{selectedOrder.customerPhone}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <FaEnvelope className="text-gray-400" />
                                                <span>{selectedOrder.customerEmail}</span>
                                            </div>
                                            <div className="flex items-start space-x-2">
                                                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                                                <span>{selectedOrder.customerAddress}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin đơn hàng */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                                            <FaClock className="mr-2" />
                                            Thông tin đơn hàng
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-600">Ngày đặt:</span>
                                                <span>{formatDate(selectedOrder.orderDate)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-600">Ngày giao:</span>
                                                <span>{formatDate(selectedOrder.requiredDate)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-600">Thanh toán:</span>
                                                <span>{getPaymentMethodText(selectedOrder.paymentMethod)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-600">Giao hàng:</span>
                                                <span>{getDeliveryMethodText(selectedOrder.deliveryMethod)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danh sách sản phẩm */}
                                <div className="mt-6">
                                    <h3 className="font-bold text-gray-800 mb-4">Sản phẩm đã đặt</h3>
                                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="text-left p-4 font-medium text-gray-700">Sản phẩm</th>
                                                    <th className="text-center p-4 font-medium text-gray-700">Số lượng</th>
                                                    <th className="text-right p-4 font-medium text-gray-700">Đơn giá</th>
                                                    <th className="text-right p-4 font-medium text-gray-700">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items.map((item) => (
                                                    <tr key={item.id} className="border-t border-gray-200">
                                                        <td className="p-4">
                                                            <div className="font-medium text-gray-800">{item.name}</div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {item.quantity} {item.unit}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {formatCurrency(item.price)}
                                                        </td>
                                                        <td className="p-4 text-right font-medium">
                                                            {formatCurrency(item.total)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Tổng tiền */}
                                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tạm tính:</span>
                                            <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phí giao hàng:</span>
                                            <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                                        </div>
                                        {selectedOrder.discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Giảm giá:</span>
                                                <span>-{formatCurrency(selectedOrder.discount)}</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                            <span>Tổng cộng:</span>
                                            <span className="text-supply-primary">{formatCurrency(selectedOrder.finalAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ghi chú */}
                                {selectedOrder.notes && (
                                    <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-800 mb-2">Ghi chú từ khách hàng:</h4>
                                        <p className="text-gray-700">{selectedOrder.notes}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-6 flex justify-end space-x-3">
                                    {selectedOrder.status === "pending" && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    handleUpdateStatus(selectedOrder.id, "confirmed");
                                                    setShowOrderDetail(false);
                                                }}
                                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                            >
                                                <FaCheck />
                                                <span>Xác nhận đơn hàng</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleUpdateStatus(selectedOrder.id, "cancelled");
                                                    setShowOrderDetail(false);
                                                }}
                                                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                            >
                                                <FaTimes />
                                                <span>Hủy đơn hàng</span>
                                            </button>
                                        </>
                                    )}
                                    {selectedOrder.status === "confirmed" && (
                                        <button
                                            onClick={() => {
                                                handleUpdateStatus(selectedOrder.id, "preparing");
                                                setShowOrderDetail(false);
                                            }}
                                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                        >
                                            <FaEdit />
                                            <span>Bắt đầu chuẩn bị</span>
                                        </button>
                                    )}
                                    {selectedOrder.status === "preparing" && (
                                        <button
                                            onClick={() => {
                                                handleUpdateStatus(selectedOrder.id, "shipping");
                                                setShowOrderDetail(false);
                                            }}
                                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                                        >
                                            <FaTruck />
                                            <span>Bắt đầu giao hàng</span>
                                        </button>
                                    )}
                                    {selectedOrder.status === "shipping" && (
                                        <button
                                            onClick={() => {
                                                handleUpdateStatus(selectedOrder.id, "delivered");
                                                setShowOrderDetail(false);
                                            }}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                        >
                                            <FaCheck />
                                            <span>Hoàn thành giao hàng</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
};

export default SellerOrders;
