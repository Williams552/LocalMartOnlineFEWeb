import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import favoriteService from '../services/favoriteService';

const TestFavorites = () => {
    const navigate = useNavigate();
    const [debugInfo, setDebugInfo] = useState({});
    const [testProductId] = useState('f6564fc0fc7649b49f3ac1f6'); // Real product ID from API
    const [isTestMode, setIsTestMode] = useState(false);

    useEffect(() => {
        runDebugTests();
    }, []);

    const runDebugTests = async () => {
        const debug = {};

        // Check authentication
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        debug.auth = {
            hasToken: !!token,
            tokenLength: token?.length || 0,
            tokenPreview: token ? token.substring(0, 50) + '...' : 'No token',
            hasUser: !!user,
            userInfo: user ? JSON.parse(user) : null
        };

        if (!token) {
            debug.message = 'User not logged in - cannot test favorite APIs';
            setDebugInfo(debug);
            return;
        }

        if (isTestMode) {
            // Test add to favorites
            try {
                console.log('🧪 Testing add to favorites...');
                const addResult = await favoriteService.addToFavorites(testProductId);
                debug.addToFavorites = addResult;
            } catch (error) {
                debug.addToFavorites = { error: error.message };
            }

            // Test check favorite status
            try {
                console.log('🧪 Testing check favorite status...');
                const checkResult = await favoriteService.checkFavoriteStatus(testProductId);
                debug.checkStatus = checkResult;
            } catch (error) {
                debug.checkStatus = { error: error.message };
            }
        }

        // Test get favorites (safe to test even without adding)
        try {
            console.log('🧪 Testing get favorites...');
            const getResult = await favoriteService.getFavoriteProducts(1, 10);
            debug.getFavorites = getResult;
        } catch (error) {
            debug.getFavorites = { error: error.message };
        }

        setDebugInfo(debug);
    };

    const handleAddFavorite = async () => {
        setIsTestMode(true);
        const result = await favoriteService.addToFavorites(testProductId);
        console.log('Manual add result:', result);
        await runDebugTests(); // Refresh debug info
    };

    const handleGetFavorites = async () => {
        const result = await favoriteService.getFavoriteProducts(1, 10);
        console.log('Manual get result:', result);
        await runDebugTests(); // Refresh debug info
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const token = localStorage.getItem('token');

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">🧪 Favorite Service Debug</h1>

            {!token && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold text-red-800 mb-2">⚠️ Authentication Required</h2>
                    <p className="text-red-700 mb-4">You need to login first to test favorite functionality.</p>
                    <button
                        onClick={handleLogin}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Go to Login
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {/* Authentication Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">🔐 Authentication</h2>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(debugInfo.auth, null, 2)}
                    </pre>
                </div>

                {/* Add to Favorites Test */}
                {token && (
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">➕ Add to Favorites</h2>
                        <button
                            onClick={handleAddFavorite}
                            className="bg-green-600 text-white px-4 py-2 rounded mb-2 hover:bg-green-700"
                        >
                            Test Add Favorite
                        </button>
                        <pre className="text-sm overflow-auto">
                            {JSON.stringify(debugInfo.addToFavorites, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Get Favorites Test */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">📋 Get Favorites</h2>
                    <button
                        onClick={handleGetFavorites}
                        className="bg-yellow-600 text-white px-4 py-2 rounded mb-2"
                    >
                        Test Get Favorites
                    </button>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(debugInfo.getFavorites, null, 2)}
                    </pre>
                </div>

                {/* Check Status Test */}
                {token && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">🔍 Check Status</h2>
                        <pre className="text-sm overflow-auto">
                            {JSON.stringify(debugInfo.checkStatus, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <div className="mt-6 space-x-4">
                <button
                    onClick={runDebugTests}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    🔄 Refresh Debug Info
                </button>

                {token && (
                    <button
                        onClick={() => navigate('/buyer/favorites')}
                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
                    >
                        📋 Go to Favorites Page
                    </button>
                )}

                <button
                    onClick={() => navigate('/')}
                    className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                    🏠 Go Home
                </button>
            </div>

            {debugInfo.message && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">{debugInfo.message}</p>
                </div>
            )}
        </div>
    );
};

export default TestFavorites;
