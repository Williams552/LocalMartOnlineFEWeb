import React, { useState, useEffect } from 'react';
import { FaHeadset, FaPlus, FaEye, FaClock, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import SupportService from '../../services/supportService';
import SupportRequestModal from '../../components/Support/SupportRequestModal';
import authService from '../../services/authService';
import toastService from '../../services/toastService';

const SupportRequestPage = () => {
    const [supportRequests, setSupportRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        fetchSupportRequests();
    }, []);

    const fetchSupportRequests = async () => {
        try {
            const userId = authService.getCurrentUserId();
            if (!userId) {
                toastService.error('Vui lòng đăng nhập để xem yêu cầu hỗ trợ');
                return;
            }

            const response = await SupportService.getUserSupportRequests(userId);
            if (response.success) {
                setSupportRequests(response.data || []);
            } else {
                toastService.error(response.message || 'Không thể tải danh sách yêu cầu hỗ trợ');
            }
        } catch (error) {
            console.error('Error fetching support requests:', error);
            toastService.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleNewRequest = () => {
        setShowModal(true);
    };

    const handleRequestSuccess = (newRequest) => {
        fetchSupportRequests(); // Refresh the list
    };

    const handleViewDetail = (request) => {
        setSelectedRequest(request);
        setShowDetail(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open':
                return 'text-blue-600 bg-blue-100';
            case 'InProgress':
                return 'text-yellow-600 bg-yellow-100';
            case 'Resolved':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open':
                return <FaClock className="text-blue-600" />;
            case 'InProgress':
                return <FaSpinner className="text-yellow-600" />;
            case 'Resolved':
                return <FaCheckCircle className="text-green-600" />;
            default:
                return <FaExclamationTriangle className="text-gray-600" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Open':
                return 'Chờ xử lý';
            case 'InProgress':
                return 'Đang xử lý';
            case 'Resolved':
                return 'Đã giải quyết';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <FaHeadset className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Yêu cầu hỗ trợ</h1>
                                <p className="text-gray-600">Quản lý các yêu cầu hỗ trợ của bạn</p>
                            </div>
                        </div>
                        <button
                            onClick={handleNewRequest}
                            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <FaPlus />
                            <span>Tạo yêu cầu mới</span>
                        </button>
                    </div>
                </div>

                {/* Support Requests List */}
                {supportRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <FaHeadset className="text-gray-300 text-6xl mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Chưa có yêu cầu hỗ trợ nào
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Bạn chưa có yêu cầu hỗ trợ nào. Hãy tạo yêu cầu mới nếu cần hỗ trợ.
                        </p>
                        <button
                            onClick={handleNewRequest}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Tạo yêu cầu đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {supportRequests.map((request) => (
                            <div key={request.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {request.subject}
                                                </h3>
                                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                    {getStatusIcon(request.status)}
                                                    <span>{getStatusText(request.status)}</span>
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-3 line-clamp-2">
                                                {request.description}
                                            </p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>Tạo: {formatDate(request.createdAt)}</span>
                                                {request.updatedAt !== request.createdAt && (
                                                    <span>Cập nhật: {formatDate(request.updatedAt)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewDetail(request)}
                                            className="ml-4 flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            <FaEye />
                                            <span className="text-sm">Xem chi tiết</span>
                                        </button>
                                    </div>

                                    {/* Response Preview */}
                                    {request.response && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <div className="flex items-start space-x-2">
                                                    <FaCheckCircle className="text-green-500 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-green-800 mb-1">
                                                            Phản hồi từ đội ngũ hỗ trợ:
                                                        </p>
                                                        <p className="text-sm text-green-700 line-clamp-2">
                                                            {request.response}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Support Request Modal */}
                <SupportRequestModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleRequestSuccess}
                />

                {/* Detail Modal */}
                {showDetail && selectedRequest && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                            {getStatusIcon(selectedRequest.status)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Chi tiết yêu cầu hỗ trợ</h3>
                                            <p className="text-blue-100 text-sm">{getStatusText(selectedRequest.status)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDetail(false)}
                                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
                                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.subject}</p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả vấn đề</label>
                                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                                            {selectedRequest.description}
                                        </p>
                                    </div>

                                    {/* Response */}
                                    {selectedRequest.response && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phản hồi từ đội ngũ hỗ trợ</label>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <p className="text-green-900 whitespace-pre-wrap">
                                                    {selectedRequest.response}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian</label>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Tạo yêu cầu:</span>
                                                <span className="text-gray-900">{formatDate(selectedRequest.createdAt)}</span>
                                            </div>
                                            {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600">Cập nhật cuối:</span>
                                                    <span className="text-gray-900">{formatDate(selectedRequest.updatedAt)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowDetail(false)}
                                        className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportRequestPage;
