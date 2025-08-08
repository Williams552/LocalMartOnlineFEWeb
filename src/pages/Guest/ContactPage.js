// src/pages/Guest/ContactPage.js
import React from "react";
import {
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaClock,
    FaHeadset,
    FaQuestionCircle
} from "react-icons/fa";

const ContactPage = () => {
    const contactInfo = [
        {
            icon: FaEnvelope,
            title: "Email",
            content: "support@localmart.vn",
            link: "mailto:support@localmart.vn",
            color: "text-blue-600"
        },
        {
            icon: FaPhone,
            title: "Hotline",
            content: "0384 630 459",
            link: "tel:0123456789",
            color: "text-green-600"
        },
        {
            icon: FaMapMarkerAlt,
            title: "Địa chỉ",
            content: "123 Đường Nguyễn Văn Cừ, Ninh Kiều, TP. Cần Thơ",
            color: "text-red-600"
        },
        {
            icon: FaClock,
            title: "Giờ làm việc",
            content: "Thứ 2 - Chủ nhật: 8:00 - 22:00",
            color: "text-purple-600"
        }
    ];

    const quickHelp = [
        {
            icon: FaHeadset,
            title: "Hỗ trợ khách hàng",
            description: "Giải đáp thắc mắc về sản phẩm và dịch vụ"
        },
        {
            icon: FaQuestionCircle,
            title: "Câu hỏi thường gặp",
            description: "Hướng dẫn sử dụng và chính sách"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section - Compact */}
            <div className="bg-gradient-to-r from-supply-primary to-supply-sec text-white py-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                        Liên hệ với LocalMart
                    </h1>
                    <p className="text-lg opacity-90">
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Main Contact Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Contact Info */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Thông tin liên hệ
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {contactInfo.map((info, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-100 hover:border-supply-primary hover:bg-supply-primary/5 transition-all duration-200">
                                        <div className={`w-10 h-10 ${info.color} bg-opacity-15 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <info.icon className={`text-lg ${info.color}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-800 text-sm mb-1">{info.title}</h3>
                                            {info.link ? (
                                                <a
                                                    href={info.link}
                                                    className={`${info.color} hover:underline text-sm break-all`}
                                                >
                                                    {info.content}
                                                </a>
                                            ) : (
                                                <p className="text-gray-600 text-sm leading-relaxed">{info.content}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="space-y-6">
                        {/* Emergency Contact - Top Priority */}
                        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaPhone className="text-xl text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">
                                    Hỗ trợ 24/7
                                </h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Gọi ngay khi cần hỗ trợ khẩn cấp
                                </p>
                                <a
                                    href="tel:0384630459"
                                    className="inline-flex items-center space-x-2 bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                                >
                                    <FaPhone className="text-sm" />
                                    <span>0384 630 459</span>
                                </a>
                            </div>
                        </div>

                        {/* Quick Help */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                Hỗ trợ nhanh
                            </h3>
                            <div className="space-y-3">
                                {quickHelp.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:border-supply-primary hover:bg-supply-primary/5 transition-all cursor-pointer">
                                        <div className="w-8 h-8 bg-supply-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <item.icon className="text-sm text-supply-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-medium text-gray-800 text-sm">{item.title}</h4>
                                            <p className="text-gray-600 text-xs">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info Section */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            Cam kết của chúng tôi
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaClock className="text-xl text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">Phản hồi nhanh</h4>
                                <p className="text-gray-600 text-sm">Phản hồi trong 24h</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaHeadset className="text-xl text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">Hỗ trợ chuyên nghiệp</h4>
                                <p className="text-gray-600 text-sm">Đội ngũ tư vấn giàu kinh nghiệm</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaQuestionCircle className="text-xl text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">Hướng dẫn chi tiết</h4>
                                <p className="text-gray-600 text-sm">Giải đáp mọi thắc mắc</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;