import React, { useState, useEffect } from 'react';
import { FiEye, FiEdit3, FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { BsFilterLeft } from 'react-icons/bs';
import adminProxyShoppingService from '../../services/adminProxyShoppingService';
import ProxyRequestDetailModal from './ProxyRequestDetailModal';
import StatusUpdateModal from './StatusUpdateModal';

const ProxyShoppingManagement = () => {
    const [proxyRequests, setProxyRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalType, setStatusModalType] = useState('request'); // 'request' or 'order'

    useEffect(() => {
        loadProxyRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [proxyRequests, searchTerm, statusFilter, orderStatusFilter]);

    const loadProxyRequests = async () => {
        try {
            setLoading(true);
            const result = await adminProxyShoppingService.getAllProxyRequests();
            if (result.success) {
                setProxyRequests(Array.isArray(result.data) ? result.data : []);
            } else {
                console.error('Error loading proxy requests:', result.error);
                setProxyRequests([]);
            }
        } catch (error) {
            console.error('Error loading proxy requests:', error);
            setProxyRequests([]); // Đảm bảo luôn là array
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        // Đảm bảo proxyRequests là array
        if (!Array.isArray(proxyRequests)) {
            setFilteredRequests([]);
            return;
        }

        let filtered = [...proxyRequests];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(request =>
                request.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.proxyShopperName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(request => request.status === statusFilter);
        }

        // Order status filter
        if (orderStatusFilter !== 'all') {
            filtered = filtered.filter(request => request.orderStatus === orderStatusFilter);
        }

        setFilteredRequests(filtered);
    };

    const handleViewDetail = async (request) => {
        try {
            setLoading(true);
            const result = await adminProxyShoppingService.getProxyRequestDetail(request.id);
            if (result.success) {
                setSelectedRequest(result.data);
                setShowDetailModal(true);
            } else {
                console.error('Error loading request detail:', result.error);
                // Có thể hiển thị toast error ở đây
            }
        } catch (error) {
            console.error('Error loading request detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = (request, type) => {
        setSelectedRequest(request);
        setStatusModalType(type);
        setShowStatusModal(true);
    };

    const handleStatusUpdated = () => {
        loadProxyRequests(); // Refresh data
        setShowStatusModal(false);
        setSelectedRequest(null);
    };

    const getStatusBadge = (status, type = 'request') => {
        const color = adminProxyShoppingService.getStatusColor(status, type);
        const label = type === 'request' 
            ? adminProxyShoppingService.getRequestStatusLabel(status)
            : adminProxyShoppingService.getOrderStatusLabel(status);

        const colorClasses = {
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
            orange: 'bg-orange-100 text-orange-800',
            red: 'bg-red-100 text-red-800',
            gray: 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color] || colorClasses.gray}`}>
                {label}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    if (loading && !(proxyRequests && proxyRequests.length)) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Proxy Shopping</h1>
                    <p className="text-gray-600 mt-1">Quản lý tất cả yêu cầu và đơn hàng proxy shopping</p>
                </div>
                <button
                    onClick={loadProxyRequests}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={loading}
                >
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email người mua hoặc proxy shopper..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <BsFilterLeft className="text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả trạng thái yêu cầu</option>
                                {adminProxyShoppingService.getProxyRequestStatusOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <FiFilter className="text-gray-500" />
                            <select
                                value={orderStatusFilter}
                                onChange={(e) => setOrderStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tất cả trạng thái đơn hàng</option>
                                {adminProxyShoppingService.getProxyOrderStatusOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="text-sm text-gray-600">Tổng yêu cầu</div>
                    <div className="text-2xl font-bold text-gray-900">{(proxyRequests || []).length}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="text-sm text-gray-600">Đang mở</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {(proxyRequests || []).filter(r => r.status === 'Open').length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="text-sm text-gray-600">Hoàn thành</div>
                    <div className="text-2xl font-bold text-green-600">
                        {(proxyRequests || []).filter(r => r.status === 'Completed').length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="text-sm text-gray-600">Có đơn hàng</div>
                    <div className="text-2xl font-bold text-purple-600">
                        {(proxyRequests || []).filter(r => r.orderStatus).length}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Yêu cầu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người mua
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Proxy Shopper
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái yêu cầu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái đơn hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tổng tiền
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
                            {(filteredRequests || []).map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            #{request.id?.substring(0, 8)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {request.items?.length || 0} sản phẩm
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {request.buyerName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {request.buyerEmail}
                                        </div>
                                        {request.buyerPhone && (
                                            <div className="text-sm text-gray-500">
                                                {request.buyerPhone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {request.proxyShopperId ? (
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {request.proxyShopperName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {request.proxyShopperEmail}
                                                </div>
                                                {request.proxyShopperPhone && (
                                                    <div className="text-sm text-gray-500">
                                                        {request.proxyShopperPhone}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">Chưa có</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {getStatusBadge(request.status, 'request')}
                                            <button
                                                onClick={() => handleUpdateStatus(request, 'request')}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                title="Cập nhật trạng thái yêu cầu"
                                            >
                                                <FiEdit3 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {request.orderStatus ? (
                                            <div className="flex items-center space-x-2">
                                                {getStatusBadge(request.orderStatus, 'order')}
                                                <button
                                                    onClick={() => handleUpdateStatus(request, 'order')}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                    title="Cập nhật trạng thái đơn hàng"
                                                >
                                                    <FiEdit3 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">Chưa có đơn hàng</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {request.totalAmount ? formatCurrency(request.totalAmount) : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(request.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetail(request)}
                                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                        >
                                            <FiEye className="w-4 h-4" />
                                            <span>Xem</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!filteredRequests || filteredRequests.length === 0) && (
                    <div className="text-center py-12">
                        <div className="text-gray-500">Không tìm thấy yêu cầu nào</div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showDetailModal && selectedRequest && (
                <ProxyRequestDetailModal
                    request={selectedRequest}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedRequest(null);
                    }}
                />
            )}

            {showStatusModal && selectedRequest && (
                <StatusUpdateModal
                    request={selectedRequest}
                    type={statusModalType}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedRequest(null);
                    }}
                    onStatusUpdated={handleStatusUpdated}
                />
            )}
        </div>
    );
};

export default ProxyShoppingManagement;
