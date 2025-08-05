import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "./Login.scss";
import backgroundRegister from "../../assets/image/bg.jpg";
import logoGreen from "../../assets/image/logo-non.png";
import { useAuth } from "../../hooks/useAuth";

const EmailVerification = () => {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [token, setToken] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);

    const { verifyEmail } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            handleVerifyEmail(tokenFromUrl);
        } else {
            setLoading(false);
            setErrorMessage("Token xác thực không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại đường link từ email hoặc yêu cầu email xác thực mới.");
        }
    }, [searchParams]);

    const handleVerifyEmail = async (verificationToken) => {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const result = await verifyEmail(verificationToken);

            if (result.success) {
                setSuccessMessage("Xác thực email thành công! Tài khoản của bạn đã được kích hoạt.");
                setShowConfetti(true);
                // Hide confetti after 3 seconds
                setTimeout(() => setShowConfetti(false), 3000);
            }
        } catch (error) {
            setErrorMessage(error.message || "Lỗi xác thực email. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container verification-container flex-center-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
            {/* Confetti Animation */}
            {showConfetti && (
                <div className="confetti-container fixed inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)]
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                </svg>
            </div>

            <div
                className="Login-wapper Width items-center bg-cover max-w-full w-full h-screen grid md:grid-cols-2 relative z-10"
                style={{ backgroundImage: `url("${backgroundRegister}")` }}
            >
                {/* Left Panel - Verification Content */}
                <div className="Info-Sign-In verification-card bg-white rounded-3xl pb-8 md:ml-8 w-11/12 lg:w-9/12 mx-auto relative pt-8 px-8 shadow-2xl my-8 border border-gray-100">
                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20"></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20"></div>

                    {/* Back Link */}
                    <Link
                        to="/login"
                        className="absolute flex gap-2 items-center top-6 left-6 text-supply-primary hover:text-supply-primary-dark cursor-pointer transition-all duration-200 hover:translate-x-1"
                    >
                        <div className="w-8 h-8 rounded-full bg-supply-primary bg-opacity-10 flex items-center justify-center">
                            <svg width="16px" height="16px" viewBox="0 0 1024 1024">
                                <path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="currentColor" />
                            </svg>
                        </div>
                        <span className="font-medium">Về trang đăng nhập</span>
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-10 mt-8">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 animate-pulse"></div>
                            <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                            Xác thực Email
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {loading ? "Đang xử lý xác thực email của bạn..." :
                                successMessage ? "Xác thực thành công!" :
                                    "Có vấn đề xảy ra trong quá trình xác thực"}
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative mb-8">
                                <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
                                <div className="animate-spin rounded-full h-20 w-20 border-4 border-supply-primary border-t-transparent absolute top-0"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-supply-primary rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-700 text-xl font-semibold mb-2">Đang xác thực email...</p>
                                <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát</p>
                                <div className="flex justify-center mt-4">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-supply-primary rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-supply-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-supply-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {successMessage && (
                        <div className="verification-success text-center py-8">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 animate-pulse"></div>
                                <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                {/* Success ring animation */}
                                <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping"></div>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 mb-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                                <h3 className="text-green-800 font-bold text-2xl mb-3">🎉 Xác thực thành công!</h3>
                                <p className="text-green-700 mb-6 text-lg">{successMessage}</p>
                                <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full text-2xl mb-4">
                                            ✓
                                        </div>
                                        <div>
                                            <p className="text-green-800 font-semibold text-lg mb-2">Tài khoản đã được kích hoạt</p>
                                            <p className="text-green-600 text-sm">Bạn có thể đăng nhập và sử dụng đầy đủ tính năng của LocalMart</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {errorMessage && (
                        <div className="verification-error text-center py-8">
                            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                                <h3 className="text-red-800 font-semibold text-lg mb-2">Xác thực không thành công</h3>
                                <p className="text-red-700 mb-4">{errorMessage}</p>
                                <div className="bg-red-100 rounded-lg p-4">
                                    <p className="text-red-800 text-sm">
                                        💡 <strong>Lưu ý:</strong> Link xác thực có thể đã hết hạn hoặc đã được sử dụng.
                                        Vui lòng đăng nhập và yêu cầu gửi lại email xác thực.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!loading && (
                        <div className="space-y-4">
                            {successMessage ? (
                                <div className="space-y-4">
                                    <div className="text-center mb-4">
                                        <p className="text-gray-600 text-sm">Bạn muốn làm gì tiếp theo?</p>
                                    </div>
                                    <Link
                                        to="/login"
                                        className="block w-full bg-gradient-to-r from-supply-primary to-supply-primary-dark text-white font-semibold py-4 px-6 rounded-xl hover:from-supply-primary-dark hover:to-supply-primary focus:outline-none focus:ring-2 focus:ring-supply-primary focus:ring-offset-2 transition-all duration-200 text-center shadow-lg transform hover:scale-105"
                                    >
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                            </svg>
                                            Đăng nhập ngay
                                        </div>
                                    </Link>
                                    <Link
                                        to="/"
                                        className="block w-full border-2 border-supply-primary text-supply-primary font-medium py-4 px-6 rounded-xl hover:bg-supply-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-supply-primary focus:ring-offset-2 transition-all duration-200 text-center transform hover:scale-105"
                                    >
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                            </svg>
                                            Khám phá trang chủ
                                        </div>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link
                                        to="/login"
                                        className="block w-full bg-supply-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-supply-primary-dark focus:outline-none focus:ring-2 focus:ring-supply-primary focus:ring-offset-2 transition-colors text-center"
                                    >
                                        Đi đến trang đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block w-full border border-supply-primary text-supply-primary font-medium py-3 px-4 rounded-lg hover:bg-supply-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-supply-primary focus:ring-offset-2 transition-colors text-center"
                                    >
                                        Đăng ký tài khoản mới
                                    </Link>
                                </div>
                            )}

                            <div className="text-center pt-4 border-t border-gray-200">
                                <p className="text-gray-600 text-sm mb-2">Cần hỗ trợ?</p>
                                <Link to="/contact" className="text-supply-primary hover:underline text-sm font-medium">
                                    Liên hệ với chúng tôi
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Branding */}
                <div className="Info-Sign-up hidden md:flex flex-col justify-center items-center text-white px-12 py-8">
                    <div className="text-center max-w-md">
                        {/* Logo */}
                        <div className="mb-8">
                            <img src={logoGreen} alt="LocalMart Logo" className="w-24 h-24 mx-auto rounded-full bg-white p-2 shadow-lg" />
                        </div>

                        <h2 className="text-4xl font-bold mb-4">LocalMart Online</h2>
                        <p className="text-xl mb-8 opacity-90">Kết nối người mua và người bán nông sản địa phương</p>

                        <div className="space-y-6">
                            <div className="flex items-center justify-center">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-lg">Nông sản tươi ngon, chất lượng cao</span>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-lg">Giao dịch an toàn và minh bạch</span>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-lg">Hỗ trợ người nông dân địa phương</span>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
                            <h3 className="text-lg font-semibold mb-2">🎉 Chào mừng bạn đến với LocalMart!</h3>
                            <p className="text-sm opacity-90">
                                Xác thực email giúp bảo vệ tài khoản và mở khóa đầy đủ tính năng của nền tảng.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
