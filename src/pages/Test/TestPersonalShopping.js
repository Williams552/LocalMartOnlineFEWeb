// Test Personal Shopping Page - Showcase the personal shopping stats
import React, { useState, useEffect } from 'react';
import PersonalShoppingStats from '../components/Seller/PersonalShoppingStats';
import personalShoppingService from '../services/personalShoppingService';
import {
    FaShoppingCart, FaHeart, FaShoppingBag, FaMoneyBillWave,
    FaCheck, FaClock, FaTruck, FaTimesCircle
} from 'react-icons/fa';

const TestPersonalShopping = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading and use mock data
        const loadMockData = () => {
            setLoading(true);

            setTimeout(() => {
                const mockStats = personalShoppingService.getMockShoppingStats();
                setStatistics(mockStats);
                setLoading(false);
            }, 1000);
        };

        loadMockData();
    }, []);

    const formatCurrency = (amount) => {
        return personalShoppingService.formatCurrency(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            🛒 Thống kê mua sắm cá nhân - Demo
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Tính năng cho sellers có vai trò kép (vừa bán vừa mua)
                        </p>

                        {/* Feature Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                                <FaShoppingCart className="text-blue-600 text-xl" />
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">Tổng đơn hàng</div>
                                    <div className="text-sm text-gray-600">Đã mua</div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                                <FaMoneyBillWave className="text-green-600 text-xl" />
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">Tổng chi tiêu</div>
                                    <div className="text-sm text-gray-600">Số tiền đã mua</div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                                <FaHeart className="text-red-600 text-xl" />
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">Yêu thích</div>
                                    <div className="text-sm text-gray-600">Sản phẩm đã thích</div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                                <FaShoppingBag className="text-purple-600 text-xl" />
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">Giỏ hàng</div>
                                    <div className="text-sm text-gray-600">Hiện tại</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo Statistics */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Demo với dữ liệu mẫu</h2>

                    {!loading && statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {statistics.totalOrders}
                                </div>
                                <div className="text-sm text-gray-600">Tổng đơn hàng</div>
                            </div>

                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(statistics.totalSpent)}
                                </div>
                                <div className="text-sm text-gray-600">Tổng chi tiêu</div>
                            </div>

                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                    {statistics.favoriteProductsCount}
                                </div>
                                <div className="text-sm text-gray-600">Sản phẩm yêu thích</div>
                            </div>

                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {statistics.cartItemsCount}
                                </div>
                                <div className="text-sm text-gray-600">Trong giỏ hàng</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* API Endpoints Information */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">🔌 API Endpoints đã tích hợp</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-3">Đơn hàng (Orders)</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center space-x-2">
                                    <FaCheck className="text-green-500" />
                                    <span>GET /api/order/buyer/{`{buyerId}`}</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <FaCheck className="text-green-500" />
                                    <span>POST /api/order/filter</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-700 mb-3">Giỏ hàng (Cart)</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center space-x-2">
                                    <FaCheck className="text-green-500" />
                                    <span>GET /api/Cart/{`{userId}`}</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <FaCheck className="text-green-500" />
                                    <span>GET /api/Cart/{`{userId}`}/summary</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-700 mb-3">Yêu thích (Favorites)</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center space-x-2">
                                    <FaCheck className="text-green-500" />
                                    <span>GET /api/favorite</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <FaCheck className="text-green-500" />
                                    <span>POST /api/favorite/add</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-700 mb-3">Trạng thái đơn hàng</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center space-x-2">
                                    <FaClock className="text-yellow-500" />
                                    <span className="text-gray-600">Chờ xác nhận</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <FaTruck className="text-blue-500" />
                                    <span className="text-gray-600">Đang giao hàng</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <FaCheck className="text-green-500" />
                                    <span className="text-gray-600">Đã hoàn thành</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <FaTimesCircle className="text-red-500" />
                                    <span className="text-gray-600">Đã hủy</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Component */}
                <PersonalShoppingStats statistics={statistics} loading={loading} />

                {/* Usage Instructions */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Hướng dẫn sử dụng</h2>
                    <div className="prose max-w-none">
                        <ol className="list-decimal list-inside space-y-2 text-gray-700">
                            <li>Truy cập <strong>/seller/personal-shopping</strong> từ seller dashboard</li>
                            <li>Xem thống kê tổng quan về hoạt động mua sắm cá nhân</li>
                            <li>Kiểm tra số đơn hàng đã mua, tổng chi tiêu, sản phẩm yêu thích</li>
                            <li>Theo dõi giỏ hàng hiện tại và đơn hàng gần đây</li>
                            <li>Chuyển đổi giữa các tab: Tổng quan, Giỏ hàng, Đơn hàng, Yêu thích</li>
                        </ol>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">💡 Lợi ích cho Sellers</h3>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>Hiểu được quan điểm khách hàng qua trải nghiệm mua sắm</li>
                                <li>Theo dõi xu hướng mua sắm cá nhân để cải thiện sản phẩm</li>
                                <li>Quản lý cả hai vai trò: seller và buyer trong một giao diện</li>
                                <li>Phân tích thói quen mua sắm để tối ưu chiến lược kinh doanh</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">🔗 Liên kết nhanh</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/seller/dashboard"
                            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            <FaShoppingCart className="text-blue-600 text-xl" />
                            <div>
                                <div className="font-medium text-gray-800">Seller Dashboard</div>
                                <div className="text-sm text-gray-600">Quay về dashboard chính</div>
                            </div>
                        </a>

                        <a
                            href="/seller/personal-shopping"
                            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            <FaShoppingBag className="text-purple-600 text-xl" />
                            <div>
                                <div className="font-medium text-gray-800">Personal Shopping</div>
                                <div className="text-sm text-gray-600">Trang chính thức</div>
                            </div>
                        </a>

                        <a
                            href="/cart"
                            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            <FaShoppingCart className="text-green-600 text-xl" />
                            <div>
                                <div className="font-medium text-gray-800">Giỏ hàng</div>
                                <div className="text-sm text-gray-600">Xem giỏ hàng hiện tại</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPersonalShopping;
