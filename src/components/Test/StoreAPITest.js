import React, { useState } from 'react';
import axios from 'axios';

const StoreAPITest = () => {
    const [testResults, setTestResults] = useState({});
    const [loading, setLoading] = useState({});
    const [storeId, setStoreId] = useState('675bf736d1b456b12c2c0001');
    const [marketId, setMarketId] = useState('675bf736d1b456b12c2c0002');

    const API_BASE_URL = 'http://localhost:5183/api';

    const setLoadingState = (testName, isLoading) => {
        setLoading(prev => ({ ...prev, [testName]: isLoading }));
    };

    const setTestResult = (testName, result) => {
        setTestResults(prev => ({ ...prev, [testName]: result }));
    };

    // 1. Follow Store (POST /api/store/{storeId}/follow - Role: "Buyer")
    const testFollowStore = async () => {
        const testName = 'followStore';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Follow Store API...');
            const apiUrl = `${API_BASE_URL}/store/${storeId}/follow`;
            console.log('🔗 Making POST request to:', apiUrl);

            const response = await axios.post(apiUrl, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_BUYER_TOKEN' // Replace with actual token
                },
                timeout: 10000
            });

            console.log('✅ Follow Store Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Follow Store Failed:', error);
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

    // 2. Unfollow Store (POST /api/store/{storeId}/unfollow - Role: "Buyer")
    const testUnfollowStore = async () => {
        const testName = 'unfollowStore';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Unfollow Store API...');
            const apiUrl = `${API_BASE_URL}/store/${storeId}/unfollow`;
            console.log('🔗 Making POST request to:', apiUrl);

            const response = await axios.post(apiUrl, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_BUYER_TOKEN' // Replace with actual token
                },
                timeout: 10000
            });

            console.log('✅ Unfollow Store Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Unfollow Store Failed:', error);
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

    // 3. Get Following Stores (GET /api/store/following - Role: "Buyer")
    const testGetFollowingStores = async () => {
        const testName = 'followingStores';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Get Following Stores API...');
            const apiUrl = `${API_BASE_URL}/store/following`;
            console.log('🔗 Making GET request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_BUYER_TOKEN' // Replace with actual token
                },
                timeout: 10000
            });

            console.log('✅ Get Following Stores Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Get Following Stores Failed:', error);
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

    // 4. Check Follow Status (GET /api/store/{storeId}/check-follow - Role: "Buyer")
    const testCheckFollowStatus = async () => {
        const testName = 'checkFollowStatus';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Check Follow Status API...');
            const apiUrl = `${API_BASE_URL}/store/${storeId}/check-follow`;
            console.log('🔗 Making GET request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_BUYER_TOKEN' // Replace with actual token
                },
                timeout: 10000
            });

            console.log('✅ Check Follow Status Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Check Follow Status Failed:', error);
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

    // 5. Get Store Info (GET /api/store/{id} - AllowAnonymous)
    const testGetStoreInfo = async () => {
        const testName = 'storeInfo';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Get Store Info API...');
            const apiUrl = `${API_BASE_URL}/store/${storeId}`;
            console.log('🔗 Making GET request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ Get Store Info Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Get Store Info Failed:', error);
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

    // 6. Get Stores by Market (GET /api/store/market/{marketId} - AllowAnonymous)
    const testGetStoresByMarket = async () => {
        const testName = 'storesByMarket';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Get Stores by Market API...');
            const apiUrl = `${API_BASE_URL}/store/market/${marketId}`;
            console.log('🔗 Making GET request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ Get Stores by Market Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Get Stores by Market Failed:', error);
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

    // Test All APIs
    const testAllStoreAPIs = async () => {
        console.log('🚀 Testing All Store Management APIs...');
        await testGetStoreInfo();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests

        await testGetStoresByMarket();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testCheckFollowStatus();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testGetFollowingStores();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testFollowStore();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testUnfollowStore();

        console.log('✅ All Store API tests completed!');
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
            <h3 style={{ marginBottom: '20px', color: '#333' }}>🏪 Store Management API Tests</h3>

            {/* Input Controls */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <h4>Test Configuration:</h4>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Store ID:</label>
                    <input
                        type="text"
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        style={{
                            padding: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            width: '300px'
                        }}
                        placeholder="Enter Store ID"
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Market ID:</label>
                    <input
                        type="text"
                        value={marketId}
                        onChange={(e) => setMarketId(e.target.value)}
                        style={{
                            padding: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            width: '300px'
                        }}
                        placeholder="Enter Market ID"
                    />
                </div>
            </div>

            {/* Individual Test Buttons */}
            <div style={{ marginBottom: '20px' }}>
                <h4>Individual Tests:</h4>
                <TestButton
                    onClick={testGetStoreInfo}
                    loading={loading.storeInfo}
                    variant="info"
                >
                    Test Get Store Info (Public)
                </TestButton>

                <TestButton
                    onClick={testGetStoresByMarket}
                    loading={loading.storesByMarket}
                    variant="info"
                >
                    Test Get Stores by Market (Public)
                </TestButton>

                <TestButton
                    onClick={testCheckFollowStatus}
                    loading={loading.checkFollowStatus}
                    variant="warning"
                >
                    Test Check Follow Status (Buyer)
                </TestButton>

                <TestButton
                    onClick={testGetFollowingStores}
                    loading={loading.followingStores}
                    variant="warning"
                >
                    Test Get Following Stores (Buyer)
                </TestButton>

                <TestButton
                    onClick={testFollowStore}
                    loading={loading.followStore}
                    variant="success"
                >
                    Test Follow Store (Buyer)
                </TestButton>

                <TestButton
                    onClick={testUnfollowStore}
                    loading={loading.unfollowStore}
                    variant="danger"
                >
                    Test Unfollow Store (Buyer)
                </TestButton>
            </div>

            {/* Test All Button */}
            <div style={{ marginBottom: '20px' }}>
                <TestButton
                    onClick={testAllStoreAPIs}
                    loading={Object.values(loading).some(Boolean)}
                    variant="primary"
                >
                    🚀 Test All Store APIs
                </TestButton>
            </div>

            {/* Test Results */}
            <div>
                <h4>Test Results:</h4>
                <TestResult testName="Get Store Info" result={testResults.storeInfo} />
                <TestResult testName="Get Stores by Market" result={testResults.storesByMarket} />
                <TestResult testName="Check Follow Status" result={testResults.checkFollowStatus} />
                <TestResult testName="Get Following Stores" result={testResults.followingStores} />
                <TestResult testName="Follow Store" result={testResults.followStore} />
                <TestResult testName="Unfollow Store" result={testResults.unfollowStore} />
            </div>

            {/* API Documentation */}
            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                <h4>📋 API Endpoints Tested:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li><code>POST /api/store/{'{storeId}'}/follow</code> - Role: "Buyer" ✅</li>
                    <li><code>POST /api/store/{'{storeId}'}/unfollow</code> - Role: "Buyer" ✅</li>
                    <li><code>GET /api/store/following</code> - Role: "Buyer" ✅</li>
                    <li><code>GET /api/store/{'{storeId}'}/check-follow</code> - Role: "Buyer" ✅</li>
                    <li><code>GET /api/store/{'{id}'}</code> - AllowAnonymous ✅</li>
                    <li><code>GET /api/store/market/{'{marketId}'}</code> - AllowAnonymous ✅</li>
                </ul>
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#6c757d' }}>
                    <strong>Note:</strong> Replace "YOUR_BUYER_TOKEN" with actual authentication token for buyer role endpoints.
                </p>
            </div>
        </div>
    );
};

export default StoreAPITest;
