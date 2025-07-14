import React, { useState, useEffect } from 'react';
import { FiClock, FiRefreshCw, FiLogOut } from 'react-icons/fi';
import authService from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

const SessionTimeoutWarning = () => {
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { logout } = useAuth();

    useEffect(() => {
        const checkInterval = setInterval(() => {
            if (authService.isTokenExpiringSoon(2)) {
                const expiration = authService.getTokenExpiration();
                const currentTime = Date.now() / 1000;
                const secondsLeft = Math.max(0, Math.floor(expiration - currentTime));

                setTimeLeft(secondsLeft);
                setShowWarning(true);

                // Auto logout if time expired
                if (secondsLeft <= 0) {
                    handleLogout();
                }
            } else {
                setShowWarning(false);
            }
        }, 1000);

        return () => clearInterval(checkInterval);
    }, []);

    const handleRefreshSession = async () => {
        try {
            setIsRefreshing(true);
            await authService.refreshToken();
            setShowWarning(false);
        } catch (error) {
            console.error('Failed to refresh session:', error);
            handleLogout();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleLogout = () => {
        setShowWarning(false);
        logout();
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                    <FiClock className="text-orange-500 mr-3" size={24} />
                    <h3 className="text-lg font-semibold text-gray-800">
                        Phiên đăng nhập sắp hết hạn
                    </h3>
                </div>

                <p className="text-gray-600 mb-4">
                    Phiên đăng nhập của bạn sẽ hết hạn trong{' '}
                    <span className="font-bold text-red-600">
                        {formatTime(timeLeft)}
                    </span>
                </p>

                <div className="flex space-x-3">
                    <button
                        onClick={handleRefreshSession}
                        disabled={isRefreshing}
                        className="flex-1 bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isRefreshing ? (
                            <FiRefreshCw className="animate-spin mr-2" size={16} />
                        ) : (
                            <FiRefreshCw className="mr-2" size={16} />
                        )}
                        Gia hạn phiên
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                    >
                        <FiLogOut className="mr-2" size={16} />
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeoutWarning;
