import React, { createContext, useContext, useState, useEffect } from 'react';
import favoriteService from '../services/favoriteService';
import { useAuth } from '../hooks/useAuth';

const FavoriteContext = createContext();

export const useFavorites = () => {
    const context = useContext(FavoriteContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoriteProvider');
    }
    return context;
};

export const FavoriteProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Load favorites when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadFavorites();
        } else {
            setFavorites([]);
            setFavoriteCount(0);
        }
    }, [isAuthenticated]);

    const loadFavorites = async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const result = await favoriteService.getFavoriteProducts(1, 100); // Load all favorites for count

            if (result.success) {
                setFavorites(result.data || []);
                setFavoriteCount(result.totalCount || 0);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToFavorites = async (productId) => {
        if (!isAuthenticated) return { success: false, message: 'Vui lòng đăng nhập' };

        try {
            const result = await favoriteService.addToFavorites(productId);

            if (result.success) {
                // Refresh favorites to get updated count
                await loadFavorites();
            }

            return result;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return { success: false, message: 'Có lỗi khi thêm vào yêu thích' };
        }
    };

    const removeFromFavorites = async (productId) => {
        if (!isAuthenticated) return { success: false, message: 'Vui lòng đăng nhập' };

        try {
            const result = await favoriteService.removeFromFavorites(productId);

            if (result.success) {
                // Update local state immediately
                setFavorites(prev => prev.filter(fav => fav.productId !== productId));
                setFavoriteCount(prev => Math.max(0, prev - 1));
            }

            return result;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return { success: false, message: 'Có lỗi khi xóa khỏi yêu thích' };
        }
    };

    const toggleFavorite = async (productId) => {
        if (!isAuthenticated) return { success: false, message: 'Vui lòng đăng nhập' };

        try {
            const result = await favoriteService.toggleFavorite(productId);

            if (result.success) {
                // Refresh favorites to get updated state
                await loadFavorites();
            }

            return result;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return { success: false, message: 'Có lỗi khi cập nhật yêu thích' };
        }
    };

    const checkFavoriteStatus = async (productId) => {
        if (!isAuthenticated) return { success: true, isFavorite: false };

        try {
            return await favoriteService.checkFavoriteStatus(productId);
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return { success: false, isFavorite: false };
        }
    };

    const isFavorite = (productId) => {
        return favorites.some(fav => fav.productId === productId);
    };

    const value = {
        favorites,
        favoriteCount,
        loading,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        checkFavoriteStatus,
        isFavorite,
        refreshFavorites: loadFavorites
    };

    return (
        <FavoriteContext.Provider value={value}>
            {children}
        </FavoriteContext.Provider>
    );
};

export default FavoriteContext;
