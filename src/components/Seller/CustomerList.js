// Customer List Component
import React, { useState } from 'react';
import {
    FaSearch, FaSort, FaEye, FaPhone, FaEnvelope,
    FaCalendarAlt, FaShoppingCart, FaDollarSign,
    FaFilter, FaUsers, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import customerService from '../../services/customerService';

const CustomerList = ({ customers, loading, onCustomerSelect, pagination, onPageChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('totalSpent');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterTier, setFilterTier] = useState('all');

    const filteredCustomers = customers?.filter(customer => {
        const matchesSearch = !searchTerm ||
            customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTier = filterTier === 'all' || customer.customerTier === filterTier;

        return matchesSearch && matchesTier;
    }) || [];

    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const getTierBadgeColor = (tier) => {
        const colors = {
            'Bronze': 'bg-orange-100 text-orange-800',
            'Silver': 'bg-gray-100 text-gray-800',
            'Gold': 'bg-yellow-100 text-yellow-800',
            'Platinum': 'bg-purple-100 text-purple-800'
        };
        return colors[tier] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Danh sách khách hàng thân thiết</h3>
                        <p className="text-sm text-gray-600">
                            {filteredCustomers.length} khách hàng • Tổng cộng {pagination?.total || 0} khách hàng
                        </p>
                    </div>
                    <FaUsers className="text-2xl text-blue-500" />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Tier Filter */}
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterTier}
                            onChange={(e) => setFilterTier(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="all">Tất cả hạng</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Bronze">Bronze</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="totalSpent-desc">Chi tiêu cao nhất</option>
                            <option value="totalSpent-asc">Chi tiêu thấp nhất</option>
                            <option value="totalOrders-desc">Đơn hàng nhiều nhất</option>
                            <option value="totalOrders-asc">Đơn hàng ít nhất</option>
                            <option value="lastOrderDate-desc">Mua gần nhất</option>
                            <option value="lastOrderDate-asc">Mua lâu nhất</option>
                            <option value="loyaltyScore-desc">Điểm thành viên cao</option>
                            <option value="loyaltyScore-asc">Điểm thành viên thấp</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <div className="p-6">
                {sortedCustomers.length === 0 ? (
                    <div className="text-center py-12">
                        <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Không tìm thấy khách hàng</h3>
                        <p className="text-gray-500">
                            {searchTerm || filterTier !== 'all'
                                ? 'Thử thay đổi bộ lọc để xem thêm kết quả'
                                : 'Chưa có khách hàng thân thiết nào'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedCustomers.map((customer, index) => (
                            <div key={customer.userId || index}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-gray-800">{customer.fullName}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(customer.customerTier)}`}>
                                                {customer.customerTier}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {customer.loyaltyScore} điểm
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaEnvelope className="text-gray-400" />
                                                <span>{customer.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaPhone className="text-gray-400" />
                                                <span>{customer.phoneNumber || 'Chưa có'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaShoppingCart className="text-gray-400" />
                                                <span>{customer.totalOrders} đơn hàng</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaDollarSign className="text-gray-400" />
                                                <span>{customerService.formatCurrency(customer.totalSpent)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <FaCalendarAlt />
                                                <span>Khách hàng từ: {formatDate(customer.firstOrderDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaCalendarAlt />
                                                <span>Mua gần nhất: {formatDate(customer.lastOrderDate)}</span>
                                            </div>
                                            <div>
                                                TB/đơn: {customerService.formatCurrency(customer.averageOrderValue)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-4">
                                        <button
                                            onClick={() => onCustomerSelect?.(customer)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <FaEye />
                                            <span className="hidden sm:inline">Chi tiết</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Trang {pagination.currentPage} / {pagination.totalPages}
                            ({pagination.total} khách hàng)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange?.(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <FaChevronLeft />
                                <span className="hidden sm:inline">Trước</span>
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                                    const pageNum = Math.max(1, pagination.currentPage - 2) + index;
                                    if (pageNum > pagination.totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => onPageChange?.(pageNum)}
                                            className={`w-8 h-8 rounded ${pageNum === pagination.currentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => onPageChange?.(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <span className="hidden sm:inline">Sau</span>
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerList;
