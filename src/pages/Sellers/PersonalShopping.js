// Personal Shopping Page - Seller's shopping activity
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import PersonalShoppingStats from '../../components/Seller/PersonalShoppingStats';
import personalShoppingService from '../../services/personalShoppingService';
import {
    FaShoppingCart, FaHeart, FaReceipt, FaEye,
    FaShoppingBag, FaArrowRight, FaStore, FaCalendarAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const PersonalShopping = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [cartItems, setCartItems] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch personal shopping statistics
            const stats = await personalShoppingService.getPersonalShoppingStats();
            setStatistics(stats);

            // Fetch additional data for different tabs
            if (activeTab === 'cart') {
                const cartData = await personalShoppingService.getCartItems();
                setCartItems(cartData);
            } else if (activeTab === 'orders') {
                const ordersData = await personalShoppingService.getMyOrders(1, 10);
                setRecentOrders(ordersData.orders);
            }

        } catch (error) {
            console.error('Error fetching personal shopping data:', error);
            setError('Không thể tải dữ liệu mua sắm. Vui lòng thử lại.');
            toast.error('Lỗi khi tải dữ liệu mua sắm');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = async (tab) => {
        setActiveTab(tab);

        if (tab === 'cart' && cartItems.length === 0) {
            try {
                const cartData = await personalShoppingService.getCartItems();
                setCartItems(cartData);
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        } else if (tab === 'orders' && recentOrders.length === 0) {
            try {
                const ordersData = await personalShoppingService.getMyOrders(1, 10);
                setRecentOrders(ordersData.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        }
    };

    const formatCurrency = (amount) => {
        return personalShoppingService.formatCurrency(amount);
    };

    const formatDate = (dateString) => {
        return personalShoppingService.formatDate(dateString);
    };

    const getStatusBadge = (status) => {
        const configs = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'preparing': 'bg-purple-100 text-purple-800',
            'shipping': 'bg-orange-100 text-orange-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return configs[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'preparing': 'Đang chuẩn bị',
            'shipping': 'Đang giao',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy'
        };
        return labels[status] || status;
    };

    if (error) {
        return (
            <SellerLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
                        <FaShoppingCart className="text-4xl text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Lỗi tải dữ liệu</h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={fetchData}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <FaShoppingCart className="mr-3 text-blue-600" />
                                    Thống kê mua sắm cá nhân
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Hoạt động mua sắm của bạn khi là khách hàng
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/cart"
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    <FaShoppingBag />
                                    <span>Xem giỏ hàng</span>
                                </Link>
                                <Link
                                    to="/orders"
                                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                >
                                    <FaReceipt />
                                    <span>Đơn hàng của tôi</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6">
                                <button
                                    onClick={() => handleTabChange('overview')}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaShoppingCart className="inline mr-2" />
                                    Tổng quan
                                </button>
                                <button
                                    onClick={() => handleTabChange('cart')}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'cart'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaShoppingBag className="inline mr-2" />
                                    Giỏ hàng hiện tại
                                    {statistics?.cartItemsCount > 0 && (
                                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                            {statistics.cartItemsCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleTabChange('orders')}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'orders'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaReceipt className="inline mr-2" />
                                    Đơn hàng
                                </button>
                                <button
                                    onClick={() => handleTabChange('favorites')}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'favorites'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaHeart className="inline mr-2" />
                                    Yêu thích
                                    {statistics?.favoriteProductsCount > 0 && (
                                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                            {statistics.favoriteProductsCount}
                                        </span>
                                    )}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <PersonalShoppingStats statistics={statistics} loading={loading} />
                    )}

                    {activeTab === 'cart' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Giỏ hàng hiện tại</h3>
                                <Link
                                    to="/cart"
                                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                                >
                                    <span>Xem đầy đủ</span>
                                    <FaArrowRight />
                                </Link>
                            </div>

                            {cartItems.length > 0 ? (
                                <div className="space-y-4">
                                    {cartItems.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <FaShoppingBag className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                                    <p className="text-sm text-gray-600">Từ: {item.seller}</p>
                                                    <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">
                                                    {formatCurrency(item.total)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatCurrency(item.price)}/sản phẩm
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaShoppingBag className="text-4xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Giỏ hàng trống</p>
                                    <Link
                                        to="/"
                                        className="inline-flex items-center space-x-2 mt-4 text-blue-600 hover:text-blue-800"
                                    >
                                        <FaStore />
                                        <span>Bắt đầu mua sắm</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Đơn hàng gần đây</h3>
                                <Link
                                    to="/orders"
                                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                                >
                                    <span>Xem tất cả</span>
                                    <FaArrowRight />
                                </Link>
                            </div>

                            {(recentOrders.length > 0 ? recentOrders : statistics?.recentOrders || []).length > 0 ? (
                                <div className="space-y-4">
                                    {(recentOrders.length > 0 ? recentOrders : statistics?.recentOrders || []).map((order, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FaReceipt className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">#{order.id}</h4>
                                                    <p className="text-sm text-gray-600">{order.sellerName}</p>
                                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                        <FaCalendarAlt />
                                                        <span>{formatDate(order.orderDate)}</span>
                                                        <span>•</span>
                                                        <span>{order.itemCount} sản phẩm</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">
                                                    {formatCurrency(order.totalAmount)}
                                                </div>
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaReceipt className="text-4xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Chưa có đơn hàng nào</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Sản phẩm yêu thích</h3>
                                <div className="text-sm text-gray-500">
                                    {statistics?.favoriteProductsCount || 0} sản phẩm
                                </div>
                            </div>

                            <div className="text-center py-12">
                                <FaHeart className="text-4xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {statistics?.favoriteProductsCount > 0
                                        ? `Bạn có ${statistics.favoriteProductsCount} sản phẩm yêu thích`
                                        : 'Chưa có sản phẩm yêu thích nào'
                                    }
                                </p>
                                <Link
                                    to="/"
                                    className="inline-flex items-center space-x-2 mt-4 text-blue-600 hover:text-blue-800"
                                >
                                    <FaStore />
                                    <span>Khám phá sản phẩm</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SellerLayout>
    );
};

export default PersonalShopping;
