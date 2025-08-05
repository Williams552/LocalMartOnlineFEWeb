import React, { useState } from 'react';
import adminProxyShoppingService from '../services/adminProxyShoppingService';

const ProxyShoppingDemo = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    // Demo data
    const demoRequest = {
        id: "demo-123",
        buyerName: "Nguyễn Văn A",
        buyerEmail: "nguyenvana@example.com",
        buyerPhone: "0123456789",
        proxyShopperId: "proxy-456",
        proxyShopperName: "Trần Thị B",
        proxyShopperEmail: "tranthib@example.com",
        proxyShopperPhone: "0987654321",
        status: "Open",
        orderStatus: "Proposed",
        totalAmount: 500000,
        createdAt: new Date().toISOString(),
        items: [
            {
                productName: "iPhone 15 Pro Max",
                description: "Màu xanh, 256GB",
                quantity: 1,
                estimatedPrice: 30000000,
                imageUrl: "https://via.placeholder.com/150"
            }
        ]
    };

    const testGetAllRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await adminProxyShoppingService.getAllProxyRequests();
            setResult({ type: 'getAllRequests', result });
        } catch (error) {
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testGetRequestDetail = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await adminProxyShoppingService.getProxyRequestDetail('demo-123');
            setResult({ type: 'getRequestDetail', result });
        } catch (error) {
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testUpdateRequestStatus = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await adminProxyShoppingService.updateProxyRequestStatus('demo-123', 'Locked');
            setResult({ type: 'updateRequestStatus', result });
        } catch (error) {
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testUpdateOrderStatus = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await adminProxyShoppingService.updateProxyOrderStatus('order-789', 'Paid');
            setResult({ type: 'updateOrderStatus', result });
        } catch (error) {
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Demo Proxy Shopping Management</h1>
            
            {/* Test Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    onClick={testGetAllRequests}
                    disabled={loading}
                    className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                    Test Get All Requests
                </button>
                
                <button
                    onClick={testGetRequestDetail}
                    disabled={loading}
                    className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                    Test Get Request Detail
                </button>
                
                <button
                    onClick={testUpdateRequestStatus}
                    disabled={loading}
                    className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
                >
                    Test Update Request Status
                </button>
                
                <button
                    onClick={testUpdateOrderStatus}
                    disabled={loading}
                    className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                    Test Update Order Status
                </button>
            </div>

            {/* Status Options */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Request Status Options</h3>
                    <div className="space-y-2">
                        {adminProxyShoppingService.getProxyRequestStatusOptions().map(option => (
                            <div key={option.value} className="flex items-center justify-between">
                                <span className="text-sm">{option.label}</span>
                                <span className={`px-2 py-1 text-xs rounded-full bg-${option.color}-100 text-${option.color}-800`}>
                                    {option.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Status Options</h3>
                    <div className="space-y-2">
                        {adminProxyShoppingService.getProxyOrderStatusOptions().map(option => (
                            <div key={option.value} className="flex items-center justify-between">
                                <span className="text-sm">{option.label}</span>
                                <span className={`px-2 py-1 text-xs rounded-full bg-${option.color}-100 text-${option.color}-800`}>
                                    {option.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Demo Data */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Demo Request Data</h3>
                <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                    {JSON.stringify(demoRequest, null, 2)}
                </pre>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Testing API...</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-red-800">{error}</div>
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">
                        Test Result: {result.type}
                    </h3>
                    <pre className="text-sm bg-white p-3 rounded overflow-auto border">
                        {JSON.stringify(result.result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default ProxyShoppingDemo;
