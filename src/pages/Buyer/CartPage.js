import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaStore, FaMapMarkerAlt, FaPhone, FaUser, FaTruck, FaCheckSquare, FaSquare } from "react-icons/fa";
import { FiShoppingBag, FiClock, FiCheck, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import toastService from "../../services/toastService";
import logo from "../../assets/image/logo.jpg";
import cartService from "../../services/cartService";
import { getCurrentUser, isAuthenticated } from "../../services/authService";

const sellerInfoMap = {
    "Cô Lan": {
        phone: "0909123456",
        address: "Gian A12, Chợ Tân An, Ninh Kiều, Cần Thơ",
        market: "Chợ Tân An",
        avatar: "👩‍🌾",
        rating: 4.8
    },
    "Anh Minh": {
        phone: "0912345678",
        address: "Gian B05, Chợ An Hòa, Ninh Kiều, Cần Thơ",
        market: "Chợ An Hòa",
        avatar: "👨‍🌾",
        rating: 4.9
    },
};

const proxyShoppers = [
    {
        name: "Chị Hương",
        phone: "0987654321",
        area: "Chợ Tân An",
        rating: 4.9,
        experience: "3 năm",
        avatar: "👩"
    },
    {
        name: "Anh Dũng",
        phone: "0978123456",
        area: "Chợ An Hòa",
        rating: 4.7,
        experience: "2 năm",
        avatar: "👨"
    },
];

const CartPage = () => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [showProxyListFor, setShowProxyListFor] = useState(null);
    const [deliveryMethod, setDeliveryMethod] = useState("delivery"); // delivery, pickup, proxy
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showClearSellerConfirm, setShowClearSellerConfirm] = useState(null);

    // Check authentication on component mount
    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('❌ User not authenticated, redirecting to login');
            toastService.error('Vui lòng đăng nhập để xem giỏ hàng');
            navigate('/login');
            return;
        }

        const user = getCurrentUser();
        console.log('✅ User authenticated:', user);

        fetchCartData();
    }, [navigate]);

    // Fetch cart data on component mount
    // useEffect(() => {
    //     fetchCartData();
    // }, []);

    const fetchCartData = async () => {
        try {
            console.log('🛒 CartPage: Starting fetchCartData...');
            setLoading(true);

            // Fetch cart items with details from backend
            console.log('🔄 CartPage: Calling cartService.getCartItems()...');
            const cartResult = await cartService.getCartItems();
            console.log('📡 CartPage: cartService response:', cartResult);

            if (!cartResult.success) {
                console.error('❌ CartPage: Cart service failed:', cartResult.message);
                toastService.error(cartResult.message);
                return;
            }

            // If cart is empty, set empty state
            if (!cartResult.data || cartResult.data.length === 0) {
                console.log('📭 CartPage: Cart is empty, setting empty state');
                setCartItems([]);
                return;
            }

            // The backend now returns cart items with product details
            console.log('📦 CartPage: Processing cart items:', cartResult.data);
            const cartItemsWithDetails = cartResult.data;
            setCartItems(cartItemsWithDetails);

        } catch (error) {
            console.error('❌ CartPage: Error fetching cart data:', error);
            toastService.error('Có lỗi khi tải giỏ hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (cartItemId, productName = '') => {
        try {
            console.log('🗑️ CartPage: Removing item:', cartItemId);
            setUpdating(prev => ({ ...prev, [cartItemId]: true }));

            // Find the cart item to get productId
            const cartItem = cartItems.find(item => item.id === cartItemId);
            if (!cartItem) {
                toastService.error('Không tìm thấy sản phẩm trong giỏ hàng');
                return;
            }

            const result = await cartService.removeFromCart(cartItem.productId);
            if (result.success) {
                toastService.success(`Đã xóa ${productName || 'sản phẩm'} khỏi giỏ hàng`);
                // Remove from local state
                setCartItems(items => items.filter(item => item.id !== cartItemId));
                // Remove from selected items if it was selected
                setSelectedItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(cartItemId);
                    return newSet;
                });
            } else {
                toastService.error(result.message || 'Không thể xóa sản phẩm');
            }
        } catch (error) {
            console.error('❌ CartPage: Error removing item:', error);
            toastService.error('Có lỗi khi xóa sản phẩm');
        } finally {
            setUpdating(prev => ({ ...prev, [cartItemId]: false }));
            setShowDeleteConfirm(null);
        }
    };



    const toggleSelectItem = (itemId) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(formattedCartItems.map(item => item.id)));
        }
        setSelectAll(!selectAll);
    };

    const updateQuantity = async (cartItemId, productId, newQuantity) => {
        try {
            // Check minimum quantity
            const item = cartItems.find(item => item.id === cartItemId);
            if (!item) return;

            if (newQuantity <= 0) {
                handleRemove(cartItemId);
                return;
            }

            // Check minimum quantity requirement
            if (item.product && item.product.minimumQuantity && newQuantity < item.product.minimumQuantity) {
                toastService.error(`Số lượng tối thiểu cho ${item.product.name} là ${item.product.minimumQuantity}`);
                return;
            }

            // Check stock availability
            if (item.product && item.product.stockQuantity > 0 && newQuantity > item.product.stockQuantity) {
                toastService.error(`Chỉ còn ${item.product.stockQuantity} ${item.product.unit} trong kho`);
                return;
            }

            console.log('📝 CartPage: Updating quantity:', { cartItemId, productId, newQuantity });
            setUpdating(prev => ({ ...prev, [cartItemId]: true }));

            const result = await cartService.updateCartItem(productId, newQuantity);
            if (result.success) {
                // Update local state
                setCartItems(items =>
                    items.map(item =>
                        item.id === cartItemId
                            ? { ...item, quantity: newQuantity, subTotal: newQuantity * item.product.price }
                            : item
                    )
                );
                toastService.success('Đã cập nhật số lượng');
            } else {
                toastService.error(result.message || 'Không thể cập nhật số lượng');
            }
        } catch (error) {
            console.error('❌ CartPage: Error updating quantity:', error);
            toastService.error('Có lỗi khi cập nhật số lượng');
        } finally {
            setUpdating(prev => ({ ...prev, [cartItemId]: false }));
        }
    };

    // Format cart items for display
    const formattedCartItems = cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.product?.price || 0,
        seller: item.product?.sellerName || 'Unknown Seller',
        storeName: item.product?.storeName || 'Unknown Store',
        image: item.product?.images ? item.product.images.split(',')[0] : logo,
        unit: item.product?.unit || 'item',
        subTotal: item.subTotal || 0,
        isAvailable: item.product?.isAvailable || false,
        stockQuantity: item.product?.stockQuantity || 0,
        minimumQuantity: item.product?.minimumQuantity || 0
    }));

    const groupedBySeller = formattedCartItems.reduce((acc, item) => {
        if (!acc[item.seller]) acc[item.seller] = [];
        acc[item.seller].push(item);
        return acc;
    }, {});

    const handleClearSeller = async (sellerName) => {
        try {
            const sellerItems = formattedCartItems.filter(item => item.seller === sellerName);
            setUpdating(prev => {
                const newState = { ...prev };
                sellerItems.forEach(item => {
                    newState[item.id] = true;
                });
                return newState;
            });

            // Remove all items from this seller
            const removePromises = sellerItems.map(item =>
                cartService.removeFromCart(item.productId)
            );

            const results = await Promise.all(removePromises);
            const successfulRemovals = results.filter(result => result.success);

            if (successfulRemovals.length === sellerItems.length) {
                toastService.success(`Đã xóa tất cả sản phẩm từ ${sellerName}`);
                // Remove all seller items from local state
                setCartItems(items =>
                    items.filter(item => !sellerItems.some(sellerItem => sellerItem.id === item.id))
                );
                // Remove from selected items
                setSelectedItems(prev => {
                    const newSet = new Set(prev);
                    sellerItems.forEach(item => newSet.delete(item.id));
                    return newSet;
                });
            } else {
                toastService.warning(`Đã xóa ${successfulRemovals.length}/${sellerItems.length} sản phẩm từ ${sellerName}`);
                // Refresh cart to sync state
                fetchCartData();
            }
        } catch (error) {
            console.error('❌ CartPage: Error clearing seller items:', error);
            toastService.error('Có lỗi khi xóa sản phẩm');
        } finally {
            const sellerItems = formattedCartItems.filter(item => item.seller === sellerName);
            setUpdating(prev => {
                const newState = { ...prev };
                sellerItems.forEach(item => {
                    newState[item.id] = false;
                });
                return newState;
            });
            setShowClearSellerConfirm(null);
        }
    };

    const handleRemoveSelected = async () => {
        if (selectedItems.size === 0) {
            toastService.warning('Vui lòng chọn sản phẩm để xóa');
            return;
        }

        try {
            const itemsToRemove = formattedCartItems.filter(item => selectedItems.has(item.id));

            setUpdating(prev => {
                const newState = { ...prev };
                itemsToRemove.forEach(item => {
                    newState[item.id] = true;
                });
                return newState;
            });

            const removePromises = itemsToRemove.map(item =>
                cartService.removeFromCart(item.productId)
            );

            const results = await Promise.all(removePromises);
            const successfulRemovals = results.filter(result => result.success);

            if (successfulRemovals.length === itemsToRemove.length) {
                toastService.success(`Đã xóa ${successfulRemovals.length} sản phẩm khỏi giỏ hàng`);
                // Remove successful items from local state
                setCartItems(items =>
                    items.filter(item => !itemsToRemove.some(removeItem => removeItem.id === item.id))
                );
            } else {
                toastService.warning(`Đã xóa ${successfulRemovals.length}/${itemsToRemove.length} sản phẩm`);
                // Refresh cart to sync state
                fetchCartData();
            }

            // Clear selection
            setSelectedItems(new Set());
            setSelectAll(false);
        } catch (error) {
            console.error('❌ CartPage: Error removing selected items:', error);
            toastService.error('Có lỗi khi xóa sản phẩm');
        } finally {
            const itemsToRemove = formattedCartItems.filter(item => selectedItems.has(item.id));
            setUpdating(prev => {
                const newState = { ...prev };
                itemsToRemove.forEach(item => {
                    newState[item.id] = false;
                });
                return newState;
            });
        }
    };

    const totalAmount = cartItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
    }, 0);

    // Calculate fees based on delivery method
    let additionalFee = 0;
    if (deliveryMethod === "proxy") {
        additionalFee = 20000 + (totalAmount * 0.05); // Proxy service fee
    }

    const finalTotal = totalAmount + additionalFee;

    // Update selectAll state when selectedItems changes
    useEffect(() => {
        if (formattedCartItems.length > 0) {
            setSelectAll(selectedItems.size === formattedCartItems.length);
        }
    }, [selectedItems, formattedCartItems.length]);

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <FaShoppingCart className="mr-3 text-supply-primary" />
                        Giỏ hàng của bạn
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {loading ? 'Đang tải...' : `${formattedCartItems.length} sản phẩm từ ${Object.keys(groupedBySeller).length} gian hàng`}
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <FiLoader className="animate-spin text-4xl text-supply-primary mx-auto mb-4" />
                        <p className="text-gray-500">Đang tải giỏ hàng...</p>
                    </div>
                ) : formattedCartItems.length === 0 ? (
                    <div className="text-center py-16">
                        <FaShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-500 mb-2">Giỏ hàng trống</h2>
                        <p className="text-gray-400 mb-6">Hãy thêm một số sản phẩm tươi sạch vào giỏ hàng!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Bulk Actions */}
                            {formattedCartItems.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border p-4">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 text-supply-primary rounded border-gray-300 focus:ring-supply-primary"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                Chọn tất cả ({formattedCartItems.length} sản phẩm)
                                            </span>
                                        </label>
                                        {selectedItems.size > 0 && (
                                            <button
                                                onClick={handleRemoveSelected}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                                <span>Xóa đã chọn ({selectedItems.size})</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {Object.entries(groupedBySeller).map(([seller, items], idx) => {
                                const sellerInfo = sellerInfoMap[seller];
                                const sellerTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                const sellerItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

                                return (
                                    <div key={idx} className="bg-white rounded-xl shadow-sm border p-6">
                                        {/* Seller Header */}
                                        <div className="flex items-center justify-between pb-4 border-b">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-3xl">{sellerInfo?.avatar}</span>
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-800">{seller}</h2>
                                                    <p className="text-sm text-gray-500 flex items-center">
                                                        <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                                                        {sellerInfo?.market}
                                                    </p>
                                                    <p className="text-sm text-supply-primary font-medium">
                                                        {sellerItemCount} sản phẩm • {sellerTotal.toLocaleString()}đ
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setShowClearSellerConfirm(seller)}
                                                    className="text-red-500 hover:text-red-700 transition p-2 rounded-lg hover:bg-red-50"
                                                    title="Xóa tất cả sản phẩm từ gian hàng này"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedSeller(seller)}
                                                    className="text-supply-primary hover:text-green-600 transition p-2 rounded-lg hover:bg-green-50"
                                                    title="Liên hệ người bán"
                                                >
                                                    <FaPhone className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="space-y-4 mt-4">
                                            {items.map(item => (
                                                <div key={item.id} className="flex items-center space-x-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.has(item.id)}
                                                        onChange={() => toggleSelectItem(item.id)}
                                                        className="w-4 h-4 text-supply-primary rounded border-gray-300 focus:ring-supply-primary"
                                                    />
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-16 h-16 rounded-lg object-cover"
                                                        onError={(e) => { e.target.src = logo; }}
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                                                        <p className="text-supply-primary font-semibold">
                                                            {item.price.toLocaleString()}đ/{item.unit}
                                                        </p>
                                                        {!item.isAvailable && (
                                                            <p className="text-red-500 text-xs">Hết hàng</p>
                                                        )}
                                                        {item.stockQuantity > 0 && (
                                                            <p className="text-gray-500 text-xs">Còn: {item.stockQuantity} {item.unit}</p>
                                                        )}
                                                        {item.minimumQuantity > 0 && (
                                                            <p className="text-gray-500 text-xs">Tối thiểu: {item.minimumQuantity} {item.unit}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.productId, item.quantity - 0.5)}
                                                            disabled={updating[item.id] || item.quantity <= item.minimumQuantity}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <FaMinus className="w-3 h-3" />
                                                        </button>
                                                        <div className="w-16 text-center">
                                                            {updating[item.id] ? (
                                                                <FiLoader className="animate-spin mx-auto" />
                                                            ) : (
                                                                <span className="font-medium">{item.quantity} {item.unit}</span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.productId, item.quantity + 0.5)}
                                                            disabled={updating[item.id] || !item.isAvailable || (item.stockQuantity > 0 && item.quantity >= item.stockQuantity)}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <FaPlus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <div className="text-right w-24">
                                                        <p className="font-semibold text-gray-800">
                                                            {item.subTotal.toLocaleString()}đ
                                                        </p>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm({ id: item.id, name: item.name })}
                                                            disabled={updating[item.id]}
                                                            className="text-red-500 hover:text-red-700 mt-1 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-red-50 transition"
                                                            title="Xóa sản phẩm"
                                                        >
                                                            {updating[item.id] ? (
                                                                <FiLoader className="animate-spin w-3 h-3" />
                                                            ) : (
                                                                <FaTrash className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Seller Actions */}
                                        <div className="flex space-x-3 mt-6 pt-4 border-t">
                                            <button
                                                onClick={() => setSelectedSeller(seller)}
                                                className="flex-1 bg-supply-primary text-white py-2 px-4 rounded-lg hover:bg-green-600 transition flex items-center justify-center space-x-2"
                                            >
                                                <FaPhone className="w-4 h-4" />
                                                <span>Liên hệ</span>
                                            </button>
                                            <button
                                                onClick={() => setShowProxyListFor(seller)}
                                                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition flex items-center justify-center space-x-2"
                                            >
                                                <FaUser className="w-4 h-4" />
                                                <span>Đi chợ dùm</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                                    <FiShoppingBag className="inline mr-2" />
                                    Tóm tắt đơn hàng
                                </h3>

                                {/* Delivery Method */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-700 mb-3">Phương thức nhận hàng</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="delivery"
                                                value="pickup"
                                                checked={deliveryMethod === "pickup"}
                                                onChange={(e) => setDeliveryMethod(e.target.value)}
                                                className="text-supply-primary"
                                            />
                                            <FaStore className="text-supply-primary" />
                                            <span className="text-sm">Tự đến lấy tại chợ</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="delivery"
                                                value="proxy"
                                                checked={deliveryMethod === "proxy"}
                                                onChange={(e) => setDeliveryMethod(e.target.value)}
                                                className="text-supply-primary"
                                            />
                                            <FaUser className="text-supply-primary" />
                                            <span className="text-sm">Nhờ người đi chợ dùm</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-3 pb-4 border-b">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Số lượng sản phẩm</span>
                                        <span className="font-medium">{formattedCartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span className="font-medium">{totalAmount.toLocaleString()}đ</span>
                                    </div>
                                    {deliveryMethod === "delivery" && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phí giao hàng</span>
                                                <span className="font-medium">
                                                    {additionalFee === 0 ? (
                                                        <span className="text-green-600">Miễn phí</span>
                                                    ) : (
                                                        `${additionalFee.toLocaleString()}đ`
                                                    )}
                                                </span>
                                            </div>
                                            {totalAmount < 200000 && (
                                                <p className="text-xs text-gray-500">
                                                    Mua thêm {(200000 - totalAmount).toLocaleString()}đ để được miễn phí giao hàng
                                                </p>
                                            )}
                                        </>
                                    )}
                                    {deliveryMethod === "proxy" && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phí dịch vụ đi chợ</span>
                                            <span className="font-medium text-blue-600">
                                                {additionalFee.toLocaleString()}đ
                                            </span>
                                        </div>
                                    )}
                                    {deliveryMethod === "pickup" && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phí giao hàng</span>
                                            <span className="font-medium text-green-600">Miễn phí</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mt-4 mb-6">
                                    <span className="text-lg font-semibold">Tổng cộng</span>
                                    <span className="text-xl font-bold text-supply-primary">
                                        {finalTotal.toLocaleString()}đ
                                    </span>
                                </div>

                                <button className="w-full bg-supply-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center space-x-2">
                                    <FiCheck className="w-5 h-5" />
                                    <span>Đặt hàng ngay</span>
                                </button>

                                <div className="mt-4 text-center">
                                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                        <FiClock className="w-4 h-4" />
                                        <span>Giao hàng trong 30-60 phút</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal liên hệ người bán */}
            {selectedSeller && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setSelectedSeller(null)}
                >
                    <div
                        className="bg-white p-8 rounded-xl w-[90%] max-w-md shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                            onClick={() => setSelectedSeller(null)}
                        >
                            ✕
                        </button>
                        <div className="text-center mb-6">
                            <span className="text-4xl mb-3 block">{sellerInfoMap[selectedSeller]?.avatar}</span>
                            <h3 className="text-xl font-bold text-gray-800">Thông tin người bán</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <FaUser className="text-supply-primary w-5 h-5" />
                                <div>
                                    <p className="text-sm text-gray-500">Họ tên</p>
                                    <p className="font-medium">{selectedSeller}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FaPhone className="text-supply-primary w-5 h-5" />
                                <div>
                                    <p className="text-sm text-gray-500">Số điện thoại</p>
                                    <p className="font-medium">{sellerInfoMap[selectedSeller]?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <FaMapMarkerAlt className="text-supply-primary w-5 h-5 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Địa chỉ gian hàng</p>
                                    <p className="font-medium">{sellerInfoMap[selectedSeller]?.address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex space-x-3">
                            <a
                                href={`tel:${sellerInfoMap[selectedSeller]?.phone}`}
                                className="flex-1 bg-blue-500 text-white py-3 rounded-lg text-center hover:bg-blue-600 transition flex items-center justify-center space-x-2"
                            >
                                <FaPhone className="w-4 h-4" />
                                <span>Gọi điện</span>
                            </a>
                            <a
                                href={`https://zalo.me/${sellerInfoMap[selectedSeller]?.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-supply-primary text-white py-3 rounded-lg text-center hover:bg-green-600 transition"
                            >
                                Chat Zalo
                            </a>
                        </div>
                    </div>
                </div>
            )}


            {/* Modal người đi chợ giùm */}
            {showProxyListFor && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowProxyListFor(null)}
                >
                    <div
                        className="bg-white p-8 rounded-xl w-[90%] max-w-lg shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                            onClick={() => setShowProxyListFor(null)}
                        >
                            ✕
                        </button>
                        <div className="text-center mb-6">
                            <FaUser className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                            <h3 className="text-xl font-bold text-gray-800">Người đi chợ dùm</h3>
                            <p className="text-gray-600 text-sm">Chọn người hỗ trợ mua hàng gần bạn</p>
                        </div>

                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            {proxyShoppers.map((ps, idx) => (
                                <div key={idx} className="border rounded-lg p-4 hover:border-blue-300 transition">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <span className="text-2xl">{ps.avatar}</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{ps.name}</h4>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                                    <FaMapMarkerAlt className="w-3 h-3" />
                                                    <span>{ps.area}</span>
                                                </div>
                                                <div className="flex items-center space-x-4 mt-2 text-sm">
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-yellow-500">⭐</span>
                                                        <span>{ps.rating}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <FiClock className="w-3 h-3 text-gray-500" />
                                                        <span className="text-gray-600">{ps.experience}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <a
                                                href={`tel:${ps.phone}`}
                                                className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition flex items-center space-x-1"
                                            >
                                                <FaPhone className="w-3 h-3" />
                                                <span>Gọi</span>
                                            </a>
                                            <a
                                                href={`https://zalo.me/${ps.phone.replace(/\D/g, "")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-supply-primary text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition text-center"
                                            >
                                                Chat
                                            </a>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                                        <p>📞 {ps.phone}</p>
                                        <p className="mt-1">Phí dịch vụ: 20.000đ + 5% giá trị đơn hàng</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-800 mb-2">💡 Lưu ý khi sử dụng dịch vụ</h5>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Liên hệ trực tiếp với người đi chợ để thỏa thuận</li>
                                <li>• Thanh toán trực tiếp khi nhận hàng</li>
                                <li>• Kiểm tra chất lượng hàng hóa trước khi thanh toán</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa sản phẩm */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowDeleteConfirm(null)}
                >
                    <div
                        className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Xác nhận xóa sản phẩm
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn xóa <span className="font-medium text-gray-800">"{showDeleteConfirm.name}"</span> khỏi giỏ hàng?
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleRemove(showDeleteConfirm.id, showDeleteConfirm.name)}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa tất cả sản phẩm của seller */}
            {showClearSellerConfirm && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowClearSellerConfirm(null)}
                >
                    <div
                        className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Xóa tất cả sản phẩm
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn xóa tất cả sản phẩm từ <span className="font-medium text-gray-800">"{showClearSellerConfirm}"</span> khỏi giỏ hàng?
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowClearSellerConfirm(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleClearSeller(showClearSellerConfirm)}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CartPage;
