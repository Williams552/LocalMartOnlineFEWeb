import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/image/logo.jpg";
import { FiBell, FiMessageSquare, FiShoppingCart, FiMapPin, FiUser, FiHeart, FiBox } from "react-icons/fi";
import { FaUserCircle, FaStore, FaHandshake, FaHeadset } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import { useFavorites } from "../../contexts/FavoriteContext";
import { useFollowStore } from "../../contexts/FollowStoreContext";
import { useAuth } from "../../hooks/useAuth";
import authService from "../../services/authService";
import "../../styles/logout-modal.css";

const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Use contexts with fallback values
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount = 0 } = useCart();
    const { favoriteCount = 0 } = useFavorites();
    const { followingCount = 0 } = useFollowStore();
    const navigate = useNavigate();

    // Remove the local auth check effect since useAuth handles it
    // useEffect(() => {
    //     const checkAuth = async () => {
    //         try {
    //             const currentUser = authService.getCurrentUser();
    //             if (currentUser) {
    //                 setUser(currentUser);
    //                 setIsAuthenticated(true);
    //             }
    //         } catch (error) {
    //             console.error('Auth check error:', error);
    //         }
    //     };
    //     checkAuth();
    // }, []);

    // Debug authentication state
    useEffect(() => {
        console.log('Header - Authentication state changed:', { isAuthenticated, user });
    }, [isAuthenticated, user]);

    const handleLogout = async (clearAllDevices = false) => {
        console.log('Header - Logout initiated', { clearAllDevices });

        try {
            setIsLoggingOut(true);

            // Use the context logout function
            await logout(clearAllDevices);

            // Clear UI state
            setShowProfileMenu(false);
            setShowLogoutConfirm(false);

            // Navigate to login page
            navigate('/login', { replace: true });

        } catch (error) {
            console.error('Logout error:', error);
            // Fallback: Force logout even if there are errors
            try {
                authService.logout();
                localStorage.clear();
                sessionStorage.clear();
            } catch (fallbackError) {
                console.error('Fallback logout error:', fallbackError);
            }
            navigate('/login', { replace: true });
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
        setShowProfileMenu(false);
    };

    const handleConfirmLogout = () => {
        handleLogout(false);
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };



    const notificationRef = useRef();
    const messageRef = useRef();
    const profileRef = useRef();

    const notifications = [
        { id: 1, message: "Đơn hàng #1234 đã được xác nhận", time: "5 phút trước", unread: true },
        { id: 2, message: "Cà rốt Đà Lạt giảm giá 20%", time: "1 giờ trước", unread: true },
        { id: 3, message: "Gian hàng Cô Lan có sản phẩm mới", time: "2 giờ trước", unread: false },
    ];

    const messages = [
        { id: 1, from: "Cô Lan (Chợ Cái Khế)", text: "Bạn còn cần thêm rau gì không?", time: "10 phút trước", avatar: "🧑‍🌾" },
        { id: 2, from: "Anh Minh (Chợ An Hòa)", text: "Cà chua hôm nay rất tươi nhé!", time: "30 phút trước", avatar: "👨‍🌾" },
    ];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target))
                setShowNotifications(false);
            if (messageRef.current && !messageRef.current.contains(e.target))
                setShowMessages(false);
            if (profileRef.current && !profileRef.current.contains(e.target))
                setShowProfileMenu(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close logout confirmation when clicking outside
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showLogoutConfirm) {
                setShowLogoutConfirm(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showLogoutConfirm]);

    return (
        <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
            {/* Top Bar */}
            <div className="bg-supply-primary text-white py-1">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                            <FiMapPin size={14} />
                            <span>Giao hàng toàn TP. Cần Thơ</span>
                        </span>
                        <span>📞 Hotline: 1900-6868</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span>🚚 Miễn phí giao hàng đơn từ 200k</span>
                        <span>⏰ Giao hàng 30 phút</span>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="relative">
                            <img src={logo} alt="LocalMart Logo" className="w-12 h-12 object-cover rounded-full border-2 border-supply-primary" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-supply-primary">LocalMart</h1>
                            <p className="text-xs text-gray-500">Chợ Online Cần Thơ</p>
                        </div>
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Favorites/Wishlist */}
                                <Link
                                    to="/buyer/favorites"
                                    className="relative text-gray-600 hover:text-red-500 transition group"
                                    title="Sản phẩm yêu thích"
                                >
                                    <FiHeart size={24} className="group-hover:text-red-500" />
                                    {favoriteCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                                            {favoriteCount > 99 ? '99+' : favoriteCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Following Stores */}
                                <Link
                                    to="/buyer/following"
                                    className="relative text-gray-600 hover:text-blue-500 transition group"
                                    title="Gian hàng theo dõi"
                                >
                                    <FaStore size={24} className="group-hover:text-blue-500" />
                                    {followingCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                                            {followingCount > 99 ? '99+' : followingCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Notifications */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setShowNotifications((prev) => !prev)}
                                        className="relative text-gray-600 hover:text-supply-primary transition"
                                    >
                                        <FiBell size={24} />
                                        {notifications.filter(n => n.unread).length > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                                {notifications.filter(n => n.unread).length}
                                            </span>
                                        )}
                                    </button>
                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
                                            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                                                <h3 className="font-semibold text-gray-800">Thông báo</h3>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.map((notification) => (
                                                    <div key={notification.id} className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${notification.unread ? 'bg-blue-50' : ''}`}>
                                                        <p className="text-sm text-gray-800">{notification.message}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 text-center border-t">
                                                <Link to="/notifications" className="text-supply-primary text-sm hover:underline">
                                                    Xem tất cả thông báo
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Messages */}
                                <div className="relative" ref={messageRef}>
                                    <button
                                        onClick={() => setShowMessages((prev) => !prev)}
                                        className="relative text-gray-600 hover:text-supply-primary transition"
                                    >
                                        <FiMessageSquare size={24} />
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                            {messages.length}
                                        </span>
                                    </button>
                                    {showMessages && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
                                            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                                                <h3 className="font-semibold text-gray-800">Tin nhắn</h3>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {messages.map((message) => (
                                                    <div key={message.id} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                                                        <div className="flex items-start space-x-3">
                                                            <span className="text-2xl">{message.avatar}</span>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm text-gray-800">{message.from}</p>
                                                                <p className="text-sm text-gray-600 mt-1">{message.text}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 text-center border-t">
                                                <Link to="/messages" className="text-supply-primary text-sm hover:underline">
                                                    Xem tất cả tin nhắn
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Cart */}
                                <Link
                                    to="/buyer/cart"
                                    className="relative text-gray-600 hover:text-supply-primary transition"
                                    title="Giỏ hàng"
                                >
                                    <FiShoppingCart size={24} />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Profile */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setShowProfileMenu((prev) => !prev)}
                                        className="flex items-center space-x-2 text-gray-600 hover:text-supply-primary transition"
                                    >
                                        <FaUserCircle size={28} />
                                        <span className="text-sm font-medium">{user?.fullName || user?.username || "Tài khoản"}</span>
                                    </button>
                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
                                            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                                                <p className="font-semibold text-gray-800">{user?.fullName || user?.username || "Người dùng"}</p>
                                                <p className="text-sm text-gray-600">
                                                    {user?.role === 'Seller' ? 'Người bán' :
                                                        user?.role === 'Admin' ? 'Quản trị viên' : 'Khách hàng'}
                                                </p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link to="/profile" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                    <FiUser size={16} />
                                                    <span>Hồ sơ của tôi</span>
                                                </Link>                                <Link to="/buyer/orders" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                    <FiBox size={16} />
                                                    <span>Đơn hàng của tôi</span>
                                                </Link>
                                                <Link to="/buyer/favorites" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                    <FiHeart size={16} />
                                                    <span>Sản phẩm yêu thích</span>
                                                    {favoriteCount > 0 && (
                                                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                            {favoriteCount}
                                                        </span>
                                                    )}
                                                </Link>
                                                <Link to="/buyer/following" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                    <FaStore size={16} />
                                                    <span>Gian hàng theo dõi</span>
                                                    {followingCount > 0 && (
                                                        <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                            {followingCount}
                                                        </span>
                                                    )}
                                                </Link>
                                                <Link to="/fast-bargain" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                    <FaHandshake size={16} />
                                                    <span>Thương lượng của tôi</span>
                                                </Link>
                                                <Link to="/support-requests" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                    <FaHeadset size={16} />
                                                    <span>Yêu cầu hỗ trợ</span>
                                                </Link>

                                                {/* Seller Navigation */}
                                                {user?.role === 'Seller' && (
                                                    <>
                                                        <div className="border-t my-2"></div>
                                                        <div className="px-4 py-2 text-xs text-gray-500 font-semibold uppercase">
                                                            Quản lý cửa hàng
                                                        </div>
                                                        <Link to="/seller/dashboard" className="flex items-center space-x-3 px-4 py-2 hover:bg-green-50 text-sm text-supply-primary">
                                                            <FaStore size={16} />
                                                            <span>Dashboard</span>
                                                        </Link>
                                                        <Link to="/seller/products" className="flex items-center space-x-3 px-4 py-2 hover:bg-green-50 text-sm">
                                                            <FiBox size={16} />
                                                            <span>Quản lý sản phẩm</span>
                                                        </Link>
                                                        <Link to="/seller/orders" className="flex items-center space-x-3 px-4 py-2 hover:bg-green-50 text-sm">
                                                            <FiShoppingCart size={16} />
                                                            <span>Đơn hàng bán</span>
                                                        </Link>
                                                        <Link to="/seller/profile" className="flex items-center space-x-3 px-4 py-2 hover:bg-green-50 text-sm">
                                                            <FaUserCircle size={16} />
                                                            <span>Hồ sơ cửa hàng</span>
                                                        </Link>
                                                    </>
                                                )}

                                                {/* Admin Navigation */}
                                                {user?.role === 'Admin' && (
                                                    <>
                                                        <div className="border-t my-2"></div>
                                                        <div className="px-4 py-2 text-xs text-gray-500 font-semibold uppercase">
                                                            Quản trị hệ thống
                                                        </div>
                                                        <Link to="/admin" className="flex items-center space-x-3 px-4 py-2 hover:bg-blue-50 text-sm text-blue-600">
                                                            <FaStore size={16} />
                                                            <span>Admin Dashboard</span>
                                                        </Link>
                                                    </>
                                                )}

                                                {/* Registration Links for buyers */}
                                                {user?.role === "Buyer" && (
                                                    <>
                                                        <div className="border-t my-2"></div>
                                                        <Link to="/register-seller" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                            <FaStore size={16} />
                                                            <span>Đăng ký bán hàng</span>
                                                        </Link>
                                                        <Link to="/proxy-shopper/register" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                            <FiMapPin size={16} />
                                                            <span>Đăng ký đi chợ dùm</span>
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                            <div className="border-t py-2">
                                                <button
                                                    onClick={handleLogoutClick}
                                                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center space-x-2 transition-colors"
                                                    disabled={isLoggingOut}
                                                >
                                                    {isLoggingOut ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                            <span>Đang đăng xuất...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                            </svg>
                                                            <span>Đăng xuất</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 border border-supply-primary text-supply-primary rounded-lg text-sm hover:bg-supply-primary hover:text-white transition"
                                    onClick={() => {
                                        console.log('Login link clicked');
                                        // Force navigation to login
                                        navigate('/login');
                                    }}
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-supply-primary text-white rounded-lg text-sm hover:bg-green-600 transition"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="border-t bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="flex items-center justify-center space-x-8 py-3 text-sm font-medium text-gray-700">
                        <Link to="/" className="hover:text-supply-primary transition flex items-center space-x-1">
                            <span>🏠</span>
                            <span>Trang chủ</span>
                        </Link>
                        <Link to="/products" className="hover:text-supply-primary transition flex items-center space-x-1">
                            <span>🥕</span>
                            <span>Sản phẩm</span>
                        </Link>
                        <Link to="/markets" className="hover:text-supply-primary transition flex items-center space-x-1">
                            <span>🏪</span>
                            <span>Các chợ</span>
                        </Link>
                        <Link to="/sellers" className="hover:text-supply-primary transition flex items-center space-x-1">
                            <span>👨‍🌾</span>
                            <span>Người bán</span>
                        </Link>
                        <Link to="/about" className="hover:text-supply-primary transition flex items-center space-x-1">
                            <span>ℹ️</span>
                            <span>Giới thiệu</span>
                        </Link>
                        <Link to="/contact" className="hover:text-supply-primary transition flex items-center space-x-1">
                            <span>📞</span>
                            <span>Liên hệ</span>
                        </Link>
                        <Link to="/faq" className="hover:text-supply-primary transition flex items-center space-x-1">
                            <span>❓</span>
                            <span>FAQ</span>
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in fade-in duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                            <div className="flex items-center justify-center space-x-3">
                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">Đăng xuất</h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 text-center">
                            <p className="text-gray-700 text-lg mb-6">
                                Bạn có muốn đăng xuất không?
                            </p>

                            {/* Action buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleCancelLogout}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                    disabled={isLoggingOut}
                                >
                                    Không
                                </button>
                                <button
                                    onClick={handleConfirmLogout}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <span>Có</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
