import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiUser, FiLock, FiEye, FiEyeOff, FiMapPin, FiPackage, FiDollarSign } from "react-icons/fi";
import backgroundImage from "../../assets/image/bg.jpg";
import logoGreen from "../../assets/image/logo-non.png";
import authService from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const ProxyShopperLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setErrorMessage("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const result = await authLogin(email, password);

            if (result.success && result.data?.token) {
                const user = authService.getCurrentUser();

                // Check if user is Proxy Shopper
                if (user?.role !== 'Proxy Shopper') {
                    setErrorMessage("Tài khoản này không có quyền truy cập Proxy Shopper");
                    await authService.logout();
                    return;
                }

                toast.success("Đăng nhập thành công!");

                setTimeout(() => {
                    navigate("/proxy-shopper/dashboard");
                }, 1500);
            } else {
                setErrorMessage(result.message || "Đăng nhập thất bại");
            }
        } catch (error) {
            const errorMsg = error.message || "Lỗi đăng nhập";
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            />

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <img src={logoGreen} alt="LocalMart Logo" className="mx-auto h-16 w-auto" />
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Proxy Shopper
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Đăng nhập để bắt đầu nhận đơn hàng
                    </p>
                </div>

                {/* Features Highlight */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="flex flex-col items-center">
                            <div className="p-2 bg-purple-100 rounded-lg mb-2">
                                <FiMapPin className="text-purple-600" size={20} />
                            </div>
                            <span className="text-xs text-gray-600">Linh hoạt khu vực</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mb-2">
                                <FiPackage className="text-blue-600" size={20} />
                            </div>
                            <span className="text-xs text-gray-600">Đơn hàng đa dạng</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="p-2 bg-green-100 rounded-lg mb-2">
                                <FiDollarSign className="text-green-600" size={20} />
                            </div>
                            <span className="text-xs text-gray-600">Thu nhập hấp dẫn</span>
                        </div>
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-xl shadow-lg border p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm text-center">{errorMessage}</p>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email hoặc tên đăng nhập
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    placeholder="Nhập email hoặc tên đăng nhập"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    placeholder="Nhập mật khẩu"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang đăng nhập...
                                </span>
                            ) : (
                                "Đăng nhập Proxy Shopper"
                            )}
                        </button>

                        {/* Links */}
                        <div className="text-center space-y-2">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-purple-600 hover:text-purple-500 transition-colors"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Registration Link */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Chưa có tài khoản Proxy Shopper?{" "}
                        <Link
                            to="/proxy-shopper/register"
                            className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Hoặc{" "}
                        <Link
                            to="/login"
                            className="text-purple-600 hover:text-purple-500 transition-colors"
                        >
                            đăng nhập với tài khoản khác
                        </Link>
                    </p>
                </div>

                {/* Benefits */}
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 text-center">
                        Lợi ích khi trở thành Proxy Shopper
                    </h3>
                    <ul className="space-y-1 text-xs text-gray-600">
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                            Thu nhập linh hoạt theo thời gian rảnh
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                            Tự do lựa chọn đơn hàng phù hợp
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                            Hỗ trợ 24/7 từ LocalMart
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProxyShopperLogin;
