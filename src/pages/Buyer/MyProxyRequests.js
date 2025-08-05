import React, { useEffect, useState } from 'react';
import { FiUser, FiClock, FiPackage, FiMapPin, FiPhone, FiEye, FiCheck, FiX, FiShoppingCart, FiRefreshCw } from 'react-icons/fi';
import proxyRequestService from '../../services/proxyRequestService';
import '../../styles/proxy-requests.css';

const MyProxyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [selectedRequestForAction, setSelectedRequestForAction] = useState(null);

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await proxyRequestService.getMyRequests();
            setRequests(data);
        } catch (err) {
            setError(err.message || "Không thể tải danh sách yêu cầu");
        }
        setLoading(false);
    };

    const getStatusDisplay = (request) => {
        // Sử dụng currentPhase từ API response mới
        const displayPhase = request.currentPhase || request.status;
        const statusMap = {
            // Current phase values từ API
            'Chưa có Proxy nhận': { text: 'Đang chờ proxy shopper nhận', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
            'Đang soạn đơn': { text: 'Proxy đang soạn đề xuất', color: 'bg-blue-100 text-blue-800', icon: '📝' },
            'Chờ duyệt': { text: 'Có đề xuất, chờ duyệt', color: 'bg-purple-100 text-purple-800', icon: '📋' },
            'Đã thanh toán': { text: 'Đã thanh toán, đang mua hàng', color: 'bg-green-100 text-green-800', icon: '💳' },
            'Đang mua hàng': { text: 'Đang mua hàng', color: 'bg-indigo-100 text-indigo-800', icon: '🛒' },
            'Đã hoàn thành': { text: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: '✅' },
            'Đã hủy': { text: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '❌' },
            'Đã hết hạn': { text: 'Đã hết hạn', color: 'bg-gray-100 text-gray-800', icon: '⏰' },
            
            // Fallback cho old statuses
            'Open': { text: 'Đang chờ proxy shopper nhận', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
            'Locked': { text: 'Đã có proxy nhận, đang soạn đề xuất', color: 'bg-blue-100 text-blue-800', icon: '🔒' },
            'Draft': { text: 'Proxy đang soạn đề xuất', color: 'bg-blue-100 text-blue-800', icon: '📝' },
            'Proposed': { text: 'Có đề xuất, chờ duyệt', color: 'bg-purple-100 text-purple-800', icon: '📋' },
            'Paid': { text: 'Đã thanh toán, đang mua hàng', color: 'bg-green-100 text-green-800', icon: '💳' },
            'InProgress': { text: 'Đang mua hàng', color: 'bg-indigo-100 text-indigo-800', icon: '🛒' },
            'Completed': { text: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: '✅' },
            'Cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '❌' }
        };
        return statusMap[displayPhase] || { text: displayPhase, color: 'bg-gray-100 text-gray-800', icon: '❓' };
    };

    const handleApproveProposal = async (requestId) => {
        setActionLoading(true);
        setActionError("");
        setActionSuccess("");
        try {
            await proxyRequestService.approveProposal(requestId);
            setActionSuccess("Đã duyệt đề xuất và thanh toán thành công!");
            await fetchMyRequests(); // Refresh data
            setShowProposalModal(false);
        } catch (err) {
            setActionError(err.message || "Không thể duyệt đề xuất");
        }
        setActionLoading(false);
    };

    const handleConfirmDelivery = async (requestId) => {
        setActionLoading(true);
        setActionError("");
        setActionSuccess("");
        try {
            await proxyRequestService.confirmDelivery(requestId);
            setActionSuccess("Đã xác nhận nhận hàng!");
            await fetchMyRequests(); // Refresh data
        } catch (err) {
            setActionError(err.message || "Không thể xác nhận nhận hàng");
        }
        setActionLoading(false);
    };

    const handleCancelRequest = async () => {
        if (!cancelReason.trim()) {
            setActionError("Vui lòng nhập lý do hủy yêu cầu");
            return;
        }

        setActionLoading(true);
        setActionError("");
        setActionSuccess("");
        try {
            await proxyRequestService.cancelRequest(selectedRequestForAction.id, cancelReason);
            setActionSuccess("Đã hủy yêu cầu thành công!");
            await fetchMyRequests(); // Refresh data
            setShowCancelModal(false);
            setCancelReason("");
            setSelectedRequestForAction(null);
        } catch (err) {
            setActionError(err.message || "Không thể hủy yêu cầu");
        }
        setActionLoading(false);
    };

    const handleRejectProposal = async () => {
        if (!rejectReason.trim()) {
            setActionError("Vui lòng nhập lý do từ chối đề xuất");
            return;
        }

        setActionLoading(true);
        setActionError("");
        setActionSuccess("");
        try {
            // Sử dụng orderId từ proposal hoặc requestId
            const orderId = selectedRequestForAction.proposal?.orderId || selectedRequestForAction.id;
            await proxyRequestService.rejectProposal(orderId, rejectReason);
            setActionSuccess("Đã từ chối đề xuất! Proxy shopper sẽ lên đơn lại.");
            await fetchMyRequests(); // Refresh data
            setShowRejectModal(false);
            setRejectReason("");
            setSelectedRequestForAction(null);
        } catch (err) {
            setActionError(err.message || "Không thể từ chối đề xuất");
        }
        setActionLoading(false);
    };

    const openCancelModal = (request) => {
        setSelectedRequestForAction(request);
        setShowCancelModal(true);
        setActionError("");
        setActionSuccess("");
    };

    const openRejectModal = (request) => {
        setSelectedRequestForAction(request);
        setShowRejectModal(true);
        setActionError("");
        setActionSuccess("");
    };

    const viewProposal = (request) => {
        setSelectedRequest(request);
        setShowProposalModal(true);
        setActionError("");
        setActionSuccess("");
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-supply-primary flex items-center">
                    <FiShoppingCart className="mr-2" />
                    Yêu cầu đi chợ giúm của tôi
                </h1>
                <button
                    onClick={fetchMyRequests}
                    className="px-4 py-2 bg-supply-primary text-white rounded hover:bg-supply-primary/90 flex items-center gap-2"
                    disabled={loading}
                >
                    <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-12">
                    <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500">Bạn chưa có yêu cầu đi chợ giúm nào</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {requests.map((request) => {
                        const statusInfo = getStatusDisplay(request);
                        // Sử dụng API response mới
                        const requestStatus = request.status; // Request status: Open, Locked, Completed
                        const orderStatus = request.orderStatus; // Order status từ API: Draft, Proposed, Paid, InProgress, Completed
                        const currentPhase = request.currentPhase; // Current phase từ API
                        const hasOrder = request.hasOrder; // Có order hay không
                                                
                        return (
                            <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">Yêu cầu #{request.id}</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center gap-1`}>
                                                <span>{statusInfo.icon}</span>
                                                {statusInfo.text}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm mb-2">
                                            <FiClock className="mr-1" />
                                            Tạo lúc: {new Date(request.createdAt).toLocaleString('vi-VN')}
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <FiMapPin className="mr-1" />
                                            Giao đến: {request.deliveryAddress}
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin proxy shopper */}
                                {request.partnerName && request.partnerRole === 'Proxy Shopper' && (
                                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                                            <FiUser className="mr-1" />
                                            Người đi chợ giùm
                                        </h4>
                                        <div className="text-blue-700">
                                            <div>Tên: {request.partnerName}</div>
                                            {request.partnerEmail && (
                                                <div className="mt-1">
                                                    Email: {request.partnerEmail}
                                                </div>
                                            )}
                                            {request.partnerPhone && (
                                                <div className="flex items-center mt-1">
                                                    <FiPhone className="mr-1" />
                                                    {request.partnerPhone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Sản phẩm yêu cầu */}
                                <div className="mb-4">
                                    <h4 className="font-medium mb-2 flex items-center">
                                        <FiPackage className="mr-1" />
                                        Sản phẩm yêu cầu ({request.items?.length || 0} mặt hàng)
                                    </h4>
                                    <div className="bg-gray-50 rounded p-3">
                                        {request.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-1">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-gray-600">{item.quantity} {item.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Thông tin đơn hàng chi tiết (nếu có) */}
                                {request.hasOrder && request.orderId && (
                                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium text-green-800 mb-3 flex items-center">
                                            <FiShoppingCart className="mr-1" />
                                            Thông tin đơn hàng (#{request.orderId.slice(-8)})
                                        </h4>
                                        
                                        {/* Chi tiết sản phẩm trong order */}
                                        {request.orderItems && request.orderItems.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="font-medium text-green-800 mb-2">Sản phẩm đã chọn:</h5>
                                                <div className="space-y-2">
                                                    {request.orderItems.map((item, idx) => (
                                                        <div key={idx} className="bg-white rounded-lg p-3 border border-green-200">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <h6 className="font-semibold text-gray-800">{item.name}</h6>
                                                                    <div className="text-sm text-gray-600 mt-1">
                                                                        <div className="flex justify-between">
                                                                            <span>Số lượng tối thiểu:</span>
                                                                            <span className="font-medium">{item.minimumQuantity} {item.unitName}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span>Đơn giá:</span>
                                                                            <span className="font-semibold text-green-600">
                                                                                {item.price?.toLocaleString()} đ/{item.unitName}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span>Thành tiền:</span>
                                                                            <span className="font-bold text-green-700">
                                                                                {((item.price || 0) * (item.minimumQuantity || 0)).toLocaleString()} đ
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tổng kết chi phí */}
                                        {(request.totalAmount || request.proxyFee) && (
                                            <div className="text-green-700">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span>Tổng tiền sản phẩm:</span>
                                                    <span className="font-semibold">
                                                        {(request.totalAmount || 0).toLocaleString()} đ
                                                    </span>
                                                </div>
                                                {request.proxyFee && (
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span>Phí dịch vụ:</span>
                                                        <span className="font-semibold">{request.proxyFee.toLocaleString()} đ</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-green-200">
                                                    <span>Tổng cộng:</span>
                                                    <span>
                                                        {((request.totalAmount || 0) + (request.proxyFee || 0)).toLocaleString()} đ
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Địa chỉ giao hàng */}
                                        {request.deliveryAddress && (
                                            <div className="mt-3 pt-3 border-t border-green-200">
                                                <span className="font-medium text-green-800">Địa chỉ giao hàng:</span>
                                                <p className="text-sm mt-1 text-green-700">{request.deliveryAddress}</p>
                                            </div>
                                        )}

                                        {/* Ghi chú */}
                                        {request.notes && (
                                            <div className="mt-3 pt-3 border-t border-green-200">
                                                <span className="font-medium text-green-800">Ghi chú:</span>
                                                <p className="text-sm mt-1 text-green-700">{request.notes}</p>
                                            </div>
                                        )}

                                        {/* Proof Images */}
                                        {request.proofImages && (
                                            <div className="mt-3 pt-3 border-t border-green-200">
                                                <span className="font-medium text-green-800">Hình ảnh xác nhận mua hàng:</span>
                                                <div className="mt-2">
                                                    <img
                                                        src={request.proofImages}
                                                        alt="Proof of purchase"
                                                        className="w-full max-w-md h-64 object-contain rounded-lg border bg-white cursor-pointer"
                                                        onClick={() => window.open(request.proofImages, '_blank')}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Thời gian đơn hàng */}
                                        {request.orderCreatedAt && (
                                            <div className="mt-3 pt-3 border-t border-green-200">
                                                <span className="font-medium text-green-800">Thời gian tạo đơn:</span>
                                                <p className="text-sm mt-1 text-green-700">
                                                    {new Date(request.orderCreatedAt).toLocaleString('vi-VN')}
                                                </p>
                                                {request.orderUpdatedAt && request.orderUpdatedAt !== request.orderCreatedAt && (
                                                    <>
                                                        <span className="font-medium text-green-800">Cập nhật lần cuối:</span>
                                                        <p className="text-sm mt-1 text-green-700">
                                                            {new Date(request.orderUpdatedAt).toLocaleString('vi-VN')}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Thông tin đề xuất với sản phẩm chi tiết */}
                                {request.proposal && (
                                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium text-green-800 mb-3">Đề xuất từ Người đi chợ giùm</h4>
                                        
                                        {/* Hiển thị sản phẩm đề xuất chi tiết */}
                                        {request.proposal.proposedItems && request.proposal.proposedItems.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="font-medium text-green-800 mb-2">Sản phẩm đề xuất:</h5>
                                                <div className="space-y-3">
                                                    {request.proposal.proposedItems.map((item, idx) => (
                                                        <div key={idx} className="bg-white rounded-lg p-3 border border-green-200">
                                                            <div className="flex items-start space-x-3">
                                                                {/* Hình ảnh sản phẩm */}
                                                                {item.imageUrls && item.imageUrls.length > 0 && (
                                                                    <div className="flex-shrink-0">
                                                                        <img 
                                                                            src={item.imageUrls[0]} 
                                                                            alt={item.name}
                                                                            className="w-16 h-16 object-cover rounded-lg border"
                                                                            onError={(e) => {
                                                                                e.target.src = '/placeholder-product.png'; // Fallback image
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Thông tin sản phẩm */}
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <h6 className="font-semibold text-gray-800">{item.name}</h6>
                                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                                            item.isAvailable 
                                                                                ? 'bg-green-100 text-green-800' 
                                                                                : 'bg-red-100 text-red-800'
                                                                        }`}>
                                                                            {item.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div className="text-sm text-gray-600 space-y-1">
                                                                        <div className="flex justify-between">
                                                                            <span>Số lượng:</span>
                                                                            <span className="font-medium">{item.quantity} {item.unit}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span>Đơn giá:</span>
                                                                            <span className="font-semibold text-green-600">
                                                                                {item.price?.toLocaleString()} đ/{item.unit}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span>Thành tiền:</span>
                                                                            <span className="font-bold text-green-700">
                                                                                {((item.price || 0) * (item.quantity || 0)).toLocaleString()} đ
                                                                            </span>
                                                                        </div>
                                                                        {item.storeName && (
                                                                            <div className="flex justify-between">
                                                                                <span>Cửa hàng:</span>
                                                                                <span className="font-medium">{item.storeName}</span>
                                                                            </div>
                                                                        )}
                                                                        {item.storeRating && (
                                                                            <div className="flex justify-between">
                                                                                <span>Đánh giá:</span>
                                                                                <span className="flex items-center">
                                                                                    ⭐ {item.storeRating}/5
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {item.categoryName && (
                                                                            <div className="flex justify-between">
                                                                                <span>Danh mục:</span>
                                                                                <span className="text-blue-600">{item.categoryName}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tổng kết chi phí */}
                                        <div className="text-green-700">
                                            <div className="flex justify-between items-center mb-1">
                                                <span>Tổng tiền sản phẩm:</span>
                                                <span className="font-semibold">
                                                    {(request.proposal.totalAmount || request.proposal.totalProductPrice || 0).toLocaleString()} đ
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span>Phí dịch vụ:</span>
                                                <span className="font-semibold">{request.proposal.proxyFee?.toLocaleString()} đ</span>
                                            </div>
                                            <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-green-200">
                                                <span>Tổng cộng:</span>
                                                <span>
                                                    {((request.proposal.totalAmount || request.proposal.totalProductPrice || 0) + (request.proposal.proxyFee || 0)).toLocaleString()} đ
                                                </span>
                                            </div>
                                            {request.proposal.note && (
                                                <div className="mt-2 pt-2 border-t border-green-200">
                                                    <span className="font-medium">Ghi chú:</span>
                                                    <p className="text-sm mt-1">{request.proposal.note}</p>
                                                </div>
                                            )}
                                            {request.proposal.createdAt && (
                                                <div className="mt-2 pt-2 border-t border-green-200">
                                                    <span className="font-medium">Thời gian đề xuất:</span>
                                                    <p className="text-sm mt-1">
                                                        {new Date(request.proposal.createdAt).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Nút thao tác */}
                                <div className="flex gap-3 justify-end mt-4">
                                    {/* Hiển thị chi tiết order nếu có */}
                                    {hasOrder && (
                                        <button
                                            onClick={() => viewProposal(request)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                                        >
                                            <FiEye className="text-sm" />
                                            Xem chi tiết đơn hàng
                                        </button>
                                    )}
                                    
                                    {/* Nút cho currentPhase = "Chờ duyệt" */}
                                    {currentPhase === 'Chờ duyệt' && (
                                        <>
                                            <button
                                                onClick={() => openRejectModal(request)}
                                                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-1"
                                                disabled={actionLoading}
                                            >
                                                <FiX className="text-sm" />
                                                Từ chối & Yêu cầu lên lại
                                            </button>
                                            <button
                                                onClick={() => handleApproveProposal(request.orderId || request.id)}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                                                disabled={actionLoading}
                                            >
                                                <FiCheck className="text-sm" />
                                                {actionLoading ? 'Đang xử lý...' : 'Duyệt & Thanh toán'}
                                            </button>
                                        </>
                                    )}
                                    
                                    {/* Nút cho currentPhase = "Đã thanh toán" hoặc "Đang mua hàng" */}
                                    {(currentPhase === 'Đã thanh toán' || currentPhase === 'Đang mua hàng') && (
                                        <button
                                            onClick={() => handleConfirmDelivery(request.orderId || request.id)}
                                            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1"
                                            disabled={actionLoading}
                                        >
                                            <FiCheck className="text-sm" />
                                            {actionLoading ? 'Đang xử lý...' : 'Xác nhận nhận hàng'}
                                        </button>
                                    )}
                                    
                                    {/* Nút cho currentPhase = "Chưa có Proxy nhận" */}
                                    {currentPhase === 'Chưa có Proxy nhận' && (
                                        <button
                                            onClick={() => openCancelModal(request)}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                                            disabled={actionLoading}
                                        >
                                            <FiX className="text-sm" />
                                            Hủy yêu cầu
                                        </button>
                                    )}

                                    {/* Nút làm mới để cập nhật trạng thái */}
                                    <button
                                        onClick={fetchMyRequests}
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-1"
                                        disabled={loading}
                                    >
                                        <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
                                        Làm mới
                                    </button>
                                </div>

                                {/* Hiển thị thông báo lỗi/thành công */}
                                {actionError && (
                                    <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                                        {actionError}
                                    </div>
                                )}
                                {actionSuccess && (
                                    <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded text-green-700">
                                        {actionSuccess}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal xem đề xuất chi tiết */}
            {showProposalModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Chi tiết đề xuất - Yêu cầu #{selectedRequest.id}</h3>
                            <button
                                onClick={() => setShowProposalModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {/* Thông tin proxy shopper */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3 flex items-center text-blue-800">
                                    <FiUser className="mr-2" />
                                    Người đi chợ giùm
                                </h4>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div>Tên: {selectedRequest.proxyShopperName}</div>
                                    {selectedRequest.proxyShopperPhone && (
                                        <div className="flex items-center mt-1">
                                            <FiPhone className="mr-1" />
                                            {selectedRequest.proxyShopperPhone}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sản phẩm đề xuất chi tiết */}
                            {selectedRequest.proposal?.proposedItems && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3 flex items-center text-green-800">
                                        <FiPackage className="mr-2" />
                                        Sản phẩm đề xuất ({selectedRequest.proposal.proposedItems.length} sản phẩm)
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedRequest.proposal.proposedItems.map((item, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <div className="flex items-start space-x-4">
                                                    {/* Hình ảnh sản phẩm */}
                                                    {item.imageUrls && item.imageUrls.length > 0 && (
                                                        <div className="flex-shrink-0">
                                                            <img 
                                                                src={item.imageUrls[0]} 
                                                                alt={item.name}
                                                                className="w-20 h-20 object-cover rounded-lg border"
                                                                onError={(e) => {
                                                                    e.target.src = '/placeholder-product.png';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    {/* Thông tin sản phẩm */}
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="font-bold text-lg text-gray-800">{item.name}</h5>
                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                item.isAvailable 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {item.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Số lượng:</span>
                                                                    <span className="font-semibold">{item.quantity} {item.unit}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Đơn giá:</span>
                                                                    <span className="font-semibold text-green-600">
                                                                        {item.price?.toLocaleString()} đ/{item.unit}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Thành tiền:</span>
                                                                    <span className="font-bold text-green-700 text-lg">
                                                                        {((item.price || 0) * (item.quantity || 0)).toLocaleString()} đ
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="space-y-2">
                                                                {item.storeName && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Cửa hàng:</span>
                                                                        <span className="font-semibold">{item.storeName}</span>
                                                                    </div>
                                                                )}
                                                                {item.storeRating && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Đánh giá cửa hàng:</span>
                                                                        <span className="flex items-center font-semibold">
                                                                            ⭐ {item.storeRating}/5
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {item.categoryName && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Danh mục:</span>
                                                                        <span className="text-blue-600 font-semibold">{item.categoryName}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Nhiều hình ảnh */}
                                                        {item.imageUrls && item.imageUrls.length > 1 && (
                                                            <div className="mt-3">
                                                                <span className="text-sm text-gray-600 mb-2 block">Hình ảnh khác:</span>
                                                                <div className="flex space-x-2 overflow-x-auto">
                                                                    {item.imageUrls.slice(1, 4).map((url, imgIdx) => (
                                                                        <img 
                                                                            key={imgIdx}
                                                                            src={url} 
                                                                            alt={`${item.name} ${imgIdx + 2}`}
                                                                            className="w-12 h-12 object-cover rounded border flex-shrink-0"
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                            }}
                                                                        />
                                                                    ))}
                                                                    {item.imageUrls.length > 4 && (
                                                                        <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-600 flex-shrink-0">
                                                                            +{item.imageUrls.length - 4}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fallback cho format cũ */}
                            {selectedRequest.proposal?.items && !selectedRequest.proposal?.proposedItems && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3 flex items-center text-green-800">
                                        <FiPackage className="mr-2" />
                                        Sản phẩm đề xuất
                                    </h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium">Tên sản phẩm</th>
                                                    <th className="px-4 py-3 text-left font-medium">Số lượng</th>
                                                    <th className="px-4 py-3 text-left font-medium">Đơn giá</th>
                                                    <th className="px-4 py-3 text-left font-medium">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedRequest.proposal.items.map((item, idx) => (
                                                    <tr key={idx} className="border-t">
                                                        <td className="px-4 py-3 font-medium">{item.name}</td>
                                                        <td className="px-4 py-3">{item.quantity} {item.unit}</td>
                                                        <td className="px-4 py-3 text-green-600 font-medium">
                                                            {item.price?.toLocaleString()} đ
                                                        </td>
                                                        <td className="px-4 py-3 text-green-600 font-bold">
                                                            {((item.price || 0) * (item.quantity || 0)).toLocaleString()} đ
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Tổng kết chi phí */}
                            <div className="bg-green-50 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold mb-3 text-green-800">Tổng kết chi phí</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Tổng tiền sản phẩm:</span>
                                        <span className="font-semibold">
                                            {(selectedRequest.proposal?.totalAmount || selectedRequest.proposal?.totalProductPrice || 0).toLocaleString()} đ
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phí dịch vụ:</span>
                                        <span className="font-semibold">{selectedRequest.proposal?.proxyFee?.toLocaleString()} đ</span>
                                    </div>
                                    <hr className="border-green-200" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Tổng cộng:</span>
                                        <span className="text-green-700">
                                            {((selectedRequest.proposal?.totalAmount || selectedRequest.proposal?.totalProductPrice || 0) + (selectedRequest.proposal?.proxyFee || 0)).toLocaleString()} đ
                                        </span>
                                    </div>
                                    
                                    {/* Thời gian đề xuất */}
                                    {selectedRequest.proposal?.createdAt && (
                                        <div className="pt-2 border-t border-green-200">
                                            <div className="flex justify-between text-sm">
                                                <span>Thời gian đề xuất:</span>
                                                <span className="font-medium">
                                                    {new Date(selectedRequest.proposal.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ghi chú */}
                            {selectedRequest.proposal?.note && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-2">Ghi chú từ Người đi chợ giùm:</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700">{selectedRequest.proposal.note}</p>
                                    </div>
                                </div>
                            )}

                            {/* Nút thao tác trong modal */}
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowProposalModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Đóng
                                </button>
                                
                                {(selectedRequest.order?.status === 'Proposed' || selectedRequest.proposal?.orderStatus === 'Proposed') && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowProposalModal(false);
                                                openRejectModal(selectedRequest);
                                            }}
                                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-2"
                                            disabled={actionLoading}
                                        >
                                            <FiX />
                                            Từ chối & Yêu cầu lên lại
                                        </button>
                                        <button
                                            onClick={() => handleApproveProposal(selectedRequest.id)}
                                            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                                            disabled={actionLoading}
                                        >
                                            <FiCheck />
                                            {actionLoading ? 'Đang xử lý...' : 'Duyệt & Thanh toán'}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thông báo trong modal */}
                            {actionError && (
                                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                                    {actionError}
                                </div>
                            )}
                            {actionSuccess && (
                                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded text-green-700">
                                    {actionSuccess}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal hủy yêu cầu */}
            {showCancelModal && selectedRequestForAction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="border-b px-6 py-4">
                            <h3 className="text-lg font-bold text-red-800">Hủy yêu cầu #{selectedRequestForAction.id}</h3>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-gray-700 mb-3">
                                    Bạn có chắc chắn muốn hủy yêu cầu này? Hành động này không thể hoàn tác.
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lý do hủy <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Nhập lý do hủy yêu cầu..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    rows="3"
                                />
                            </div>

                            {actionError && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                                    {actionError}
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason("");
                                        setSelectedRequestForAction(null);
                                        setActionError("");
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                    disabled={actionLoading}
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleCancelRequest}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                                    disabled={actionLoading || !cancelReason.trim()}
                                >
                                    <FiX />
                                    {actionLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal từ chối đề xuất */}
            {showRejectModal && selectedRequestForAction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="border-b px-6 py-4">
                            <h3 className="text-lg font-bold text-orange-800">Từ chối đề xuất #{selectedRequestForAction.id}</h3>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-gray-700 mb-3">
                                    Từ chối đề xuất hiện tại và yêu cầu proxy shopper lên đơn lại với sản phẩm phù hợp hơn.
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lý do từ chối <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Ví dụ: Giá cao quá, mong proxy tìm sản phẩm rẻ hơn..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    rows="3"
                                />
                            </div>

                            {actionError && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                                    {actionError}
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason("");
                                        setSelectedRequestForAction(null);
                                        setActionError("");
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                    disabled={actionLoading}
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleRejectProposal}
                                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-2"
                                    disabled={actionLoading || !rejectReason.trim()}
                                >
                                    <FiX />
                                    {actionLoading ? 'Đang xử lý...' : 'Từ chối & Yêu cầu lên lại'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProxyRequests;
