import React, { useState, useCallback, useMemo } from 'react';
import { FaTimes, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import reportService from '../../services/reportService';

// Constants
const FORM_VALIDATION = {
    EVIDENCE_MAX_LENGTH: 300,
    CUSTOM_TITLE_MIN_LENGTH: 10,
    CUSTOM_TITLE_MAX_LENGTH: 100,
    REASON_MIN_LENGTH: 20,
    REASON_MAX_LENGTH: 500
};

const INITIAL_FORM_STATE = {
    reason: '',
    customTitle: '',
    reasonContent: '',
    evidence: ''
};

const ReportModal = ({ 
    isOpen,
    onClose,
    targetType = 'Product',
    targetId,
    targetName,
    targetInfo = null,
    onSuccess
}) => {
    // State management
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Memoized values
    const reasons = useMemo(() => reportService.getReportReasons(), []);
    const targetTypeLabel = useMemo(() => 
        reportService.getTargetTypeLabel(targetType), [targetType]
    );

    // Form validation
    const validateForm = useCallback(() => {
        const newErrors = {};
        
        if (!formData.reason) {
            newErrors.reason = 'Vui lòng chọn lý do báo cáo';
        }
        
        // Validate custom title if "other" reason is selected
        if (formData.reason === 'other') {
            const customTitle = formData.customTitle.trim();
            if (!customTitle) {
                newErrors.customTitle = 'Vui lòng nhập tiêu đề báo cáo';
            } else if (customTitle.length < FORM_VALIDATION.CUSTOM_TITLE_MIN_LENGTH) {
                newErrors.customTitle = `Tiêu đề phải có ít nhất ${FORM_VALIDATION.CUSTOM_TITLE_MIN_LENGTH} ký tự`;
            } else if (customTitle.length > FORM_VALIDATION.CUSTOM_TITLE_MAX_LENGTH) {
                newErrors.customTitle = `Tiêu đề không được vượt quá ${FORM_VALIDATION.CUSTOM_TITLE_MAX_LENGTH} ký tự`;
            }
        }
        
        // Validate reason content
        const reasonContent = formData.reasonContent.trim();
        if (!reasonContent) {
            newErrors.reasonContent = 'Vui lòng mô tả nội dung báo cáo';
        } else if (reasonContent.length < FORM_VALIDATION.REASON_MIN_LENGTH) {
            newErrors.reasonContent = `Nội dung phải có ít nhất ${FORM_VALIDATION.REASON_MIN_LENGTH} ký tự`;
        } else if (reasonContent.length > FORM_VALIDATION.REASON_MAX_LENGTH) {
            newErrors.reasonContent = `Nội dung không được vượt quá ${FORM_VALIDATION.REASON_MAX_LENGTH} ký tự`;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Input change handler
    const handleInputChange = useCallback((e) => {
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
    }, [errors]);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData(INITIAL_FORM_STATE);
        setErrors({});
    }, []);

    // Form submission
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            console.log('📋 ReportModal - Submitting report:', {
                targetType,
                targetId,
                ...formData
            });

            // Build report data matching CreateReportDto
            const reportData = {
                targetType,
                targetId,
                title: formData.reason === 'other' 
                    ? formData.customTitle.trim()
                    : reasons.find(r => r.value === formData.reason)?.label || `Báo cáo ${targetTypeLabel}: ${targetName}`,
                reason: formData.reasonContent.trim(),
                evidenceImage: formData.evidence.trim() || null
            };

            const result = await reportService.createReport(reportData);
            
            if (result.success) {
                toast.success(result.message || 'Báo cáo đã được gửi thành công');
                onSuccess?.(result.data);
                onClose();
                resetForm();
            } else {
                toast.error(result.message || 'Có lỗi xảy ra khi gửi báo cáo');
            }
        } catch (error) {
            console.error('❌ ReportModal - Error submitting report:', error);
            toast.error('Có lỗi xảy ra khi gửi báo cáo');
        } finally {
            setLoading(false);
        }
    }, [formData, targetType, targetId, targetName, targetTypeLabel, reasons, validateForm, onSuccess, onClose, resetForm]);

    // Close handler
    const handleClose = useCallback(() => {
        if (loading) return;
        onClose();
        resetForm();
    }, [loading, onClose, resetForm]);

    // Render form field with error handling
    const renderFormField = useCallback(({ 
        label, 
        name, 
        type = 'text', 
        required = false, 
        placeholder = '', 
        rows = null,
        maxLength = null,
        children = null 
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'select' ? (
                <select
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10 bg-white text-gray-900 ${
                        errors[name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                    style={{ zIndex: 60, color: '#374151', backgroundColor: 'white' }}
                >
                    {children}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    rows={rows}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-gray-900 placeholder-gray-500 ${
                        errors[name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                    style={{ color: '#374151', backgroundColor: 'white' }}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
                        errors[name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                    style={{ color: '#374151', backgroundColor: 'white' }}
                />
            )}
            {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
            {maxLength && type === 'textarea' && (
                <p className="text-gray-500 text-sm mt-1 text-right">
                    {formData[name].length}/{maxLength}
                </p>
            )}
        </div>
    ), [formData, errors, handleInputChange, loading]);

    // Early return if not open
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <FaExclamationTriangle className="text-red-500" size={24} />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Báo cáo {targetTypeLabel.toLowerCase()}
                            </h3>
                            <p className="text-sm text-gray-600">{targetName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-50"
                        aria-label="Đóng"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Target Info */}
                    {targetInfo && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                                Thông tin đối tượng báo cáo:
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-medium">Loại:</span> {targetTypeLabel}</p>
                                <p><span className="font-medium">Tên:</span> {targetName}</p>
                                {targetInfo.id && (
                                    <p><span className="font-medium">ID:</span> {targetInfo.id}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reason Selection */}
                    {renderFormField({
                        label: 'Lý do báo cáo',
                        name: 'reason',
                        type: 'select',
                        required: true,
                        children: (
                            <>
                                <option value="" style={{ color: '#6B7280', backgroundColor: 'white' }}>Chọn lý do báo cáo</option>
                                {reasons.map((reason) => (
                                    <option key={reason.value} value={reason.value} style={{ color: '#374151', backgroundColor: 'white' }}>
                                        {reason.label}
                                    </option>
                                ))}
                            </>
                        )
                    })}

                    {/* Custom Title - Only show if "other" is selected */}
                    {formData.reason === 'other' && renderFormField({
                        label: 'Tiêu đề báo cáo',
                        name: 'customTitle',
                        type: 'text',
                        required: true,
                        maxLength: FORM_VALIDATION.CUSTOM_TITLE_MAX_LENGTH,
                        placeholder: 'Nhập tiêu đề cụ thể cho báo cáo của bạn...'
                    })}

                    {/* Reason Content */}
                    {renderFormField({
                        label: 'Nội dung báo cáo',
                        name: 'reasonContent',
                        type: 'textarea',
                        required: true,
                        rows: 4,
                        maxLength: FORM_VALIDATION.REASON_MAX_LENGTH,
                        placeholder: 'Mô tả chi tiết vấn đề bạn gặp phải...'
                    })}

                    {/* Evidence Image URL */}
                    {renderFormField({
                        label: 'Bằng chứng hình ảnh (tùy chọn)',
                        name: 'evidence',
                        type: 'url',
                        maxLength: FORM_VALIDATION.EVIDENCE_MAX_LENGTH,
                        placeholder: 'Nhập URL hình ảnh bằng chứng (nếu có)...'
                    })}

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <FaExclamationTriangle className="text-yellow-500 mt-0.5" size={16} />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Báo cáo sai sự thật có thể dẫn đến việc bị khóa tài khoản</li>
                                    <li>Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ</li>
                                    <li>Thông tin cá nhân của bạn sẽ được bảo mật</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    <span>Đang gửi...</span>
                                </>
                            ) : (
                                <span>Gửi báo cáo</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );};

export default ReportModal;
