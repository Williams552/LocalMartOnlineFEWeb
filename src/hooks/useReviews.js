import { useState, useEffect, useCallback } from 'react';
import reviewService from '../services/reviewService';

export const useReviews = (targetType, targetId, options = {}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [averageRating, setAverageRating] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [ratingBreakdown, setRatingBreakdown] = useState(null);
    const [hasMore, setHasMore] = useState(false);

    const {
        autoFetch = true,
        pageSize = 10,
        initialFilters = {}
    } = options;

    const [filters, setFilters] = useState({
        page: 1,
        pageSize,
        sortBy: 'newest',
        ...initialFilters
    });

    const fetchReviews = useCallback(async (newFilters = {}, append = false) => {
        if (!targetType || !targetId) return;

        try {
            setLoading(true);
            setError(null);

            const finalFilters = { ...filters, ...newFilters };
            const result = await reviewService.getReviewsForTarget(targetType, targetId, finalFilters);

            if (result.success) {
                const formattedReviews = result.reviews.map(review =>
                    reviewService.formatReviewForDisplay(review)
                );

                if (append) {
                    setReviews(prev => [...prev, ...formattedReviews]);
                } else {
                    setReviews(formattedReviews);
                }

                setAverageRating(result.averageRating);
                setTotalCount(result.totalCount);

                const breakdown = reviewService.calculateRatingBreakdown(formattedReviews);
                setRatingBreakdown(breakdown);

                setHasMore(formattedReviews.length === finalFilters.pageSize);
                setFilters(finalFilters);
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Không thể tải đánh giá');
        } finally {
            setLoading(false);
        }
    }, [targetType, targetId, filters]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchReviews({ page: filters.page + 1 }, true);
        }
    }, [fetchReviews, loading, hasMore, filters.page]);

    const applyFilters = useCallback((newFilters) => {
        const resetFilters = { ...newFilters, page: 1 };
        fetchReviews(resetFilters, false);
    }, [fetchReviews]);

    const refresh = useCallback(() => {
        fetchReviews({}, false);
    }, [fetchReviews]);

    useEffect(() => {
        if (autoFetch && targetType && targetId) {
            fetchReviews();
        }
    }, [targetType, targetId, autoFetch]);

    return {
        reviews,
        loading,
        error,
        averageRating,
        totalCount,
        ratingBreakdown,
        hasMore,
        filters,
        loadMore,
        applyFilters,
        refresh,
        fetchReviews
    };
};

export const useUserReviews = (userId, options = {}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { autoFetch = true } = options;

    const fetchUserReviews = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            const result = await reviewService.getUserReviews(userId);

            if (result.success) {
                const formattedReviews = result.reviews.map(review =>
                    reviewService.formatReviewForDisplay(review)
                );
                setReviews(formattedReviews);
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error('Error fetching user reviews:', err);
            setError('Không thể tải đánh giá của người dùng');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const addReview = useCallback((newReview) => {
        const formattedReview = reviewService.formatReviewForDisplay(newReview);
        setReviews(prev => [formattedReview, ...prev]);
    }, []);

    const updateReview = useCallback((updatedReview) => {
        const formattedReview = reviewService.formatReviewForDisplay(updatedReview);
        setReviews(prev => prev.map(review =>
            review.id === updatedReview.id ? formattedReview : review
        ));
    }, []);

    const removeReview = useCallback((reviewId) => {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
    }, []);

    useEffect(() => {
        if (autoFetch && userId) {
            fetchUserReviews();
        }
    }, [userId, autoFetch, fetchUserReviews]);

    return {
        reviews,
        loading,
        error,
        fetchUserReviews,
        addReview,
        updateReview,
        removeReview,
        refresh: fetchUserReviews
    };
};
