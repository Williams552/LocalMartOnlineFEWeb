import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaSpinner, FaUser, FaEdit } from 'react-icons/fa';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../hooks/useAuth';
import StoreReviewModal from './StoreReviewModal';
import { toast } from 'react-toastify';

const StoreReviewList = ({ storeId, storeName = 'Cửa hàng', onReviewsLoaded }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const { user, isAuthenticated } = useAuth();
    const [stats, setStats] = useState({
        averageRating: 0,
        totalCount: 0,
        breakdown: {}
    });

    useEffect(() => {
        fetchStoreReviews();
    }, [storeId]);

    const fetchStoreReviews = async () => {
        if (!storeId) return;

        try {
            setLoading(true);
            setError(null);

            const result = await reviewService.getReviewsForTarget('Store', storeId);

            if (result.success) {
                const reviewsData = result.reviews || [];
                setReviews(reviewsData);
                
                // Calculate statistics
                const avgRating = reviewService.calculateAverageRating(reviewsData);
                const breakdown = reviewService.calculateRatingBreakdown(reviewsData);
                
                setStats({
                    averageRating: avgRating,
                    totalCount: reviewsData.length,
                    breakdown: breakdown
                });

                if (onReviewsLoaded) {
                    onReviewsLoaded({
                        reviews: reviewsData,
                        averageRating: avgRating,
                        totalCount: reviewsData.length
                    });
                }
            } else {
                setError(result.message || 'Không thể tải đánh giá');
            }
        } catch (error) {
            console.error('Error fetching store reviews:', error);
            setError('Có lỗi xảy ra khi tải đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => {
            const isActive = i < rating;
            return (
                <span key={i} className={isActive ? 'text-yellow-500' : 'text-gray-300'}>
                    {isActive ? <FaStar size={14} /> : <FaRegStar size={14} />}
                </span>
            );
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowEditModal(true);
    };

    const handleEditSubmitted = async (reviewData) => {
        // Refresh reviews after edit
        await fetchStoreReviews();
        setShowEditModal(false);
        setEditingReview(null);
        
        if (onReviewsLoaded && stats) {
            onReviewsLoaded(stats);
        }
    };

    const isUserReview = (review) => {
        return isAuthenticated && user?.id && review.userId === user.id;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <FaSpinner className="animate-spin text-2xl text-supply-primary mr-2" />
                <span>Đang tải đánh giá...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                    onClick={fetchStoreReviews}
                    className="px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Summary */}
            {stats.totalCount > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Đánh giá cửa hàng
                        </h3>
                        <span className="text-sm text-gray-600">
                            {stats.totalCount} đánh giá
                        </span>
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-supply-primary">
                                {stats.averageRating}
                            </div>
                            <div className="flex items-center justify-center space-x-1 mt-1">
                                {renderStars(Math.round(stats.averageRating))}
                            </div>
                        </div>

                        <div className="flex-1">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center space-x-2 mb-1">
                                    <span className="text-sm w-3">{star}</span>
                                    <FaStar size={12} className="text-yellow-500" />
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-500 h-2 rounded-full"
                                            style={{
                                                width: `${stats.breakdown.percentages?.[star] || 0}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm w-10 text-right">
                                        {stats.breakdown.counts?.[star] || 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center p-8">
                    <div className="text-gray-500 mb-4">
                        <FaStar size={48} className="mx-auto text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có đánh giá nào
                    </h3>
                    <p className="text-gray-600">
                        Hãy là người đầu tiên đánh giá cửa hàng này!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                        Đánh giá từ khách hàng ({reviews.length})
                    </h4>
                    
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white border border-gray-200 rounded-lg p-6"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <FaUser className="text-gray-500" size={16} />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h5 className="font-medium text-gray-900">
                                                {review.reviewerName || 'Khách hàng ẩn danh'}
                                            </h5>
                                            <div className="flex items-center space-x-1 mt-1">
                                                {renderStars(review.rating)}
                                                <span className="text-sm text-gray-600 ml-2">
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>

                                    {review.comment && (
                                        <div className="mt-3">
                                            <p className="text-gray-700 leading-relaxed">
                                                {review.comment}
                                            </p>
                                        </div>
                                    )}

                                    {/* Edit button for user's own review */}
                                    {isUserReview(review) && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => handleEditReview(review)}
                                                className="inline-flex items-center space-x-2 text-sm text-supply-primary hover:text-green-600 font-medium transition-colors"
                                            >
                                                <FaEdit size={14} />
                                                <span>Chỉnh sửa đánh giá</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Review Modal */}
            <StoreReviewModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingReview(null);
                }}
                storeId={storeId}
                storeName={storeName} // You might want to pass store name as prop
                userId={user?.id}
                existingReview={editingReview}
                onReviewSubmitted={handleEditSubmitted}
            />
        </div>
    );
};

export default StoreReviewList;
