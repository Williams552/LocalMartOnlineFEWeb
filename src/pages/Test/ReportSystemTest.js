import React, { useState } from 'react';
import { ReportModal, ReportButton, reportService } from '../../components/Report';
import { FaBox, FaStore, FaUser } from 'react-icons/fa';

const ReportSystemTest = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState({
        type: 'Product',
        id: 'test-product-001',
        name: 'Test Product'
    });

    const mockData = {
        products: [
            { id: 'prod-1', name: 'Smartphone iPhone 15', price: '25,000,000₫' },
            { id: 'prod-2', name: 'Laptop Gaming ROG', price: '35,000,000₫' },
            { id: 'prod-3', name: 'Tai nghe AirPods Pro', price: '6,500,000₫' }
        ],
        stores: [
            { id: 'store-1', name: 'TechWorld Store', rating: 4.8 },
            { id: 'store-2', name: 'Mobile Paradise', rating: 4.5 },
            { id: 'store-3', name: 'Gaming Corner', rating: 4.7 }
        ],
        users: [
            { id: 'user-1', name: 'Nguyễn Văn A', role: 'Seller' },
            { id: 'user-2', name: 'Trần Thị B', role: 'Buyer' },
            { id: 'user-3', name: 'Lê Văn C', role: 'Seller' }
        ]
    };

    const handleReportSuccess = (reportData) => {
        console.log('✅ Report created successfully:', reportData);
    };

    const testReportService = async () => {
        console.log('🧪 Testing Report Service...');
        
        // Test get reasons
        const reasons = reportService.getReportReasons();
        console.log('📋 Available reasons:', reasons);
        
        // Test get target types
        const targetTypes = reportService.getTargetTypes();
        console.log('🎯 Target types:', targetTypes);
        
        // Test format status
        const statuses = ['Pending', 'Resolved', 'Dismissed'];
        statuses.forEach(status => {
            const formatted = reportService.formatReportStatus(status);
            console.log(`📊 Status ${status}:`, formatted);
        });
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    🧪 Report System Test Dashboard
                </h1>

                {/* Service Test */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Service Tests</h2>
                    <button
                        onClick={testReportService}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Test Report Service (Check Console)
                    </button>
                </div>

                {/* Manual Modal Test */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Manual Modal Test</h2>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <button
                            onClick={() => {
                                setSelectedTarget({ type: 'Product', id: 'test-prod', name: 'Test Product' });
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Test Product Report
                        </button>
                        <button
                            onClick={() => {
                                setSelectedTarget({ type: 'Store', id: 'test-store', name: 'Test Store' });
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                            Test Store Report
                        </button>
                        <button
                            onClick={() => {
                                setSelectedTarget({ type: 'Seller', id: 'test-seller', name: 'Test Seller' });
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Test Seller Report
                        </button>
                    </div>
                </div>

                {/* Products with Report Buttons */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FaBox className="mr-2" />
                        Products with Report Buttons
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {mockData.products.map((product) => (
                            <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                <p className="text-gray-600 mb-3">{product.price}</p>
                                <div className="flex justify-between items-center">
                                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                        Xem chi tiết
                                    </button>
                                    <ReportButton
                                        targetType="Product"
                                        targetId={product.id}
                                        targetName={product.name}
                                        variant="icon"
                                        size="sm"
                                        onReportSuccess={handleReportSuccess}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stores with Report Buttons */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FaStore className="mr-2" />
                        Stores with Report Buttons
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {mockData.stores.map((store) => (
                            <div key={store.id} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900">{store.name}</h3>
                                <p className="text-gray-600 mb-3">⭐ {store.rating}/5.0</p>
                                <div className="flex justify-between items-center">
                                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                                        Theo dõi
                                    </button>
                                    <ReportButton
                                        targetType="Store"
                                        targetId={store.id}
                                        targetName={store.name}
                                        variant="default"
                                        size="sm"
                                        onReportSuccess={handleReportSuccess}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Users with Report Buttons */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FaUser className="mr-2" />
                        Users with Report Buttons
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {mockData.users.map((user) => (
                            <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900">{user.name}</h3>
                                <p className="text-gray-600 mb-3">{user.role}</p>
                                <div className="flex justify-between items-center">
                                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                                        Xem profile
                                    </button>
                                    <ReportButton
                                        targetType={user.role}
                                        targetId={user.id}
                                        targetName={user.name}
                                        variant="text"
                                        size="sm"
                                        buttonText="Báo cáo"
                                        onReportSuccess={handleReportSuccess}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Button Variants Demo */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Button Variants Demo</h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <span className="w-20 text-sm">Default:</span>
                            <ReportButton
                                targetType="Product"
                                targetId="demo-1"
                                targetName="Demo Product"
                                variant="default"
                                size="md"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="w-20 text-sm">Icon:</span>
                            <ReportButton
                                targetType="Store"
                                targetId="demo-2"
                                targetName="Demo Store"
                                variant="icon"
                                size="md"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="w-20 text-sm">Text:</span>
                            <ReportButton
                                targetType="Seller"
                                targetId="demo-3"
                                targetName="Demo Seller"
                                variant="text"
                                size="md"
                                buttonText="Báo cáo người bán"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="w-20 text-sm">Sizes:</span>
                            <ReportButton
                                targetType="Product"
                                targetId="demo-4"
                                targetName="Small"
                                variant="default"
                                size="sm"
                                buttonText="SM"
                            />
                            <ReportButton
                                targetType="Product"
                                targetId="demo-5"
                                targetName="Medium"
                                variant="default"
                                size="md"
                                buttonText="MD"
                            />
                            <ReportButton
                                targetType="Product"
                                targetId="demo-6"
                                targetName="Large"
                                variant="default"
                                size="lg"
                                buttonText="LG"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Test Modal */}
            {showModal && (
                <ReportModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    targetType={selectedTarget.type}
                    targetId={selectedTarget.id}
                    targetName={selectedTarget.name}
                    onSuccess={(data) => {
                        console.log('✅ Manual test report created:', data);
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ReportSystemTest;
