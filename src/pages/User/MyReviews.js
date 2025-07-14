import React, { useState } from 'react';
import { FaStar, FaEdit, FaTrash, FaEye, FaFilter } from 'react-icons/fa';
import { ReviewCard, ReviewForm } from '../../components/Review';
import { useUserReviews } from '../../hooks/useReviews';
import reviewService from '../../services/reviewService';
import { toast } from 'react-toastify';

const MyReviews = () => {
    const [currentUser] = useState(() => {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    });

    const {
        reviews,
        loading,
        error,
        updateReview,
        removeReview,
        refresh
    } = useUserReviews(currentUser?.id);

    const [editingReview, setEditingReview] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [filter, setFilter] = useState('all'); // all, product, seller

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowEditForm(true);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
            return;
        }

        try {
            const result = await reviewService.deleteReview(reviewId, currentUser.id);
            if (result.success) {
                removeReview(reviewId);
                toast.success('Đánh giá đã được xóa');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Không thể xóa đánh giá');
        }
    };

    const handleReviewUpdated = (updatedReviewData) => {
        updateReview(updatedReviewData);
        setShowEditForm(false);
        setEditingReview(null);
        toast.success('Đánh giá đã được cập nhật');
    };

    const filteredReviews = reviews.filter(review => {
        if (filter === 'all') return true;
        return review.targetType.toLowerCase() === filter;
    });

    const getFilterLabel = (filterType) => {
        const labels = {
            all: 'Tất cả',
            product: 'Sản phẩm',
            seller: 'Người bán'
        };
        return labels[filterType] || filterType;
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Đăng nhập để xem đánh giá của bạn
                    </h2>
                    <p className="text-gray-600">
                        Bạn cần đăng nhập để quản lý các đánh giá của mình.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-lg p-6">
                                    <div className="h-4 bg-gray-200 rounded mb-4 w-1/4"></div>
                                    <div className="h-20 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={refresh}
                        className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-supply-primary-dark transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Đánh giá của tôi
                    </h1>
                    <p className="text-gray-600">
                        Quản lý tất cả các đánh giá bạn đã viết
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        <FaFilter className="text-gray-500" />
                        <span className="font-medium text-gray-700">Lọc theo:</span>
                        <div className="flex space-x-2">
                            {['all', 'product', 'seller'].map(filterType => (
                                <button
                                    key={filterType}
                                    onClick={() => setFilter(filterType)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === filterType
                                            ? 'bg-supply-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {getFilterLabel(filterType)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                    {filteredReviews.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <div className="text-gray-400 text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {filter === 'all' ? 'Chưa có đánh giá nào' : `Chưa có đánh giá ${getFilterLabel(filter).toLowerCase()}`}
                            </h3>
                            <p className="text-gray-600">
                                {filter === 'all'
                                    ? 'Hãy mua sắm và viết đánh giá đầu tiên của bạn!'
                                    : `Bạn chưa đánh giá ${getFilterLabel(filter).toLowerCase()} nào.`
                                }
                            </p>
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                {/* Review Target Info */}
                                <div className="bg-gray-50 px-6 py-3 border-b">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                Đánh giá {review.targetType === 'Product' ? 'sản phẩm' : 'người bán'}:
                                            </span>
                                            <span className="ml-2 font-bold text-gray-800">
                                                {review.targetName || `${review.targetType} #${review.targetId.slice(-6)}`}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditReview(review)}
                                                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                            >
                                                <FaEdit className="text-xs" />
                                                <span className="text-sm">Sửa</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <FaTrash className="text-xs" />
                                                <span className="text-sm">Xóa</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className="p-6">
                                    <ReviewCard
                                        review={review}
                                        showActions={false}
                                        showProduct={false}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Stats */}
                {reviews.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Thống kê đánh giá</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-supply-primary mb-1">
                                    {reviews.length}
                                </div>
                                <div className="text-sm text-gray-600">Tổng đánh giá</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-500 mb-1">
                                    {reviewService.calculateAverageRating(reviews)}
                                </div>
                                <div className="text-sm text-gray-600">Đánh giá trung bình</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                    {reviews.filter(r => r.targetType === 'Product').length}
                                </div>
                                <div className="text-sm text-gray-600">Đánh giá sản phẩm</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                    {reviews.filter(r => r.targetType === 'Seller').length}
                                </div>
                                <div className="text-sm text-gray-600">Đánh giá người bán</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Review Modal */}
            {showEditForm && editingReview && (
                <ReviewForm
                    targetType={editingReview.targetType}
                    targetId={editingReview.targetId}
                    userId={currentUser.id}
                    existingReview={editingReview}
                    isModal={true}
                    onReviewSubmitted={handleReviewUpdated}
                    onCancel={() => {
                        setShowEditForm(false);
                        setEditingReview(null);
                    }}
                />
            )}
        </div>
    );
};

export default MyReviews;
