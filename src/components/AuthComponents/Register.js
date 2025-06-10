import React from "react";
import "./Login.scss";
import backgroundRegister from "../../assets/image/bg.jpg";
import { TbFaceIdError } from "react-icons/tb";
import OtpInput from "react-otp-input";

const Register = () => {
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

                    <div className="col-4 mx-auto font-bold text-3xl text-center text-supply-primary mb-6">Đăng Ký</div>

                    <div className="content-form col-5 w-10/12 mx-auto space-y-4">
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Tên của bạn"
                                className="border-[1px] shadow border-supply-primary text-black w-full px-4 py-2 rounded"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Email"
                                className="border-[1px] shadow border-supply-primary text-black w-full px-4 py-2 rounded"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                className="border-[1px] shadow border-supply-primary text-black w-full px-4 py-2 rounded"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Xác thực mật khẩu"
                                className="border-[1px] shadow border-supply-primary text-black w-full px-4 py-2 rounded"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Số điện thoại"
                                className="border-[1px] shadow border-supply-primary text-black w-full px-4 py-2 rounded"
                            />
                        </div>

                        <div>
                            <p className="mb-1 text-sm font-medium">Giới tính:</p>
                            <div className="flex justify-between text-sm">
                                <label className="flex items-center">
                                    <input type="radio" name="gender" />
                                    <span className="ml-2">Nam</span>
                                </label>
                                <label className="flex items-center ml-4">
                                    <input type="radio" name="gender" />
                                    <span className="ml-2">Nữ</span>
                                </label>
                                <label className="flex items-center ml-4">
                                    <input type="radio" name="gender" />
                                    <span className="ml-2">Khác</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="block mb-1 text-sm font-medium">Ngày sinh</label>
                            <input
                                type="date"
                                className="border-[1px] shadow border-supply-primary text-black w-full px-4 py-2 rounded"
                            />
                        </div>

                        <div className="flex items-center text-sm mt-2">
                            <input type="checkbox" className="mr-2" />
                            <label>Nhấn vào đây nếu bạn là người bán</label>
                        </div>

                        <div className="errorShow register mt-2">
                            <div className="errorShow flex items-center gap-2 text-red-600 bg-red-100 px-3 py-2 rounded">
                                <TbFaceIdError className="text-xl" />
                                <div className="errorBox">
                                    <span className="error text-sm">Thông báo lỗi (demo)</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <button className="text-center bg-supply-primary text-white px-10 py-2 rounded-full hover:bg-green-600 transition">
                                Đăng ký
                            </button>
                        </div>
                    </div>

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
                <div className="hidden md:flex flex-col items-center justify-center text-center px-4">
                    {/* <img src="image/logo-white.png" alt="Logo" className="w-36 mb-4" /> */}
                    <p className="text-white font-semibold text-3xl">
                        Sự tiện lợi của bạn <br /> là sứ mệnh của chúng tôi
                    </p>
                    <div className="flex items-center gap-4 justify-center mt-4">
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
        </div>
    );
};

export default Register;
