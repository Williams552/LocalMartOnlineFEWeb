import React, { useState } from 'react';
import { FaFlag, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import reportService from '../../services/reportService';

const ReportModal = ({ isOpen, onClose, product, onSuccess }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const reportReasons = reportService.getReportReasons();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedReason) {
            setError('Vui lòng chọn lý do báo cáo');
            return;
        }

        if (selectedReason === 'other' && !customReason.trim()) {
            setError('Vui lòng nhập lý do cụ thể');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const reportData = {
                targetType: 'Product',
                targetId: product.id,
                reason: selectedReason === 'other' ? customReason : selectedReason
            };

            const result = await reportService.createReport(reportData);

            if (result.success) {
                onSuccess && onSuccess(result.data);
                onClose();
                // Reset form
                setSelectedReason('');
                setCustomReason('');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setSelectedReason('');
        setCustomReason('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <FaFlag className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Báo cáo sản phẩm</h3>
                            <p className="text-sm text-gray-500">Báo cáo vấn đề với sản phẩm này</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        <FaTimes className="text-gray-400" />
                    </button>
                </div>

                {/* Product Info */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <img
                            src={product.image || '/default-product.jpg'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                            <p className="text-sm text-gray-500">
                                Giá: {product.price?.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Chọn lý do báo cáo <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                {reportReasons.map((reason) => (
                                    <label
                                        key={reason.value}
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedReason === reason.value
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={reason.value}
                                            checked={selectedReason === reason.value}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="text-red-600 focus:ring-red-500"
                                            disabled={isSubmitting}
                                        />
                                        <span className="ml-3 text-sm text-gray-700">{reason.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Custom reason input */}
                        {selectedReason === 'other' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả chi tiết <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Vui lòng mô tả cụ thể vấn đề..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                    disabled={isSubmitting}
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {customReason.length}/500 ký tự
                                </p>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        {/* Warning note */}
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                                <FaExclamationTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-700">
                                    <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Báo cáo sai sự thật có thể bị xử lý</li>
                                        <li>• Chúng tôi sẽ xem xét báo cáo trong 24-48 giờ</li>
                                        <li>• Thông tin báo cáo được bảo mật</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Đang gửi...</span>
                                </div>
                            ) : (
                                'Gửi báo cáo'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
