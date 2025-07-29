import React, { useState, useEffect } from 'react';
import {
    FaExclamationTriangle,
    FaEye,
    FaFilter,
    FaSearch,
    FaSyncAlt,
    FaUser,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaSpinner
} from 'react-icons/fa';
import SellerLayout from '../../layouts/SellerLayout';
import reportService from '../../services/reportService';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const UserReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportDetail, setShowReportDetail] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        page: 1,
        limit: 20
    });

    useEffect(() => {
        fetchUserReports();
    }, [filters]);

    const fetchUserReports = async () => {
        try {
            setLoading(true);
            setError("");

            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                setError("Không tìm thấy thông tin người dùng");
                return;
            }

            console.log('🔍 Fetching my reports for user:', currentUser.id);

            const params = {
                ...filters,
                status: filters.status === 'all' ? undefined : filters.status
            };

            // Sử dụng getMyReports để lấy báo cáo của người dùng hiện tại
            const result = await reportService.getMyReports(params);

            if (result.success) {
                // API trả về { reports: [...] }
                const reportsData = Array.isArray(result.data?.reports) ? result.data.reports : 
                                  Array.isArray(result.data?.items) ? result.data.items :
                                  Array.isArray(result.data) ? result.data : [];
                console.log('✅ Reports loaded:', reportsData.length, 'reports');
                setReports(reportsData);
            } else {
                setError(result.message || 'Không thể tải danh sách báo cáo');
            }

        } catch (error) {
            console.error('❌ Error fetching user reports:', error);
            setError('Không thể tải danh sách báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setShowReportDetail(true);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset page when filter changes
        }));
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800', icon: FaClock },
            'Resolved': { label: 'Đã giải quyết', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
            'Dismissed': { label: 'Đã bác bỏ', color: 'bg-red-100 text-red-800', icon: FaTimesCircle }
        };

        const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: FaClock };
        const IconComponent = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.label}
            </span>
        );
    };

    const getReasonBadge = (reason) => {
        const reasonConfig = {
            'Spam': { label: 'Spam', color: 'bg-orange-100 text-orange-800' },
            'Inappropriate': { label: 'Không phù hợp', color: 'bg-red-100 text-red-800' },
            'Fraud': { label: 'Lừa đảo', color: 'bg-purple-100 text-purple-800' },
            'Violation': { label: 'Vi phạm', color: 'bg-blue-100 text-blue-800' },
            'Other': { label: 'Khác', color: 'bg-gray-100 text-gray-800' }
        };

        const config = reasonConfig[reason] || { label: reason, color: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = (report.id || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (report.targetName || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (report.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (report.reason || '').toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus = filters.status === 'all' || report.status === filters.status;
        return matchesSearch && matchesStatus;
    });

    return (
        <SellerLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <FaExclamationTriangle className="mr-3 text-orange-600" />
                                Báo cáo của tôi
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Xem và theo dõi các báo cáo mà bạn đã gửi về sản phẩm, cửa hàng và người dùng khác
                            </p>
                        </div>
                        <button
                            onClick={fetchUserReports}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                        >
                            <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Tải lại
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo mã báo cáo, đối tượng báo cáo..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="Pending">Chờ xử lý</option>
                                <option value="Resolved">Đã giải quyết</option>
                                <option value="Dismissed">Đã bác bỏ</option>
                            </select>
                        </div>

                        {/* Report Count */}
                        <div className="flex items-end">
                            <div className="text-sm text-gray-600">
                                Hiển thị {filteredReports.length} báo cáo
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reports List */}
                <div className="bg-white rounded-lg shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center">
                            <FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Đang tải danh sách báo cáo...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <FaExclamationTriangle className="text-4xl text-red-400 mx-auto mb-4" />
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={fetchUserReports}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="p-8 text-center">
                            <FaExclamationTriangle className="text-4xl text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Chưa có báo cáo nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Báo cáo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Đối tượng báo cáo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loại & Lý do
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{report.id}
                                                </div>
                                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                                    {report.title || report.reason || 'Không có tiêu đề'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {report.targetName || 'Không xác định'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {report.targetType} - ID: {report.targetId || 'N/A'}
                                                        </div>
                                                        {report.targetPrice && (
                                                            <div className="text-sm text-green-600">
                                                                {new Intl.NumberFormat('vi-VN', { 
                                                                    style: 'currency', 
                                                                    currency: 'VND' 
                                                                }).format(report.targetPrice)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="text-xs font-medium text-gray-600">
                                                        {report.targetType}
                                                    </div>
                                                    {getReasonBadge(report.reason)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(report.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(report.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewReport(report)}
                                                    className="text-supply-primary hover:text-green-600 flex items-center"
                                                >
                                                    <FaEye className="mr-1" />
                                                    Xem
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Report Detail Modal */}
                {showReportDetail && selectedReport && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <FaExclamationTriangle className="mr-2 text-orange-600" />
                                    Chi tiết báo cáo: #{selectedReport.id}
                                </h3>
                                <button
                                    onClick={() => setShowReportDetail(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Report Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                            <FaExclamationTriangle className="mr-2" />
                                            Thông tin báo cáo
                                        </h4>
                                        <div className="space-y-2">
                                            <p><strong>Mã báo cáo:</strong> #{selectedReport.id}</p>
                                            <p><strong>Tiêu đề:</strong> {selectedReport.title || 'Không có tiêu đề'}</p>
                                            <p><strong>Trạng thái:</strong> {getStatusBadge(selectedReport.status)}</p>
                                            <p><strong>Ngày tạo:</strong> {formatDate(selectedReport.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/* Target Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                            <FaUser className="mr-2" />
                                            Đối tượng báo cáo
                                        </h4>
                                        <div className="space-y-2">
                                            <p><strong>Loại:</strong> {selectedReport.targetType}</p>
                                            <p><strong>Tên:</strong> {selectedReport.targetName || 'Không xác định'}</p>
                                            <p><strong>ID:</strong> {selectedReport.targetId || 'N/A'}</p>
                                            {selectedReport.targetPrice && (
                                                <p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { 
                                                    style: 'currency', 
                                                    currency: 'VND' 
                                                }).format(selectedReport.targetPrice)}</p>
                                            )}
                                            {selectedReport.targetUnit && (
                                                <p><strong>Đơn vị:</strong> {selectedReport.targetUnit}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Report Content */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Nội dung báo cáo
                                    </h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {selectedReport.reason || 'Không có nội dung chi tiết'}
                                    </p>
                                </div>

                                {/* Target Images */}
                                {selectedReport.targetImages && selectedReport.targetImages.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <h4 className="font-medium text-gray-900 mb-3">
                                            Hình ảnh đối tượng
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {selectedReport.targetImages.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt={`${selectedReport.targetName} ${index + 1}`}
                                                    className="w-full h-20 object-cover rounded border"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Response */}
                                {selectedReport.adminResponse && (
                                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                        <h4 className="font-medium text-gray-900 mb-3">
                                            Phản hồi từ quản trị viên
                                        </h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {selectedReport.adminResponse}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end px-6 py-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowReportDetail(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
};

export default UserReportsPage;
