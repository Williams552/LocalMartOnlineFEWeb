import React, { useState } from 'react';
import axios from 'axios';

const CartAPITest = () => {
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testCartAPI = async () => {
        setLoading(true);
        try {
            console.log('🧪 Testing Cart API...');

            const userId = '675bf736d1b456b12c2c0001';
            const apiUrl = `http://localhost:5183/api/Cart/${userId}`;

            console.log('🔗 Making request to:', apiUrl);

            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ API Test Success:', response.data);
            setTestResult({ success: true, data: response.data });

        } catch (error) {
            console.error('❌ API Test Failed:', error);
            setTestResult({
                success: false,
                error: error.message,
                details: error.response?.data || 'No response data'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
            <h3>Cart API Test</h3>
            <button onClick={testCartAPI} disabled={loading}>
                {loading ? 'Testing...' : 'Test Cart API'}
            </button>

            {testResult && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: testResult.success ? '#d4edda' : '#f8d7da' }}>
                    <h4>Test Result:</h4>
                    <pre>{JSON.stringify(testResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default CartAPITest;
