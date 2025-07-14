import React from 'react';
import { FaStar, FaRegStar, FaUsers, FaThumbsUp } from 'react-icons/fa';

const ReviewSummary = ({
    averageRating = 0,
    totalReviews = 0,
    ratingBreakdown = null,
    showDetailed = true,
    className = ""
}) => {
    const renderStars = (rating, size = "text-base") => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className={`text-yellow-500 ${size}`} />
            ) : (
                <FaRegStar key={i} className={`text-gray-300 ${size}`} />
            )
        );
    };

    const calculateRatingBreakdown = () => {
        if (ratingBreakdown) return ratingBreakdown;

        // Fallback calculation if breakdown not provided
        return {
            counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            total: totalReviews
        };
    };

    const breakdown = calculateRatingBreakdown();

    if (totalReviews === 0) {
        return (
            <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
                <div className="text-gray-400 text-3xl mb-3">⭐</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Chưa có đánh giá
                </h3>
                <p className="text-gray-600 text-sm">
                    Hãy là người đầu tiên đánh giá!
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            {/* Overall Rating */}
            <div className="flex items-center space-x-6 mb-6">
                <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 mb-2">
                        {averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                        {renderStars(averageRating, "text-lg")}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                        <FaUsers className="text-xs" />
                        <span>{totalReviews} đánh giá</span>
                    </div>
                </div>

                {/* Rating Breakdown */}
                {showDetailed && (
                    <div className="flex-1">
                        {[5, 4, 3, 2, 1].map(rating => (
                            <div key={rating} className="flex items-center space-x-3 mb-2">
                                <div className="flex items-center space-x-1 w-12">
                                    <span className="text-sm font-medium">{rating}</span>
                                    <FaStar className="text-yellow-500 text-xs" />
                                </div>

                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${breakdown.percentages[rating] || 0}%` }}
                                    ></div>
                                </div>

                                <div className="w-8 text-right">
                                    <span className="text-sm text-gray-600">
                                        {breakdown.counts[rating] || 0}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                        {breakdown.counts[5] + breakdown.counts[4]}
                    </div>
                    <div className="text-xs text-gray-600">Hài lòng</div>
                </div>

                <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">
                        {breakdown.counts[3]}
                    </div>
                    <div className="text-xs text-gray-600">Bình thường</div>
                </div>

                <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                        {breakdown.counts[2] + breakdown.counts[1]}
                    </div>
                    <div className="text-xs text-gray-600">Không hài lòng</div>
                </div>
            </div>
        </div>
    );
};

export default ReviewSummary;
