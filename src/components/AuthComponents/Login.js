
import React from "react";
import "./Login.scss";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import backgroundRegister from "../../assets/image/bg.jpg";
import logoGreen from "../../assets/image/logo-non.png";

const Login = () => {
    return (
        <div className="login-container flex-center-center h-screen">
            <div
                className="Login-wapper Width items-center bg-cover max-w-full w-full h-full grid md:grid-cols-2"
                style={{ backgroundImage: `url("${backgroundRegister}")` }}
            >
                {/* Left Login Panel */}
                <div className="Info-Sign-In bg-white rounded-2xl pt-12 pb-6 md:ml-8 w-11/12 lg:w-8/12 mx-auto relative">
                    <a href="/" className="absolute flex gap-1 items-center top-3 left-4 text-supply-primary cursor-pointer">
                        <svg width="16px" height="16px" viewBox="0 0 1024 1024">
                            <path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="#ff8b00" />
                        </svg>
                        <span>Trang chủ</span>
                    </a>

                    <img
                        src={logoGreen}
                        alt="Logo Green"
                        className="logo-img"
                    />


                    <p className="text-3xl font-bold text-supply-primary mb-4">Đăng nhập</p>

                    <div className="content-form col-5 w-10/12">
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Email"
                                className="border-[1px] shadow border-supply-primary text-black w-full px-4 py-2 rounded"
                            />
                        </div>
                        <div className="form-group mt-4">
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                className="border-[1px] shadow border-supply-primary text-black w-full px-4 py-2 rounded"
                            />
                        </div>

                        <div className="forget-password cursor-pointer mt-2">
                            <span>Quên mật khẩu ?</span>
                        </div>

                        <div className="text-center mt-6">
                            <button className="bg-supply-primary text-white px-10 py-2 rounded-full">
                                Đăng nhập
                            </button>
                        </div>
                    </div>

                    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
                        <div className="login-container text-center mt-4">
                            <h2 className="my-3 text-xs">Hoặc</h2>
                            <GoogleLogin onSuccess={() => { }} onError={() => { }} />
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
                <div className="hidden md:flex flex-col items-center justify-center text-center">
                    <img
                        src={logoGreen}
                        alt="Logo Green"
                        className="logo-img"
                    />
                    <p className="text-white font-semibold text-3xl">
                        Sự tiện lợi của bạn <br /> là sứ mệnh của chúng tôi
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
