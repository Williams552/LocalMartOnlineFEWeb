import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import toastService from '../../services/toastService';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import QuantityInput from './QuantityInput';

const AddToCartButton = ({
    product,
    quantity = 1,
    onQuantityChange,
    className = "",
    showQuantityControls = true,
    size = "default" // default, small, large
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        console.log('🛒 AddToCart button clicked');
        console.log('🔍 Product:', product);
        console.log('🔍 Quantity:', quantity);
        console.log('🔍 isAuthenticated:', isAuthenticated);

        if (!isAuthenticated) {
            console.log('❌ User not authenticated');
            toastService.authError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            navigate('/login');
            return;
        }

        if (!product || !product.id) {
            console.log('❌ Invalid product:', product);
            toastService.error('Sản phẩm không hợp lệ');
            return;
        }

        if (quantity <= 0) {
            console.log('❌ Invalid quantity:', quantity);
            toastService.error('Số lượng phải lớn hơn 0');
            return;
        }

        try {
            setIsAdding(true);
            console.log('🛒 Adding to cart:', { productId: product.id, quantity, product });

            const result = await addToCart(product.id, quantity);
            console.log('🛒 Add to cart result:', result);

            if (result.success) {
                toastService.cartSuccess(product.name || 'Sản phẩm');

                // Reset quantity if needed
                if (onQuantityChange) {
                    onQuantityChange(product?.minimumQuantity || 0.5); // Reset to minimum quantity
                }
            } else {
                console.error('🛒 Add to cart failed:', result.message);
                toastService.cartError(result.message || 'Không thể thêm sản phẩm vào giỏ hàng');
            }
        } catch (error) {
            console.error('🛒 Error adding to cart:', error);
            toastService.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
        } finally {
            setIsAdding(false);
        }
    };

    const handleQuantityChange = (newQuantity) => {
        if (onQuantityChange) {
            onQuantityChange(newQuantity);
        }
    };

    // Size variants
    const sizeClasses = {
        small: {
            button: "px-3 py-2 text-sm",
            quantityButton: "w-6 h-6",
            icon: "w-3 h-3",
            text: "text-sm"
        },
        default: {
            button: "px-6 py-3",
            quantityButton: "w-8 h-8",
            icon: "w-4 h-4",
            text: "text-base"
        },
        large: {
            button: "px-8 py-4 text-lg",
            quantityButton: "w-10 h-10",
            icon: "w-5 h-5",
            text: "text-lg"
        }
    };

    const currentSize = sizeClasses[size] || sizeClasses.default;

    return (
        <div className={`flex flex-col space-y-3 ${className}`}>
            {/* Quantity Controls */}
            {showQuantityControls && onQuantityChange && (
                <div className="flex items-center justify-between">
                    <span className={`font-medium text-gray-700 ${currentSize.text}`}>
                        Số lượng:
                    </span>
                    <QuantityInput
                        quantity={quantity}
                        onQuantityChange={handleQuantityChange}
                        minQuantity={product?.minimumQuantity || 0.5}
                        maxQuantity={product?.stock || 999}
                        unit={product?.unit || 'kg'}
                        size={size}
                        allowDirectInput={true}
                    />
                </div>
            )}

            {/* Add to Cart Button */}
            <button
                onClick={handleAddToCart}
                disabled={isAdding || !product || quantity <= 0}
                className={`
                    ${currentSize.button}
                    bg-supply-primary text-white rounded-lg font-semibold 
                    hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed 
                    transition flex items-center justify-center space-x-2
                    ${className}
                `}
            >
                {isAdding ? (
                    <>
                        <FiLoader className={`${currentSize.icon} animate-spin`} />
                        <span>Đang thêm...</span>
                    </>
                ) : (
                    <>
                        <FaShoppingCart className={currentSize.icon} />
                        <span>
                            {showQuantityControls ? 'Thêm vào giỏ' : `Thêm ${quantity} ${product?.unit || 'kg'}`}
                        </span>
                    </>
                )}
            </button>

            {/* Product Info */}
            {product && (
                <div className="text-center">
                    <p className={`text-gray-600 ${currentSize.text}`}>
                        Giá: <span className="font-semibold text-supply-primary">
                            {(Math.round((product.price * quantity) * 100) / 100).toLocaleString()}đ
                        </span>
                    </p>
                    {product.stock && (
                        <p className="text-sm text-gray-500">
                            Còn lại: {product.stock} {product.unit || 'kg'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddToCartButton;
