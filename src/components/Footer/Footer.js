import React from "react";
import { FaFacebookF, FaYoutube, FaTiktok, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { FiClock, FiShield, FiTruck } from "react-icons/fi";
import logo from "../../assets/image/logo.jpg";
import "./Footer.scss";

const Footer = () => {
    return (
        <footer className="footer-wrapper bg-supply-primary text-white">
            {/* Top Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Cột 1: Thông tin công ty */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <img src={logo} alt="LocalMart" className="w-12 h-12 rounded-full border-2 border-white" />
                            <div>
                                <h3 className="text-xl font-bold">LocalMart</h3>
                                <p className="text-sm opacity-90">Chợ Online Việt Nam</p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed opacity-90 mb-4">
                            Nền tảng kết nối nông sản tươi sạch từ các chợ địa phương với người tiêu dùng.
                            Mua bán dễ dàng, nhanh chóng và đáng tin cậy.
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                                <FaPhone className="text-yellow-300" />
                                <span>Hotline: 1900-6868</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaEnvelope className="text-yellow-300" />
                                <span>support@localmart.vn</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaMapMarkerAlt className="text-yellow-300" />
                                <span>Cần Thơ, Việt Nam</span>
                            </div>
                        </div>
                    </div>

                    {/* Cột 2: Dành cho khách hàng */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">Dành cho khách hàng</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/" className="hover:text-yellow-300 transition">🏠 Trang chủ</a></li>
                            <li><a href="/cart" className="hover:text-yellow-300 transition">🛒 Giỏ hàng</a></li>
                            <li><a href="/profile" className="hover:text-yellow-300 transition">👤 Tài khoản</a></li>
                        </ul>
                    </div>

                    {/* Cột 3: Hỗ trợ */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">Hỗ trợ</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/about" className="hover:text-yellow-300 transition">ℹ️ Giới thiệu</a></li>
                            <li><a href="/contact" className="hover:text-yellow-300 transition">📞 Liên hệ</a></li>
                            <li><a href="/faq" className="hover:text-yellow-300 transition">❓ FAQ</a></li>
                            <li><a href="/policy" className="hover:text-yellow-300 transition">📋 Chính sách</a></li>
                        </ul>
                    </div>

                    {/* Cột 4: Cam kết & Mạng xã hội */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">Cam kết chất lượng</h4>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center space-x-3 text-sm">
                                <FiShield className="text-yellow-300 text-lg" />
                                <span>Nông sản tươi sạch 100%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-white/20 bg-green-700">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                        <p>© 2025 LocalMart - Chợ Online Việt Nam. Bản quyền thuộc về SEP490_22.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
