import React from "react";
import { FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa";
import "./Footer.scss";

const Footer = () => {
    return (
        <footer className="footer-wrapper mt-10">
            <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                {/* Cột 1: Thông tin */}
                <div>
                    <h3 className="text-xl font-bold mb-3">LocalMart</h3>
                    <p className="text-sm leading-relaxed">
                        Nền tảng kết nối nông sản sạch và người tiêu dùng. Mua bán dễ dàng, nhanh chóng và đáng tin cậy.
                    </p>
                </div>

                {/* Cột 2: Liên kết */}
                <div>
                    <h4 className="text-lg font-semibold mb-2">Liên kết nhanh</h4>
                    <ul className="space-y-1 text-sm">
                        <li><a href="/home" className="hover:underline">Trang chủ</a></li>
                        <li><a href="/products" className="hover:underline">Sản phẩm</a></li>
                        <li><a href="/about" className="hover:underline">Giới thiệu</a></li>
                        <li><a href="/contact" className="hover:underline">Liên hệ</a></li>
                    </ul>
                </div>

                {/* Cột 3: Mạng xã hội */}
                <div>
                    <h4 className="text-lg font-semibold mb-2">Theo dõi chúng tôi</h4>
                    <div className="flex items-center gap-4 mt-2">
                        <a href="#" className="icon-circle bg-[#1877f2]"><FaFacebookF /></a>
                        <a href="#" className="icon-circle bg-[#ff0000]"><FaYoutube /></a>
                        <a href="#" className="icon-circle bg-black"><FaTiktok /></a>
                    </div>
                </div>
            </div>

            <div className="text-center text-sm py-4 border-t border-white/20 text-white bg-[#219150]">
                © 2025 LocalMart. Bản quyền thuộc về SEP490_22.
            </div>
        </footer>
    );
};

export default Footer;
