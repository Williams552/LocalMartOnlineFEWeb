import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FaStore, FaBoxOpen, FaShoppingCart, FaChartLine,
    FaUser, FaHome, FaBell, FaCog, FaSignOutAlt,
    FaUsers, FaAccessibleIcon, FaCreditCard, FaComments,
    FaQuestionCircle, FaBars, FaTimes, FaChevronDown, FaShoppingBag,
    FaExclamationTriangle, FaHandshake
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "../components/Seller/NotificationBell";

const SellerLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const sidebarRef = useRef(null);

    // Use authentication context like in Header
    const { logout } = useAuth();

    useEffect(() => {
        // Get user info from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserInfo(user);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                isSidebarOpen &&
                window.innerWidth < 1024 // Only on mobile/tablet
            ) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    const sidebarItems = [
        {
            path: '/seller/products',
            icon: FaBoxOpen,
            label: 'Sản phẩm',
            color: 'text-green-600',
            description: 'Quản lý sản phẩm'
        },
        {
            path: '/seller/orders',
            icon: FaShoppingCart,
            label: 'Đơn hàng',
            color: 'text-orange-600',
            description: 'Quản lý đơn hàng'
        },
        {
            path: '/seller/fast-bargains',
            icon: FaHandshake,
            label: 'Thương lượng nhanh',
            color: 'text-orange-500',
            description: 'Quản lý thương lượng từ khách hàng'
        },
        {
            path: '/seller/customers',
            icon: FaUsers,
            label: 'Khách hàng',
            color: 'text-indigo-600',
            description: 'Quản lý khách hàng'
        },
        {
            path: '/seller/analytics',
            icon: FaChartLine,
            label: 'Thống kê',
            color: 'text-purple-600',
            description: 'Báo cáo & phân tích'
        },
        {
            path: '/seller/notifications',
            icon: FaBell,
            label: 'Thông báo',
            color: 'text-indigo-600',
            description: 'Thông báo & cập nhật'
        },
        {
            path: '/seller/payments',
            icon: FaCreditCard,
            label: 'Thanh toán',
            color: 'text-red-600',
            description: 'Phí & thanh toán'
        },
        {
            path: '/seller/licenses',
            icon: FaAccessibleIcon,
            label: 'Giấy phép',
            color: 'text-yellow-600',
            description: 'Quản lý giấy phép'
        },
        {
            path: '/seller/profile',
            icon: FaStore,
            label: 'Hồ sơ cửa hàng',
            color: 'text-teal-600',
            description: 'Thông tin cửa hàng'
        },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = (logoutFromAllDevices = false) => {
        console.log('SellerLayout - Logout button clicked', { logoutFromAllDevices });
        logout(logoutFromAllDevices);
        setIsDropdownOpen(false);
        // Navigate to login page after logout with a small delay to ensure state is updated
        setTimeout(() => {
            navigate('/login');
        }, 100);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Dropdown menu items
    const dropdownItems = [
        {
            to: "/",
            icon: FaHome,
            label: "Về trang chủ",
            color: "text-blue-600"
        },
        {
            to: "/support",
            icon: FaQuestionCircle,
            label: "Hỗ trợ",
            color: "text-yellow-600"
        },
        {
            action: handleLogout,
            icon: FaSignOutAlt,
            label: "Đăng xuất",
            color: "text-red-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`fixed lg:relative left-0 top-0 h-screen w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 flex flex-col`}
            >
                {/* Header */}
                <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200">
                    <Link to="/seller/dashboard" className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-supply-primary rounded-lg flex items-center justify-center">
                            <FaStore className="text-white" size={16} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">Seller Panel</h2>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">Quản lý cửa hàng</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-3 sm:p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <ul className="space-y-1 sm:space-y-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all group ${isActive(item.path)
                                            ? 'bg-supply-primary text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon
                                            size={16}
                                            className={`flex-shrink-0 ${isActive(item.path) ? 'text-white' : item.color}`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm sm:text-base font-medium truncate block">{item.label}</span>
                                            {!isActive(item.path) && (
                                                <p className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Top Navigation Bar - Compact seller header */}
            <div className="flex-1 flex flex-col lg:min-h-screen">
                <nav className="flex-shrink-0 h-14 sm:h-16 bg-white border-b border-gray-200 z-10">
                    <div className="flex items-center justify-between h-full px-3 sm:px-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors z-50"
                        >
                            {isSidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
                        </button>

                        {/* Page Title */}
                        <div className="flex-1 lg:flex-none px-2">
                            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                                {sidebarItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                            </h1>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* Notifications */}
                            <NotificationBell />

                            {/* User Menu with Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-medium text-gray-800 truncate max-w-32">
                                            {userInfo?.name || userInfo?.storeName || 'Seller'}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate">
                                            {userInfo?.role || 'Seller'}
                                        </p>
                                    </div>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-supply-primary rounded-full flex items-center justify-center">
                                        <FaUser className="text-white text-xs sm:text-sm" />
                                    </div>
                                    <FaChevronDown className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={10} />
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[60]">
                                        {dropdownItems.map((item, index) => (
                                            <div key={index}>
                                                {item.to ? (
                                                    <Link
                                                        to={item.to}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <item.icon size={16} className={item.color} />
                                                        <span>{item.label}</span>
                                                    </Link>
                                                ) : (
                                                    <button
                                                        onClick={item.action}
                                                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <item.icon size={16} className={item.color} />
                                                        <span>{item.label}</span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SellerLayout;
