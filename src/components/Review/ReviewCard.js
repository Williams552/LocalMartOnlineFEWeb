import React from 'react';
import { FaStar, FaRegStar, FaUser, FaCheckCircle, FaThumbsUp } from 'react-icons/fa';

const ReviewCard = ({
    review,
    showProduct = false,
    showActions = true,
    compact = false
}) => {
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className="text-yellow-500" />
            ) : (
                <FaRegStar key={i} className="text-gray-300" />
            )
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return diffMinutes <= 0 ? 'Vừa xong' : `${diffMinutes} phút trước`;
            }
            return `${diffHours} giờ trước`;
        } else if (diffDays < 7) {
            return `${diffDays} ngày trước`;
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    };

    if (compact) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-supply-primary to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {review.userAvatar ? (
                            <img
                                src={review.userAvatar}
                                alt={review.userName}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            review.userName?.charAt(0) || 'U'
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-800 text-sm truncate">
                                {review.userName || 'Người dùng ẩn danh'}
                            </span>
                            {review.isVerifiedPurchase && (
                                <FaCheckCircle className="text-green-500 text-xs flex-shrink-0" />
                            )}
                        </div>

                        <div className="flex items-center space-x-1 mb-2">
                            <div className="flex text-xs">
                                {renderStars(review.rating)}
                            </div>
                            <span className="text-xs text-gray-500">
                                {formatDate(review.createdAt)}
                            </span>
                        </div>

                        {review.comment && (
                            <p className="text-gray-700 text-sm line-clamp-2">
                                {review.comment}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            {/* Product Info (if showing) */}
            {showProduct && review.productInfo && (
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
                    <img
                        src={review.productInfo.image || '/default-product.jpg'}
                        alt={review.productInfo.name}
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                        <h4 className="font-medium text-gray-800 line-clamp-1">
                            {review.productInfo.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                            {review.productInfo.price?.toLocaleString('vi-VN')}đ
                        </p>
                    </div>
                </div>
            )}

            {/* User Info */}
            <div className="flex items-start space-x-4">
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
                    {/* Header */}
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-800">
                            {review.userName || 'Người dùng ẩn danh'}
                        </span>
                        {review.isVerifiedPurchase && (
                            <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                <FaCheckCircle className="text-xs" />
                                <span>Đã mua hàng</span>
                            </div>
                        )}
                        <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
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

                    {/* Images (if any) */}
                    {review.images && review.images.length > 0 && (
                        <div className="flex space-x-2 mb-3">
                            {review.images.slice(0, 3).map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Review ${index + 1}`}
                                    className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                />
                            ))}
                            {review.images.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                                    +{review.images.length - 3}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Seller Response */}
                    {review.response && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-blue-800 text-sm">
                                    Phản hồi từ người bán
                                </span>
                                {review.responseDate && (
                                    <span className="text-xs text-blue-600">
                                        {formatDate(review.responseDate)}
                                    </span>
                                )}
                            </div>
                            <p className="text-blue-700 text-sm">
                                {review.response}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
