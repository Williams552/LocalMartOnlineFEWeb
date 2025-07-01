// Test component để kiểm tra API kết nối
import React, { useState, useEffect } from 'react';
import { Button, Card, message } from 'antd';
import userService from '../services/userService';
import apiService from '../services/apiService';

const TestAPI = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const testConnection = async () => {
        setLoading(true);
        try {
            console.log('Testing API connection...');
            console.log('API Base URL:', process.env.REACT_APP_API_URL);

            // Check if user is logged in
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (!token) {
                message.warning('Bạn cần đăng nhập trước để test API');
                setResult({ error: 'No authentication token found' });
                return;
            }

            console.log('Testing with token:', token.substring(0, 20) + '...');

            // Test 1: Direct API call
            const directResponse = await apiService.get('/api/User?pageNumber=1&pageSize=5');
            console.log('Direct API response:', directResponse);

            // Test 2: UserService call
            const userServiceResponse = await userService.getAllUsers({ pageNumber: 1, pageSize: 5 });
            console.log('UserService response:', userServiceResponse);

            setResult({
                direct: directResponse,
                userService: userServiceResponse,
                auth: { token: token ? 'Present' : 'Missing', user: user ? JSON.parse(user) : 'Missing' }
            });

            message.success('API test completed - check console for details');
        } catch (error) {
            console.error('API test failed:', error);
            message.error('API test failed: ' + error.message);
            setResult({ error: error.message, stack: error.stack });
        } finally {
            setLoading(false);
        }
    };

    const testAuth = () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        console.log('Current token:', token);
        console.log('Current user:', user);

        message.info('Check console for auth info');
    };

    const debugResponseStructure = () => {
        console.log('=== DEBUGGING RESPONSE STRUCTURE ===');

        // Test with different response formats
        const mockResponse1 = { success: true, data: { Data: [], Total: 0 } };
        const mockResponse2 = { success: true, data: [] };
        const mockResponse3 = { data: [] };
        const mockResponse4 = [];

        console.log('Test 1 - Backend format:', mockResponse1);
        console.log('  userData would be:', mockResponse1.data?.Data || mockResponse1.data);

        console.log('Test 2 - Simple format:', mockResponse2);
        console.log('  userData would be:', mockResponse2.data?.Data || mockResponse2.data);

        console.log('Test 3 - No success field:', mockResponse3);
        console.log('  userData would be:', mockResponse3.data?.Data || mockResponse3.data);

        console.log('Test 4 - Direct array:', mockResponse4);
        console.log('  userData would be:', mockResponse4.Data || mockResponse4);

        message.info('Response structure debug completed - check console');
    };

    const testLogin = async () => {
        try {
            // Test login with demo credentials
            const loginData = {
                username: 'admin', // or test credentials
                password: 'admin123',
                userToken: 'web_test_token'
            };

            console.log('Testing login with:', loginData);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/Auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();
            console.log('Login response:', result);

            if (result.success && result.data?.token) {
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify({
                    username: result.data.username,
                    role: result.data.role,
                    token: result.data.token
                }));
                message.success('Test login successful!');
            } else {
                message.error('Test login failed: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Test login error:', error);
            message.error('Test login error: ' + error.message);
        }
    };

    const forceMockData = () => {
        // Force set mock data in localStorage for testing
        const mockToken = 'mock_jwt_token_for_testing';
        const mockUser = {
            username: 'admin',
            role: 'Admin',
            token: mockToken
        };

        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));

        message.success('Mock authentication data set! Try API test now.');
        console.log('Mock data set:', { token: mockToken, user: mockUser });
    };

    return (
        <Card title="API Test Component" style={{ margin: 20 }}>
            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    onClick={testConnection}
                    loading={loading}
                    style={{ marginRight: 8 }}
                >
                    Test API Connection
                </Button>
                <Button onClick={testAuth} style={{ marginRight: 8 }}>
                    Check Auth Status
                </Button>
                <Button onClick={testLogin} style={{ marginRight: 8 }}>
                    Test Login
                </Button>
                <Button onClick={forceMockData} style={{ marginRight: 8 }}>
                    Force Mock Auth
                </Button>
                <Button onClick={debugResponseStructure}>
                    Debug Response Structure
                </Button>
                <Button onClick={testLogin} style={{ marginLeft: 8 }}>
                    Test Login
                </Button>
                <Button onClick={forceMockData} style={{ marginLeft: 8 }}>
                    Set Mock Data
                </Button>
            </div>

            {result && (
                <div>
                    <h3>Test Results:</h3>
                    <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </Card>
    );
};

export default TestAPI;
