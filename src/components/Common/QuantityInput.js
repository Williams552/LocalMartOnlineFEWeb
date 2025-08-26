import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

const QuantityInput = ({
    quantity = 1,
    onQuantityChange,
    minQuantity = 0.5,
    maxQuantity = 999,
    unit = 'kg',
    disabled = false,
    size = 'default', // small, default, large
    allowDirectInput = true // Cho phép nhập trực tiếp
}) => {
    const [inputValue, setInputValue] = useState(quantity.toString());
    const [isEditing, setIsEditing] = useState(false);

    // Update input value when quantity prop changes
    useEffect(() => {
        if (!isEditing) {
            setInputValue(formatQuantity(quantity));
        }
    }, [quantity, isEditing]);

    const formatQuantity = (value) => {
        return parseFloat(value).toFixed(2).replace(/\.?0+$/, '');
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Chỉ cho phép nhập số và dấu chấm
        if (/^\d*\.?\d*$/.test(value)) {
            setInputValue(value);
        }
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        const numValue = parseFloat(inputValue);
        
        if (isNaN(numValue) || numValue <= 0) {
            // Reset to minimum if invalid
            setInputValue(formatQuantity(minQuantity));
            if (onQuantityChange) {
                onQuantityChange(minQuantity);
            }
            return;
        }

        let finalValue = numValue;
        
        // Validate against min/max
        if (finalValue < minQuantity) {
            finalValue = minQuantity;
        } else if (finalValue > maxQuantity) {
            finalValue = maxQuantity;
        }

        // Round to 2 decimal places
        finalValue = Math.round(finalValue * 100) / 100;
        
        setInputValue(formatQuantity(finalValue));
        if (onQuantityChange) {
            onQuantityChange(finalValue);
        }
    };

    const handleInputFocus = () => {
        setIsEditing(true);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    const handleDecrease = () => {
        const newQuantity = Math.max(minQuantity, Math.round((quantity - minQuantity) * 100) / 100);
        if (onQuantityChange) {
            onQuantityChange(newQuantity);
        }
    };

    const handleIncrease = () => {
        const newQuantity = Math.min(maxQuantity, Math.round((quantity + minQuantity) * 100) / 100);
        if (onQuantityChange) {
            onQuantityChange(newQuantity);
        }
    };

    // Size variants
    const sizeClasses = {
        small: {
            button: "w-6 h-6",
            input: "w-16 h-6 text-sm px-2",
            icon: "w-3 h-3",
            text: "text-xs"
        },
        default: {
            button: "w-8 h-8",
            input: "w-20 h-8 text-sm px-3",
            icon: "w-3 h-3",
            text: "text-sm"
        },
        large: {
            button: "w-10 h-10",
            input: "w-24 h-10 text-base px-4",
            icon: "w-4 h-4",
            text: "text-base"
        }
    };

    const currentSize = sizeClasses[size] || sizeClasses.default;

    return (
        <div className="flex items-center space-x-2">
            {/* Decrease Button */}
            <button
                onClick={handleDecrease}
                disabled={disabled || quantity <= minQuantity}
                className={`${currentSize.button} rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition`}
                title="Giảm số lượng"
            >
                <FaMinus className={currentSize.icon} />
            </button>

            {/* Quantity Input/Display */}
            {allowDirectInput ? (
                <div className="flex flex-col items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onFocus={handleInputFocus}
                        onKeyPress={handleKeyPress}
                        disabled={disabled}
                        className={`${currentSize.input} text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        title="Nhập số lượng trực tiếp"
                    />
                    <span className={`${currentSize.text} text-gray-500 mt-1`}>{unit}</span>
                </div>
            ) : (
                <div className="text-center">
                    <span className={`font-medium ${currentSize.text}`}>
                        {formatQuantity(quantity)} {unit}
                    </span>
                </div>
            )}

            {/* Increase Button */}
            <button
                onClick={handleIncrease}
                disabled={disabled || quantity >= maxQuantity}
                className={`${currentSize.button} rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition`}
                title="Tăng số lượng"
            >
                <FaPlus className={currentSize.icon} />
            </button>
        </div>
    );
};

export default QuantityInput;
