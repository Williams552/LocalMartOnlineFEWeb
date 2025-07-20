import React, { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReviewModal = ({ order, isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSubmit({
                orderId: order.id,
                rating,
                comment,
            });

            toast.success('Đánh giá thành công!');
            onClose();
            setRating(5);
            setComment('');
        } catch (error) {
            toast.error('Lỗi khi gửi đánh giá');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-lg w-full mx-4">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">Đánh giá đơn hàng</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-800 mb-2">
                            Đơn hàng #{order?.id}
                        </h3>
                        <div className="flex items-center space-x-3 mb-3">
                            <img
                                src={order?.sellerAvatar || 'https://i.pravatar.cc/50?img=1'}
                                alt={order?.sellerName || 'Cửa hàng'}
                                className="w-8 h-8 rounded-full"
                            />
                            <p className="text-sm text-gray-600 font-medium">
                                {order?.sellerName || 'Cửa hàng'}
                            </p>
                        </div>
                        {order?.items && order.items.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-2">Sản phẩm đã mua:</p>
                                <div className="space-y-1">
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <p key={index} className="text-xs text-gray-700">
                                            • {item.name || `Sản phẩm ${item.productId}`}
                                            <span className="text-gray-500"> x{item.quantity}</span>
                                        </p>
                                    ))}
                                    {order.items.length > 3 && (
                                        <p className="text-xs text-gray-500">và {order.items.length - 3} sản phẩm khác...</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đánh giá của bạn
                        </label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-2xl ${star <= rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                        } hover:text-yellow-400 transition`}
                                >
                                    <FaStar />
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {rating === 1 && 'Rất không hài lòng'}
                            {rating === 2 && 'Không hài lòng'}
                            {rating === 3 && 'Bình thường'}
                            {rating === 4 && 'Hài lòng'}
                            {rating === 5 && 'Rất hài lòng'}
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nhận xét (tùy chọn)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về đơn hàng này..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-supply-primary"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
