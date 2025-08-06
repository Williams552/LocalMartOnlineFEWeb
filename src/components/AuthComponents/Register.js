import React, { useState } from "react";
import "./Login.scss";
import backgroundRegister from "../../assets/image/bg.jpg";
import { TbFaceIdError } from "react-icons/tb";
import OtpInput from "react-otp-input";
import authService from "../../services/authService";
import TermsOfServiceModal from "../ModalComponent/TermsOfServiceModal";
import PrivacyPolicyModal from "../ModalComponent/PrivacyPolicyModal";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        address: "",
        role: "Buyer"
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTermsClick = (e) => {
        e.preventDefault();
        setShowTermsModal(true);
    };

    const handleCloseTermsModal = () => {
        setShowTermsModal(false);
    };

    const handlePrivacyClick = (e) => {
        e.preventDefault();
        setShowPrivacyModal(true);
    };

    const handleClosePrivacyModal = () => {
        setShowPrivacyModal(false);
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setErrorMessage("Vui lòng nhập họ và tên");
            return false;
        }
        if (!formData.username.trim()) {
            setErrorMessage("Vui lòng nhập tên đăng nhập");
            return false;
        }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            setErrorMessage("Vui lòng nhập email hợp lệ");
            return false;
        }
        if (!formData.password || formData.password.length < 6) {
            setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Mật khẩu xác nhận không khớp");
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const registerData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber || null,
                address: formData.address || null,
                role: formData.role
            };

            console.log('Attempting to register with data:', registerData);

            const result = await authService.register(registerData);

            console.log('Registration result:', result);

            if (result.success) {
                setSuccessMessage("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
                // Reset form
                setFormData({
                    fullName: "",
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    phoneNumber: "",
                    address: "",
                    role: "Buyer"
                });

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }
        } catch (error) {
            console.error('Registration error caught:', error);

            // Handle specific error types
            let errorMsg = "Đăng ký thất bại. Vui lòng thử lại.";

            if (error.message) {
                errorMsg = error.message;
            } else if (typeof error === 'string') {
                errorMsg = error;
            }

            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div
            className="login-container min-h-screen bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: `url("${backgroundRegister}")` }}
        >
            <div className="min-h-screen flex items-center justify-center py-8 px-4">
                {/* Single Horizontal Panel */}
                <div className="Info-Sign-In bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl relative py-8 px-12 w-full max-w-6xl">
                    <a href="/" className="absolute flex gap-1 items-center top-4 left-6 text-supply-primary cursor-pointer">
                        <svg width="16px" height="16px" viewBox="0 0 1024 1024">
                            <path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="#27ae60" />
                        </svg>
                        <span>Trang chủ</span>
                    </a>

                    <div className="text-center mb-8">
                        <h1 className="font-bold text-4xl text-supply-primary mb-2">Đăng Ký</h1>
                        <p className="text-gray-600 text-lg">Tham gia cộng đồng mua bán nông sản LocalMart</p>
                    </div>

                    {errorMessage && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 text-center max-w-2xl mx-auto">
                            {errorMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6 text-center max-w-2xl mx-auto">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="content-form max-w-5xl mx-auto">
                        {/* Grid layout cho các input fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Cột trái */}
                            <div className="space-y-4">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập họ và tên đầy đủ"
                                        className="border-[1px] shadow-sm border-gray-300 focus:border-supply-primary focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên đăng nhập"
                                        className="border-[1px] shadow-sm border-gray-300 focus:border-supply-primary focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Nhập địa chỉ email"
                                        className="border-[1px] shadow-sm border-gray-300 focus:border-supply-primary focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số điện thoại (không bắt buộc)"
                                        className="border-[1px] shadow-sm border-gray-300 focus:border-supply-primary focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition"
                                    />
                                </div>
                            </div>

                            {/* Cột phải */}
                            <div className="space-y-4">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                                        className="border-[1px] shadow-sm border-gray-300 focus:border-supply-primary focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Nhập lại mật khẩu"
                                        className="border-[1px] shadow-sm border-gray-300 focus:border-supply-primary focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Nhập địa chỉ (không bắt buộc)"
                                        className="border-[1px] shadow-sm border-gray-300 focus:border-supply-primary focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Checkbox và Button */}
                        <div className="space-y-6">
                            <div className="flex items-start text-sm justify-center">
                                <input type="checkbox" className="mr-3 mt-1 text-supply-primary focus:ring-supply-primary" required />
                                <label className="text-gray-600 text-center">
                                    Tôi đồng ý với <a href="#" onClick={handleTermsClick} className="text-supply-primary hover:underline">Điều khoản sử dụng</a> và <a href="#" onClick={handlePrivacyClick} className="text-supply-primary hover:underline">Chính sách bảo mật</a> của LocalMart
                                </label>
                            </div>

                            <div className="text-center">
                                <button
                                    type="submit"
                                    className="bg-supply-primary hover:bg-green-600 text-white px-12 py-4 rounded-lg font-medium transition duration-200 shadow-lg disabled:opacity-50 text-lg"
                                    disabled={loading}
                                >
                                    {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-lg">
                            Bạn đã có tài khoản?{" "}
                            <a href="/login" className="text-supply-primary underline cursor-pointer hover:opacity-80 font-medium">
                                Đăng nhập
                            </a>
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                            ©2025 bản quyền thuộc về SEP490_22
                        </p>
                    </div>
                </div>
            </div>

            {/* Terms of Service Modal */}
            <TermsOfServiceModal
                isOpen={showTermsModal}
                onClose={handleCloseTermsModal}
            />

            {/* Privacy Policy Modal */}
            <PrivacyPolicyModal
                isOpen={showPrivacyModal}
                onClose={handleClosePrivacyModal}
            />
        </div>
    );
};

export default Register;
