import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaSpinner } from 'react-icons/fa';
import favoriteService from '../../services/favoriteService';
import toastService from '../../services/toastService';

const FavoriteButton = ({
    productId,
    size = 'md',
    showText = false,
    className = '',
    onFavoriteChange = null
}) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Size configurations
    const sizeConfig = {
        sm: {
            iconSize: 16,
            textSize: 'text-sm',
            padding: 'p-1'
        },
        md: {
            iconSize: 20,
            textSize: 'text-base',
            padding: 'p-2'
        },
        lg: {
            iconSize: 24,
            textSize: 'text-lg',
            padding: 'p-3'
        }
    };

    const config = sizeConfig[size] || sizeConfig.md;

    // Check initial favorite status
    useEffect(() => {
        const checkInitialStatus = async () => {
            if (!productId) return;

            try {
                const result = await favoriteService.checkFavoriteStatus(productId);
                if (result.success) {
                    setIsFavorited(result.isFavorite);
                }
            } catch (error) {
                console.error('Error checking initial favorite status:', error);
            } finally {
                setInitialCheckDone(true);
            }
        };

        checkInitialStatus();
    }, [productId]);

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!productId || loading) return;

        setLoading(true);

        try {
            const result = await favoriteService.toggleFavorite(productId);

            if (result.success) {
                const newState = !isFavorited;
                setIsFavorited(newState);

                // Show success message
                toastService.success(result.message);

                // Call callback if provided
                if (onFavoriteChange) {
                    onFavoriteChange(productId, newState);
                }
            } else {
                toastService.error(result.message || 'Có lỗi khi cập nhật yêu thích');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toastService.error('Có lỗi khi cập nhật yêu thích');
        } finally {
            setLoading(false);
        }
    };

    // Don't render until initial check is done
    if (!initialCheckDone) {
        return (
            <div className={`${config.padding} ${className}`}>
                <FaSpinner className="animate-spin text-gray-400" size={config.iconSize} />
            </div>
        );
    }

    return (
        <button
            onClick={handleToggleFavorite}
            disabled={loading || !productId}
            className={`
                ${config.padding} 
                ${config.textSize}
                transition-all duration-200 
                ${isFavorited
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-110 active:scale-95
                ${className}
            `}
            title={isFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
            <div className="flex items-center space-x-2">
                {loading ? (
                    <FaSpinner className="animate-spin" size={config.iconSize} />
                ) : (
                    <>
                        {isFavorited ? (
                            <FaHeart size={config.iconSize} />
                        ) : (
                            <FaRegHeart size={config.iconSize} />
                        )}
                        {showText && (
                            <span className="font-medium">
                                {isFavorited ? 'Đã yêu thích' : 'Yêu thích'}
                            </span>
                        )}
                    </>
                )}
            </div>
        </button>
    );
};

export default FavoriteButton;
