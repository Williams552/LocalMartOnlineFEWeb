import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/image/logo.jpg";
import { FiBell, FiMessageSquare, FiShoppingCart, FiSearch, FiMapPin, FiUser, FiHeart, FiBox } from "react-icons/fi";
import { FaUserCircle, FaStore } from "react-icons/fa";
import authService from "../../services/authService";

const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Authentication state
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        const authenticated = authService.isAuthenticated();
        const currentUser = authService.getCurrentUser();

        setIsLoggedIn(authenticated);
        setUser(currentUser);
    };

    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
        setUser(null);
        setShowProfileMenu(false);
    };



    const notificationRef = useRef();
    const messageRef = useRef();
    const profileRef = useRef();
    const cartRef = useRef();

    const notifications = [
        { id: 1, message: "Đơn hàng #1234 đã được xác nhận", time: "5 phút trước", unread: true },
        { id: 2, message: "Cà rốt Đà Lạt giảm giá 20%", time: "1 giờ trước", unread: true },
        { id: 3, message: "Gian hàng Cô Lan có sản phẩm mới", time: "2 giờ trước", unread: false },
    ];

    const messages = [
        { id: 1, from: "Cô Lan (Chợ Cái Khế)", text: "Bạn còn cần thêm rau gì không?", time: "10 phút trước", avatar: "🧑‍🌾" },
        { id: 2, from: "Anh Minh (Chợ An Hòa)", text: "Cà chua hôm nay rất tươi nhé!", time: "30 phút trước", avatar: "👨‍🌾" },
    ];

    const cartItems = [
        { id: 1, name: "Rau muống Cần Thơ", quantity: 2, price: 15000, seller: "Cô Lan", image: logo },
        { id: 2, name: "Cà rốt Đà Lạt", quantity: 1, price: 25000, seller: "Anh Minh", image: logo },
        { id: 3, name: "Thịt heo sạch", quantity: 0.5, price: 120000, seller: "Chú Tám", image: logo },
    ];

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target))
                setShowNotifications(false);
            if (messageRef.current && !messageRef.current.contains(e.target))
                setShowMessages(false);
            if (profileRef.current && !profileRef.current.contains(e.target))
                setShowProfileMenu(false);
            if (cartRef.current && !cartRef.current.contains(e.target))
                setShowCart(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm rau củ, trái cây, thịt cá tươi sạch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-full focus:border-supply-primary focus:outline-none text-sm"
                            />
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-supply-primary text-white p-2 rounded-full hover:bg-green-600 transition">
                                <FiSearch size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                {/* Wishlist */}
                                <Link to="/wishlist" className="relative text-gray-600 hover:text-supply-primary transition">
                                    <FiHeart size={24} />
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
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
                                <div className="relative" ref={cartRef}>
                                    <button
                                        onClick={() => setShowCart((prev) => !prev)}
                                        className="relative text-gray-600 hover:text-supply-primary transition"
                                    >
                                        <FiShoppingCart size={24} />
                                        {cartItems.length > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                                {cartItems.length}
                                            </span>
                                        )}
                                    </button>
                                    {showCart && (
                                        <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50">
                                            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                                                <h3 className="font-semibold text-gray-800">Giỏ hàng của bạn</h3>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {cartItems.map((item) => (
                                                    <div key={item.id} className="p-4 border-b flex items-center space-x-3">
                                                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm text-gray-800">{item.name}</p>
                                                            <p className="text-xs text-gray-500">Bán bởi: {item.seller}</p>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className="text-sm text-gray-600">SL: {item.quantity}kg</span>
                                                                <span className="font-medium text-supply-primary">{item.price.toLocaleString()}đ</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 border-t">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-semibold">Tổng cộng:</span>
                                                    <span className="font-bold text-supply-primary text-lg">{totalAmount.toLocaleString()}đ</span>
                                                </div>
                                                <Link
                                                    to="/cart"
                                                    className="w-full bg-supply-primary text-white py-2 px-4 rounded-lg hover:bg-green-600 transition text-center block"
                                                >
                                                    Xem giỏ hàng
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

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
                                                <Link to="/buyer/profile" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                    <FiUser size={16} />
                                                    <span>Hồ sơ của tôi</span>
                                                </Link>
                                                <Link to="/buyer/orders" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                    <FiBox size={16} />
                                                    <span>Đơn hàng của tôi</span>
                                                </Link>
                                                <Link to="/wishlist" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm">
                                                    <FiHeart size={16} />
                                                    <span>Sản phẩm yêu thích</span>
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
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                                                >
                                                    Đăng xuất
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
        </header>
    );
};

export default Header;
