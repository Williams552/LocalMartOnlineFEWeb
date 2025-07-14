import React, { useState } from 'react';
import axios from 'axios';

const CategoryInfoAPITest = () => {
    const [testResults, setTestResults] = useState({});
    const [loading, setLoading] = useState({});
    const [searchParams, setSearchParams] = useState({
        searchKeyword: 'electronics',
        filterCategory: 'technology',
        filterMinPrice: 100000,
        filterMaxPrice: 5000000
    });

    const API_BASE_URL = 'http://localhost:5183/api';

    const setLoadingState = (testName, isLoading) => {
        setLoading(prev => ({ ...prev, [testName]: isLoading }));
    };

    const setTestResult = (testName, result) => {
        setTestResults(prev => ({ ...prev, [testName]: result }));
    };

    // 1. Get All Categories (GET /api/category - AllowAnonymous)
    const testGetAllCategories = async () => {
        const testName = 'allCategories';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Get All Categories API...');
            const apiUrl = `${API_BASE_URL}/category`;
            console.log('🔗 Making GET request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ Get All Categories Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Get All Categories Failed:', error);
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

    // 2. Search Categories (GET /api/category/search - AllowAnonymous)
    const testSearchCategories = async () => {
        const testName = 'searchCategories';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Search Categories API...');
            const queryParams = new URLSearchParams({
                keyword: searchParams.searchKeyword,
                page: 1,
                pageSize: 10
            });
            const apiUrl = `${API_BASE_URL}/category/search?${queryParams}`;
            console.log('🔗 Making GET request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ Search Categories Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Search Categories Failed:', error);
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

    // 3. Filter Categories (GET /api/category/filter - AllowAnonymous)
    const testFilterCategories = async () => {
        const testName = 'filterCategories';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Filter Categories API...');
            const queryParams = new URLSearchParams({
                category: searchParams.filterCategory,
                minPrice: searchParams.filterMinPrice,
                maxPrice: searchParams.filterMaxPrice,
                page: 1,
                pageSize: 10
            });
            const apiUrl = `${API_BASE_URL}/category/filter?${queryParams}`;
            console.log('🔗 Making GET request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ Filter Categories Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Filter Categories Failed:', error);
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

    // 4. Get Platform Policy (GET /api/platformpolicy - AllowAnonymous)
    const testGetPlatformPolicy = async () => {
        const testName = 'platformPolicy';
        setLoadingState(testName, true);

        try {
            console.log('🧪 Testing Get Platform Policy API...');
            const apiUrl = `${API_BASE_URL}/platformpolicy`;
            console.log('🔗 Making GET request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ Get Platform Policy Success:', response.data);
            setTestResult(testName, {
                success: true,
                data: response.data,
                status: response.status
            });

        } catch (error) {
            console.error('❌ Get Platform Policy Failed:', error);
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
    const testAllCategoryInfoAPIs = async () => {
        console.log('🚀 Testing All Category & Info APIs...');
        await testGetAllCategories();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests

        await testSearchCategories();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testFilterCategories();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testGetPlatformPolicy();

        console.log('✅ All Category & Info API tests completed!');
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
            <h3 style={{ marginBottom: '20px', color: '#333' }}>🗂️ Category & Info API Tests</h3>

            {/* Search and Filter Configuration */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <h4>Search & Filter Configuration:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Search Keyword:</label>
                        <input
                            type="text"
                            value={searchParams.searchKeyword}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, searchKeyword: e.target.value }))}
                            style={{
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                width: '100%'
                            }}
                            placeholder="Enter search keyword"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Filter Category:</label>
                        <input
                            type="text"
                            value={searchParams.filterCategory}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, filterCategory: e.target.value }))}
                            style={{
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                width: '100%'
                            }}
                            placeholder="Enter category for filter"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Min Price (VND):</label>
                        <input
                            type="number"
                            value={searchParams.filterMinPrice}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, filterMinPrice: parseInt(e.target.value) || 0 }))}
                            style={{
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                width: '100%'
                            }}
                            placeholder="Enter minimum price"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Max Price (VND):</label>
                        <input
                            type="number"
                            value={searchParams.filterMaxPrice}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, filterMaxPrice: parseInt(e.target.value) || 0 }))}
                            style={{
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                width: '100%'
                            }}
                            placeholder="Enter maximum price"
                        />
                    </div>
                </div>
            </div>

            {/* Individual Test Buttons */}
            <div style={{ marginBottom: '20px' }}>
                <h4>Individual Tests:</h4>
                <TestButton
                    onClick={testGetAllCategories}
                    loading={loading.allCategories}
                    variant="info"
                >
                    Test Get All Categories (Public)
                </TestButton>

                <TestButton
                    onClick={testSearchCategories}
                    loading={loading.searchCategories}
                    variant="success"
                >
                    Test Search Categories (Public)
                </TestButton>

                <TestButton
                    onClick={testFilterCategories}
                    loading={loading.filterCategories}
                    variant="warning"
                >
                    Test Filter Categories (Public)
                </TestButton>

                <TestButton
                    onClick={testGetPlatformPolicy}
                    loading={loading.platformPolicy}
                    variant="secondary"
                >
                    Test Get Platform Policy (Public)
                </TestButton>
            </div>

            {/* Test All Button */}
            <div style={{ marginBottom: '20px' }}>
                <TestButton
                    onClick={testAllCategoryInfoAPIs}
                    loading={Object.values(loading).some(Boolean)}
                    variant="primary"
                >
                    🚀 Test All Category & Info APIs
                </TestButton>
            </div>

            {/* Test Results */}
            <div>
                <h4>Test Results:</h4>
                <TestResult testName="Get All Categories" result={testResults.allCategories} />
                <TestResult testName="Search Categories" result={testResults.searchCategories} />
                <TestResult testName="Filter Categories" result={testResults.filterCategories} />
                <TestResult testName="Get Platform Policy" result={testResults.platformPolicy} />
            </div>

            {/* API Documentation */}
            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                <h4>📋 API Endpoints Tested:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li><code>GET /api/category</code> - AllowAnonymous ✅</li>
                    <li><code>GET /api/category/search</code> - AllowAnonymous ✅</li>
                    <li><code>GET /api/category/filter</code> - AllowAnonymous ✅</li>
                    <li><code>GET /api/platformpolicy</code> - AllowAnonymous ✅</li>
                </ul>
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>ℹ️ API Features:</h5>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                        <li><strong>Categories:</strong> Browse all product categories available on the platform</li>
                        <li><strong>Search:</strong> Find categories by keyword with pagination support</li>
                        <li><strong>Filter:</strong> Advanced filtering by category, price range, and other criteria</li>
                        <li><strong>Platform Policy:</strong> View terms of service, privacy policy, and platform rules</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CategoryInfoAPITest;
