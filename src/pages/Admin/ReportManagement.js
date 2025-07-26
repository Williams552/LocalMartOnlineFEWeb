import React, { useState, useEffect } from 'react';
import { FaFlag, FaEye, FaCheck, FaTimes, FaFilter, FaSearch, FaChevronDown } from 'react-icons/fa';
import reportService from '../../services/reportService';

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statistics, setStatistics] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        targetType: '',
        status: '',
        search: ''
    });

    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0
    });

    // Load reports
    const loadReports = async (page = 1) => {
        try {
            setLoading(true);
            const result = await reportService.getAllReports(page, pagination.pageSize, filters);

            if (result.success) {
                setReports(result.data.reports);
                setPagination(result.data.pagination);
                setError('');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Load statistics
    const loadStatistics = async () => {
        try {
            const result = await reportService.getReportStatistics();
            if (result.success) {
                setStatistics(result.data);
            }
        } catch (err) {
            console.error('Error loading statistics:', err);
        }
    };

    // Update report status
    const updateReportStatus = async (reportId, status) => {
        try {
            const result = await reportService.updateReportStatus(reportId, status);

            if (result.success) {
                // Refresh reports and statistics
                await Promise.all([loadReports(pagination.currentPage), loadStatistics()]);
                setShowDetailModal(false);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Apply filters
    const applyFilters = () => {
        loadReports(1);
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            targetType: '',
            status: '',
            search: ''
        });
        setTimeout(() => loadReports(1), 100);
    };

    // View report details
    const viewReportDetails = (report) => {
        setSelectedReport(report);
        setShowDetailModal(true);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusInfo = reportService.formatReportStatus(status);
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                {statusInfo.label}
            </span>
        );
    };

    // Get target type badge
    const getTargetTypeBadge = (targetType) => {
        const colors = {
            'Product': 'bg-blue-100 text-blue-800',
            'User': 'bg-green-100 text-green-800',
            'Seller': 'bg-purple-100 text-purple-800',
            'Buyer': 'bg-orange-100 text-orange-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[targetType] || 'bg-gray-100 text-gray-800'}`}>
                {targetType}
            </span>
        );
    };

    useEffect(() => {
        loadReports();
        loadStatistics();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaFlag className="mr-3 text-red-600" />
                    Quản lý báo cáo
                </h1>
                <p className="text-gray-600 mt-1">Xem và xử lý các báo cáo từ người dùng</p>
            </div>

            {/* Statistics */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaFlag className="text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Tổng báo cáo</p>
                                <p className="text-2xl font-semibold text-gray-900">{statistics.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <FaClock className="text-yellow-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Chờ xử lý</p>
                                <p className="text-2xl font-semibold text-gray-900">{statistics.byStatus.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaCheck className="text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Đã xử lý</p>
                                <p className="text-2xl font-semibold text-gray-900">{statistics.byStatus.resolved}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <FaTimes className="text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-500">Đã từ chối</p>
                                <p className="text-2xl font-semibold text-gray-900">{statistics.byStatus.dismissed}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <FaFilter className="mr-2" />
                        Bộ lọc
                    </h3>
                    <button
                        onClick={resetFilters}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Xóa bộ lọc
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại đối tượng
                        </label>
                        <select
                            value={filters.targetType}
                            onChange={(e) => handleFilterChange('targetType', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="Product">Sản phẩm</option>
                            <option value="User">Người dùng</option>
                            <option value="Seller">Người bán</option>
                            <option value="Buyer">Người mua</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="Pending">Chờ xử lý</option>
                            <option value="Resolved">Đã xử lý</option>
                            <option value="Dismissed">Đã từ chối</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Tìm kiếm..."
                                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={applyFilters}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Danh sách báo cáo ({pagination.totalCount})
                    </h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Đang tải...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-red-600 text-center">
                            <FaTimes className="mx-auto mb-2" size={24} />
                            <p>{error}</p>
                        </div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500 text-center">
                            <FaFlag className="mx-auto mb-2" size={24} />
                            <p>Không có báo cáo nào</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người báo cáo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Đối tượng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lý do
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {report.reporter.name?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {report.reporter.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {report.reporter.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                {getTargetTypeBadge(report.targetType)}
                                                <div className="text-sm text-gray-900 mt-1">
                                                    {report.targetInfo?.name || 'Không xác định'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {report.reason}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(report.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => viewReportDetails(report)}
                                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                            >
                                                <FaEye className="mr-1" />
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => loadReports(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => loadReports(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Hiển thị{' '}
                                    <span className="font-medium">
                                        {(pagination.currentPage - 1) * pagination.pageSize + 1}
                                    </span>{' '}
                                    đến{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}
                                    </span>{' '}
                                    trong{' '}
                                    <span className="font-medium">{pagination.totalCount}</span> kết quả
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => loadReports(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Trước
                                    </button>
                                    {[...Array(pagination.totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        if (
                                            page === 1 ||
                                            page === pagination.totalPages ||
                                            (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => loadReports(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.currentPage
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === pagination.currentPage - 2 ||
                                            page === pagination.currentPage + 2
                                        ) {
                                            return (
                                                <span
                                                    key={page}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                    <button
                                        onClick={() => loadReports(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Sau
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Report Detail Modal */}
            {showDetailModal && selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Chi tiết báo cáo</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FaTimes className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Report Info */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Thông tin báo cáo</h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">ID:</span>
                                        <span className="text-sm font-medium">{selectedReport.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Trạng thái:</span>
                                        {getStatusBadge(selectedReport.status)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Ngày tạo:</span>
                                        <span className="text-sm font-medium">{formatDate(selectedReport.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Ngày cập nhật:</span>
                                        <span className="text-sm font-medium">{formatDate(selectedReport.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reporter Info */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Người báo cáo</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                                            <span className="text-lg font-medium text-gray-700">
                                                {selectedReport.reporter.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {selectedReport.reporter.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {selectedReport.reporter.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Target Info */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Đối tượng bị báo cáo</h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Loại:</span>
                                        {getTargetTypeBadge(selectedReport.targetType)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">ID:</span>
                                        <span className="text-sm font-medium">{selectedReport.targetId}</span>
                                    </div>
                                    {selectedReport.targetInfo && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Tên:</span>
                                            <span className="text-sm font-medium">{selectedReport.targetInfo.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Lý do báo cáo</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">{selectedReport.reason}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedReport.status === 'Pending' && (
                                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => updateReportStatus(selectedReport.id, 'Resolved')}
                                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <FaCheck className="mr-2" />
                                        Chấp nhận báo cáo
                                    </button>
                                    <button
                                        onClick={() => updateReportStatus(selectedReport.id, 'Dismissed')}
                                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                                    >
                                        <FaTimes className="mr-2" />
                                        Từ chối báo cáo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportManagement;
