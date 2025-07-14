import React, { useState } from 'react';
import axios from 'axios';

const PaymentAPITest = () => {
    const [testResults, setTestResults] = useState({});
    const [loading, setLoading] = useState({});
    const [paymentData, setPaymentData] = useState({
        orderId: 'ORDER123456789',
        amount: 100000,
        orderInfo: 'Test payment for LocalMart order',
        returnUrl: 'http://localhost:3000/payment/return'
    });

    const API_BASE_URL = 'http://localhost:5183/api';

    const setLoadingState = (testName, isLoading) => {
        setLoading(prev => ({ ...prev, [testName]: isLoading }));
    };

    const setTestResult = (testName, result) => {
        setTestResults(prev => ({ ...prev, [testName]: result }));
    };

    // 1. Create VNPay Payment Link (POST /api/vnpay/create-payment)
    const testCreatePayment = async () => {
        const testName = 'createPayment';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Create VNPay Payment API...');
            const apiUrl = `${API_BASE_URL}/vnpay/create-payment`;
            console.log('🔗 Making POST request to:', apiUrl);
            console.log('📋 Payment Data:', paymentData);

            const response = await axios.post(apiUrl, paymentData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_TOKEN' // Replace with actual token if needed
                },
                timeout: 15000
            });

            console.log('✅ Create Payment Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Create Payment Failed:', error);
            setTestResult(testName, {
                success: false,
                error: error.message,
                status: error.response?.status,
                details: error.response?.data || 'No response data'
            });
        } finally {
            setLoadingState(testName, false);
        }
    };

    // 2. Handle Payment Callback (GET /api/vnpay/callback)
    const testPaymentCallback = async () => {
        const testName = 'paymentCallback';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing VNPay Payment Callback API...');

            // Sample callback parameters (normally these come from VNPay)
            const callbackParams = {
                vnp_TmnCode: 'TEST_TMN_CODE',
                vnp_Amount: '10000000', // Amount in VND (x100)
                vnp_BankCode: 'NCB',
                vnp_BankTranNo: 'VNP13588709',
                vnp_CardType: 'ATM',
                vnp_OrderInfo: 'Test payment for LocalMart order',
                vnp_PayDate: '20250714120000',
                vnp_ResponseCode: '00',
                vnp_TxnRef: 'ORDER123456789',
                vnp_TransactionNo: '13588709',
                vnp_TransactionStatus: '00',
                vnp_SecureHash: 'sample_secure_hash'
            };

            const queryString = new URLSearchParams(callbackParams).toString();
            const apiUrl = `${API_BASE_URL}/vnpay/callback?${queryString}`;
            console.log('🔗 Making GET request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });

            console.log('✅ Payment Callback Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Payment Callback Failed:', error);
            setTestResult(testName, {
                success: false,
                error: error.message,
                status: error.response?.status,
                details: error.response?.data || 'No response data'
            });
        } finally {
            setLoadingState(testName, false);
        }
    };

    // Test All Payment APIs
    const testAllPaymentAPIs = async () => {
        console.log('🚀 Testing All Payment APIs...');
        await testCreatePayment();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between tests

        await testPaymentCallback();

        console.log('✅ All Payment API tests completed!');
    };

    const TestButton = ({ onClick, loading, children, variant = 'primary' }) => {
        const baseStyle = {
            padding: '8px 16px',
            margin: '5px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: loading ? 0.6 : 1
        };

        const variants = {
            primary: { backgroundColor: '#007bff', color: 'white' },
            success: { backgroundColor: '#28a745', color: 'white' },
            info: { backgroundColor: '#17a2b8', color: 'white' },
            warning: { backgroundColor: '#ffc107', color: 'black' },
            danger: { backgroundColor: '#dc3545', color: 'white' },
            secondary: { backgroundColor: '#6c757d', color: 'white' }
        };

        return (
            <button
                onClick={onClick}
                disabled={loading}
                style={{ ...baseStyle, ...variants[variant] }}
            >
                {loading ? 'Testing...' : children}
            </button>
        );
    };

    const TestResult = ({ testName, result }) => {
        if (!result) return null;

        return (
            <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '4px'
            }}>
                <h5 style={{ margin: '0 0 10px 0', color: result.success ? '#155724' : '#721c24' }}>
                    {result.success ? '✅' : '❌'} {testName} Result:
                </h5>
                <pre style={{
                    fontSize: '12px',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    maxHeight: '200px',
                    overflow: 'auto'
                }}>
                    {JSON.stringify(result, null, 2)}
                </pre>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>💰 VNPay Payment API Tests</h3>

            {/* Payment Configuration */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <h4>Payment Configuration:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Order ID:</label>
                        <input
                            type="text"
                            value={paymentData.orderId}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, orderId: e.target.value }))}
                            style={{
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                width: '100%'
                            }}
                            placeholder="Enter Order ID"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Amount (VND):</label>
                        <input
                            type="number"
                            value={paymentData.amount}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                            style={{
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                width: '100%'
                            }}
                            placeholder="Enter Amount"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Order Info:</label>
                        <input
                            type="text"
                            value={paymentData.orderInfo}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, orderInfo: e.target.value }))}
                            style={{
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                width: '100%'
                            }}
                            placeholder="Enter Order Info"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Return URL:</label>
                        <input
                            type="text"
                            value={paymentData.returnUrl}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, returnUrl: e.target.value }))}
                            style={{
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                width: '100%'
                            }}
                            placeholder="Enter Return URL"
                        />
                    </div>
                </div>
            </div>

            {/* Individual Test Buttons */}
            <div style={{ marginBottom: '20px' }}>
                <h4>Individual Tests:</h4>
                <TestButton
                    onClick={testCreatePayment}
                    loading={loading.createPayment}
                    variant="success"
                >
                    Test Create Payment Link
                </TestButton>

                <TestButton
                    onClick={testPaymentCallback}
                    loading={loading.paymentCallback}
                    variant="info"
                >
                    Test Payment Callback
                </TestButton>
            </div>

            {/* Test All Button */}
            <div style={{ marginBottom: '20px' }}>
                <TestButton
                    onClick={testAllPaymentAPIs}
                    loading={Object.values(loading).some(Boolean)}
                    variant="primary"
                >
                    🚀 Test All Payment APIs
                </TestButton>
            </div>

            {/* Test Results */}
            <div>
                <h4>Test Results:</h4>
                <TestResult testName="Create Payment Link" result={testResults.createPayment} />
                <TestResult testName="Payment Callback" result={testResults.paymentCallback} />
            </div>

            {/* API Documentation */}
            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                <h4>📋 API Endpoints Tested:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li><code>POST /api/vnpay/create-payment</code> - Create VNPay payment link ✅</li>
                    <li><code>GET /api/vnpay/callback</code> - Handle payment callback ✅</li>
                </ul>
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Important Notes:</h5>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                        <li>Payment callback test uses sample parameters for demonstration</li>
                        <li>Real callback parameters come from VNPay after user completes payment</li>
                        <li>Secure hash validation should be implemented on the backend</li>
                        <li>Test payment amounts are in VND (Vietnamese Dong)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PaymentAPITest;
