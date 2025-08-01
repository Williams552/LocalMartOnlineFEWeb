import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaStar, FaRegStar, FaUser, FaReply, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { Button, Input, message } from 'antd';
import reviewService from '../../services/reviewService';
import authService from '../../services/authService';

const { TextArea } = Input;

const ReviewListWithResponse = forwardRef(({ targetType, targetId, maxHeight = "600px" }, ref) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [averageRating, setAverageRating] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [responseStates, setResponseStates] = useState({});
    const [respondingTo, setRespondingTo] = useState(null);

    const currentUser = authService.getCurrentUser();

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
    }, [targetType, targetId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching reviews for:', { targetType, targetId });
            const result = await reviewService.getReviewsForTarget(targetType, targetId, {
                sortBy: 'newest',
                page: 1,
                pageSize: 50
            });

            console.log('Review fetch result:', result);

            if (result.success) {
                const validReviews = Array.isArray(result.reviews) ? result.reviews : [];
                const formattedReviews = validReviews
                    .map(review => reviewService.formatReviewForDisplay(review))
                    .filter(review => review && review.id);

                setReviews(formattedReviews);
                setTotalCount(result.totalCount || formattedReviews.length);
                setAverageRating(result.averageRating || 0);
                console.log('Reviews loaded:', formattedReviews.length);
            } else {
                console.warn('Review fetch was not successful:', result.message);
                setReviews([]);
                setTotalCount(0);
                setAverageRating(0);
                setError(result.message || 'Không thể tải đánh giá');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError('Có lỗi xảy ra khi tải đánh giá');
            setReviews([]);
            setTotalCount(0);
            setAverageRating(0);
        } finally {
            setLoading(false);
        }
    };

    const handleResponseSubmit = async (reviewId) => {
        const responseText = responseStates[reviewId];
        if (!responseText || !responseText.trim()) {
            message.warning('Vui lòng nhập nội dung phản hồi');
            return;
        }

        if (!currentUser?.id) {
            message.error('Không tìm thấy thông tin người dùng');
            return;
        }

        try {
            const result = await reviewService.respondToReview(reviewId, currentUser.id, responseText.trim());
            
            if (result.success) {
                message.success('Phản hồi đã được gửi thành công');
                setResponseStates(prev => ({ ...prev, [reviewId]: '' }));
                setRespondingTo(null);
                // Refresh reviews to show the new response
                fetchReviews();
            } else {
                message.error(result.message || 'Không thể gửi phản hồi');
            }
        } catch (error) {
            console.error('Error submitting response:', error);
            message.error('Có lỗi xảy ra khi gửi phản hồi');
        }
    };

    const handleResponseChange = (reviewId, value) => {
        setResponseStates(prev => ({ ...prev, [reviewId]: value }));
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} className="text-yellow-400" />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<FaStar key={i} className="text-yellow-400" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-gray-300" />);
            }
        }
        return stars;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải đánh giá...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-2">⚠️ {error}</div>
                <button
                    onClick={fetchReviews}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="review-list" style={{ maxHeight, overflow: 'auto' }}>
            {/* Header với thống kê */}
            {totalCount > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <div className="flex items-center">
                                    {renderStars(averageRating)}
                                </div>
                                <span className="font-medium text-lg">{averageRating.toFixed(1)}</span>
                                <span className="text-gray-600">({totalCount} đánh giá)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Danh sách reviews */}
            {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <FaStar className="mx-auto mb-2 text-gray-300" size={48} />
                    <p>Chưa có đánh giá nào</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                            {/* Review header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <FaUser className="text-gray-500" size={16} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {review.reviewerName || 'Người dùng ẩn danh'}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center">
                                                {renderStars(review.rating)}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Review content */}
                            <div className="mb-3">
                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>

                            {/* Existing response */}
                            {review.response && (
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                                    <div className="flex items-center mb-2">
                                        <FaReply className="text-blue-600 mr-2" size={14} />
                                        <span className="text-sm font-medium text-blue-800">Phản hồi từ cửa hàng</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{review.response}</p>
                                </div>
                            )}

                            {/* Response section for sellers */}
                            {!review.response && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    {respondingTo === review.id ? (
                                        <div className="space-y-3">
                                            <TextArea
                                                value={responseStates[review.id] || ''}
                                                onChange={(e) => handleResponseChange(review.id, e.target.value)}
                                                placeholder="Nhập phản hồi của bạn..."
                                                rows={3}
                                                maxLength={500}
                                            />
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    {(responseStates[review.id] || '').length}/500 ký tự
                                                </span>
                                                <div className="flex space-x-2">
                                                    <Button 
                                                        size="small"
                                                        onClick={() => {
                                                            setRespondingTo(null);
                                                            setResponseStates(prev => ({ ...prev, [review.id]: '' }));
                                                        }}
                                                    >
                                                        <FaTimes className="mr-1" size={12} />
                                                        Hủy
                                                    </Button>
                                                    <Button 
                                                        type="primary" 
                                                        size="small"
                                                        onClick={() => handleResponseSubmit(review.id)}
                                                        disabled={!responseStates[review.id]?.trim()}
                                                    >
                                                        <FaPaperPlane className="mr-1" size={12} />
                                                        Gửi phản hồi
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button 
                                            type="link" 
                                            size="small"
                                            onClick={() => setRespondingTo(review.id)}
                                            className="p-0 h-auto"
                                        >
                                            <FaReply className="mr-1" size={12} />
                                            Phản hồi
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default ReviewListWithResponse;
