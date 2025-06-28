import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.scss";
import backgroundRegister from "../../assets/image/bg.jpg";
import logoGreen from "../../assets/image/logo-non.png";
import { useAuth } from "../../hooks/useAuth";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous messages
        setErrorMessage("");
        setSuccessMessage("");

        // Validate email
        if (!email.trim()) {
            setErrorMessage("Vui lòng nhập địa chỉ email");
            return;
        }

        // More comprehensive email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setErrorMessage("Địa chỉ email không hợp lệ");
            return;
        }

        setLoading(true);

        try {
            const result = await forgotPassword(email.trim());

            if (result && result.success) {
                setSuccessMessage(
                    result.message ||
                    "Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư và thư mục spam."
                );
                setEmail("");

                // Optional: Redirect to login after a delay
                setTimeout(() => {
                    navigate("/login");
                }, 5000);
            } else {
                setErrorMessage(result?.message || "Có lỗi xảy ra khi gửi email");
            }
        } catch (error) {
            console.error("Forgot password error:", error);

            // Handle different types of errors
            if (error.message.includes("fetch") || error.message.includes("network")) {
                setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.");
            } else if (error.message.includes("timeout")) {
                setErrorMessage("Yêu cầu hết thời gian chờ. Vui lòng thử lại.");
            } else {
                setErrorMessage(error.message || "Có lỗi xảy ra khi gửi email đặt lại mật khẩu");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container flex-center-center h-screen">
            <div
                className="Login-wapper Width items-center bg-cover max-w-full w-full h-full grid md:grid-cols-2"
                style={{ backgroundImage: `url("${backgroundRegister}")` }}
            >
                {/* Left Panel */}
                <div className="Info-Sign-In bg-white rounded-2xl pb-4 md:ml-8 w-11/12 lg:w-8/12 mx-auto relative pt-12 px-6 shadow-xl">
                    <a
                        href="/login"
                        className="absolute flex gap-1 items-center top-3 left-4 text-supply-primary cursor-pointer"
                    >
                        <svg width="16px" height="16px" viewBox="0 0 1024 1024">
                            <path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="#27ae60" />
                        </svg>
                        <span>Quay lại đăng nhập</span>
                    </a>

                    <div className="col-4 mx-auto font-bold text-3xl text-center text-supply-primary mb-2">
                        Quên mật khẩu
                    </div>
                    <p className="text-gray-600 text-sm mb-6 text-center">
                        Nhập email bạn đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.<br />
                        <span className="text-xs text-gray-500">Kiểm tra cả hộp thư spam nếu không thấy email.</span>
                    </p>

                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center w-10/12 mx-auto">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">Thành công!</span>
                            </div>
                            <p className="text-sm">{successMessage}</p>
                            <p className="text-xs mt-2 text-green-600">Bạn sẽ được chuyển về trang đăng nhập sau 5 giây...</p>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center w-10/12 mx-auto">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">Lỗi!</span>
                            </div>
                            <p className="text-sm">{errorMessage}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="content-form col-5 w-10/12 mx-auto space-y-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        // Clear error when user starts typing
                                        if (errorMessage) setErrorMessage("");
                                    }}
                                    placeholder="Nhập địa chỉ email của bạn"
                                    className={`border-[1px] shadow-sm focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition ${errorMessage
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-300 focus:border-supply-primary'
                                        }`}
                                    required
                                    disabled={loading}
                                    autoComplete="email"
                                />
                                {loading && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email.trim()}
                            className="w-full bg-supply-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-supply-primary/90 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang gửi...
                                </>
                            ) : (
                                "Gửi email đặt lại mật khẩu"
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <span className="text-gray-600 text-sm">Đã nhớ mật khẩu? </span>
                        <a href="/login" className="text-supply-primary hover:underline text-sm">
                            Đăng nhập ngay
                        </a>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="Info-Sign-up hidden md:flex flex-col justify-center items-center text-white px-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-4">LocalMart Online</h2>
                        <p className="text-xl mb-8">Kết nối người mua và người bán nông sản địa phương</p>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Nông sản tươi ngon, chất lượng cao</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Giao dịch an toàn và minh bạch</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Hỗ trợ người nông dân địa phương</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
