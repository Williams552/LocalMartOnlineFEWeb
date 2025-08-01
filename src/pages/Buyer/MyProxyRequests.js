import React, { useEffect, useState } from 'react';
import { FiUser, FiClock, FiPackage, FiMapPin, FiPhone, FiEye, FiCheck, FiX, FiShoppingCart, FiRefreshCw } from 'react-icons/fi';
import proxyRequestService from '../../services/proxyRequestService';

const MyProxyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

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

    const getStatusDisplay = (status) => {
        const statusMap = {
            'Open': { text: 'Đang chờ proxy shopper nhận', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
            'Locked': { text: 'Đã có proxy nhận, đang soạn đề xuất', color: 'bg-blue-100 text-blue-800', icon: '🔒' },
            'Proposed': { text: 'Có đề xuất, chờ duyệt', color: 'bg-purple-100 text-purple-800', icon: '📋' },
            'Paid': { text: 'Đã thanh toán, đang mua hàng', color: 'bg-green-100 text-green-800', icon: '💳' },
            'InProgress': { text: 'Đang mua hàng', color: 'bg-indigo-100 text-indigo-800', icon: '🛒' },
            'Completed': { text: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: '✅' },
            'Cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '❌' }
        };
        return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
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
                        const statusInfo = getStatusDisplay(request.status);
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
                                {request.proxyShopperName && (
                                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                                            <FiUser className="mr-1" />
                                            Người đi chợ giúm
                                        </h4>
                                        <div className="text-blue-700">
                                            <div>Tên: {request.proxyShopperName}</div>
                                            {request.proxyShopperPhone && (
                                                <div className="flex items-center mt-1">
                                                    <FiPhone className="mr-1" />
                                                    {request.proxyShopperPhone}
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

                                {/* Thông tin đề xuất */}
                                {request.proposal && (
                                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium text-green-800 mb-2">Đề xuất từ người đi chợ giúm</h4>
                                        <div className="text-green-700">
                                            <div className="flex justify-between items-center mb-1">
                                                <span>Tổng tiền sản phẩm:</span>
                                                <span className="font-semibold">{request.proposal.totalProductPrice?.toLocaleString()} đ</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span>Phí dịch vụ:</span>
                                                <span className="font-semibold">{request.proposal.proxyFee?.toLocaleString()} đ</span>
                                            </div>
                                            <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-green-200">
                                                <span>Tổng cộng:</span>
                                                <span>{((request.proposal.totalProductPrice || 0) + (request.proposal.proxyFee || 0)).toLocaleString()} đ</span>
                                            </div>
                                            {request.proposal.note && (
                                                <div className="mt-2 pt-2 border-t border-green-200">
                                                    <span className="font-medium">Ghi chú:</span>
                                                    <p className="text-sm mt-1">{request.proposal.note}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Nút thao tác */}
                                <div className="flex gap-3 justify-end mt-4">
                                    {request.proposal && (
                                        <button
                                            onClick={() => viewProposal(request)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                                        >
                                            <FiEye className="text-sm" />
                                            Xem đề xuất
                                        </button>
                                    )}
                                    
                                    {request.status === 'Proposed' && (
                                        <button
                                            onClick={() => handleApproveProposal(request.id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                                            disabled={actionLoading}
                                        >
                                            <FiCheck className="text-sm" />
                                            {actionLoading ? 'Đang xử lý...' : 'Duyệt & Thanh toán'}
                                        </button>
                                    )}
                                    
                                    {(request.status === 'Paid' || request.status === 'InProgress') && (
                                        <button
                                            onClick={() => handleConfirmDelivery(request.id)}
                                            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1"
                                            disabled={actionLoading}
                                        >
                                            <FiCheck className="text-sm" />
                                            {actionLoading ? 'Đang xử lý...' : 'Xác nhận nhận hàng'}
                                        </button>
                                    )}
                                    
                                    {(request.status === 'Open' || request.status === 'Locked') && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) {
                                                    // Add cancel functionality later
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                                        >
                                            <FiX className="text-sm" />
                                            Hủy yêu cầu
                                        </button>
                                    )}
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
                                    Người đi chợ giúm
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

                            {/* Sản phẩm đề xuất */}
                            {selectedRequest.proposal?.items && (
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

                            {/* Tổng kết */}
                            <div className="bg-green-50 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold mb-3 text-green-800">Tổng kết chi phí</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Tổng tiền sản phẩm:</span>
                                        <span className="font-semibold">{selectedRequest.proposal?.totalProductPrice?.toLocaleString()} đ</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phí dịch vụ:</span>
                                        <span className="font-semibold">{selectedRequest.proposal?.proxyFee?.toLocaleString()} đ</span>
                                    </div>
                                    <hr className="border-green-200" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Tổng cộng:</span>
                                        <span className="text-green-700">
                                            {((selectedRequest.proposal?.totalProductPrice || 0) + (selectedRequest.proposal?.proxyFee || 0)).toLocaleString()} đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ghi chú */}
                            {selectedRequest.proposal?.note && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-2">Ghi chú từ người đi chợ giúm:</h4>
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
                                
                                {selectedRequest.status === 'Proposed' && (
                                    <button
                                        onClick={() => handleApproveProposal(selectedRequest.id)}
                                        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                                        disabled={actionLoading}
                                    >
                                        <FiCheck />
                                        {actionLoading ? 'Đang xử lý...' : 'Duyệt & Thanh toán'}
                                    </button>
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
        </div>
    );
};

export default MyProxyRequests;
