import React, { useState } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import adminProxyShoppingService from '../../services/adminProxyShoppingService';

const StatusUpdateModal = ({ request, type, onClose, onStatusUpdated }) => {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isRequestType = type === 'request';
    const currentStatus = isRequestType ? request.status : request.orderStatus;
    
    const statusOptions = isRequestType 
        ? adminProxyShoppingService.getProxyRequestStatusOptions()
        : adminProxyShoppingService.getProxyOrderStatusOptions();

    const getStatusLabel = (status) => {
        return isRequestType 
            ? adminProxyShoppingService.getRequestStatusLabel(status)
            : adminProxyShoppingService.getOrderStatusLabel(status);
    };

    const handleUpdateStatus = async () => {
        if (!selectedStatus || selectedStatus === currentStatus) {
            setError('Vui lòng chọn trạng thái mới');
            return;
        }

        try {
            setLoading(true);
            setError('');

            let result;
            if (isRequestType) {
                result = await adminProxyShoppingService.updateProxyRequestStatus(request.id, selectedStatus);
            } else {
                // Kiểm tra điều kiện để cập nhật order status
                if (!request.proxyOrderId) {
                    setError('Không tìm thấy ID đơn hàng proxy. Vui lòng tải lại dữ liệu.');
                    return;
                }
                result = await adminProxyShoppingService.updateProxyOrderStatus(request.proxyOrderId, selectedStatus);
            }

            if (result.success) {
                onStatusUpdated();
            } else {
                setError(result.error || 'Có lỗi xảy ra khi cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setLoading(false);
        }
    };

    const getStatusChangeWarning = () => {
        if (!selectedStatus) return null;

        const warnings = {
            'Cancelled': 'Thao tác này sẽ hủy yêu cầu/đơn hàng và không thể hoàn tác.',
            'Expired': 'Thao tác này sẽ đánh dấu yêu cầu/đơn hàng đã hết hạn.',
            'Completed': 'Thao tác này sẽ đánh dấu yêu cầu/đơn hàng đã hoàn thành.',
            'Locked': 'Thao tác này sẽ khóa yêu cầu, không cho phép proxy shopper khác nhận.'
        };

        return warnings[selectedStatus];
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        Cập nhật trạng thái {isRequestType ? 'yêu cầu' : 'đơn hàng'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">

                    {/* Request Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">
                            {isRequestType ? 'Yêu cầu' : 'Đơn hàng'} #{request.id?.substring(0, 8)}
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                            {request.buyerName}
                        </div>
                        <div className="text-sm text-gray-600">
                            Trạng thái hiện tại: <span className="font-medium">{getStatusLabel(currentStatus)}</span>
                        </div>
                        {!isRequestType && (
                            <div className="text-sm text-gray-500 mt-1">
                                Proxy Order ID: {request.proxyOrderId || 'Chưa có'}
                            </div>
                        )}
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái mới
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setError('');
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Chọn trạng thái mới</option>
                            {statusOptions.map(option => (
                                <option 
                                    key={option.value} 
                                    value={option.value}
                                    disabled={option.value === currentStatus}
                                >
                                    {option.label} {option.value === currentStatus ? '(hiện tại)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Warning */}
                    {getStatusChangeWarning() && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                                <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-yellow-800">
                                    <div className="font-medium mb-1">Cảnh báo</div>
                                    <div>{getStatusChangeWarning()}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <FiAlertCircle className="w-5 h-5 text-red-600" />
                                <div className="text-sm text-red-800">{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Status Descriptions */}
                    {selectedStatus && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="text-sm text-blue-800">
                                <div className="font-medium mb-1">Mô tả trạng thái</div>
                                <div>
                                    {isRequestType ? getRequestStatusDescription(selectedStatus) : getOrderStatusDescription(selectedStatus)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleUpdateStatus}
                        disabled={!selectedStatus || selectedStatus === currentStatus || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang cập nhật...</span>
                            </>
                        ) : (
                            <>
                                <FiCheck className="w-4 h-4" />
                                <span>Cập nhật</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper functions for status descriptions
const getRequestStatusDescription = (status) => {
    const descriptions = {
        'Open': 'Yêu cầu đang mở, proxy shopper có thể nhận và tạo đề xuất.',
        'Locked': 'Yêu cầu đã bị khóa, không cho phép proxy shopper khác tham gia.',
        'Completed': 'Yêu cầu đã hoàn thành thành công.',
        'Cancelled': 'Yêu cầu đã bị hủy bởi người mua hoặc admin.',
        'Expired': 'Yêu cầu đã hết hạn và không còn hiệu lực.'
    };
    return descriptions[status] || '';
};

const getOrderStatusDescription = (status) => {
    const descriptions = {
        'Draft': 'Đơn hàng đang được soạn thảo bởi proxy shopper.',
        'Proposed': 'Đơn hàng đã được đề xuất và đang chờ phê duyệt từ người mua.',
        'Paid': 'Đơn hàng đã được thanh toán và proxy shopper có thể bắt đầu mua hàng.',
        'InProgress': 'Proxy shopper đang thực hiện mua hàng.',
        'Completed': 'Đơn hàng đã hoàn thành và giao hàng thành công.',
        'Cancelled': 'Đơn hàng đã bị hủy.',
        'Expired': 'Đơn hàng đã hết hạn.'
    };
    return descriptions[status] || '';
};

export default StatusUpdateModal;
