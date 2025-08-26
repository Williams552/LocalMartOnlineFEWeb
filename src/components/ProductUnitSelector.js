import React from 'react';
import QuantityInput from './Common/QuantityInput';

/**
 * ProductUnitSelector component - wrapper around QuantityInput for backward compatibility
 */
const ProductUnitSelector = ({
    quantity = 1,
    onQuantityChange,
    product,
    minQuantity,
    maxQuantity,
    unit,
    disabled = false,
    size = 'default',
    allowDirectInput = true
}) => {
    return (
        <QuantityInput
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            minQuantity={minQuantity || product?.minimumQuantity || 0.5}
            maxQuantity={maxQuantity || product?.stockQuantity || product?.stock || 999}
            unit={unit || product?.unit || 'kg'}
            disabled={disabled}
            size={size}
            allowDirectInput={allowDirectInput}
        />
    );
};

export default ProductUnitSelector;