import React, { createContext, useContext, useState, useEffect } from 'react';
import followStoreService from '../services/followStoreService';
import { useAuth } from '../hooks/useAuth';

const FollowStoreContext = createContext();

export const useFollowStore = () => {
    const context = useContext(FollowStoreContext);
    if (!context) {
        throw new Error('useFollowStore must be used within a FollowStoreProvider');
    }
    return context;
};

export const FollowStoreProvider = ({ children }) => {
    const [followingStores, setFollowingStores] = useState(new Set());
    const [followingCount, setFollowingCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, user } = useAuth();

    // Load following stores when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadFollowingStores();
        } else {
            setFollowingStores(new Set());
            setFollowingCount(0);
        }
    }, [isAuthenticated, user]);

    const loadFollowingStores = async () => {
        try {
            setLoading(true);
            const result = await followStoreService.getFollowingStores(1, 1000); // Get all following stores

            if (result.success) {
                const storeIds = new Set(result.data.map(store => store.id || store.storeId));
                setFollowingStores(storeIds);
                setFollowingCount(result.totalCount || result.data.length);
            }
        } catch (error) {
            console.error('Error loading following stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const followStore = async (storeId) => {
        try {
            const result = await followStoreService.followStore(storeId);
            if (result.success) {
                setFollowingStores(prev => new Set([...prev, storeId]));
                setFollowingCount(prev => prev + 1);
                return result;
            }
            return result;
        } catch (error) {
            console.error('Error following store:', error);
            return { success: false, message: 'Không thể theo dõi gian hàng' };
        }
    };

    const unfollowStore = async (storeId) => {
        try {
            const result = await followStoreService.unfollowStore(storeId);
            if (result.success) {
                setFollowingStores(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(storeId);
                    return newSet;
                });
                setFollowingCount(prev => Math.max(0, prev - 1));
                return result;
            }
            return result;
        } catch (error) {
            console.error('Error unfollowing store:', error);
            return { success: false, message: 'Không thể hủy theo dõi gian hàng' };
        }
    };

    const toggleFollow = async (storeId) => {
        const isCurrentlyFollowing = followingStores.has(storeId);

        if (isCurrentlyFollowing) {
            return await unfollowStore(storeId);
        } else {
            return await followStore(storeId);
        }
    };

    const isFollowing = (storeId) => {
        return followingStores.has(storeId);
    };

    const checkFollowStatus = async (storeId) => {
        try {
            const result = await followStoreService.checkFollowing(storeId);
            if (result.success) {
                // Update local state if needed
                if (result.isFollowing && !followingStores.has(storeId)) {
                    setFollowingStores(prev => new Set([...prev, storeId]));
                } else if (!result.isFollowing && followingStores.has(storeId)) {
                    setFollowingStores(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(storeId);
                        return newSet;
                    });
                }
                return result.isFollowing;
            }
            return false;
        } catch (error) {
            console.error('Error checking follow status:', error);
            return false;
        }
    };

    const refreshFollowingStores = () => {
        if (isAuthenticated) {
            loadFollowingStores();
        }
    };

    const value = {
        // State
        followingStores: Array.from(followingStores),
        followingCount,
        loading,

        // Actions
        followStore,
        unfollowStore,
        toggleFollow,
        isFollowing,
        checkFollowStatus,
        refreshFollowingStores,

        // Utilities
        isAuthenticated: isAuthenticated && !!user
    };

    return (
        <FollowStoreContext.Provider value={value}>
            {children}
        </FollowStoreContext.Provider>
    );
};

export default FollowStoreContext;
