import React, { useState } from 'react';
import { FaStar, FaRegStar, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import reviewService from '../../services/reviewService';
import eventService from '../../services/eventService';
import './OrderAnimations.css';

const OrderReviewModal = ({ order, isOpen, onClose, onSubmitSuccess }) => {
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const renderStars = (rating, onRatingChange) => {
        return Array.from({ length: 5 }, (_, i) => (
            <button
                key={i}
                type="button"
                onClick={() => onRatingChange(i + 1)}
                className="focus:outline-none hover:scale-110 transition-transform rating-star"
            >
                {i < rating ? (
                    <FaStar className="text-yellow-500 text-xl" />
                ) : (
                    <FaRegStar className="text-gray-300 text-xl hover:text-yellow-400" />
                )}
            </button>
        ));
    };

    const handleRatingChange = (productId, rating) => {
        setRatings(prev => ({
            ...prev,
            [productId]: rating
        }));
    };

    const handleCommentChange = (productId, comment) => {
        setComments(prev => ({
            ...prev,
            [productId]: comment
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!order || !order.items || order.items.length === 0) {
            toast.error('Không tìm thấy sản phẩm để đánh giá');
            return;
        }

        // Validate that all products have ratings
        const unratedProducts = order.items.filter(item => !ratings[item.productId]);
        if (unratedProducts.length > 0) {
            toast.error('Vui lòng đánh giá tất cả sản phẩm trong đơn hàng');
            return;
        }

        setSubmitting(true);

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id || user._id;

            if (!userId) {
                toast.error('Không tìm thấy thông tin người dùng');
                return;
            }

            // Submit reviews for each product
            const reviewPromises = order.items.map(async (item) => {
                const reviewData = {
                    targetType: 'Product',
                    targetId: item.productId,
                    orderId: order.id, // Thêm orderId để track review per order
                    rating: ratings[item.productId],
                    comment: comments[item.productId] || ''
                };

                console.log(`Submitting review for product ${item.productId} from order ${order.id}:`, reviewData);
                return await reviewService.createReview(userId, reviewData);
            });

            const results = await Promise.all(reviewPromises);

            // Check if all reviews were successful
            const successfulReviews = results.filter(result => result.success);
            const failedReviews = results.filter(result => !result.success);

            if (failedReviews.length > 0) {
                console.error('Some reviews failed:', failedReviews);
                toast.warning(`Đã gửi ${successfulReviews.length}/${results.length} đánh giá thành công`);
            } else {
                toast.success('Cảm ơn bạn đã đánh giá! Tất cả đánh giá đã được gửi thành công.');
            }

            // Reset form
            setRatings({});
            setComments({});

            // Call success callback
            if (onSubmitSuccess) {
                onSubmitSuccess(results);
            }

            // Emit event to refresh reviews in ProductDetail
            const productIds = results
                .filter(result => result.success && result.review)
                .map(result => result.review.targetId);

            if (productIds.length > 0) {
                // Emit refresh event for each product
                productIds.forEach(productId => {
                    eventService.emit(eventService.EVENTS.REVIEWS_REFRESH, { productId });
                });

                // Also emit a general refresh event
                eventService.emit(eventService.EVENTS.REVIEWS_REFRESH);
            }

            // Close modal
            onClose();

        } catch (error) {
            console.error('Error submitting reviews:', error);
            toast.error('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl modal-content">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <FaCheck className="text-green-600 mr-3 animate-bounce-in" />
                                Đánh giá đơn hàng
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Đơn hàng #{order.id} đã hoàn thành thành công
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
                            disabled={submitting}
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Order Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3 mb-3">
                                <img
                                    src={order.sellerAvatar || "https://i.pravatar.cc/50?img=1"}
                                    alt={order.sellerName || "Seller"}
                                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">
                                        {order.sellerName || "Cửa hàng"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Đơn hàng #{order.id} - Tổng tiền: {order.totalAmount?.toLocaleString('vi-VN')}đ
                                    </p>
                                </div>
                            </div>
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                💡 Bạn có thể đánh giá lại các sản phẩm này nếu mua trong đơn hàng khác
                            </div>
                        </div>

                        {/* Products Review */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                Đánh giá sản phẩm ({order.items?.length || 0} sản phẩm)
                            </h3>

                            {order.items && order.items.map((item, index) => (
                                <div key={item.productId || index} className="border border-gray-200 rounded-lg p-4 bg-white">
                                    {/* Product Info */}
                                    <div className="flex items-center space-x-3 mb-4">
                                        <img
                                            src={item.productImageUrl || '/default-product.jpg'}
                                            alt={item.name || item.productName}
                                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-800">
                                                {item.name || item.productName || `Sản phẩm ${item.productId}`}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Số lượng: {item.quantity} {item.unit || item.productUnitName || ''}
                                            </p>
                                            <p className="text-sm text-green-600 font-medium">
                                                {(item.priceAtPurchase || 0).toLocaleString('vi-VN')}đ
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Đánh giá chất lượng sản phẩm <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center space-x-1">
                                            {renderStars(
                                                ratings[item.productId] || 0,
                                                (rating) => handleRatingChange(item.productId, rating)
                                            )}
                                            <span className="ml-3 text-sm text-gray-600">
                                                {ratings[item.productId] ? `${ratings[item.productId]} sao` : 'Chưa đánh giá'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nhận xét (không bắt buộc)
                                        </label>
                                        <textarea
                                            value={comments[item.productId] || ''}
                                            onChange={(e) => handleCommentChange(item.productId, e.target.value)}
                                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                            rows={3}
                                            maxLength={500}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {(comments[item.productId] || '').length}/500 ký tự
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Để sau
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaCheck />
                                        <span>Gửi đánh giá</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrderReviewModal;
