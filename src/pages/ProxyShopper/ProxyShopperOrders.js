import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiClock, FiMapPin, FiUser, FiEye, FiEdit3, FiShoppingCart, FiCheck, FiSend, FiX, FiCamera } from 'react-icons/fi';
import { FaBoxOpen } from 'react-icons/fa';
import proxyShopperService from '../../services/proxyShopperService';
import UploadProofModal from '../../components/ProxyShopper/UploadProofModal';

const ProxyShopperOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

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
            console.log('Fetched orders data with market info and proofImages:', data); // Debug log để xem market info và proofImages
            
            // Debug: Log structure of first order to see available fields including market and proofImages
            if (data && data.length > 0) {
                console.log('First order structure:', Object.keys(data[0]));
                console.log('First order full data with market and proofImages:', data[0]);
                console.log('ProofImages field:', data[0].proofImages); // Debug proofImages
            }
            
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

    // Các hàm xử lý hành động
    const handleCreateProposal = async (requestId) => {
        try {
            // Chuyển hướng đến trang tạo order cho buyer
            window.location.href = `/proxy-shopper/orders/${requestId}/create`;
        } catch (error) {
            console.error('Error creating proposal:', error);
            alert('Có lỗi xảy ra khi tạo đề xuất');
        }
    };

    const handleStartShopping = async (orderId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5183/api/ProxyShopper/orders/${orderId}/start-shopping`, {
                method: 'POST',
                headers: {
                    "Authorization": token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json"
                },
            });
            
            if (!res.ok) throw new Error("Không thể bắt đầu mua hàng");
            
            alert('Đã bắt đầu quá trình mua hàng!');
            await fetchOrders(); // Refresh data
        } catch (error) {
            console.error('Error starting shopping:', error);
            alert('Có lỗi xảy ra khi bắt đầu mua hàng');
        }
    };

    const handleCompleteOrder = async (orderId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5183/api/ProxyShopper/orders/${orderId}/complete`, {
                method: 'POST',
                headers: {
                    "Authorization": token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json"
                },
            });
            
            if (!res.ok) throw new Error("Không thể hoàn thành đơn hàng");
            
            alert('Đã hoàn thành đơn hàng!');
            await fetchOrders(); // Refresh data
        } catch (error) {
            console.error('Error completing order:', error);
            alert('Có lỗi xảy ra khi hoàn thành đơn hàng');
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5183/api/ProxyShopper/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: {
                    "Authorization": token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json"
                },
            });
            
            if (!res.ok) throw new Error("Không thể hủy đơn hàng");
            
            alert('Đã hủy đơn hàng!');
            await fetchOrders(); // Refresh data
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Có lỗi xảy ra khi hủy đơn hàng');
        }
    };

    const handleOpenUploadModal = (orderId) => {
        setSelectedOrderId(orderId);
        setShowUploadModal(true);
    };

    const handleUploadSuccess = () => {
        setShowUploadModal(false);
        setSelectedOrderId(null);
        fetchOrders(); // Refresh data
        alert('Đã upload chứng từ thành công!');
    };

    const getStatusBadge = (orderStatus, currentPhase) => {
        // Sử dụng currentPhase từ API hoặc orderStatus làm fallback
        const displayText = currentPhase || orderStatus;
        
        const statusConfig = {
            // Request statuses
            'Pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý', icon: '⏳' },
            'Accepted': { color: 'bg-blue-100 text-blue-800', text: 'Đã nhận', icon: '📋' },
            'Locked': { color: 'bg-blue-100 text-blue-800', text: 'Đã nhận, đang soạn đề xuất', icon: '🔒' },
            
            // Order statuses với currentPhase từ API
            'Draft': { color: 'bg-blue-100 text-blue-800', text: 'Đang soạn đề xuất', icon: '📝' },
            'Proposed': { color: 'bg-purple-100 text-purple-800', text: 'Chờ buyer duyệt', icon: '📋' },
            'Paid': { color: 'bg-green-100 text-green-800', text: 'Đã thanh toán - Sẵn sàng mua hàng', icon: '💳' },
            'InProgress': { color: 'bg-indigo-100 text-indigo-800', text: 'Đang mua hàng', icon: '🛒' },
            'Completed': { color: 'bg-green-100 text-green-800', text: 'Hoàn thành', icon: '✅' },
            'Cancelled': { color: 'bg-red-100 text-red-800', text: 'Đã hủy', icon: '❌' },
            
            // Các currentPhase từ API
            'Đang soạn đơn': { color: 'bg-blue-100 text-blue-800', text: 'Đang soạn đơn', icon: '📝' },
            'Chờ buyer duyệt': { color: 'bg-purple-100 text-purple-800', text: 'Chờ buyer duyệt', icon: '📋' },
            'Đã thanh toán - Sẵn sàng mua hàng': { color: 'bg-green-100 text-green-800', text: 'Sẵn sàng mua hàng', icon: '💳' },
            'Đang thực hiện mua hàng': { color: 'bg-indigo-100 text-indigo-800', text: 'Đang mua hàng', icon: '🛒' }
        };

        const config = statusConfig[displayText] || statusConfig[orderStatus] || {
            color: 'bg-gray-100 text-gray-800',
            text: displayText || orderStatus || 'Không xác định',
            icon: '❓'
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <span className="mr-1">{config.icon}</span>
                {config.text}
            </span>
        );
    };

    const getFilterTabs = () => {
        const getOrderStatus = (order) => order.orderStatus || order.requestStatus;
        
        return [
            { key: 'all', label: 'Tất cả', count: orders.length },
            { key: 'active', label: 'Đang thực hiện', count: orders.filter(o => {
                const status = getOrderStatus(o);
                return ['Accepted', 'Locked', 'Draft', 'Proposed', 'Paid', 'InProgress'].includes(status);
            }).length },
            { key: 'draft', label: 'Soạn đề xuất', count: orders.filter(o => o.canEditProposal).length },
            { key: 'proposed', label: 'Chờ duyệt', count: orders.filter(o => getOrderStatus(o) === 'Proposed').length },
            { key: 'shopping', label: 'Đang mua hàng', count: orders.filter(o => o.canStartShopping || o.canUploadProof).length },
            { key: 'completed', label: 'Hoàn thành', count: orders.filter(o => getOrderStatus(o) === 'Completed').length },
            { key: 'cancelled', label: 'Đã hủy', count: orders.filter(o => getOrderStatus(o) === 'Cancelled').length }
        ];
    };

    const filteredOrders = (() => {
        const getOrderStatus = (order) => order.orderStatus || order.requestStatus;
        
        if (filter === 'all') return orders;
        
        switch (filter) {
            case 'active':
                return orders.filter(order => {
                    const status = getOrderStatus(order);
                    return ['Accepted', 'Locked', 'Draft', 'Proposed', 'Paid', 'InProgress'].includes(status);
                });
            case 'draft':
                return orders.filter(order => order.canEditProposal);
            case 'proposed':
                return orders.filter(order => getOrderStatus(order) === 'Proposed');
            case 'shopping':
                return orders.filter(order => order.canStartShopping || order.canUploadProof);
            case 'completed':
                return orders.filter(order => getOrderStatus(order) === 'Completed');
            case 'cancelled':
                return orders.filter(order => getOrderStatus(order) === 'Cancelled');
            default:
                return orders.filter(order => getOrderStatus(order) === filter);
        }
    })();

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
                <p className="text-gray-600">Quản lý tất cả đơn hàng bạn đã nhận và thực hiện từ các chợ đã đăng ký.</p>
                <div className="mt-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-center">
                        <FiMapPin className="text-green-500 mr-2" size={16} />
                        <p className="text-sm text-green-700">
                            <strong>Lưu ý:</strong> Bạn chỉ nhận được đơn hàng từ những chợ mà bạn đã đăng ký làm proxy shopper.
                        </p>
                    </div>
                </div>
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
                    filteredOrders.map((order) => {
                        // Debug log cho từng order với cấu trúc mới
                        console.log(`Order ${order.requestId} - OrderStatus: ${order.orderStatus}, CurrentPhase: ${order.currentPhase}, Permissions:`, {
                            canEditProposal: order.canEditProposal,
                            canStartShopping: order.canStartShopping,
                            canUploadProof: order.canUploadProof,
                            canCancel: order.canCancel
                        });
                        
                        return (
                            <div key={order.requestId} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <h3 className="font-semibold text-lg text-gray-900">
                                                Đơn hàng #{order.requestId?.slice(-8)}
                                            </h3>
                                            {getStatusBadge(order.orderStatus, order.currentPhase)}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt || order.requestCreatedAt).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Buyer Information */}
                                    {order.buyerName && (
                                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                            <h4 className="text-sm font-medium text-blue-800 mb-2">Thông tin khách hàng</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-blue-600">Tên:</span>
                                                    <span className="ml-2 font-medium">{order.buyerName}</span>
                                                </div>
                                                {order.buyerPhone && (
                                                    <div>
                                                        <span className="text-blue-600">SĐT:</span>
                                                        <span className="ml-2 font-medium">{order.buyerPhone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Market Information */}
                                    {order.marketName && (
                                        <div className="bg-green-50 rounded-lg p-3 mb-4">
                                            <h4 className="text-sm font-medium text-green-800 mb-2">Thông tin chợ</h4>
                                            <div className="flex items-center text-sm">
                                                <FiMapPin className="mr-2 text-green-600" size={16} />
                                                <span className="text-green-600">Chợ:</span>
                                                <span className="ml-2 font-medium text-green-800">{order.marketName}</span>
                                                {order.marketId && (
                                                    <span className="ml-2 text-xs text-green-600">(ID: {order.marketId})</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

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
                                                {order.requestItems?.length || 0} sản phẩm yêu cầu
                                                {order.orderItems && order.orderItems.length > 0 && (
                                                    <span className="text-green-600 ml-1">
                                                        ({order.orderItems.length} sản phẩm đề xuất)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Request Items Preview */}
                                    {order.requestItems && order.requestItems.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Sản phẩm yêu cầu:</h4>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="space-y-2">
                                                    {order.requestItems.slice(0, 3).map((item, index) => (
                                                        <div key={index} className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {item.name}
                                                            </span>
                                                            <span className="font-medium">
                                                                {item.quantity} {item.unit}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {order.requestItems.length > 3 && (
                                                        <p className="text-xs text-gray-500">
                                                            và {order.requestItems.length - 3} sản phẩm khác...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Items (Proposal) Information */}
                                    {order.orderItems && order.orderItems.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Đề xuất sản phẩm:</h4>
                                            <div className="bg-green-50 rounded-lg p-3">
                                                <div className="space-y-2">
                                                    {order.orderItems.slice(0, 3).map((item, index) => (
                                                        <div key={index} className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {item.name || item.productName}
                                                            </span>
                                                            <span className="font-medium text-green-700">
                                                                {item.quantity} {item.unit} - {formatCurrency(item.price)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {order.orderItems.length > 3 && (
                                                        <p className="text-xs text-gray-500">
                                                            và {order.orderItems.length - 3} sản phẩm khác...
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-green-200">
                                                    <div>
                                                        <span className="text-gray-600">Tổng tiền sản phẩm:</span>
                                                        <span className="font-semibold ml-2">
                                                            {formatCurrency(order.totalAmount)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Phí dịch vụ:</span>
                                                        <span className="font-semibold ml-2">
                                                            {formatCurrency(order.proxyFee)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {order.orderCreatedAt && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Đề xuất lúc: {new Date(order.orderCreatedAt).toLocaleString('vi-VN')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Proof Images Display - Hiển thị ảnh xác nhận đã upload */}
                                    {order.proofImages && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Hình ảnh xác nhận mua hàng:</h4>
                                            <div className="bg-blue-50 rounded-lg p-3">
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {/* Handle both string (single image) and array (multiple images) */}
                                                    {(() => {
                                                        const images = Array.isArray(order.proofImages) 
                                                            ? order.proofImages 
                                                            : [order.proofImages];
                                                        
                                                        return images.map((imageUrl, index) => (
                                                            <div key={index} className="relative">
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={`Proof ${index + 1}`}
                                                                    className="w-full h-40 object-contain rounded-lg border bg-white"
                                                                    onClick={() => window.open(imageUrl, '_blank')}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                                    {index + 1}/{images.length}
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                                <div className="mt-2 text-xs text-gray-600">
                                                    ✅ Đã upload {Array.isArray(order.proofImages) ? order.proofImages.length : 1} hình ảnh xác nhận
                                                    {order.proofUploadedAt && (
                                                        <div className="text-gray-500">
                                                            Upload lúc: {new Date(order.proofUploadedAt).toLocaleString('vi-VN')}
                                                        </div>
                                                    )}
                                                    {order.proofNote && (
                                                        <div className="mt-1 text-gray-700">
                                                            <strong>Ghi chú:</strong> {order.proofNote}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Footer with Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-600">Tổng tiền:</span>
                                            <span className="text-lg font-bold text-supply-primary">
                                                {formatCurrency((order.totalAmount || 0) + (order.proxyFee || 0))}
                                            </span>
                                            {order.proxyFee && (
                                                <span className="text-sm text-gray-600">
                                                    (Bao gồm phí dịch vụ: {formatCurrency(order.proxyFee)})
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Action Buttons based on Permissions from API */}
                                        <div className="flex items-center space-x-3">
                                            {/* Xem chi tiết luôn hiển thị */}
                                            <Link
                                                to={`/proxy-shopper/orders/${order.orderId || order.requestId}/details`}
                                                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                <FiEye className="mr-2" size={16} />
                                                Xem chi tiết
                                            </Link>

                                            {/* Nút tạo/chỉnh sửa đề xuất */}
                                            {order.canEditProposal && (
                                                <Link
                                                    to={`/proxy-shopper/orders/${order.requestId}/create`}
                                                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                                >
                                                    <FiEdit3 className="mr-2" size={16} />
                                                    {order.orderItems ? 'Chỉnh sửa đề xuất' : 'Tạo đề xuất'}
                                                </Link>
                                            )}

                                            {/* Chờ duyệt */}
                                            {order.orderStatus === 'Proposed' && !order.canEditProposal && (
                                                <div className="flex items-center text-sm text-blue-600">
                                                    <FiClock className="mr-1" size={16} />
                                                    Chờ khách hàng duyệt
                                                </div>
                                            )}

                                            {/* Nút bắt đầu mua hàng */}
                                            {order.canStartShopping && (
                                                <button
                                                    onClick={() => handleStartShopping(order.orderId)}
                                                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                                >
                                                    <FiShoppingCart className="mr-2" size={16} />
                                                    Bắt đầu mua hàng
                                                </button>
                                            )}

                                            {/* Nút upload chứng từ - chỉ hiện khi chưa có ảnh proof */}
                                            {order.canUploadProof && !order.proofImages && (
                                                <button
                                                    onClick={() => handleOpenUploadModal(order.orderId)}
                                                    className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                                                >
                                                    <FiCamera className="mr-2" size={16} />
                                                    Đăng hình sản phẩm đã mua
                                                </button>
                                            )}

                                            {/* Hiển thị trạng thái đã upload proof với thumbnail nhỏ */}
                                            {order.proofImages && (
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex items-center text-sm text-green-600">
                                                        <FiCheck className="mr-1" size={16} />
                                                        Đã gửi chứng từ
                                                    </div>
                                                    <div className="flex -space-x-1">
                                                        {(() => {
                                                            const images = Array.isArray(order.proofImages) 
                                                                ? order.proofImages 
                                                                : [order.proofImages];
                                                            
                                                            return images.slice(0, 3).map((imageUrl, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={imageUrl}
                                                                    alt={`Proof ${index + 1}`}
                                                                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                                                    onClick={() => window.open(imageUrl, '_blank')}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            ));
                                                        })()}
                                                        {(() => {
                                                            const images = Array.isArray(order.proofImages) 
                                                                ? order.proofImages 
                                                                : [order.proofImages];
                                                            
                                                            return images.length > 3 && (
                                                                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                                                    +{images.length - 3}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Nút hủy đơn hàng */}
                                            {order.canCancel && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                                                            handleCancelOrder(order.orderId);
                                                        }
                                                    }}
                                                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                                                >
                                                    <FiX className="mr-2" size={16} />
                                                    Hủy
                                                </button>
                                            )}

                                            {/* Hiển thị trạng thái hoàn thành */}
                                            {order.orderStatus === 'Completed' && (
                                                <div className="flex items-center text-sm text-green-600">
                                                    <FiCheck className="mr-1" size={16} />
                                                    Đã hoàn thành
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
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

            {/* Upload Proof Modal */}
            <UploadProofModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                orderId={selectedOrderId}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default ProxyShopperOrders;
