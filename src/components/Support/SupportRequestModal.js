import React, { useState } from 'react';
import { FaTimes, FaHeadset, FaPaperPlane } from 'react-icons/fa';
import SupportService from '../../services/supportService';
import authService from '../../services/authService';
import toastService from '../../services/toastService';

const SupportRequestModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        subject: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const predefinedSubjects = [
        'Hỗ trợ đặt hàng',
        'Vấn đề thanh toán',
        'Hỗ trợ giao hàng',
        'Khiếu nại sản phẩm',
        'Hỗ trợ tài khoản',
        'Báo cáo lỗi hệ thống',
        'Hỗ trợ người bán',
        'Khác'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.subject.trim()) {
            newErrors.subject = 'Vui lòng chọn chủ đề';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Vui lòng mô tả vấn đề của bạn';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const userId = authService.getCurrentUserId();
        if (!userId) {
            toastService.error('Vui lòng đăng nhập để gửi yêu cầu hỗ trợ');
            return;
        }

        setLoading(true);

        try {
            const response = await SupportService.createSupportRequest(userId, formData);

            if (response.success) {
                toastService.success('Đã gửi yêu cầu hỗ trợ thành công! Chúng tôi sẽ phản hồi sớm nhất.');
                setFormData({ subject: '', description: '' });
                setErrors({});
                onSuccess && onSuccess(response.data);
                onClose();
            } else {
                toastService.error(response.message || 'Có lỗi xảy ra khi gửi yêu cầu');
            }
        } catch (error) {
            console.error('Error submitting support request:', error);
            const errorMessage = error.message || 'Có lỗi xảy ra khi gửi yêu cầu hỗ trợ';
            toastService.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({ subject: '', description: '' });
            setErrors({});
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <FaHeadset className="text-white text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Yêu cầu hỗ trợ</h3>
                                <p className="text-blue-100 text-sm">Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors disabled:opacity-50"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Subject Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chủ đề hỗ trợ <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                disabled={loading}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.subject ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Chọn chủ đề...</option>
                                {predefinedSubjects.map((subject, index) => (
                                    <option key={index} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                            {errors.subject && (
                                <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                            )}
                        </div>

                        {/* Custom Subject Input */}
                        {formData.subject === 'Khác' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chủ đề tùy chỉnh <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="customSubject"
                                    placeholder="Nhập chủ đề của bạn..."
                                    maxLength={100}
                                    disabled={loading}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả vấn đề <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Hãy mô tả chi tiết vấn đề bạn gặp phải để chúng tôi có thể hỗ trợ tốt nhất..."
                                rows={4}
                                maxLength={1000}
                                disabled={loading}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {errors.description && (
                                    <p className="text-red-500 text-xs">{errors.description}</p>
                                )}
                                <p className="text-gray-400 text-xs ml-auto">
                                    {formData.description.length}/1000
                                </p>
                            </div>
                        </div>

                        {/* Support Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <FaHeadset className="text-blue-500 text-lg mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                                        Thời gian phản hồi
                                    </h4>
                                    <p className="text-xs text-blue-600">
                                        • Các vấn đề thường gặp: 2-4 giờ<br />
                                        • Vấn đề kỹ thuật: 4-8 giờ<br />
                                        • Vấn đề phức tạp: 1-2 ngày làm việc
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.subject.trim() || !formData.description.trim()}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane />
                                        <span>Gửi yêu cầu</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupportRequestModal;
