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
        <div className="login-container flex-center-center h-screen">
            <div
                className="Login-wapper Width items-center bg-cover max-w-full w-full h-full grid md:grid-cols-2"
                style={{ backgroundImage: `url("${backgroundRegister}")` }}
            >
                {/* Left Panel */}
                <div className="Info-Sign-In bg-white rounded-2xl pb-4 md:ml-8 w-11/12 lg:w-8/12 mx-auto relative pt-12 px-6 shadow-xl">
                    <a href="/" className="absolute flex gap-1 items-center top-3 left-4 text-supply-primary cursor-pointer">
                        <svg width="16px" height="16px" viewBox="0 0 1024 1024">
                            <path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="#27ae60" />
                        </svg>
                        <span>Trang chủ</span>
                    </a>

                    <div className="col-4 mx-auto font-bold text-3xl text-center text-supply-primary mb-2">Đăng Ký</div>
                    <p className="text-gray-600 text-sm mb-6 text-center">Tham gia cộng đồng mua bán nông sản LocalMart</p>

                    {errorMessage && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center w-10/12 mx-auto">
                            {errorMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center w-10/12 mx-auto">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="content-form col-5 w-10/12 mx-auto space-y-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Nhập số điện thoại (không bắt buộc)"
                                className="border-[1px] shadow-sm border-gray-300 focus:border-supply-primary focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Nhập địa chỉ (không bắt buộc)"
                                className="border-[1px] shadow-sm border-gray-300 focus:border-supply-primary focus:ring-1 focus:ring-supply-primary text-black w-full px-4 py-3 rounded-lg transition"
                            />
                        </div>

                        <div className="flex items-start text-sm mt-4">
                            <input type="checkbox" className="mr-2 mt-1 text-supply-primary focus:ring-supply-primary" required />
                            <label className="text-gray-600">
                                Tôi đồng ý với <a href="#" onClick={handleTermsClick} className="text-supply-primary hover:underline">Điều khoản sử dụng</a> và <a href="#" onClick={handlePrivacyClick} className="text-supply-primary hover:underline">Chính sách bảo mật</a> của LocalMart
                            </label>
                        </div>

                        <div className="text-center mt-6">
                            <button
                                type="submit"
                                className="w-full bg-supply-primary hover:bg-green-600 text-white px-10 py-3 rounded-lg font-medium transition duration-200 shadow-md disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p>
                            Bạn đã có tài khoản?{" "}
                            <a href="/login" className="text-supply-primary underline cursor-pointer hover:opacity-80">
                                Đăng nhập
                            </a>
                        </p>
                        <p className="text-[10px] text-gray-500 mt-2">
                            ©2025 bản quyền thuộc về SEP490_22
                        </p>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="hidden md:flex flex-col items-center justify-center text-center px-8">
                    <div className="mb-6">
                        <h2 className="text-white font-bold text-4xl mb-4">LocalMart</h2>
                        <p className="text-white/90 font-medium text-xl leading-relaxed mb-8">
                            Tham gia cộng đồng mua bán <br />
                            nông sản lớn nhất Việt Nam
                        </p>
                    </div>

                    <div className="space-y-6 text-white/90">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <span>🥕</span>
                            </div>
                            <span>Nông sản tươi sạch từ chợ địa phương</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <span>🚚</span>
                            </div>
                            <span>Giao hàng nhanh chóng, an toàn</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <span>💰</span>
                            </div>
                            <span>Giá cả minh bạch, hợp lý</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <span>🤝</span>
                            </div>
                            <span>Kết nối trực tiếp với người bán</span>
                        </div>
                    </div>
                </div>

                {/* OTP UI – giữ nguyên nhưng ẩn (demo) */}
                {/* 
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
                        <div className="absolute top-4 right-4 cursor-pointer">
                            <img src="/image/icon/close.png" alt="" className="w-4" />
                        </div>
                        <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6 mt-2">Nhập mã OTP</h3>
                        <p className="text-sm text-gray-600 text-center mb-4">Vui lòng nhập mã OTP gồm 6 chữ số được gửi đến email của bạn</p>
                        <OtpInput
                            value=""
                            onChange={() => {}}
                            numInputs={6}
                            containerStyle={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            renderInput={(props) => (
                                <input
                                    {...props}
                                    className="w-12 h-12 text-center text-gray-800 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                                />
                            )}
                        />
                        <button className="mt-6 w-full py-3 bg-indigo-600 text-white text-lg font-medium rounded-md">Xác nhận OTP</button>
                        <p className="text-sm text-gray-500 text-center mt-4">
                            Không nhận được mã?{" "}
                            <span className="text-indigo-600 hover:underline cursor-pointer">
                                Gửi lại
                            </span>
                        </p>
                    </div>
                </div> 
                */}
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
