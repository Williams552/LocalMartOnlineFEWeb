import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaStore, FaBoxOpen, FaShoppingCart, FaUsers, FaStar, FaEye,
    FaChartLine, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
    FaCalendarAlt, FaDollarSign, FaHeart, FaComments, FaUser,
    FaHome, FaShoppingBag, FaHistory, FaCreditCard
} from "react-icons/fa";
import products from "../../data/products";
import SellerLayout from "../../layouts/SellerLayout";

const SellerDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState("7days");
    const [searchTerm, setSearchTerm] = useState("");

    // Mock data - trong thực tế sẽ lấy từ API dựa trên seller ID
    const sellerData = {
        name: "Gian hàng Cô Lan",
        avatar: "https://i.pravatar.cc/100?img=1",
        rating: 4.8,
        followers: 340,
        joinDate: "Tham gia từ 2023"
    };

    const stats = {
        totalProducts: 25,
        totalOrders: 128,
        totalRevenue: 15600000,
        newFollowers: 12,
        viewsThisWeek: 456,
        pendingOrders: 8,
        // Buyer stats
        totalPurchases: 34,
        totalSpent: 2800000,
        cartItems: 3,
        favoriteProducts: 18
    };

    const recentOrders = [
        { id: "DH001", customer: "Chị Lan Anh", product: "Rau muống", quantity: "2kg", status: "Đang chuẩn bị", time: "10 phút trước" },
        { id: "DH002", customer: "Anh Minh", product: "Cà chua", quantity: "3kg", status: "Đã giao", time: "1 giờ trước" },
        { id: "DH003", customer: "Chị Hoa", product: "Xà lách", quantity: "1kg", status: "Chờ xác nhận", time: "2 giờ trước" },
        { id: "DH004", customer: "Anh Tùng", product: "Bắp cải", quantity: "2kg", status: "Đang giao", time: "3 giờ trước" }
    ];

    const topProducts = products.slice(0, 5).map((product, idx) => ({
        ...product,
        sold: Math.floor(Math.random() * 50) + 10,
        views: Math.floor(Math.random() * 200) + 50
    }));

    const getStatusColor = (status) => {
        switch (status) {
            case "Chờ xác nhận": return "bg-yellow-100 text-yellow-800";
            case "Đang chuẩn bị": return "bg-blue-100 text-blue-800";
            case "Đang giao": return "bg-purple-100 text-purple-800";
            case "Đã giao": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <SellerLayout>
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img
                                src={sellerData.avatar}
                                alt={sellerData.name}
                                className="w-12 h-12 rounded-full border-2 border-supply-primary"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">{sellerData.name}</h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <FaStar className="text-yellow-500" />
                                        <span>{sellerData.rating}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <FaUsers />
                                        <span>{sellerData.followers} theo dõi</span>
                                    </div>
                                    <span>{sellerData.joinDate}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <Link
                                to="/seller/products/add"
                                className="flex items-center space-x-2 bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                            >
                                <FaPlus />
                                <span>Thêm sản phẩm</span>
                            </Link>
                            <Link
                                to="/cart"
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                <FaShoppingBag />
                                <span>Giỏ hàng ({stats.cartItems})</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Trang chủ</h2>
                        <div className="flex space-x-2">
                            <Link to="/" className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                                <FaHome size={16} />
                                <span>Trang chủ mua sắm</span>
                            </Link>
                            <Link to="/buyer/profile" className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                                <FaUser size={16} />
                                <span>Hồ sơ mua hàng</span>
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <FaShoppingBag className="text-blue-600" size={20} />
                            <div>
                                <p className="font-medium text-gray-800">Đã mua</p>
                                <p className="text-sm text-gray-600">{stats.totalPurchases} đơn hàng</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <FaCreditCard className="text-green-600" size={20} />
                            <div>
                                <p className="font-medium text-gray-800">Đã chi tiêu</p>
                                <p className="text-sm text-gray-600">{stats.totalSpent.toLocaleString()}đ</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                            <FaHeart className="text-red-600" size={20} />
                            <div>
                                <p className="font-medium text-gray-800">Yêu thích</p>
                                <p className="text-sm text-gray-600">{stats.favoriteProducts} sản phẩm</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                            <FaShoppingCart className="text-orange-600" size={20} />
                            <div>
                                <p className="font-medium text-gray-800">Giỏ hàng</p>
                                <p className="text-sm text-gray-600">{stats.cartItems} sản phẩm</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Sản phẩm</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <FaBoxOpen className="text-blue-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Đơn hàng</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <FaShoppingCart className="text-green-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Doanh thu</p>
                                <p className="text-xl font-bold text-gray-800">{stats.totalRevenue.toLocaleString()}đ</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <FaDollarSign className="text-yellow-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Người theo dõi mới</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.newFollowers}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <FaHeart className="text-red-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Lượt xem</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.viewsThisWeek}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <FaEye className="text-purple-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Chờ xử lý</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <FaComments className="text-orange-600" size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Orders */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Đơn hàng gần đây</h2>
                                <Link to="/seller/orders" className="text-supply-primary hover:underline">
                                    Xem tất cả →
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <span className="font-medium text-gray-800">#{order.id}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {order.customer} • {order.product} • {order.quantity}
                                            </p>
                                            <p className="text-xs text-gray-500">{order.time}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                                                <FaEye size={14} />
                                            </button>
                                            <button className="text-green-600 hover:bg-green-50 p-2 rounded">
                                                <FaEdit size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Sản phẩm bán chạy</h2>
                                <Link to="/seller/products" className="text-supply-primary hover:underline">
                                    Quản lý →
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {topProducts.map((product, idx) => (
                                    <div key={product.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition">
                                        <div className="flex-shrink-0 w-8 h-8 bg-supply-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 truncate">{product.name}</p>
                                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                                <span>Bán: {product.sold}</span>
                                                <span>•</span>
                                                <span>Xem: {product.views}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-supply-primary">{product.price.toLocaleString()}đ</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Thao tác nhanh</h2>

                        {/* Seller Actions */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                <FaStore className="mr-2" />
                                Quản lý cửa hàng
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link
                                    to="/seller/products/add"
                                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-supply-primary hover:bg-green-50 transition group"
                                >
                                    <div className="bg-green-100 group-hover:bg-supply-primary group-hover:text-white p-3 rounded-lg mb-2 transition">
                                        <FaPlus size={20} />
                                    </div>
                                    <span className="font-medium text-gray-800">Thêm sản phẩm</span>
                                </Link>

                                <Link
                                    to="/seller/orders"
                                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-supply-primary hover:bg-green-50 transition group"
                                >
                                    <div className="bg-blue-100 group-hover:bg-supply-primary group-hover:text-white p-3 rounded-lg mb-2 transition">
                                        <FaShoppingCart size={20} />
                                    </div>
                                    <span className="font-medium text-gray-800">Quản lý đơn hàng</span>
                                </Link>

                                <Link
                                    to="/seller/analytics"
                                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-supply-primary hover:bg-green-50 transition group"
                                >
                                    <div className="bg-purple-100 group-hover:bg-supply-primary group-hover:text-white p-3 rounded-lg mb-2 transition">
                                        <FaChartLine size={20} />
                                    </div>
                                    <span className="font-medium text-gray-800">Thống kê</span>
                                </Link>

                                <Link
                                    to="/seller/profile"
                                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-supply-primary hover:bg-green-50 transition group"
                                >
                                    <div className="bg-yellow-100 group-hover:bg-supply-primary group-hover:text-white p-3 rounded-lg mb-2 transition">
                                        <FaStore size={20} />
                                    </div>
                                    <span className="font-medium text-gray-800">Hồ sơ cửa hàng</span>
                                </Link>
                            </div>
                        </div>

                        {/* Buyer Actions */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                <FaShoppingBag className="mr-2" />
                                Mua sắm & Tài khoản
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link
                                    to="/"
                                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                                >
                                    <div className="bg-blue-100 group-hover:bg-blue-500 group-hover:text-white p-3 rounded-lg mb-2 transition">
                                        <FaHome size={20} />
                                    </div>
                                    <span className="font-medium text-gray-800">Trang chủ</span>
                                </Link>

                                <Link
                                    to="/cart"
                                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                                >
                                    <div className="bg-orange-100 group-hover:bg-blue-500 group-hover:text-white p-3 rounded-lg mb-2 transition">
                                        <FaShoppingCart size={20} />
                                    </div>
                                    <span className="font-medium text-gray-800">Giỏ hàng ({stats.cartItems})</span>
                                </Link>

                                <Link
                                    to="/buyer/profile"
                                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                                >
                                    <div className="bg-indigo-100 group-hover:bg-blue-500 group-hover:text-white p-3 rounded-lg mb-2 transition">
                                        <FaUser size={20} />
                                    </div>
                                    <span className="font-medium text-gray-800">Hồ sơ cá nhân</span>
                                </Link>

                                <Link
                                    to="/buyer/orders"
                                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                                >
                                    <div className="bg-pink-100 group-hover:bg-blue-500 group-hover:text-white p-3 rounded-lg mb-2 transition">
                                        <FaHistory size={20} />
                                    </div>
                                    <span className="font-medium text-gray-800">Lịch sử mua hàng</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerDashboard;
