import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/image/logo.jpg";
import { FiBell, FiMessageSquare, FiShoppingCart } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [language, setLanguage] = useState("vi");
    const [isLoggedIn, setIsLoggedIn] = useState(true); // <-- CHUYỂN THÀNH STATE

    const userRole = "buyer"; // Giả định là buyer
    const isProxyShopper = false;
    const isSeller = false;

    const notificationRef = useRef();
    const messageRef = useRef();
    const profileRef = useRef();

    const notifications = [
        "Đơn hàng #1234 đã được xác nhận",
        "Sản phẩm bạn theo dõi đã giảm giá",
    ];

    const messages = [
        { from: "Nguyễn Văn A", text: "Bạn còn bán cà rốt không?" },
        { from: "Trần Thị B", text: "Cảm ơn bạn đã giao hàng nhanh!" },
    ];

    const cartItems = [
        { name: "Rau muống", quantity: 2 },
        { name: "Cà rốt", quantity: 1 },
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

    return (
        <header className="bg-white shadow sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/home" className="flex items-center gap-2">
                    <img src={logo} alt="LocalMart Logo" className="w-10 h-10 object-cover rounded-full" />
                    <span className="text-xl font-bold text-supply-primary">LocalMart</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-4 text-sm font-medium text-gray-700">
                    <Link to="/products" className="hover:text-supply-primary transition">Sản phẩm</Link>
                    <Link to="/about" className="hover:text-supply-primary transition">Giới thiệu</Link>
                    <Link to="/contact" className="hover:text-supply-primary transition">Liên hệ</Link>
                    <Link to="/faq" className="hover:text-supply-primary transition">FAQ</Link>
                    <Link to="/policy" className="hover:text-supply-primary transition">Chính sách</Link>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-3 relative">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="border px-2 py-1 rounded text-sm"
                    >
                        <option value="vi">🇻🇳 VN</option>
                        <option value="en">🇺🇸 EN</option>
                    </select>

                    {isLoggedIn ? (
                        <>
                            {/* Notifications */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications((prev) => !prev)}
                                    className="relative text-gray-700 hover:text-supply-primary"
                                >
                                    <FiBell size={22} />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow z-50">
                                        <div className="p-3 border-b font-semibold text-sm">Thông báo</div>
                                        <ul className="text-sm max-h-56 overflow-y-auto">
                                            {notifications.map((note, idx) => (
                                                <li key={idx} className="px-4 py-2 hover:bg-gray-100">{note}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="relative" ref={messageRef}>
                                <button
                                    onClick={() => setShowMessages((prev) => !prev)}
                                    className="relative text-gray-700 hover:text-supply-primary"
                                >
                                    <FiMessageSquare size={22} />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>
                                {showMessages && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow z-50">
                                        <div className="p-3 border-b font-semibold text-sm">Tin nhắn</div>
                                        <ul className="text-sm max-h-56 overflow-y-auto">
                                            {messages.map((msg, idx) => (
                                                <li key={idx} className="px-4 py-2 hover:bg-gray-100">
                                                    <p className="font-semibold">{msg.from}</p>
                                                    <p className="text-gray-600 text-xs">{msg.text}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Cart */}
                            <div className="relative">
                                <Link to="/cart" className="relative text-gray-700 hover:text-supply-primary">
                                    <FiShoppingCart size={22} />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Link>
                            </div>

                            {/* Avatar dropdown */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setShowProfileMenu((prev) => !prev)}
                                    className="text-gray-700 hover:text-supply-primary"
                                >
                                    <FaUserCircle size={24} />
                                </button>
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow z-50">
                                        <ul className="text-sm">
                                            <li className="px-4 py-2 hover:bg-gray-100">
                                                <Link to="/buyer/profile">Hồ sơ của tôi</Link>
                                            </li>
                                            <li className="px-4 py-2 hover:bg-gray-100">
                                                <Link to="/buyer/settings">Cài đặt</Link>
                                            </li>
                                            {userRole === "buyer" && !isProxyShopper && (
                                                <li className="px-4 py-2 hover:bg-gray-100">
                                                    <Link to="/proxy-shopper/register">Đăng ký đi chợ dùm</Link>
                                                </li>
                                            )}
                                            {userRole === "buyer" && !isSeller && (
                                                <li className="px-4 py-2 hover:bg-gray-100">
                                                    <Link to="/register-seller">Đăng ký người bán</Link>
                                                </li>
                                            )}
                                            <li className="px-4 py-2 hover:bg-gray-100 text-red-500">
                                                <button
                                                    onClick={() => {
                                                        setIsLoggedIn(false);
                                                        setShowProfileMenu(false);
                                                    }}
                                                >
                                                    Đăng xuất
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="px-4 py-1 border border-supply-primary text-supply-primary rounded-full text-sm hover:bg-supply-primary hover:text-white transition">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="px-4 py-1 border border-supply-primary text-supply-primary rounded-full text-sm hover:bg-supply-primary hover:text-white transition">
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
