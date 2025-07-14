import React, { useState } from 'react';
import { FaTimes, FaHandshake, FaDollarSign, FaBoxes } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import fastBargainService from '../../services/fastBargainService';
import authService from '../../services/authService';
import '../../styles/fast-bargain.css';

const StartBargainModal = ({ isOpen, onClose, product, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [offerPrice, setOfferPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const currentUser = authService.getCurrentUser();

    const validateForm = () => {
        const newErrors = {};

        if (!quantity || quantity < 1) {
            newErrors.quantity = 'Số lượng phải lớn hơn 0';
        }

        if (!offerPrice || isNaN(offerPrice) || parseFloat(offerPrice) <= 0) {
            newErrors.offerPrice = 'Giá đề xuất phải là số hợp lệ và lớn hơn 0';
        }

        if (parseFloat(offerPrice) >= product?.price) {
            newErrors.offerPrice = 'Giá đề xuất phải thấp hơn giá gốc để thương lượng';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await fastBargainService.startBargain({
                productId: product.id,
                buyerId: currentUser.id,
                quantity: parseInt(quantity),
                initialOfferPrice: parseFloat(offerPrice)
            });

            if (result.success) {
                onSuccess?.(result.data);
                onClose();
                // Reset form
                setQuantity(1);
                setOfferPrice('');
                setErrors({});
            } else {
                setErrors({ submit: result.message });
            }
        } catch (error) {
            setErrors({ submit: 'Có lỗi xảy ra khi bắt đầu thương lượng' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setQuantity(1);
            setOfferPrice('');
            setErrors({});
            onClose();
        }
    };

    if (!isOpen || !product) return null;

    const totalOriginalPrice = product.price * quantity;
    const totalOfferPrice = parseFloat(offerPrice || 0) * quantity;
    const savingAmount = totalOriginalPrice - totalOfferPrice;
    const savingPercent = totalOriginalPrice > 0 ? ((savingAmount / totalOriginalPrice) * 100).toFixed(1) : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl animate-in fade-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FaHandshake className="text-white text-xl" />
                            <h3 className="text-lg font-semibold text-white">Bắt đầu thương lượng</h3>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="text-white hover:text-gray-200 disabled:opacity-50"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Product Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-3">
                            {product.imageUrl && (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                            )}
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{product.name}</h4>
                                <p className="text-green-600 font-semibold">
                                    {fastBargainService.formatCurrency(product.price)}/{product.unit}
                                </p>
                                {product.seller && (
                                    <p className="text-sm text-gray-600">Bán bởi: {product.seller}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaBoxes className="inline mr-2" />
                                Số lượng
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.quantity ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            />
                            {errors.quantity && (
                                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                            )}
                        </div>

                        {/* Offer Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaDollarSign className="inline mr-2" />
                                Giá đề xuất (VND/{product.unit})
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                value={offerPrice}
                                onChange={(e) => setOfferPrice(e.target.value)}
                                placeholder="Nhập giá đề xuất của bạn"
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.offerPrice ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                            />
                            {errors.offerPrice && (
                                <p className="text-red-500 text-sm mt-1">{errors.offerPrice}</p>
                            )}
                        </div>

                        {/* Price Summary */}
                        {offerPrice && quantity && (
                            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Giá gốc:</span>
                                    <span className="line-through text-gray-500">
                                        {fastBargainService.formatCurrency(totalOriginalPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Giá đề xuất:</span>
                                    <span className="text-green-600">
                                        {fastBargainService.formatCurrency(totalOfferPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tiết kiệm:</span>
                                    <span className="text-blue-600 font-medium">
                                        {fastBargainService.formatCurrency(savingAmount)} ({savingPercent}%)
                                    </span>
                                </div>
                            </div>
                        )}

                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !offerPrice || !quantity}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <FiLoader className="animate-spin" />
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaHandshake />
                                        <span>Bắt đầu thương lượng</span>
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

export default StartBargainModal;
