import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaStar, FaRegStar, FaThumbsUp, FaUser, FaCheckCircle, FaFilter, FaSort } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import reviewService from '../../services/reviewService';

const ReviewList = forwardRef(({ targetType, targetId, showFilters = true, maxHeight = "600px" }, ref) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [averageRating, setAverageRating] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [ratingBreakdown, setRatingBreakdown] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        sortBy: 'newest',
        page: 1,
        pageSize: 10
        // rating is intentionally omitted when null
    });

    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Expose refresh function through ref
    useImperativeHandle(ref, () => ({
        refresh: () => {
            fetchReviews();
        }
    }), []);

    useEffect(() => {
        if (targetType && targetId) {
            fetchReviews();
        }
    }, [targetType, targetId, filters]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching reviews for:', { targetType, targetId, filters });
            const result = await reviewService.getReviewsForTarget(targetType, targetId, filters);

            console.log('Review fetch result:', result);

            if (result.success) {
                const validReviews = Array.isArray(result.reviews) ? result.reviews : [];
                const formattedReviews = validReviews
                    .map(review => reviewService.formatReviewForDisplay(review))
                    .filter(review => review !== null); // Filter out null reviews

                setReviews(formattedReviews);
                setAverageRating(Number(result.averageRating) || 0);
                setTotalCount(Number(result.totalCount) || 0);

                // Calculate rating breakdown
                const breakdown = reviewService.calculateRatingBreakdown(formattedReviews);
                setRatingBreakdown(breakdown);

                // If no reviews found, it's not an error
                if (formattedReviews.length === 0) {
                    console.log('No reviews found for this target');
                }
            } else {
                console.error('Failed to fetch reviews:', result.message);
                setError(result.message || 'Không thể tải đánh giá');
                // Set empty state
                setReviews([]);
                setAverageRating(0);
                setTotalCount(0);
                setRatingBreakdown(reviewService.calculateRatingBreakdown([]));
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Không thể tải đánh giá');
            // Set empty state
            setReviews([]);
            setAverageRating(0);
            setTotalCount(0);
            setRatingBreakdown(reviewService.calculateRatingBreakdown([]));
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className="text-yellow-500" />
            ) : (
                <FaRegStar key={i} className="text-gray-300" />
            )
        );
    };

    const handleFilterChange = (newFilters) => {
        // Clean filters to avoid sending null values
        const cleanedFilters = {};
        Object.keys(newFilters).forEach(key => {
            const value = newFilters[key];
            if (value !== null && value !== undefined && value !== '') {
                cleanedFilters[key] = value;
            }
        });

        setFilters(prev => ({
            ...prev,
            ...cleanedFilters,
            page: 1 // Reset to first page when filtering
        }));
        setShowFilterDropdown(false);
    };

    const clearRatingFilter = () => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters.rating; // Remove rating property completely
            newFilters.page = 1; // Reset to first page
            return newFilters;
        });
        setShowFilterDropdown(false);
    };

    const handleLoadMore = () => {
        setFilters(prev => ({
            ...prev,
            page: prev.page + 1
        }));
    };

    if (loading && reviews.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border-b pb-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                                        <div className="h-3 bg-gray-200 rounded mb-2 w-1/6"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center py-8">
                    <div className="text-red-500 text-xl mb-2">⚠️</div>
                    <p className="text-gray-600 mb-2">{error}</p>
                    <p className="text-gray-500 text-sm mb-4">
                        {error.includes('404') || error.includes('Chưa có')
                            ? 'Sản phẩm này chưa có đánh giá nào.'
                            : 'Đã xảy ra lỗi khi tải đánh giá.'
                        }
                    </p>
                    <button
                        onClick={fetchReviews}
                        className="mt-4 bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-supply-primary-dark transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // No reviews found but not an error
    if (!loading && reviews.length === 0 && totalCount === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có đánh giá</h3>
                    <p className="text-gray-600">Sản phẩm này chưa có đánh giá nào từ khách hàng.</p>
                    <p className="text-gray-500 text-sm mt-2">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Header với tổng quan */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Đánh giá ({totalCount})
                    </h2>

                    {showFilters && (
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaFilter className="text-sm" />
                                <span className="text-sm">Lọc & Sắp xếp</span>
                            </button>

                            {showFilterDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    <div className="p-4">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Lọc theo số sao
                                            </label>
                                            <div className="space-y-2">
                                                <button
                                                    onClick={clearRatingFilter}
                                                    className={`w-full text-left px-3 py-2 rounded ${!filters.hasOwnProperty('rating') ? 'bg-supply-primary text-white' : 'hover:bg-gray-100'
                                                        }`}
                                                >
                                                    Tất cả
                                                </button>
                                                {[5, 4, 3, 2, 1].map(rating => (
                                                    <button
                                                        key={rating}
                                                        onClick={() => handleFilterChange({ rating })}
                                                        className={`w-full text-left px-3 py-2 rounded flex items-center ${filters.rating === rating ? 'bg-supply-primary text-white' : 'hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <div className="flex items-center">
                                                            {renderStars(rating)}
                                                            <span className="ml-2">{rating} sao</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Sắp xếp theo
                                            </label>
                                            <div className="space-y-2">
                                                {[
                                                    { value: 'newest', label: 'Mới nhất' },
                                                    { value: 'oldest', label: 'Cũ nhất' },
                                                    { value: 'rating_high', label: 'Đánh giá cao nhất' },
                                                    { value: 'rating_low', label: 'Đánh giá thấp nhất' }
                                                ].map(option => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => handleFilterChange({ sortBy: option.value })}
                                                        className={`w-full text-left px-3 py-2 rounded ${filters.sortBy === option.value ? 'bg-supply-primary text-white' : 'hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Rating Overview */}
                {averageRating > 0 && (
                    <div className="flex items-center space-x-6 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-800 mb-1">
                                {averageRating.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center mb-1">
                                {renderStars(averageRating)}
                            </div>
                            <div className="text-sm text-gray-600">
                                {totalCount} đánh giá
                            </div>
                        </div>

                        {ratingBreakdown && (
                            <div className="flex-1">
                                {[5, 4, 3, 2, 1].map(rating => (
                                    <div key={rating} className="flex items-center space-x-2 mb-1">
                                        <span className="text-sm w-6">{rating}</span>
                                        <FaStar className="text-yellow-500 text-xs" />
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-500 h-2 rounded-full"
                                                style={{ width: `${ratingBreakdown.percentages[rating]}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-8">
                                            {ratingBreakdown.counts[rating]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reviews List */}
            <div className="space-y-6" style={{ maxHeight, overflowY: 'auto' }}>
                {reviews.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-4">💬</div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            Chưa có đánh giá nào
                        </h3>
                        <p className="text-gray-600">
                            Hãy là người đầu tiên đánh giá sản phẩm này!
                        </p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start space-x-4">
                                {/* User Avatar */}
                                <div className="w-12 h-12 bg-gradient-to-r from-supply-primary to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {review.userAvatar ? (
                                        <img
                                            src={review.userAvatar}
                                            alt={review.userName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <FaUser className="text-lg" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    {/* User Info */}
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-medium text-gray-800">
                                            {review.userName}
                                        </span>
                                        {review.isVerifiedPurchase && (
                                            <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                                <FaCheckCircle className="text-xs" />
                                                <span>Đã mua hàng</span>
                                            </div>
                                        )}
                                        <span className="text-sm text-gray-500">
                                            {review.timeAgo}
                                        </span>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center space-x-1 mb-3">
                                        {renderStars(review.rating)}
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <p className="text-gray-700 mb-3 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    )}

                                    {/* Seller Response */}
                                    {review.response && (
                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="font-medium text-blue-800">
                                                    Phản hồi từ người bán
                                                </span>
                                            </div>
                                            <p className="text-blue-700 text-sm">
                                                {review.response}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Load More Button */}
            {reviews.length > 0 && reviews.length < totalCount && (
                <div className="text-center mt-6">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-supply-primary-dark transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
                    </button>
                </div>
            )}
        </div>
    );
});

ReviewList.displayName = 'ReviewList';

export default ReviewList;
