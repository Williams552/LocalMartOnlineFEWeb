import React from 'react';
import StoreReviewForm from './StoreReviewForm';

const StoreReviewModal = ({
    isOpen,
    onClose,
    storeId,
    storeName,
    userId,
    existingReview = null,
    onReviewSubmitted
}) => {
    if (!isOpen) return null;

    return (
        <StoreReviewForm
            storeId={storeId}
            storeName={storeName}
            userId={userId}
            existingReview={existingReview}
            onReviewSubmitted={onReviewSubmitted}
            onCancel={onClose}
            isModal={true}
        />
    );
};

export default StoreReviewModal;
