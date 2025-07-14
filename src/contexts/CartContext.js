import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import cartService from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Fetch cart data
    const fetchCartData = async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            setCartCount(0);
            return;
        }

        try {
            setLoading(true);
            const result = await cartService.getCartItems();
            if (result.success) {
                const items = result.data || [];
                setCartItems(items);
                // Calculate total quantity using new backend structure
                const totalQuantity = items.reduce((sum, item) => sum + (item.Quantity || 0), 0);
                setCartCount(totalQuantity);
            } else {
                setCartItems([]);
                setCartCount(0);
            }
        } catch (error) {
            console.error('Error fetching cart data:', error);
            setCartItems([]);
            setCartCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Add item to cart
    const addToCart = async (productId, quantity) => {
        try {
            console.log('🛒 CartContext.addToCart:', { productId, quantity });
            const result = await cartService.addToCart(productId, quantity);
            console.log('🛒 CartContext result:', result);

            if (result.success) {
                // Refresh cart data
                await fetchCartData();
                return result;
            }
            return result;
        } catch (error) {
            console.error('🛒 CartContext Error:', error);
            return {
                success: false,
                message: 'Không thể thêm sản phẩm vào giỏ hàng'
            };
        }
    };

    // Update cart item
    const updateCartItem = async (productId, quantity) => {
        try {
            const result = await cartService.updateCartItem(productId, quantity);
            if (result.success) {
                // Update local state using new backend structure
                const oldItem = cartItems.find(item => item.ProductId === productId);
                const oldQuantity = oldItem ? oldItem.Quantity : 0;
                const quantityDifference = quantity - oldQuantity;

                setCartItems(prev =>
                    prev.map(item =>
                        item.ProductId === productId
                            ? { ...item, Quantity: quantity }
                            : item
                    )
                );

                // Update cart count with the quantity difference
                setCartCount(prev => prev + quantityDifference);
            }
            return result;
        } catch (error) {
            console.error('Error updating cart item:', error);
            return {
                success: false,
                message: 'Không thể cập nhật số lượng'
            };
        }
    };

    // Remove item from cart
    const removeFromCart = async (productId) => {
        try {
            const result = await cartService.removeFromCart(productId);
            if (result.success) {
                // Find the item being removed using new backend structure
                const removedItem = cartItems.find(item => item.ProductId === productId);
                const removedQuantity = removedItem ? removedItem.Quantity : 0;

                // Update local state
                setCartItems(prev => prev.filter(item => item.ProductId !== productId));
                setCartCount(prev => Math.max(0, prev - removedQuantity));
            }
            return result;
        } catch (error) {
            console.error('Error removing from cart:', error);
            return {
                success: false,
                message: 'Không thể xóa sản phẩm'
            };
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        try {
            const result = await cartService.clearCart();
            if (result.success) {
                setCartItems([]);
                setCartCount(0);
            }
            return result;
        } catch (error) {
            console.error('Error clearing cart:', error);
            return {
                success: false,
                message: 'Không thể xóa giỏ hàng'
            };
        }
    };

    // Refresh cart when authentication changes
    useEffect(() => {
        if (isAuthenticated) {
            fetchCartData();
        } else {
            // Clear cart data when user logs out
            setCartItems([]);
            setCartCount(0);
        }
    }, [isAuthenticated]);

    const value = {
        cartItems,
        cartCount,
        loading,
        fetchCartData,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
