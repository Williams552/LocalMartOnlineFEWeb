import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Login.scss";
import backgroundRegister from "../../assets/image/bg.jpg";
import { useAuth } from "../../hooks/useAuth";

const EmailVerification = () => {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [token, setToken] = useState("");

    const { verifyEmail } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            handleVerifyEmail(tokenFromUrl);
        } else {
            // Check if we're on the verify email page without token (manual access)
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
                setSuccessMessage("Xác thực email thành công! Tài khoản của bạn đã được kích hoạt. Bạn sẽ được chuyển đến trang đăng nhập.");

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            }
        } catch (error) {
            setErrorMessage(error.message || "Lỗi xác thực email");
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
                        <span>Về trang đăng nhập</span>
                    </a>

                    <div className="col-4 mx-auto font-bold text-3xl text-center text-supply-primary mb-2">
                        Xác thực Email
                    </div>
                    <p className="text-gray-600 text-sm mb-6 text-center">
                        Đang xử lý xác thực email của bạn...
                    </p>

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-supply-primary"></div>
                            <p className="text-gray-600 mt-4">Đang xác thực email...</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center w-10/12 mx-auto">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center w-10/12 mx-auto">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            {errorMessage}
                        </div>
                    )}

                    {!loading && (
                        <div className="text-center mt-6 space-y-4">
                            <a
                                href="/login"
                                className="inline-block w-full bg-supply-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-supply-primary/90 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:ring-offset-2 transition-colors"
                            >
                                Đi đến trang đăng nhập
                            </a>

                            <div className="text-center">
                                <span className="text-gray-600 text-sm">Chưa có tài khoản? </span>
                                <a href="/register" className="text-supply-primary hover:underline text-sm">
                                    Đăng ký ngay
                                </a>
                            </div>
                        </div>
                    )}
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

export default EmailVerification;
