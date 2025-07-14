import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';

const CartIcon = ({ className = "" }) => {
    const { isAuthenticated } = useAuth();
    const { cartCount, loading } = useCart();
    const navigate = useNavigate();

    const handleClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate('/cart');
    };

    return (
        <button
            onClick={handleClick}
            className={`relative p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
            disabled={loading}
        >
            <FaShoppingCart className="w-6 h-6 text-gray-700" />

            {/* Cart Count Badge */}
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            )}

            {/* Loading Indicator */}
            {loading && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </span>
            )}
        </button>
    );
};

export default CartIcon;
