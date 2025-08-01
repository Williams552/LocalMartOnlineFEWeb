import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaSpinner } from 'react-icons/fa';
import { useFollowStore } from '../contexts/FollowStoreContext';
import toastService from '../services/toastService';
import { useAuth } from '../hooks/useAuth';

const FollowStoreButton = ({
    storeId,
    initialFollowing = false,
    onFollowChange,
    className = '',
    variant = 'default', // 'default', 'outline', 'white', 'icon-only'
    size = 'md' // 'sm', 'md', 'lg'
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    const { isAuthenticated } = useAuth();
    const { isFollowing, toggleFollow, checkFollowStatus } = useFollowStore();

    const currentlyFollowing = isFollowing(storeId);

    // Check follow status on mount
    useEffect(() => {
        const checkStatus = async () => {
            if (!isAuthenticated || !storeId) {
                setIsCheckingStatus(false);
                return;
            }

            try {
                await checkFollowStatus(storeId);
            } catch (error) {
                console.error('Error checking follow status:', error);
            } finally {
                setIsCheckingStatus(false);
            }
        };

        checkStatus();
    }, [storeId, isAuthenticated, checkFollowStatus]);

    const handleFollowToggle = async () => {
        if (!isAuthenticated) {
            toastService.info('Vui lòng đăng nhập để theo dõi gian hàng');
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        try {
            const result = await toggleFollow(storeId);

            if (result.success) {
                // Call callback if provided
                if (onFollowChange) {
                    onFollowChange(!currentlyFollowing);
                }

                // Show success message
                toastService.success(result.message);
            } else {
                toastService.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            toastService.error('Không thể thay đổi trạng thái theo dõi');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state during initial check
    if (isCheckingStatus) {
        return (
            <button
                disabled
                className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all opacity-50 cursor-not-allowed ${getSizeClasses(size)} ${className}`}
            >
                <FaSpinner className="animate-spin" />
                {variant !== 'icon-only' && <span>Đang tải...</span>}
            </button>
        );
    }

    return (
        <button
            onClick={handleFollowToggle}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all transform hover:scale-105 ${getSizeClasses(size)} ${getVariantClasses(variant, isFollowing)} ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                } ${className}`}
        >
            {isLoading ? (
                <FaSpinner className="animate-spin" />
            ) : currentlyFollowing ? (
                <FaHeart className="text-current" />
            ) : (
                <FaRegHeart className="text-current" />
            )}

            {variant !== 'icon-only' && (
                <span>
                    {isLoading
                        ? 'Đang xử lý...'
                        : currentlyFollowing
                            ? 'Đã theo dõi'
                            : 'Theo dõi'
                    }
                </span>
            )}
        </button>
    );
};

// Helper functions for styling
const getSizeClasses = (size) => {
    switch (size) {
        case 'sm':
            return 'px-3 py-1.5 text-sm';
        case 'lg':
            return 'px-6 py-3 text-lg';
        default:
            return 'px-4 py-2 text-base';
    }
};

const getVariantClasses = (variant, isFollowing) => {
    switch (variant) {
        case 'outline':
            return isFollowing
                ? 'border-2 border-red-500 text-red-500 bg-red-50 hover:bg-red-100'
                : 'border-2 border-supply-primary text-supply-primary bg-white hover:bg-supply-primary hover:text-white';
        case 'white':
            return isFollowing
                ? 'border-2 border-red-500 text-red-500 bg-white hover:bg-red-50'
                : 'border-2 border-supply-primary text-supply-primary bg-white hover:bg-supply-primary hover:text-white';
        case 'icon-only':
            return isFollowing
                ? 'text-red-500 hover:text-red-600 p-2'
                : 'text-gray-500 hover:text-supply-primary p-2';
        default:
            return isFollowing
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-supply-primary text-white hover:bg-supply-primary-dark';
    }
};

export default FollowStoreButton;
