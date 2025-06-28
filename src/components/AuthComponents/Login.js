import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.scss";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import backgroundRegister from "../../assets/image/bg.jpg";
import logoGreen from "../../assets/image/logo-non.png";
import authService from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail, validatePassword, validate2FACode, validateUsername } from "../../utils/authValidation";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showTwoFA, setShowTwoFA] = useState(false);
    const [twoFACode, setTwoFACode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Frontend validation states
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [twoFAError, setTwoFAError] = useState("");

    const navigate = useNavigate();
    const { login: authLogin, verify2FA: authVerify2FA, send2FACode } = useAuth();

    // Cooldown timer for resend 2FA
    useEffect(() => {
        let interval = null;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown(cooldown => cooldown - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    // Email/Username validation function
    const validateEmailOrUsername = (input) => {
        if (!input) {
            return "Email hoặc tên đăng nhập không được để trống";
        }

        // Check if it's an email format
        if (input.includes('@')) {
            return validateEmail(input);
        } else {
            return validateUsername(input);
        }
    };

    // Password validation function - using utility
    const validatePasswordInput = (password) => {
        return validatePassword(password);
    };

    // 2FA code validation function - using utility
    const validate2FACodeInput = (code) => {
        return validate2FACode(code);
    };

    // Clear all validation errors
    const clearValidationErrors = () => {
        setEmailError("");
        setPasswordError("");
        setTwoFAError("");
        setErrorMessage("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Clear previous errors
        clearValidationErrors();

        // Frontend validation
        const emailValidationError = validateEmailOrUsername(email);
        const passwordValidationError = validatePasswordInput(password);

        if (emailValidationError) {
            setEmailError(emailValidationError);
        }
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
        }

        // If there are validation errors, don't proceed
        if (emailValidationError || passwordValidationError) {
            toast.error("Vui lòng kiểm tra lại thông tin đăng nhập");
            return;
        }

        setLoading(true);

        try {
            const result = await authLogin(email, password);

            if (result.requires2FA) {
                setShowTwoFA(true);
                toast.success("Mã xác thực đã được gửi đến email của bạn");
            } else if (result.success && result.data?.token) {
                // Login successful with toast notification
                toast.success("Đăng nhập thành công!");

                // Redirect based on user role using proper navigation
                const user = authService.getCurrentUser();
                if (user?.role === 'Admin') {
                    navigate("/admin");
                } else if (user?.role === 'Seller') {
                    navigate("/seller/dashboard");
                } else {
                    navigate("/");
                }
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

    const handleVerify2FA = async (e) => {
        e.preventDefault();

        // Clear previous errors
        setTwoFAError("");
        setErrorMessage("");

        // Frontend validation for 2FA code
        const twoFAValidationError = validate2FACodeInput(twoFACode);
        if (twoFAValidationError) {
            setTwoFAError(twoFAValidationError);
            toast.error(twoFAValidationError);
            return;
        }

        setLoading(true);

        try {
            const result = await authVerify2FA(email, twoFACode);

            if (result.success && result.data?.token) {
                toast.success("Xác thực thành công!");

                // Redirect based on user role using proper navigation
                const user = authService.getCurrentUser();
                if (user?.role === 'Admin') {
                    navigate("/admin");
                } else if (user?.role === 'Seller') {
                    navigate("/seller/dashboard");
                } else {
                    navigate("/");
                }
            } else {
                setErrorMessage(result.message || "Xác thực thất bại");
            }
        } catch (error) {
            const errorMsg = error.message || "Lỗi xác thực";
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setShowTwoFA(false);
        setTwoFACode("");
        setResendCooldown(0);
        clearValidationErrors();
    };

    const handleResend2FA = async () => {
        if (resendCooldown > 0) return;

        try {
            // Backend không có endpoint để resend 2FA, cần login lại
            toast.info("Để nhận mã xác thực mới, vui lòng quay lại đăng nhập.");
            handleBackToLogin();
        } catch (error) {
            toast.error(error.message || "Không thể gửi lại mã xác thực");
        }
    };

    const handleForgotPassword = () => {
        navigate("/forgot-password");
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            // TODO: Implement Google OAuth login with backend
            console.log("Google login success:", credentialResponse);
            toast.info("Đăng nhập Google sẽ được hỗ trợ sớm");
        } catch (error) {
            toast.error("Lỗi đăng nhập Google");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error("Đăng nhập Google thất bại");
    };

    return (
        <div className="login-container flex-center-center h-screen">
            <div
                className="Login-wapper Width items-center bg-cover max-w-full w-full h-full grid md:grid-cols-2"
                style={{ backgroundImage: `url("${backgroundRegister}")` }}
            >
                <div className="Info-Sign-In bg-white rounded-2xl pt-12 pb-6 md:ml-8 w-11/12 lg:w-8/12 mx-auto relative">
                    <a
                        href="/"
                        className="absolute flex gap-1 items-center top-3 left-4 text-supply-primary cursor-pointer hover:text-orange-600 transition-colors"
                    >
                        <svg width="16px" height="16px" viewBox="0 0 1024 1024">
                            <path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="currentColor" />
                        </svg>
                        <span>Trang chủ</span>
                    </a>

                    <img src={logoGreen} alt="Logo Green" className="logo-img w-20 h-20 mx-auto mb-4 rounded-full" />
                    <p className="text-3xl font-bold text-supply-primary mb-2">
                        {showTwoFA ? "Xác thực 2 bước" : "Đăng nhập"}
                    </p>
                    <p className="text-gray-600 text-sm mb-6 text-center">
                        {showTwoFA ? "Nhập mã xác thực được gửi về email" : "Chào mừng trở lại với LocalMart"}
                    </p>

                    {errorMessage && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                            {errorMessage}
                        </div>
                    )}

                    {!showTwoFA ? (
                        <form onSubmit={handleLogin} className="content-form col-5 w-10/12">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email hoặc Tên đăng nhập</label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        // Clear email error when user starts typing
                                        if (emailError) setEmailError("");
                                    }}
                                    onBlur={() => {
                                        // Validate on blur
                                        const error = validateEmailOrUsername(email);
                                        setEmailError(error);
                                    }}
                                    placeholder="Nhập email hoặc tên đăng nhập"
                                    className={`border-[1px] shadow-sm focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition ${emailError
                                        ? 'border-red-400 focus:border-red-400'
                                        : 'border-gray-300 focus:border-supply-primary'
                                        }`}
                                    required
                                />
                                {emailError && (
                                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                                )}
                            </div>
                            <div className="form-group mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        // Clear password error when user starts typing
                                        if (passwordError) setPasswordError("");
                                    }}
                                    onBlur={() => {
                                        // Validate on blur
                                        const error = validatePasswordInput(password);
                                        setPasswordError(error);
                                    }}
                                    placeholder="Nhập mật khẩu"
                                    className={`border-[1px] shadow-sm focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition ${passwordError
                                        ? 'border-red-400 focus:border-red-400'
                                        : 'border-gray-300 focus:border-supply-primary'
                                        }`}
                                    required
                                />
                                {passwordError && (
                                    <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-3">
                                <div className="forget-password cursor-pointer">
                                    <span
                                        className="text-supply-primary hover:underline text-sm cursor-pointer"
                                        onClick={handleForgotPassword}
                                    >
                                        Quên mật khẩu?
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="mr-2"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label htmlFor="remember" className="text-sm text-gray-600">Ghi nhớ đăng nhập</label>
                                </div>
                            </div>

                            <div className="text-center mt-6">
                                <button
                                    type="submit"
                                    className={`px-12 py-3 rounded-lg font-medium w-full transition duration-200 shadow-md ${loading || emailError || passwordError
                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                        : 'bg-supply-primary hover:bg-green-600 text-white'
                                        }`}
                                    disabled={loading || emailError || passwordError}
                                >
                                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify2FA} className="content-form col-5 w-10/12">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã xác thực</label>
                                <input
                                    type="text"
                                    value={twoFACode}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setTwoFACode(value);
                                        // Clear 2FA error when user starts typing
                                        if (twoFAError) setTwoFAError("");
                                    }}
                                    onBlur={() => {
                                        // Validate on blur
                                        const error = validate2FACodeInput(twoFACode);
                                        setTwoFAError(error);
                                    }}
                                    placeholder="Nhập mã 6 chữ số"
                                    className={`border-[1px] shadow-sm focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition text-center text-2xl tracking-widest ${twoFAError
                                        ? 'border-red-400 focus:border-red-400'
                                        : 'border-gray-300 focus:border-supply-primary'
                                        }`}
                                    maxLength="6"
                                    pattern="[0-9]{6}"
                                    autoComplete="one-time-code"
                                    required
                                />
                                {twoFAError && (
                                    <p className="text-red-500 text-xs mt-1 text-center">{twoFAError}</p>
                                )}
                                <div className="text-center mt-2">
                                    <p className="text-xs text-gray-500">
                                        Mã gồm 6 chữ số • Hết hạn sau 5 phút
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResend2FA}
                                        disabled={resendCooldown > 0}
                                        className={`text-xs mt-2 transition-colors ${resendCooldown > 0
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-supply-primary hover:text-green-600 cursor-pointer'
                                            }`}
                                    >
                                        {resendCooldown > 0
                                            ? `Gửi lại sau ${resendCooldown}s`
                                            : "Gửi lại mã xác thực"
                                        }
                                    </button>
                                </div>
                            </div>

                            <div className="text-center mt-6 space-y-3">
                                <button
                                    type="submit"
                                    className={`px-12 py-3 rounded-lg font-medium w-full transition duration-200 shadow-md ${loading || twoFAError || twoFACode.length !== 6
                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                        : 'bg-supply-primary hover:bg-green-600 text-white'
                                        }`}
                                    disabled={loading || twoFAError || twoFACode.length !== 6}
                                >
                                    {loading ? "Đang xác thực..." : "Xác thực"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBackToLogin}
                                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-12 py-3 rounded-lg font-medium w-full transition duration-200"
                                >
                                    Quay lại đăng nhập
                                </button>
                            </div>
                        </form>
                    )}

                    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
                        <div className="login-container text-center mt-4">
                            <h2 className="my-3 text-xs text-gray-500">Hoặc</h2>
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </GoogleOAuthProvider>

                    <div className="mt-4 text-center">
                        <p>
                            Bạn chưa có tài khoản?{" "}
                            <a href="/register" className="text-supply-primary underline">Đăng ký</a>
                        </p>
                        <p className="text-[8px]">@2025 bản quyền thuộc về SEP490_22</p>
                    </div>
                </div>

                {/* Right Info Panel */}
                <div className="hidden md:flex flex-col items-center justify-center text-center px-8">
                    <img src={logoGreen} alt="Logo Green" className="w-24 h-24 mb-6 rounded-full shadow-lg" />
                    <h2 className="text-white font-bold text-4xl mb-4">LocalMart</h2>
                    <p className="text-white/90 font-medium text-xl leading-relaxed">
                        Kết nối người mua và người bán <br />
                        nông sản tươi sạch từ chợ địa phương
                    </p>
                    <div className="mt-8 flex items-center space-x-4 text-white/80">
                        <div className="text-center">
                            <div className="text-2xl font-bold">1000+</div>
                            <div className="text-sm">Sản phẩm</div>
                        </div>
                        <div className="w-px h-12 bg-white/30"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">500+</div>
                            <div className="text-sm">Người bán</div>
                        </div>
                        <div className="w-px h-12 bg-white/30"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">50+</div>
                            <div className="text-sm">Chợ</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
