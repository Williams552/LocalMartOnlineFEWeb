import React, { useState } from 'react';
import { FaHeadset, FaQuestion, FaComments } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SupportRequestModal from './SupportRequestModal';
import { useAuth } from '../../hooks/useAuth';

const SupportButton = ({ variant = 'floating', showText = true, className = '' }) => {
    const [showModal, setShowModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const { isAuthenticated } = useAuth();

    const supportOptions = [
        {
            icon: FaHeadset,
            label: 'Tạo yêu cầu hỗ trợ',
            action: () => setShowModal(true),
            description: 'Gửi yêu cầu hỗ trợ chi tiết',
            color: 'text-blue-600'
        },
        {
            icon: FaQuestion,
            label: 'Câu hỏi thường gặp',
            action: () => window.open('/faq', '_blank'),
            description: 'Tìm câu trả lời nhanh',
            color: 'text-green-600'
        },
        {
            icon: FaComments,
            label: 'Chat trực tuyến',
            action: () => window.open('/chat', '_blank'),
            description: 'Hỗ trợ trực tuyến 24/7',
            color: 'text-purple-600'
        }
    ];

    if (variant === 'floating') {
        return (
            <>
                <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
                    <div className="relative">
                        {/* Main Support Button */}
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                        >
                            <FaHeadset className="text-xl" />
                            {showText && <span className="hidden md:inline font-medium">Hỗ trợ</span>}
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom duration-200">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                                    <h3 className="text-white font-semibold text-lg">Trung tâm hỗ trợ</h3>
                                    <p className="text-blue-100 text-sm">Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
                                </div>

                                <div className="p-2">
                                    {supportOptions.map((option, index) => {
                                        const IconComponent = option.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    option.action();
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                            >
                                                <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${option.color}`}>
                                                    <IconComponent className="text-lg" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-800">{option.label}</div>
                                                    <div className="text-sm text-gray-600">{option.description}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="border-t p-3 bg-gray-50">
                                    <Link
                                        to="/support-requests"
                                        onClick={() => setShowDropdown(false)}
                                        className="block text-center text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                                    >
                                        Xem tất cả yêu cầu hỗ trợ →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Backdrop */}
                    {showDropdown && (
                        <div
                            className="fixed inset-0 z-[-1]"
                            onClick={() => setShowDropdown(false)}
                        />
                    )}
                </div>

                {/* Support Request Modal */}
                <SupportRequestModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        setShowDropdown(false);
                    }}
                />
            </>
        );
    }

    if (variant === 'header') {
        return (
            <>
                <div className={`relative ${className}`}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                        title="Hỗ trợ khách hàng"
                    >
                        <FaHeadset size={20} />
                        {showText && <span className="text-sm">Hỗ trợ</span>}
                    </button>

                    {showDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                            <div className="p-4 border-b bg-blue-50">
                                <h3 className="font-semibold text-gray-800">Hỗ trợ khách hàng</h3>
                                <p className="text-sm text-gray-600">Chọn loại hỗ trợ phù hợp</p>
                            </div>

                            <div className="p-2">
                                {supportOptions.map((option, index) => {
                                    const IconComponent = option.icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                option.action();
                                                setShowDropdown(false);
                                            }}
                                            className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded transition-colors text-left"
                                        >
                                            <IconComponent className={`text-lg ${option.color}`} />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800 text-sm">{option.label}</div>
                                                <div className="text-xs text-gray-600">{option.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Backdrop */}
                {showDropdown && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    />
                )}

                {/* Support Request Modal */}
                <SupportRequestModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        setShowDropdown(false);
                    }}
                />
            </>
        );
    }

    // Simple button variant
    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors ${className}`}
            >
                <FaHeadset />
                {showText && <span>Hỗ trợ</span>}
            </button>

            <SupportRequestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    );
};

export default SupportButton;
