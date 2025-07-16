import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const FollowStoreSimpleTest = () => {
    const [storeId, setStoreId] = useState('1');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();

    const testFollowAPI = async () => {
        if (!isAuthenticated) {
            setResult('❌ Please login first');
            return;
        }

        setLoading(true);
        setResult('⏳ Testing...');

        try {
            // Get user info
            const userStr = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            const userData = userStr ? JSON.parse(userStr) : null;
            const userId = userData?.id || userData?.Id;

            console.log('=== FOLLOW STORE TEST ===');
            console.log('User Data:', userData);
            console.log('User ID:', userId);
            console.log('Token:', token);
            console.log('Store ID:', storeId);

            if (!userId) {
                setResult('❌ User ID not found');
                return;
            }

            // Make direct API call
            const apiUrl = `http://localhost:5183/api/store/${storeId}/follow?userId=${userId}`;
            console.log('API URL:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });

            console.log('Response Status:', response.status);
            const data = await response.json();
            console.log('Response Data:', data);

            if (response.ok) {
                setResult(`✅ Success: ${data.message || 'Followed store successfully'}`);
            } else {
                setResult(`❌ Error ${response.status}: ${data.message || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Error:', error);
            setResult(`❌ Network Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">Please login to test Follow Store</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">🧪 Simple Follow Store Test</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Store ID:</label>
                    <input
                        type="number"
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded"
                        placeholder="1"
                    />
                </div>

                <button
                    onClick={testFollowAPI}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Testing...' : 'Test Follow Store'}
                </button>

                {result && (
                    <div className="p-3 bg-gray-50 border rounded">
                        <p className="text-sm">{result}</p>
                    </div>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>User:</strong> {user?.fullName || 'Unknown'}</p>
                    <p><strong>Role:</strong> {user?.role || 'Unknown'}</p>
                    <p><strong>API:</strong> POST /api/store/{storeId}/follow?userId=...</p>
                </div>
            </div>
        </div>
    );
};

export default FollowStoreSimpleTest;
