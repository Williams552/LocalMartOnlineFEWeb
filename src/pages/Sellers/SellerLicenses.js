import React, { useState, useEffect } from "react";
import {
    FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter,
    FaFileAlt, FaCheck, FaTimes, FaClock, FaCalendarAlt,
    FaDownload, FaUpload, FaSpinner, FaChevronLeft,
    FaChevronRight, FaExclamationTriangle, FaInfoCircle
} from "react-icons/fa";
import SellerLayout from "../../layouts/SellerLayout";
import licenseService from "../../services/licenseService";
import sellerRegistrationService from "../../services/sellerRegistrationService";
import { getCurrentUser } from "../../services/authService";
import toastService from "../../services/toastService";

const SellerLicenses = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // State for API data
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [userRegistration, setUserRegistration] = useState(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedLicense, setSelectedLicense] = useState(null);

    // Form state
    const [licenseForm, setLicenseForm] = useState({
        licenseType: '',
        licenseNumber: '',
        licenseUrl: '',
        issueDate: '',
        expiryDate: '',
        issuingAuthority: ''
    });
    const [formLoading, setFormLoading] = useState(false);

    const currentUser = getCurrentUser();
    const pageSize = 10;

    // License types
    const licenseTypes = [
        { value: 'BusinessLicense', label: 'Giấy phép kinh doanh' },
        { value: 'FoodSafetyCertificate', label: 'Chứng nhận an toàn thực phẩm' },
        { value: 'TaxRegistration', label: 'Đăng ký thuế' },
        { value: 'EnvironmentalPermit', label: 'Giấy phép môi trường' },
        { value: 'Other', label: 'Khác' }
    ];

    // Status options
    const statusOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'Pending', label: 'Chờ duyệt' },
        { value: 'Verified', label: 'Đã duyệt' },
        { value: 'Rejected', label: 'Bị từ chối' }
    ];

    // Load licenses
    const loadLicenses = async (page = 1, showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const params = {
                page,
                pageSize,
                status: filterStatus === 'all' ? '' : filterStatus,
                licenseType: filterType === 'all' ? '' : filterType
            };

            const response = await licenseService.getMyLicenses(params);

            if (response && response.licenses) {
                setLicenses(response.licenses);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.totalCount || 0);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error loading licenses:', error);
            toastService.error('Không thể tải danh sách giấy phép');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadUserRegistration();
    }, []);

    useEffect(() => {
        if (userRegistration) {
            loadLicenses();
        }
    }, [filterStatus, filterType, sortBy, userRegistration]);

    // Load user registration
    const loadUserRegistration = async () => {
        try {
            const registration = await sellerRegistrationService.getMyRegistration();
            setUserRegistration(registration);
        } catch (error) {
            console.error('Error loading user registration:', error);
            toastService.error('Không thể tải thông tin đăng ký seller');
        }
    };

    // Reset form
    const resetForm = () => {
        setLicenseForm({
            licenseType: '',
            licenseNumber: '',
            licenseUrl: '',
            issueDate: '',
            expiryDate: '',
            issuingAuthority: ''
        });
    };

    // Handle add license
    const handleAddLicense = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            // Check if user has registration
            if (!userRegistration || !userRegistration.id) {
                toastService.error('Bạn cần có đăng ký seller để thêm giấy phép');
                return;
            }

            const licenseData = {
                ...licenseForm,
                registrationId: userRegistration.id
            };

            await licenseService.createLicense(licenseData);
            toastService.success('Thêm giấy phép thành công');
            setShowAddModal(false);
            resetForm();
            loadLicenses();
        } catch (error) {
            console.error('Error adding license:', error);
            toastService.error('Không thể thêm giấy phép');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle edit license
    const handleEditLicense = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            await licenseService.updateLicense(selectedLicense.id, licenseForm);
            toastService.success('Cập nhật giấy phép thành công');
            setShowEditModal(false);
            setSelectedLicense(null);
            resetForm();
            loadLicenses();
        } catch (error) {
            console.error('Error updating license:', error);
            toastService.error('Không thể cập nhật giấy phép');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle delete license
    const handleDeleteLicense = async (licenseId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa giấy phép này?')) {
            return;
        }

        try {
            await licenseService.deleteLicense(licenseId);
            toastService.success('Xóa giấy phép thành công');
            loadLicenses();
        } catch (error) {
            console.error('Error deleting license:', error);
            toastService.error('Không thể xóa giấy phép');
        }
    };

    // Open edit modal
    const openEditModal = (license) => {
        setSelectedLicense(license);
        setLicenseForm({
            licenseType: license.licenseType,
            licenseNumber: license.licenseNumber || '',
            licenseUrl: license.licenseUrl,
            issueDate: license.issueDate ? new Date(license.issueDate).toISOString().split('T')[0] : '',
            expiryDate: license.expiryDate ? new Date(license.expiryDate).toISOString().split('T')[0] : '',
            issuingAuthority: license.issuingAuthority || ''
        });
        setShowEditModal(true);
    };

    // Open view modal
    const openViewModal = (license) => {
        setSelectedLicense(license);
        setShowViewModal(true);
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const badges = {
            Pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, text: 'Chờ duyệt' },
            Verified: { color: 'bg-green-100 text-green-800', icon: FaCheck, text: 'Đã duyệt' },
            Rejected: { color: 'bg-red-100 text-red-800', icon: FaTimes, text: 'Bị từ chối' }
        };

        const badge = badges[status] || badges.Pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {badge.text}
            </span>
        );
    };

    // Get license type label
    const getLicenseTypeLabel = (type) => {
        const typeObj = licenseTypes.find(t => t.value === type);
        return typeObj ? typeObj.label : type;
    };

    // Check if license is expired
    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    // Check if license is expiring soon (within 30 days)
    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        return expiry > now && expiry <= thirtyDaysFromNow;
    };

    // Filtered licenses
    const filteredLicenses = licenses.filter(license => {
        const matchesSearch = license.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getLicenseTypeLabel(license.licenseType).toLowerCase().includes(searchTerm.toLowerCase()) ||
            license.issuingAuthority?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <FaSpinner className="animate-spin text-4xl text-supply-primary" />
                </div>
            </SellerLayout>
        );
    }

    // Check if user has seller registration
    if (!userRegistration) {
        return (
            <SellerLayout>
                <div className="p-6">
                    <div className="text-center py-12">
                        <FaInfoCircle className="mx-auto h-12 w-12 text-yellow-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Chưa có đăng ký Seller</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Bạn cần đăng ký làm seller trước khi có thể quản lý giấy phép.
                        </p>
                        <div className="mt-6">
                            <a
                                href="/register-seller"
                                className="inline-flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-supply-primary-dark transition-colors"
                            >
                                Đăng ký Seller
                            </a>
                        </div>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý giấy phép</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Quản lý các giấy phép kinh doanh của cửa hàng
                            </p>
                        </div>
                        <div className="mt-4 lg:mt-0">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-supply-primary-dark transition-colors"
                            >
                                <FaPlus className="w-4 h-4 mr-2" />
                                Thêm giấy phép
                            </button>
                        </div>
                    </div>
                </div>

                {/* Registration Status Info */}
                {userRegistration && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <FaInfoCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Thông tin đăng ký Seller
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p><strong>Tên cửa hàng:</strong> {userRegistration.storeName}</p>
                                    <p><strong>Trạng thái:</strong>
                                        <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${userRegistration.status === 'Approved'
                                                ? 'bg-green-100 text-green-800'
                                                : userRegistration.status === 'Pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                            {userRegistration.status === 'Approved' ? 'Đã duyệt' :
                                                userRegistration.status === 'Pending' ? 'Chờ duyệt' :
                                                    userRegistration.status === 'Rejected' ? 'Bị từ chối' : userRegistration.status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm giấy phép..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                            >
                                <option value="all">Tất cả loại</option>
                                {licenseTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Refresh Button */}
                        <div>
                            <button
                                onClick={() => loadLicenses(currentPage, false)}
                                disabled={refreshing}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {refreshing ? (
                                    <FaSpinner className="animate-spin mx-auto" />
                                ) : (
                                    'Làm mới'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Licenses Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredLicenses.map((license) => (
                        <div key={license.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            {/* License Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {getLicenseTypeLabel(license.licenseType)}
                                    </h3>
                                    {license.licenseNumber && (
                                        <p className="text-sm text-gray-600">
                                            Số: {license.licenseNumber}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {getStatusBadge(license.status)}
                                </div>
                            </div>

                            {/* License Details */}
                            <div className="space-y-2 mb-4">
                                {license.issuingAuthority && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FaFileAlt className="w-4 h-4 mr-2" />
                                        <span>Cơ quan cấp: {license.issuingAuthority}</span>
                                    </div>
                                )}

                                {license.issueDate && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                                        <span>Ngày cấp: {new Date(license.issueDate).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                )}

                                {license.expiryDate && (
                                    <div className="flex items-center text-sm">
                                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                                        <span className={`${isExpired(license.expiryDate)
                                                ? 'text-red-600'
                                                : isExpiringSoon(license.expiryDate)
                                                    ? 'text-yellow-600'
                                                    : 'text-gray-600'
                                            }`}>
                                            Hết hạn: {new Date(license.expiryDate).toLocaleDateString('vi-VN')}
                                            {isExpired(license.expiryDate) && ' (Đã hết hạn)'}
                                            {isExpiringSoon(license.expiryDate) && ' (Sắp hết hạn)'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Warning for expired/expiring licenses */}
                            {(isExpired(license.expiryDate) || isExpiringSoon(license.expiryDate)) && (
                                <div className={`flex items-center p-2 rounded-lg mb-4 ${isExpired(license.expiryDate)
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-yellow-50 text-yellow-700'
                                    }`}>
                                    <FaExclamationTriangle className="w-4 h-4 mr-2" />
                                    <span className="text-sm">
                                        {isExpired(license.expiryDate)
                                            ? 'Giấy phép đã hết hạn'
                                            : 'Giấy phép sắp hết hạn'
                                        }
                                    </span>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {license.status === 'Rejected' && license.rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-red-700">
                                        <strong>Lý do từ chối:</strong> {license.rejectionReason}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => openViewModal(license)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <FaEye className="w-4 h-4" />
                                    </button>

                                    {license.licenseUrl && (
                                        <a
                                            href={license.licenseUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Tải xuống"
                                        >
                                            <FaDownload className="w-4 h-4" />
                                        </a>
                                    )}

                                    {license.status === 'Pending' && (
                                        <button
                                            onClick={() => openEditModal(license)}
                                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleDeleteLicense(license.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Xóa"
                                >
                                    <FaTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredLicenses.length === 0 && (
                    <div className="text-center py-12">
                        <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có giấy phép nào</h3>
                        <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm giấy phép đầu tiên.</p>
                        <div className="mt-6">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-supply-primary-dark transition-colors"
                            >
                                <FaPlus className="w-4 h-4 mr-2" />
                                Thêm giấy phép
                            </button>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-700">
                            <span>
                                Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, totalItems)} trong tổng số {totalItems} giấy phép
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => loadLicenses(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <FaChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-700">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => loadLicenses(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <FaChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add License Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Thêm giấy phép mới</h2>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleAddLicense} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Loại giấy phép *
                                    </label>
                                    <select
                                        required
                                        value={licenseForm.licenseType}
                                        onChange={(e) => setLicenseForm({ ...licenseForm, licenseType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    >
                                        <option value="">Chọn loại giấy phép</option>
                                        {licenseTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số giấy phép
                                    </label>
                                    <input
                                        type="text"
                                        value={licenseForm.licenseNumber}
                                        onChange={(e) => setLicenseForm({ ...licenseForm, licenseNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        placeholder="Nhập số giấy phép"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL file giấy phép *
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={licenseForm.licenseUrl}
                                        onChange={(e) => setLicenseForm({ ...licenseForm, licenseUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        placeholder="https://example.com/license.pdf"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày cấp
                                        </label>
                                        <input
                                            type="date"
                                            value={licenseForm.issueDate}
                                            onChange={(e) => setLicenseForm({ ...licenseForm, issueDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày hết hạn
                                        </label>
                                        <input
                                            type="date"
                                            value={licenseForm.expiryDate}
                                            onChange={(e) => setLicenseForm({ ...licenseForm, expiryDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cơ quan cấp
                                    </label>
                                    <input
                                        type="text"
                                        value={licenseForm.issuingAuthority}
                                        onChange={(e) => setLicenseForm({ ...licenseForm, issuingAuthority: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        placeholder="Nhập tên cơ quan cấp"
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-supply-primary-dark transition-colors disabled:opacity-50 flex items-center"
                                    >
                                        {formLoading && <FaSpinner className="animate-spin w-4 h-4 mr-2" />}
                                        Thêm giấy phép
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit License Modal */}
            {showEditModal && selectedLicense && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa giấy phép</h2>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedLicense(null);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleEditLicense} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Loại giấy phép *
                                    </label>
                                    <select
                                        required
                                        value={licenseForm.licenseType}
                                        onChange={(e) => setLicenseForm({ ...licenseForm, licenseType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    >
                                        <option value="">Chọn loại giấy phép</option>
                                        {licenseTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số giấy phép
                                    </label>
                                    <input
                                        type="text"
                                        value={licenseForm.licenseNumber}
                                        onChange={(e) => setLicenseForm({ ...licenseForm, licenseNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        placeholder="Nhập số giấy phép"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL file giấy phép *
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={licenseForm.licenseUrl}
                                        onChange={(e) => setLicenseForm({ ...licenseForm, licenseUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        placeholder="https://example.com/license.pdf"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày cấp
                                        </label>
                                        <input
                                            type="date"
                                            value={licenseForm.issueDate}
                                            onChange={(e) => setLicenseForm({ ...licenseForm, issueDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày hết hạn
                                        </label>
                                        <input
                                            type="date"
                                            value={licenseForm.expiryDate}
                                            onChange={(e) => setLicenseForm({ ...licenseForm, expiryDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cơ quan cấp
                                    </label>
                                    <input
                                        type="text"
                                        value={licenseForm.issuingAuthority}
                                        onChange={(e) => setLicenseForm({ ...licenseForm, issuingAuthority: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        placeholder="Nhập tên cơ quan cấp"
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedLicense(null);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-supply-primary-dark transition-colors disabled:opacity-50 flex items-center"
                                    >
                                        {formLoading && <FaSpinner className="animate-spin w-4 h-4 mr-2" />}
                                        Cập nhật
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View License Modal */}
            {showViewModal && selectedLicense && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Chi tiết giấy phép</h2>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedLicense(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại giấy phép</label>
                                    <p className="text-sm text-gray-900">{getLicenseTypeLabel(selectedLicense.licenseType)}</p>
                                </div>

                                {selectedLicense.licenseNumber && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Số giấy phép</label>
                                        <p className="text-sm text-gray-900">{selectedLicense.licenseNumber}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <div className="flex items-center">
                                        {getStatusBadge(selectedLicense.status)}
                                    </div>
                                </div>

                                {selectedLicense.issuingAuthority && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cơ quan cấp</label>
                                        <p className="text-sm text-gray-900">{selectedLicense.issuingAuthority}</p>
                                    </div>
                                )}

                                {selectedLicense.issueDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
                                        <p className="text-sm text-gray-900">
                                            {new Date(selectedLicense.issueDate).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                )}

                                {selectedLicense.expiryDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                                        <p className={`text-sm ${isExpired(selectedLicense.expiryDate)
                                                ? 'text-red-600'
                                                : isExpiringSoon(selectedLicense.expiryDate)
                                                    ? 'text-yellow-600'
                                                    : 'text-gray-900'
                                            }`}>
                                            {new Date(selectedLicense.expiryDate).toLocaleDateString('vi-VN')}
                                            {isExpired(selectedLicense.expiryDate) && ' (Đã hết hạn)'}
                                            {isExpiringSoon(selectedLicense.expiryDate) && ' (Sắp hết hạn)'}
                                        </p>
                                    </div>
                                )}

                                {selectedLicense.status === 'Rejected' && selectedLicense.rejectionReason && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối</label>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <p className="text-sm text-red-700">{selectedLicense.rejectionReason}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">File giấy phép</label>
                                    <div className="flex items-center space-x-2">
                                        <a
                                            href={selectedLicense.licenseUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <FaDownload className="w-4 h-4 mr-2" />
                                            Tải xuống
                                        </a>
                                        <a
                                            href={selectedLicense.licenseUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                            <FaEye className="w-4 h-4 mr-2" />
                                            Xem
                                        </a>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(selectedLicense.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cập nhật</label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(selectedLicense.updatedAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedLicense(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Đóng
                                </button>
                                {selectedLicense.status === 'Pending' && (
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            openEditModal(selectedLicense);
                                        }}
                                        className="px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-supply-primary-dark transition-colors"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
};

export default SellerLicenses;
