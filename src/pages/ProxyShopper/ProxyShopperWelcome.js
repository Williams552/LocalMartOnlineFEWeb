import React from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiUser, FiClock, FiMapPin } from 'react-icons/fi';
import { FaBoxOpen, FaHandshake } from 'react-icons/fa';

const ProxyShopperWelcome = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-8 mb-8 text-center">
                <div className="text-6xl mb-4">🛍️</div>
                <h1 className="text-3xl font-bold mb-2">Chào mừng bạn đến với Proxy Shopper!</h1>
                <p className="text-lg opacity-90">
                    Bạn đã đăng nhập thành công với quyền Proxy Shopper. Hãy bắt đầu kiếm tiền bằng cách mua hàng hộ cho khách hàng!
                </p>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-white rounded-lg shadow-sm border mb-8">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Bắt đầu nhanh</h2>
                    <p className="text-gray-600 mt-1">Làm theo các bước đơn giản để bắt đầu nhận đơn hàng</p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiUser className="text-purple-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">1. Hoàn thiện hồ sơ</h3>
                            <p className="text-sm text-gray-600 mb-3">Cập nhật thông tin cá nhân và khu vực hoạt động</p>
                            <Link
                                to="/proxy-shopper/profile"
                                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                                Cập nhật hồ sơ →
                            </Link>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiPackage className="text-blue-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">2. Tìm đơn hàng</h3>
                            <p className="text-sm text-gray-600 mb-3">Xem các đơn hàng có sẵn trong khu vực của bạn</p>
                            <Link
                                to="/proxy-shopper/available-orders"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Xem đơn hàng →
                            </Link>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaHandshake className="text-green-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">3. Nhận đơn hàng</h3>
                            <p className="text-sm text-gray-600 mb-3">Chọn và nhận đơn hàng phù hợp với bạn</p>
                            <span className="text-green-600 text-sm font-medium">Sẵn sàng nhận đơn</span>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiClock className="text-yellow-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">4. Hoàn thành</h3>
                            <p className="text-sm text-gray-600 mb-3">Mua hàng và giao cho khách hàng</p>
                            <Link
                                to="/proxy-shopper/orders"
                                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                            >
                                Quản lý đơn →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FiMapPin className="text-purple-600" size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Khu vực linh hoạt</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Chọn khu vực hoạt động phù hợp với bạn. Bạn có thể cập nhật khu vực hoạt động bất cứ lúc nào.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Tự do chọn khu vực</li>
                        <li>• Cập nhật dễ dàng</li>
                        <li>• Nhận đơn gần nhà</li>
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FiPackage className="text-green-600" size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Thu nhập ổn định</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Kiếm tiền từ việc mua hàng hộ với phí dịch vụ hấp dẫn và thanh toán nhanh chóng.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Phí dịch vụ cạnh tranh</li>
                        <li>• Thanh toán tức thì</li>
                        <li>• Thu nhập minh bạch</li>
                    </ul>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sẵn sàng bắt đầu?</h2>
                <p className="text-gray-600 mb-6">
                    Hãy tìm đơn hàng đầu tiên của bạn và bắt đầu kiếm tiền ngay hôm nay!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/proxy-shopper/dashboard"
                        className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        <FiUser className="mr-2" size={18} />
                        Xem Dashboard
                    </Link>
                    <Link
                        to="/proxy-shopper/available-orders"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <FaBoxOpen className="mr-2" size={18} />
                        Tìm đơn hàng ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProxyShopperWelcome;
