import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import StoreReviewModal from './StoreReviewModal';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import reviewService from '../../services/reviewService';

const ClickableStoreRating = ({
    storeId,
    storeName,
    rating = 0,
    reviewCount = 0,
    onReviewSubmitted,
    className = '',
    showText = true
}) => {
    const [showModal, setShowModal] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();

    // Check for existing review when component mounts or user changes
    useEffect(() => {
        const checkExistingReview = async () => {
            if (!isAuthenticated || !user?.id || !storeId) {
                setExistingReview(null);
                return;
            }
            
            try {
                setLoading(true);
                const result = await reviewService.getUserReviewForTarget('Store', storeId, user.id);
                
                const reviewData = result.success && result.data ? result.data : null;
                setExistingReview(reviewData);
            } catch (error) {
                console.error('Error checking existing review:', error);
                setExistingReview(null);
            } finally {
                setLoading(false);
            }
        };

        checkExistingReview();
    }, [isAuthenticated, user?.id, storeId]);

    const handleClick = () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đánh giá cửa hàng');
            return;
        }

        if (!user?.id) {
            toast.error('Không tìm thấy thông tin người dùng');
            return;
        }

        // Kiểm tra nếu đã có review (phải có id mới là review thật)
        if (existingReview && existingReview.id) {
            toast.info('Bạn đã đánh giá cửa hàng này rồi');
            return;
        }

        // Cho phép mở modal nếu chưa có review hoặc existingReview là null
        setShowModal(true);
    };

    const renderStars = () => {
        return [...Array(5)].map((_, i) => (
            i < Math.floor(rating) ?
                <FaStar key={i} className="text-yellow-400" /> :
                <FaRegStar key={i} className="text-white opacity-50" />
        ));
    };

    // Helper function to check if user has reviewed
    const hasReviewed = () => {
        return existingReview && existingReview.id;
    };

    return (
        <>
            <div 
                className={`flex items-center gap-1 ${hasReviewed() ? 'cursor-default opacity-75' : 'cursor-pointer hover:opacity-80'} transition-opacity ${className}`}
                onClick={hasReviewed() ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.info('Bạn đã đánh giá cửa hàng này rồi');
                } : handleClick}
                title={hasReviewed() ? "Bạn đã đánh giá cửa hàng này" : "Click để đánh giá cửa hàng"}
            >
                {loading ? (
                    <div className="flex items-center gap-1">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-white text-sm">Đang tải...</span>
                    </div>
                ) : (
                    <>
                        {renderStars()}
                        {showText && (
                            <span className="ml-2 text-white">
                                {rating.toFixed(1)} ({reviewCount} đánh giá)
                                {hasReviewed() && <span className="text-green-300 ml-1">✓ Đã đánh giá</span>}
                            </span>
                        )}
                    </>
                )}
            </div>

            {/* Luôn render modal, chỉ điều khiển bằng isOpen */}
            <StoreReviewModal
                isOpen={showModal && !hasReviewed()}
                onClose={() => setShowModal(false)}
                storeId={storeId}
                storeName={storeName}
                userId={user?.id}
                existingReview={existingReview}
            />
        </>
    );
};

export default ClickableStoreRating;
