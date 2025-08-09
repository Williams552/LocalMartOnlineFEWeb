// src/pages/Guest/AboutPage.js
import React from "react";
import { Card, Row, Col, Button } from "antd";
import {
    ShopOutlined,
    TruckOutlined,
    SafetyOutlined,
    StarOutlined,
    RocketOutlined,
    PhoneOutlined,
    MailOutlined,
    HeartOutlined,
    TeamOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    GiftOutlined,
    BankOutlined
} from "@ant-design/icons";

const AboutPage = () => {
    const features = [
        {
            icon: <ShopOutlined className="text-3xl text-supply-primary" />,
            title: "Sản phẩm tươi ngon",
            description: "Trực tiếp từ chợ truyền thống với chất lượng đảm bảo"
        },
        {
            icon: <TruckOutlined className="text-3xl text-supply-primary" />,
            title: "Dịch vụ mua hộ",
            description: "Nhanh chóng, minh bạch với đội ngũ Proxy Shopper chuyên nghiệp"
        },
        {
            icon: <SafetyOutlined className="text-3xl text-supply-primary" />,
            title: "Thanh toán an toàn",
            description: "Bảo mật tuyệt đối, giao hàng linh hoạt"
        },
        {
            icon: <StarOutlined className="text-3xl text-supply-primary" />,
            title: "Hỗ trợ chuyển đổi số",
            description: "Giúp tiểu thương tiếp cận công nghệ dễ dàng"
        }
    ];

    const coreValues = [
        {
            icon: <HeartOutlined className="text-2xl text-red-500" />,
            title: "Niềm tin",
            description: "Xây dựng lòng tin qua chất lượng sản phẩm và dịch vụ"
        },
        {
            icon: <TeamOutlined className="text-2xl text-blue-500" />,
            title: "Kết nối",
            description: "Cầu nối giữa chợ truyền thống và thế giới số"
        },
        {
            icon: <RocketOutlined className="text-2xl text-green-500" />,
            title: "Tiện lợi",
            description: "Mua sắm dễ dàng, nhanh chóng mọi lúc mọi nơi"
        },
        {
            icon: <EnvironmentOutlined className="text-2xl text-purple-500" />,
            title: "Phát triển cộng đồng",
            description: "Hỗ trợ kinh tế địa phương và bảo tồn văn hóa chợ"
        }
    ];

    const commitments = [
        {
            icon: <CheckCircleOutlined className="text-green-500" />,
            title: "Chất lượng sản phẩm",
            description: "Cam kết 100% sản phẩm tươi ngon, nguồn gốc rõ ràng"
        },
        {
            icon: <BankOutlined className="text-blue-500" />,
            title: "Minh bạch giá cả",
            description: "Giá cả công khai, không phát sinh chi phí ẩn"
        },
        {
            icon: <GiftOutlined className="text-orange-500" />,
            title: "Hỗ trợ 24/7",
            description: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Giới thiệu tổng quan */}
            <div className="py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">
                            LocalMart Online là gì?
                        </h2>
                        <div className="max-w-4xl mx-auto">
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                LocalMart Online là nền tảng số hóa chợ truyền thống đầu tiên tại Việt Nam,
                                ra đời nhằm giải quyết khoảng cách giữa người tiêu dùng bận rộn và tiểu thương chợ truyền thống.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Chúng tôi kết nối công nghệ hiện đại với văn hóa chợ phiên truyền thống,
                                mang đến trải nghiệm mua sắm hoàn toàn mới cho người Việt.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="bg-supply-primary/5 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <Row gutter={[32, 32]}>
                        <Col md={12}>
                            <Card className="h-full border-0 shadow-md">
                                <div className="text-center">
                                    <RocketOutlined className="text-4xl text-supply-primary mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Sứ mệnh</h2>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        Mang chợ truyền thống đến gần hơn với mọi người thông qua công nghệ,
                                        hỗ trợ tiểu thương phát triển bền vững và giúp người tiêu dùng
                                        mua sắm dễ dàng, nhanh chóng.
                                    </p>
                                </div>
                            </Card>
                        </Col>
                        <Col md={12}>
                            <Card className="h-full border-0 shadow-md">
                                <div className="text-center">
                                    <StarOutlined className="text-4xl text-supply-primary mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Tầm nhìn</h2>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        Trở thành nền tảng thương mại điện tử hàng đầu cho chợ truyền thống
                                        tại Việt Nam và khu vực Đông Nam Á, bảo tồn và phát huy
                                        giá trị văn hóa chợ phiên truyền thống.
                                    </p>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Giá trị cốt lõi */}
            <div className="py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Giá trị cốt lõi
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Những giá trị định hướng mọi hoạt động của LocalMart
                        </p>
                    </div>

                    <Row gutter={[24, 24]}>
                        {coreValues.map((value, index) => (
                            <Col xs={24} md={12} lg={6} key={index}>
                                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="text-center">
                                        <div className="mb-3">{value.icon}</div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {value.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {value.description}
                                        </p>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>

            {/* Lý do chọn chúng tôi */}
            <div className="bg-gray-100 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Lý do chọn LocalMart
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Điểm khác biệt so với chợ truyền thống và các sàn TMĐT khác
                        </p>
                    </div>

                    <Row gutter={[24, 24]}>
                        {features.map((feature, index) => (
                            <Col xs={24} md={12} lg={6} key={index}>
                                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="text-center">
                                        <div className="mb-3">{feature.icon}</div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>

            {/* Cam kết với người dùng */}
            <div className="bg-supply-primary/5 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Cam kết của chúng tôi
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Những cam kết thiết thực với mọi người dùng
                        </p>
                    </div>

                    <Row gutter={[32, 32]}>
                        {commitments.map((commitment, index) => (
                            <Col xs={24} md={8} key={index}>
                                <Card className="h-full border-0 shadow-md text-center">
                                    <div className="mb-4">{commitment.icon}</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                        {commitment.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {commitment.description}
                                    </p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-supply-primary text-white py-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Liên hệ với chúng tôi
                    </h2>
                    <p className="text-lg mb-6 opacity-90">
                        Có câu hỏi hoặc muốn hợp tác? Chúng tôi luôn sẵn sàng hỗ trợ!
                    </p>

                    <Row gutter={[24, 24]} className="mb-6">
                        <Col xs={24} md={12}>
                            <div className="flex items-center justify-center space-x-3">
                                <PhoneOutlined className="text-xl" />
                                <div className="text-left">
                                    <p className="text-sm opacity-80">Hotline</p>
                                    <p className="text-base font-semibold">1900 8888</p>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div className="flex items-center justify-center space-x-3">
                                <MailOutlined className="text-xl" />
                                <div className="text-left">
                                    <p className="text-sm opacity-80">Email</p>
                                    <p className="text-base font-semibold">support@localmart.vn</p>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Button
                        type="default"
                        size="large"
                        className="bg-white text-supply-primary border-0 font-semibold px-6"
                    >
                        Liên hệ ngay
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;