import React, { useState } from "react";
import {
    FaCalendarAlt, FaInfoCircle
} from "react-icons/fa";
import SellerLayout from "../../layouts/SellerLayout";
import { getCurrentUser } from "../../services/authService";

const SellerLicensesTemp = () => {
    const currentUser = getCurrentUser();

    // License data with image
    const licenseData = {
        licenseImage: "https://res.cloudinary.com/dmqrmxyuz/image/upload/v1754480926/z6880259709327_9a498fcd95688f961268b3a6bd4797fa_bpp3mh.jpg",
        startDate: "2025-06-20",
        expiryDate: "2028-06-20"
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        const today = new Date();
        const expiry = new Date(expiryDate);
        return expiry < today;
    };

    const getExpiryStatus = () => {
        if (isExpired(licenseData.expiryDate)) {
            return { text: "Đã hết hạn", color: "text-red-600", bgColor: "bg-red-100" };
        } else if (isExpiringSoon(licenseData.expiryDate)) {
            return { text: "Sắp hết hạn", color: "text-orange-600", bgColor: "bg-orange-100" };
        } else {
            return { text: "Còn hiệu lực", color: "text-green-600", bgColor: "bg-green-100" };
        }
    };

    const status = getExpiryStatus();

    return (
        <SellerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý Giấy phép</h1>
                        <p className="text-gray-600 mt-1">Thông tin giấy phép kinh doanh của bạn</p>
                    </div>
                </div>

                {/* License Card */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Giấy phép kinh doanh
                            </h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                                {status.text}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* License Image */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Hình ảnh giấy phép</h4>
                                <div className="border-2 border-gray-200 border-dashed rounded-lg overflow-hidden">
                                    <img
                                        src={licenseData.licenseImage}
                                        alt="Giấy phép kinh doanh"
                                        className="w-full h-auto object-contain"
                                        style={{ maxHeight: '400px' }}
                                    />
                                </div>
                            </div>

                            {/* License Information */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-4">Thông tin giấy phép</h4>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <FaCalendarAlt className="h-5 w-5 text-green-600 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Ngày bắt đầu</p>
                                                    <p className="text-lg font-semibold text-gray-900">{formatDate(licenseData.startDate)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <FaCalendarAlt className="h-5 w-5 text-red-600 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Ngày hết hạn</p>
                                                    <p className="text-lg font-semibold text-gray-900">{formatDate(licenseData.expiryDate)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <h5 className="text-sm font-medium text-blue-900 mb-2">Trạng thái giấy phép</h5>
                                            <p className={`text-sm ${status.color}`}>
                                                {status.text}
                                                {status.text === "Sắp hết hạn" && (
                                                    <span className="block text-xs text-gray-600 mt-1">
                                                        Vui lòng gia hạn giấy phép trước khi hết hạn
                                                    </span>
                                                )}
                                                {status.text === "Đã hết hạn" && (
                                                    <span className="block text-xs text-gray-600 mt-1">
                                                        Cần gia hạn giấy phép ngay lập tức
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerLicensesTemp;
