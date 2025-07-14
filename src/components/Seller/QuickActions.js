// Quick Actions Component - Comprehensive action hub for sellers
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaPlus, FaBoxOpen, FaShoppingCart, FaChartLine, FaStore,
    FaHome, FaUser, FaShoppingBag, FaUserEdit, FaHistory,
    FaBell, FaHeart, FaReceipt, FaCog, FaSearch, FaTachometerAlt
} from 'react-icons/fa';
import cartService from '../../services/cartService';
import { getCurrentUser } from '../../services/authService';

const QuickActions = ({ showNotification = true }) => {
    const [cartItemCount, setCartItemCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = getCurrentUser();
                setUser(currentUser);

                // Get cart item count
                if (currentUser && currentUser.id) {
                    const cartData = await cartService.getCartSummary(currentUser.id);
                    setCartItemCount(cartData.itemCount || 0);
                }
            } catch (error) {
                console.error('Error loading quick actions data:', error);
                setCartItemCount(0);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Store Management Actions
    const storeActions = [
        {
            title: 'Thêm sản phẩm mới',
            description: 'Đăng sản phẩm mới',
            icon: FaPlus,
            link: '/seller/products/add',
            color: 'bg-green-100',
            iconColor: 'text-green-600',
            hoverColor: 'hover:bg-green-50 hover:border-green-400'
        },
        {
            title: 'Quản lý sản phẩm',
            description: 'Danh sách sản phẩm',
            icon: FaBoxOpen,
            link: '/seller/products',
            color: 'bg-blue-100',
            iconColor: 'text-blue-600',
            hoverColor: 'hover:bg-blue-50 hover:border-blue-400'
        },
        {
            title: 'Quản lý đơn hàng',
            description: 'Xử lý đơn hàng',
            icon: FaShoppingCart,
            link: '/seller/orders',
            color: 'bg-orange-100',
            iconColor: 'text-orange-600',
            hoverColor: 'hover:bg-orange-50 hover:border-orange-400'
        },
        {
            title: 'Thống kê chi tiết',
            description: 'Analytics & báo cáo',
            icon: FaChartLine,
            link: '/seller/analytics',
            color: 'bg-purple-100',
            iconColor: 'text-purple-600',
            hoverColor: 'hover:bg-purple-50 hover:border-purple-400'
        },
        {
            title: 'Hồ sơ cửa hàng',
            description: 'Quản lý thông tin',
            icon: FaStore,
            link: '/seller/profile',
            color: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            hoverColor: 'hover:bg-indigo-50 hover:border-indigo-400'
        }
    ];

    // Shopping Activities Actions
    const shoppingActions = [
        {
            title: 'Trang chủ mua sắm',
            description: 'Khám phá sản phẩm',
            icon: FaHome,
            link: '/',
            color: 'bg-blue-100',
            iconColor: 'text-blue-600',
            hoverColor: 'hover:bg-blue-50 hover:border-blue-400'
        },
        {
            title: 'Hồ sơ mua hàng',
            description: 'Profile buyer',
            icon: FaUserEdit,
            link: '/profile',
            color: 'bg-green-100',
            iconColor: 'text-green-600',
            hoverColor: 'hover:bg-green-50 hover:border-green-400'
        },
        {
            title: 'Giỏ hàng',
            description: `${cartItemCount} sản phẩm`,
            icon: FaShoppingBag,
            link: '/cart',
            color: 'bg-pink-100',
            iconColor: 'text-pink-600',
            hoverColor: 'hover:bg-pink-50 hover:border-pink-400',
            badge: cartItemCount
        },
        {
            title: 'Hồ sơ cá nhân',
            description: 'Thông tin tài khoản',
            icon: FaUser,
            link: '/profile',
            color: 'bg-gray-100',
            iconColor: 'text-gray-600',
            hoverColor: 'hover:bg-gray-50 hover:border-gray-400'
        },
        {
            title: 'Lịch sử mua hàng',
            description: 'Đơn hàng đã mua',
            icon: FaHistory,
            link: '/buyer/orders',
            color: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            hoverColor: 'hover:bg-yellow-50 hover:border-yellow-400'
        }
    ];

    const ActionCard = ({ action, isLoading = false }) => {
        const Icon = action.icon;

        if (isLoading) {
            return (
                <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
            );
        }

        return (
            <Link
                to={action.link}
                className={`flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg transition-all duration-200 group ${action.hoverColor}`}
            >
                <div className={`relative ${action.color} group-hover:bg-supply-primary group-hover:text-white p-3 rounded-lg mb-3 transition-all duration-200`}>
                    <Icon className={`${action.iconColor} group-hover:text-white text-xl`} />
                    {action.badge > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {action.badge > 99 ? '99+' : action.badge}
                        </span>
                    )}
                </div>
                <div className="text-center">
                    <span className="font-medium text-gray-800 text-sm block mb-1">
                        {action.title}
                    </span>
                    <span className="text-xs text-gray-500">
                        {action.description}
                    </span>
                </div>
            </Link>
        );
    };

    return (
        <div className="space-y-8">
            {/* Store Management Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FaStore className="mr-3 text-supply-primary" />
                            Quản lý cửa hàng
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Các thao tác nhanh cho việc quản lý kinh doanh
                        </p>
                    </div>
                    <Link
                        to="/seller/dashboard"
                        className="flex items-center space-x-2 text-supply-primary hover:text-green-700 transition"
                    >
                        <FaTachometerAlt />
                        <span className="text-sm">Dashboard</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <ActionCard key={index} action={{}} isLoading={true} />
                        ))
                    ) : (
                        storeActions.map((action, index) => (
                            <ActionCard key={index} action={action} />
                        ))
                    )}
                </div>

                {/* Quick Stats */}
                {!loading && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-green-600">24</div>
                                <div className="text-xs text-gray-600">Sản phẩm</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-blue-600">12</div>
                                <div className="text-xs text-gray-600">Đơn hàng hôm nay</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-purple-600">3</div>
                                <div className="text-xs text-gray-600">Chờ xử lý</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-orange-600">4.8</div>
                                <div className="text-xs text-gray-600">Đánh giá TB</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Shopping Activities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FaShoppingBag className="mr-3 text-blue-600" />
                            Hoạt động mua sắm
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Các thao tác khi bạn mua sắm như khách hàng
                        </p>
                    </div>
                    <Link
                        to="/seller/personal-shopping"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition"
                    >
                        <FaChartLine />
                        <span className="text-sm">Thống kê cá nhân</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <ActionCard key={index} action={{}} isLoading={true} />
                        ))
                    ) : (
                        shoppingActions.map((action, index) => (
                            <ActionCard key={index} action={action} />
                        ))
                    )}
                </div>

                {/* Shopping Stats */}
                {!loading && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-blue-600">{cartItemCount}</div>
                                <div className="text-xs text-gray-600">Trong giỏ hàng</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-green-600">15</div>
                                <div className="text-xs text-gray-600">Đã mua tháng này</div>
                            </div>
                            <div className="bg-pink-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-pink-600">8</div>
                                <div className="text-xs text-gray-600">Yêu thích</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-yellow-600">2.5M</div>
                                <div className="text-xs text-gray-600">Đã chi tiêu</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Additional Quick Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🔗 Liên kết hữu ích</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        to="/seller/customers"
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition"
                    >
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <FaUser className="text-indigo-600" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-800 text-sm">Khách hàng</div>
                            <div className="text-xs text-gray-600">Quản lý & thống kê</div>
                        </div>
                    </Link>

                    <Link
                        to="/seller/payments"
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition"
                    >
                        <div className="bg-green-100 p-2 rounded-lg">
                            <FaReceipt className="text-green-600" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-800 text-sm">Thanh toán</div>
                            <div className="text-xs text-gray-600">Phí & doanh thu</div>
                        </div>
                    </Link>

                    <Link
                        to="/seller/licenses"
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition"
                    >
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <FaCog className="text-purple-600" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-800 text-sm">Giấy phép</div>
                            <div className="text-xs text-gray-600">Quản lý chứng chỉ</div>
                        </div>
                    </Link>

                    <a
                        href="/support"
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition"
                    >
                        <div className="bg-yellow-100 p-2 rounded-lg">
                            <FaBell className="text-yellow-600" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-800 text-sm">Hỗ trợ</div>
                            <div className="text-xs text-gray-600">Trung tâm trợ giúp</div>
                        </div>
                    </a>
                </div>
            </div>

            {/* User Welcome Message */}
            {user && showNotification && (
                <div className="bg-supply-primary bg-opacity-10 border border-supply-primary border-opacity-20 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <FaUser className="text-supply-primary text-xl" />
                        <div>
                            <h4 className="font-semibold text-gray-800">
                                Chào mừng, {user.fullName || user.username || 'Seller'}!
                            </h4>
                            <p className="text-sm text-gray-600">
                                Sử dụng các thao tác nhanh để quản lý cửa hàng và mua sắm hiệu quả.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickActions;
