import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaPaperPlane, FaTimes, FaSpinner } from 'react-icons/fa';
import reviewService from '../../services/reviewService';
import { toast } from 'react-toastify';

const StoreReviewForm = ({
    storeId,
    storeName,
    userId,
    existingReview = null,
    onReviewSubmitted,
    onCancel,
    isModal = false
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentReview, setCurrentReview] = useState(existingReview);
    const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState(false);

    // Initialize form with existing review data or check for existing review
    useEffect(() => {
        if (existingReview && existingReview.id) {
            // If existingReview is passed as prop, use it directly
            setCurrentReview(existingReview);
            setRating(existingReview.rating || 0);
            setComment(existingReview.comment || '');
            setLoading(false);
        } else if (!currentReview) {
            // Only check for existing review if we don't have one yet
            const checkExistingReview = async () => {
                if (!userId || !storeId) return;
                
                try {
                    setLoading(true);
                    const result = await reviewService.getUserReviewForTarget('Store', storeId, userId);
                    
                    if (result.success && result.data && result.data.id) {
                        setCurrentReview(result.data);
                        setRating(result.data.rating || 0);
                        setComment(result.data.comment || '');
                    } else {
                        // Reset form for new review
                        setCurrentReview(null);
                        setRating(0);
                        setComment('');
                    }
                } catch (error) {
                    console.error('Error checking existing review:', error);
                    // Reset form on error
                    setCurrentReview(null);
                    setRating(0);
                    setComment('');
                } finally {
                    setLoading(false);
                }
            };
            
            checkExistingReview();
        }
    }, [userId, storeId, existingReview]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        const reviewData = {
            targetType: 'Store',
            targetId: storeId,
            rating,
            comment: comment.trim()
        };

        console.log('Submitting store review:', reviewData);

        const validation = reviewService.validateReviewData(reviewData);
        if (!validation.isValid) {
            validation.errors.forEach(error => toast.error(error));
            return;
        }

        try {
            setSubmitting(true);

            let result;
            const currentExistingReview = currentReview;
            
            if (currentExistingReview && currentExistingReview.id) {
                // Update existing review
                console.log('Updating existing store review:', currentExistingReview.id);
                result = await reviewService.updateReview(currentExistingReview.id, userId, {
                    rating,
                    comment: comment.trim()
                });
            } else {
                // Create new review or check if review exists
                let reviewToUpdate = currentExistingReview;
                
                // If no existing review passed as prop, check again
                if (!reviewToUpdate) {
                    const checkResult = await reviewService.getUserReviewForTarget('Store', storeId, userId);
                    if (checkResult.success && checkResult.data) {
                        reviewToUpdate = checkResult.data;
                    }
                }

                if (reviewToUpdate && reviewToUpdate.id) {
                    // Update found review
                    console.log('Updating found store review:', reviewToUpdate.id);
                    result = await reviewService.updateReview(reviewToUpdate.id, userId, {
                        rating,
                        comment: comment.trim()
                    });
                } else {
                    // Create new review
                    console.log('Creating new store review');
                    result = await reviewService.createReview(userId, reviewData);
                }
            }

            console.log('Store review submission result:', result);

            if (result.success) {
                const isUpdate = currentExistingReview || (result.data && result.data.id);
                
                // Custom success messages
                let successMessage;
                if (isUpdate) {
                    successMessage = 'Cập nhật đánh giá thành công';
                } else {
                    successMessage = 'Đánh giá cửa hàng thành công';
                }
                
                toast.success(successMessage);
                
                // Update current review state to enable editing mode
                if (result.data) {
                    setCurrentReview(result.data);
                    setHasSubmittedSuccessfully(true);
                }
                
                // Only call onReviewSubmitted if it's not modal mode or if explicitly requested
                // This prevents the form from being closed automatically
                if (onReviewSubmitted && !isModal) {
                    onReviewSubmitted(result.data);
                }

                // Reload the page after successful submission
                setTimeout(() => {
                    window.location.reload();
                }, 500); // Delay 1.5 seconds to let user see the success message
            } else {
                // Custom error message for already reviewed
                toast.error('Bạn đã đánh giá cửa hàng này rồi');
            }
        } catch (error) {
            console.error('Error submitting store review:', error);
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
                    disabled={submitting}
                >
                    {isActive ? <FaStar /> : <FaRegStar />}
                </button>
            );
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <FaSpinner className="animate-spin text-2xl text-supply-primary mr-2" />
                <span>Đang kiểm tra đánh giá...</span>
            </div>
        );
    }

    const content = (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {currentReview ? 'Chỉnh sửa đánh giá cửa hàng' : 'Đánh giá cửa hàng'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{storeName}</p>
                </div>
                {isModal && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                )}
            </div>

            {/* Success message after submission */}
            {hasSubmittedSuccessfully && isModal && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-800">
                                Đánh giá đã được gửi thành công!
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                                Bạn có thể tiếp tục chỉnh sửa đánh giá hoặc đóng form này.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating */}
            <div className="space-y-2">
                <div className="flex items-center space-x-1">
                    {renderStars()}
                </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                    Nhận xét về cửa hàng
                </label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về cửa hàng này (tùy chọn)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent resize-none text-gray-900 bg-white placeholder-gray-500"
                    rows="4"
                    maxLength="1000"
                    disabled={submitting}
                />
                <div className="text-right text-xs text-gray-500">
                    {comment.length}/1000 ký tự
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
                {!isModal && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={submitting}
                    >
                        Hủy
                    </button>
                )}
                
                {/* Show close button for modal after successful submission */}
                {isModal && hasSubmittedSuccessfully && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={submitting}
                    >
                        Đóng
                    </button>
                )}
                
                <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="flex items-center space-x-2 px-6 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {submitting ? (
                        <>
                            <FaSpinner className="animate-spin" size={16} />
                            <span>Đang gửi...</span>
                        </>
                    ) : (
                        <>
                            <FaPaperPlane size={16} />
                            <span>{currentReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {content}
        </div>
    );
};

export default StoreReviewForm;
