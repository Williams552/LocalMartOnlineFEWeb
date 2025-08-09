import React, { useState, useEffect, useCallback } from 'react';
import {
    FaFileAlt, FaEye, FaPlus, FaSpinner, FaExclamationTriangle,
    FaCheck, FaTimes, FaSearch, FaStore, FaBox, FaUser, FaImage
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import reportService from '../../services/reportService';
import ReportModal from '../../components/Report/ReportModal';

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        targetType: '',
        page: 1,
        pageSize: 10
    });

    const fetchMyReports = useCallback(async () => {
        try {
            setLoading(true);
            const result = await reportService.getMyReports(filters);

            if (result.success) {
                // API trả về { reports: [...] }
                const reportsData = result.data?.reports || result.data?.items || result.data || [];
                setReports(reportsData);
            } else {
                toast.error(result.message || 'Không thể tải danh sách báo cáo');
            }
        } catch (error) {
            console.error('Error fetching my reports:', error);
            toast.error('Có lỗi xảy ra khi tải báo cáo');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchMyReports();
    }, [fetchMyReports]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            page: 1
        }));
    };

    const handleReportCreated = () => {
        setShowReportModal(false);
        toast.success('Báo cáo đã được gửi thành công');
        fetchMyReports();
    };

    const getStatusBadge = (status) => {
        const statusInfo = reportService.formatReportStatus(status);
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                {statusInfo.label}
            </span>
        );
    };

    const getTargetTypeIcon = (targetType) => {
        const icons = {
            'Product': FaBox,
            'Store': FaStore,
            'Seller': FaUser,
            'Buyer': FaUser
        };
        const Icon = icons[targetType] || FaFileAlt;
        return <Icon className="text-gray-500" size={16} />;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return <FaExclamationTriangle className="text-yellow-500" size={16} />;
            case 'Resolved':
                return <FaCheck className="text-green-500" size={16} />;
            case 'Dismissed':
                return <FaTimes className="text-red-500" size={16} />;
            default:
                return <FaFileAlt className="text-gray-500" size={16} />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Báo cáo của tôi</h1>
                    <p className="text-gray-600">Quản lý các báo cáo mà bạn đã gửi</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng báo cáo</p>
                            <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                        </div>
                        <FaFileAlt className="text-blue-500" size={24} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Tìm theo mô tả..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả trạng thái</option>
                            {reportService.getStatusTypes().map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại đối tượng
                        </label>
                        <select
                            value={filters.targetType}
                            onChange={(e) => handleFilterChange('targetType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả loại</option>
                            {reportService.getTargetTypes().map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-lg shadow border">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <FaSpinner className="animate-spin text-blue-500" size={24} />
                        <span className="ml-2 text-gray-600">Đang tải báo cáo...</span>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-12">
                        <FaFileAlt className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600 mb-4">Bạn chưa có báo cáo nào</p>
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Gửi báo cáo đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {reports.map((report) => (
                            <div key={report.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className="flex items-center space-x-2">
                                            {getTargetTypeIcon(report.targetType)}
                                            {getStatusIcon(report.status)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {reportService.getTargetTypeLabel(report.targetType)} - {report.reason}
                                                </h3>
                                                {getStatusBadge(report.status)}
                                            </div>

                                            {/* Hiển thị tên đối tượng được báo cáo */}
                                            {report.targetName && (
                                                <p className="text-sm font-medium text-blue-600 mb-1">
                                                    🎯 {report.targetName}
                                                    {report.targetPrice && (
                                                        <span className="text-green-600 ml-2">
                                                            ({report.targetPrice.toLocaleString('vi-VN')}đ)
                                                        </span>
                                                    )}
                                                    {report.targetUnit && (
                                                        <span className="text-gray-500 ml-1">/{report.targetUnit}</span>
                                                    )}
                                                </p>
                                            )}

                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                {report.description || report.title}
                                            </p>

                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <span>ID: #{report.id.slice(-8)}</span>
                                                <span>•</span>
                                                <span>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</span>
                                                {report.targetName ? (
                                                    <>
                                                        <span>•</span>
                                                        <span>Đối tượng: {report.targetName}</span>
                                                    </>
                                                ) : report.targetId && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Đối tượng ID: {report.targetId.slice(-8)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedReport(report)}
                                        className="ml-4 text-blue-600 hover:text-blue-900"
                                        title="Xem chi tiết"
                                    >
                                        <FaEye size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-semibold">Chi tiết báo cáo</h3>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ID báo cáo</label>
                                    <p className="text-sm text-gray-900">{selectedReport.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại đối tượng</label>
                                    <p className="text-sm text-gray-900">{reportService.getTargetTypeLabel(selectedReport.targetType)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                    {getStatusBadge(selectedReport.status)}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ngày gửi</label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(selectedReport.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            </div>

                            {/* Thông tin đối tượng được báo cáo */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Thông tin đối tượng được báo cáo</h4>
                                {selectedReport.targetName ? (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-xs font-medium text-blue-700">Tên đối tượng</label>
                                            <p className="text-sm text-blue-900 font-medium">{selectedReport.targetName}</p>
                                        </div>

                                        {selectedReport.targetPrice && (
                                            <div>
                                                <label className="block text-xs font-medium text-blue-700">Giá</label>
                                                <p className="text-sm text-green-600 font-medium">
                                                    {selectedReport.targetPrice.toLocaleString('vi-VN')}đ
                                                    {selectedReport.targetUnit && <span className="text-gray-500">/{selectedReport.targetUnit}</span>}
                                                </p>
                                            </div>
                                        )}

                                        {selectedReport.targetImages && selectedReport.targetImages.length > 0 && (
                                            <div>
                                                <label className="block text-xs font-medium text-blue-700 mb-2">Hình ảnh sản phẩm</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedReport.targetImages.slice(0, 3).map((image, index) => (
                                                        <img
                                                            key={index}
                                                            src={image}
                                                            alt={`Sản phẩm ${index + 1}`}
                                                            className="w-16 h-16 object-cover rounded border"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ))}
                                                    {selectedReport.targetImages.length > 3 && (
                                                        <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                                            <span className="text-xs text-gray-500">+{selectedReport.targetImages.length - 3}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-medium text-blue-700">ID đối tượng</label>
                                            <p className="text-xs text-gray-500 font-mono">{selectedReport.targetId}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-medium text-blue-700">ID đối tượng</label>
                                        <p className="text-sm text-gray-900">{selectedReport.targetId}</p>
                                        <p className="text-xs text-red-500 mt-1">Không thể tải thông tin chi tiết đối tượng</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lý do báo cáo</label>
                                <p className="text-sm text-gray-900">{selectedReport.reason}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedReport.description || selectedReport.title}</p>
                            </div>

                            {selectedReport.evidenceImage && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bằng chứng</label>
                                    <img
                                        src={selectedReport.evidenceImage}
                                        alt="Bằng chứng"
                                        className="max-w-full h-auto max-h-64 rounded border"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                    <p className="text-sm text-red-500 hidden">Không thể tải hình ảnh bằng chứng</p>
                                </div>
                            )}

                            {/* Thông tin người báo cáo */}
                            {(selectedReport.reporterName || selectedReport.reporterPhone) && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-800 mb-2">Thông tin người báo cáo</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedReport.reporterName && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Tên</label>
                                                <p className="text-sm text-gray-900">{selectedReport.reporterName}</p>
                                            </div>
                                        )}
                                        {selectedReport.reporterPhone && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600">Số điện thoại</label>
                                                <p className="text-sm text-gray-900">{selectedReport.reporterPhone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedReport.status === 'Resolved' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <FaCheck className="text-green-600" size={16} />
                                        <span className="text-sm font-medium text-green-800">
                                            Báo cáo đã được giải quyết
                                        </span>
                                    </div>
                                    <p className="text-sm text-green-700 mt-1">
                                        Cảm ơn bạn đã báo cáo. Chúng tôi đã xử lý vấn đề này.
                                    </p>
                                    {selectedReport.adminResponse && (
                                        <div className="mt-2">
                                            <label className="block text-xs font-medium text-green-700">Phản hồi từ quản trị viên</label>
                                            <p className="text-sm text-green-800 bg-green-100 p-2 rounded mt-1">
                                                {selectedReport.adminResponse}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedReport.status === 'Dismissed' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <FaTimes className="text-red-600" size={16} />
                                        <span className="text-sm font-medium text-red-800">
                                            Báo cáo đã bị bác bỏ
                                        </span>
                                    </div>
                                    <p className="text-sm text-red-700 mt-1">
                                        Sau khi xem xét, chúng tôi xác định báo cáo này không vi phạm quy định.
                                    </p>
                                    {selectedReport.adminResponse && (
                                        <div className="mt-2">
                                            <label className="block text-xs font-medium text-red-700">Lý do từ quản trị viên</label>
                                            <p className="text-sm text-red-800 bg-red-100 p-2 rounded mt-1">
                                                {selectedReport.adminResponse}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <ReportModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    onReportCreated={handleReportCreated}
                />
            )}
        </div>
    );
};

export default MyReports;
