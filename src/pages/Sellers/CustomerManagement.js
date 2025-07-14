// Customer Management Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaUsers, FaChartLine, FaDownload, FaFilter,
    FaSync, FaInfoCircle, FaTimes
} from 'react-icons/fa';
import SellerLayout from '../../layouts/SellerLayout';
import CustomerAnalytics from '../../components/Seller/CustomerAnalytics';
import CustomerList from '../../components/Seller/CustomerList';
import customerService from '../../services/customerService';
import { toast } from 'react-toastify';

const CustomerManagement = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1
    });
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [error, setError] = useState(null);

    // Load initial data
    useEffect(() => {
        loadCustomerData();
    }, []);

    const loadCustomerData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📊 Loading customer analytics data...');

            // Load statistics and customers in parallel
            const [statsResult, customersResult] = await Promise.all([
                customerService.getCustomerStatistics(),
                customerService.getLoyalCustomers({
                    page: pagination.currentPage,
                    pageSize: pagination.pageSize
                })
            ]);

            // Handle statistics
            if (statsResult.success) {
                setStatistics(statsResult.data);
                console.log('✅ Customer statistics loaded:', statsResult.data);
            } else {
                console.warn('⚠️ Using mock statistics:', statsResult.message);
                setStatistics(customerService.getMockStatistics());
                if (!statsResult.message.includes('mẫu')) {
                    toast.warn('Sử dụng dữ liệu mẫu: ' + statsResult.message);
                }
            }

            // Handle customers
            if (customersResult.success) {
                setCustomers(customersResult.data.customers || []);
                setPagination({
                    currentPage: customersResult.data.currentPage || 1,
                    pageSize: customersResult.data.pageSize || 10,
                    total: customersResult.data.totalCount || 0,
                    totalPages: customersResult.data.totalPages || 1
                });
                console.log('✅ Customer list loaded:', customersResult.data.customers?.length, 'customers');
            } else {
                console.warn('⚠️ Using mock customer data:', customersResult.message);
                const mockData = customerService.getMockCustomers();
                setCustomers(mockData.customers);
                setPagination({
                    currentPage: mockData.currentPage,
                    pageSize: mockData.pageSize,
                    total: mockData.totalCount,
                    totalPages: mockData.totalPages
                });
                if (!customersResult.message.includes('mẫu')) {
                    toast.warn('Sử dụng dữ liệu mẫu: ' + customersResult.message);
                }
            }

        } catch (error) {
            console.error('❌ Error loading customer data:', error);
            setError('Không thể tải dữ liệu khách hàng');
            toast.error('Không thể tải dữ liệu khách hàng');

            // Use fallback data
            setStatistics(customerService.getMockStatistics());
            const mockData = customerService.getMockCustomers();
            setCustomers(mockData.customers);
            setPagination({
                currentPage: mockData.currentPage,
                pageSize: mockData.pageSize,
                total: mockData.totalCount,
                totalPages: mockData.totalPages
            });
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setRefreshing(true);
        await loadCustomerData();
        setRefreshing(false);
        toast.success('Dữ liệu đã được cập nhật');
    };

    const handlePageChange = async (page) => {
        try {
            setLoading(true);
            const result = await customerService.getLoyalCustomers({
                page,
                pageSize: pagination.pageSize
            });

            if (result.success) {
                setCustomers(result.data.customers || []);
                setPagination(prev => ({
                    ...prev,
                    currentPage: page
                }));
            } else {
                toast.error('Không thể tải trang ' + page);
            }
        } catch (error) {
            console.error('Error changing page:', error);
            toast.error('Không thể tải trang ' + page);
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerSelect = async (customer) => {
        try {
            setSelectedCustomer(customer);
            setShowCustomerModal(true);

            // Load customer orders
            const result = await customerService.getCustomerOrderSummary(customer.userId);
            if (result.success) {
                setCustomerOrders(result.data || []);
            } else {
                setCustomerOrders([]);
                console.warn('Could not load customer orders:', result.message);
            }
        } catch (error) {
            console.error('Error selecting customer:', error);
            setCustomerOrders([]);
        }
    };

    const exportCustomerData = () => {
        // Mock export functionality
        toast.info('Tính năng xuất dữ liệu sẽ được triển khai sớm');
    };

    // Loading state for initial load
    if (loading && !statistics && customers.length === 0) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Đang tải dữ liệu khách hàng...</h3>
                        <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    // Error state
    if (error && !statistics && customers.length === 0) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Không thể tải dữ liệu</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={loadCustomerData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Thống kê khách hàng</h1>
                            <p className="text-gray-600 mt-1">
                                Phân tích khách hàng thân thiết và tỷ lệ quay lại
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={refreshData}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                <FaSync className={refreshing ? 'animate-spin' : ''} />
                                <span className="hidden sm:inline">
                                    {refreshing ? 'Đang tải...' : 'Làm mới'}
                                </span>
                            </button>
                            <button
                                onClick={exportCustomerData}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <FaDownload />
                                <span className="hidden sm:inline">Xuất dữ liệu</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Customer Analytics */}
                <div className="mb-8">
                    <CustomerAnalytics
                        statistics={statistics}
                        loading={loading && !statistics}
                    />
                </div>

                {/* Customer List */}
                <div className="mb-8">
                    <CustomerList
                        customers={customers}
                        loading={loading && customers.length === 0}
                        onCustomerSelect={handleCustomerSelect}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Thao tác nhanh</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            to="/seller/customers"
                            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                        >
                            <div className="bg-blue-100 group-hover:bg-blue-500 group-hover:text-white p-3 rounded-lg transition">
                                <FaUsers size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Quản lý khách hàng</h4>
                                <p className="text-sm text-gray-600">Xem chi tiết từng khách hàng</p>
                            </div>
                        </Link>

                        <Link
                            to="/seller/analytics"
                            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition group"
                        >
                            <div className="bg-green-100 group-hover:bg-green-500 group-hover:text-white p-3 rounded-lg transition">
                                <FaChartLine size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Báo cáo chi tiết</h4>
                                <p className="text-sm text-gray-600">Xem báo cáo tổng quan</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <FaInfoCircle size={20} className="text-yellow-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Hỗ trợ</h4>
                                <p className="text-sm text-gray-600">Cần hỗ trợ? Liên hệ admin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Detail Modal */}
            {showCustomerModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Chi tiết khách hàng: {selectedCustomer.fullName}
                                    </h3>
                                    <p className="text-gray-600">
                                        Hạng {selectedCustomer.customerTier} • {selectedCustomer.loyaltyScore} điểm
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCustomerModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="font-semibold mb-3">Thông tin cá nhân</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Email:</strong> {selectedCustomer.email}</p>
                                        <p><strong>Điện thoại:</strong> {selectedCustomer.phoneNumber || 'Chưa có'}</p>
                                        <p><strong>Khách hàng từ:</strong> {new Date(selectedCustomer.firstOrderDate).toLocaleDateString('vi-VN')}</p>
                                        <p><strong>Mua gần nhất:</strong> {new Date(selectedCustomer.lastOrderDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3">Thống kê mua hàng</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Tổng đơn hàng:</strong> {selectedCustomer.totalOrders}</p>
                                        <p><strong>Đơn hoàn thành:</strong> {selectedCustomer.completedOrders}</p>
                                        <p><strong>Tổng chi tiêu:</strong> {customerService.formatCurrency(selectedCustomer.totalSpent)}</p>
                                        <p><strong>Trung bình/đơn:</strong> {customerService.formatCurrency(selectedCustomer.averageOrderValue)}</p>
                                    </div>
                                </div>
                            </div>

                            {customerOrders.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3">Lịch sử đơn hàng gần đây</h4>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Mã đơn</th>
                                                    <th className="px-4 py-2 text-left">Ngày</th>
                                                    <th className="px-4 py-2 text-left">Trạng thái</th>
                                                    <th className="px-4 py-2 text-right">Tổng tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customerOrders.slice(0, 5).map((order, index) => (
                                                    <tr key={index} className="border-t border-gray-200">
                                                        <td className="px-4 py-2">#{order.orderNumber}</td>
                                                        <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                                        <td className="px-4 py-2">
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-right">{customerService.formatCurrency(order.totalAmount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
};

export default CustomerManagement;
