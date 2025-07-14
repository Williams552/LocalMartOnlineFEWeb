// Test Customer Analytics Page
import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import CustomerAnalytics from '../components/Seller/CustomerAnalytics';
import CustomerList from '../components/Seller/CustomerList';
import customerService from '../services/customerService';

const TestCustomerAnalytics = () => {
    // Mock data for testing
    const mockStatistics = customerService.getMockStatistics();
    const mockCustomers = customerService.getMockCustomers();

    const handleCustomerSelect = (customer) => {
        console.log('Selected customer:', customer);
        alert(`Selected customer: ${customer.fullName}`);
    };

    const handlePageChange = (page) => {
        console.log('Page changed to:', page);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/seller/dashboard"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <FaArrowLeft />
                            <span>Quay lại Dashboard</span>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Test - Thống kê khách hàng
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Trang test cho Customer Analytics components
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Customer Analytics Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        📊 Customer Analytics Component
                    </h2>
                    <CustomerAnalytics
                        statistics={mockStatistics}
                        loading={false}
                    />
                </div>

                {/* Customer List Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        📋 Customer List Component
                    </h2>
                    <CustomerList
                        customers={mockCustomers.customers}
                        loading={false}
                        onCustomerSelect={handleCustomerSelect}
                        pagination={{
                            currentPage: mockCustomers.currentPage,
                            totalPages: mockCustomers.totalPages,
                            total: mockCustomers.totalCount,
                            pageSize: mockCustomers.pageSize
                        }}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* API Endpoints Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        🔗 API Endpoints Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Customer Statistics</h4>
                            <code className="text-sm bg-gray-100 p-2 rounded block">
                                GET /api/customer/statistics
                            </code>
                            <p className="text-sm text-gray-600 mt-2">
                                Returns: Bronze, Silver, Gold, Platinum customers count and repeat customer rate
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Loyal Customers List</h4>
                            <code className="text-sm bg-gray-100 p-2 rounded block">
                                GET /api/customer
                            </code>
                            <p className="text-sm text-gray-600 mt-2">
                                Returns: Paginated list of loyal customers with tiers
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Customer Orders</h4>
                            <code className="text-sm bg-gray-100 p-2 rounded block">
                                GET /api/customer/customer/:id/orders
                            </code>
                            <p className="text-sm text-gray-600 mt-2">
                                Returns: Order history for specific customer
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Loyalty Score Info</h4>
                            <code className="text-sm bg-gray-100 p-2 rounded block">
                                GET /api/customer/loyalty-score-info
                            </code>
                            <p className="text-sm text-gray-600 mt-2">
                                Returns: Information about loyalty score calculation
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestCustomerAnalytics;
