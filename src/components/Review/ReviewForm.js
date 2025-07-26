import React, { useState } from 'react';
import { FaStar, FaRegStar, FaPaperPlane, FaTimes } from 'react-icons/fa';
import reviewService from '../../services/reviewService';
import eventService from '../../services/eventService';
import { toast } from 'react-toastify';

const ReviewForm = ({
    targetType,
    targetId,
    userId,
    onReviewSubmitted,
    onCancel,
    existingReview = null,
    isModal = false
}) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        } const reviewData = {
            targetType,
            targetId,
            rating,
            comment: comment.trim()
        };

        console.log('Submitting review:', reviewData);
        console.log('User ID:', userId);

        const validation = reviewService.validateReviewData(reviewData);
        if (!validation.isValid) {
            validation.errors.forEach(error => toast.error(error));
            return;
        }

        try {
            setSubmitting(true);

            let result;
            if (existingReview) {
                // Update existing review
                console.log('Updating existing review:', existingReview.id);
                result = await reviewService.updateReview(existingReview.id, userId, {
                    rating,
                    comment: comment.trim()
                });
            } else {
                // Create new review
                console.log('Creating new review');
                result = await reviewService.createReview(userId, reviewData);
            }

            console.log('Review submission result:', result);

            if (result.success) {
                toast.success(result.message);
                if (onReviewSubmitted) {
                    onReviewSubmitted(result.data);
                }

                // Emit event to refresh reviews
                eventService.emit(eventService.EVENTS.REVIEWS_REFRESH, {
                    productId: targetId
                });

                // Reset form if creating new review
                if (!existingReview) {
                    setRating(0);
                    setComment('');
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            const isActive = starValue <= (hoverRating || rating);

            return (
                <button
                    key={i}
                    type="button"
                    className={`text-2xl transition-colors ${isActive ? 'text-yellow-500' : 'text-gray-300'
                        } hover:text-yellow-500`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                >
                    {isActive ? <FaStar /> : <FaRegStar />}
                </button>
            );
        });
    };

    const getRatingText = (rating) => {
        const ratingTexts = {
            1: 'Rất không hài lòng',
            2: 'Không hài lòng',
            3: 'Bình thường',
            4: 'Hài lòng',
            5: 'Rất hài lòng'
        };
        return ratingTexts[rating] || '';
    };

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                    {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
                </h3>
                {isModal && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                )}
            </div>

            {/* Rating Section */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Đánh giá của bạn *
                </label>
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        {renderStars()}
                    </div>
                    {(rating > 0 || hoverRating > 0) && (
                        <span className="text-sm text-gray-600 ml-3">
                            {getRatingText(hoverRating || rating)}
                        </span>
                    )}
                </div>
            </div>

            {/* Comment Section */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Chia sẻ trải nghiệm của bạn
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm/dịch vụ này..."
                    rows={4}
                    maxLength={1000}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-supply-primary resize-none"
                />
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Tối đa 1000 ký tự</span>
                    <span>{comment.length}/1000</span>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">💡 Mẹo viết đánh giá hữu ích:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Chia sẻ trải nghiệm thực tế của bạn</li>
                    <li>• Mô tả chất lượng sản phẩm/dịch vụ</li>
                    <li>• Đề cập đến ưu điểm và nhược điểm</li>
                    <li>• Giữ đánh giá khách quan và lịch sự</li>
                </ul>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3">
                <button
                    type="submit"
                    disabled={rating === 0 || submitting}
                    className="flex-1 bg-supply-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-supply-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {submitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Đang gửi...</span>
                        </>
                    ) : (
                        <>
                            <FaPaperPlane />
                            <span>{existingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}</span>
                        </>
                    )}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                )}
            </div>
        </form>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    {formContent}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            {formContent}
        </div>
    );
};

export default ReviewForm;
