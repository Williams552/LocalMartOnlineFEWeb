import React from 'react';
import { FaCheckCircle, FaStar, FaTimes } from 'react-icons/fa';
import './OrderAnimations.css';

const OrderCompletionNotification = ({
    isOpen,
    onClose,
    onReviewNow,
    onReviewLater,
    orderInfo
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-white rounded-lg shadow-xl border-l-4 border-green-500 p-4 max-w-sm">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <FaCheckCircle className="text-green-500 text-xl" />
                    </div>

                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                            Đơn hàng hoàn thành!
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                            Đơn hàng #{orderInfo?.id} đã hoàn thành thành công.
                        </p>
                        <p className="text-xs text-green-600 mt-1 font-medium">
                            Hãy đánh giá sản phẩm để giúp người bán khác!
                        </p>

                        <div className="flex space-x-2 mt-3">
                            <button
                                onClick={onReviewNow}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            >
                                <FaStar className="text-xs" />
                                <span>Đánh giá ngay</span>
                            </button>
                            <button
                                onClick={onReviewLater}
                                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Để sau
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes className="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderCompletionNotification;
