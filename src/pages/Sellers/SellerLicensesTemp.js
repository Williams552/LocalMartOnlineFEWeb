import React, { useState } from "react";
import {
    FaCalendarAlt, FaInfoCircle, FaUpload, FaEdit, FaSpinner, FaCheck, FaTimes
} from "react-icons/fa";
import SellerLayout from "../../layouts/SellerLayout";
import { getCurrentUser } from "../../services/authService";

const SellerLicensesTemp = () => {
    const currentUser = getCurrentUser();

    // Upload states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [newLicenseData, setNewLicenseData] = useState({
        startDate: "",
        expiryDate: ""
    });

    // License data with image
    const [licenseData, setLicenseData] = useState({
        licenseImage: "https://res.cloudinary.com/dmqrmxyuz/image/upload/v1754480926/z6880259709327_9a498fcd95688f961268b3a6bd4797fa_bpp3mh.jpg",
        startDate: "2025-06-20",
        expiryDate: "2028-06-20"
    });

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

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                alert('Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File không được lớn hơn 5MB');
                return;
            }

            setSelectedFile(file);
        }
    };

    // Handle upload
    const handleUpload = async () => {
        if (!selectedFile || !newLicenseData.startDate || !newLicenseData.expiryDate) {
            alert('Vui lòng chọn file và nhập đầy đủ thông tin ngày tháng');
            return;
        }

        setUploading(true);
        try {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create preview URL for the uploaded image
            const imageUrl = URL.createObjectURL(selectedFile);

            // Update license data
            setLicenseData({
                licenseImage: imageUrl,
                startDate: newLicenseData.startDate,
                expiryDate: newLicenseData.expiryDate
            });

            setUploadSuccess(true);
            setTimeout(() => {
                setShowUploadModal(false);
                setUploadSuccess(false);
                setSelectedFile(null);
                setNewLicenseData({ startDate: "", expiryDate: "" });
            }, 1500);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Có lỗi xảy ra khi upload file');
        } finally {
            setUploading(false);
        }
    };

    // Reset upload form
    const resetUploadForm = () => {
        setSelectedFile(null);
        setNewLicenseData({ startDate: "", expiryDate: "" });
        setUploadSuccess(false);
    };

    return (
        <SellerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý Giấy phép</h1>
                            <p className="text-gray-600 mt-1">Thông tin giấy phép kinh doanh của bạn</p>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <FaUpload /> Cập nhật giấy phép
                        </button>
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

                {/* Upload License Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Cập nhật giấy phép mới</h3>
                                    <button
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            resetUploadForm();
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                {uploadSuccess ? (
                                    <div className="text-center py-8">
                                        <FaCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload thành công!</h3>
                                        <p className="text-gray-600">Giấy phép của bạn đã được cập nhật.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* File Upload Area */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Chọn file giấy phép
                                            </label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                <div className="space-y-1 text-center">
                                                    {selectedFile ? (
                                                        <div className="text-center">
                                                            <FaCheck className="mx-auto h-12 w-12 text-green-400" />
                                                            <div className="mt-2">
                                                                <p className="text-sm text-gray-900 font-medium">
                                                                    {selectedFile.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                                                            <div className="flex text-sm text-gray-600">
                                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                                    <span>Chọn file</span>
                                                                    <input
                                                                        id="file-upload"
                                                                        name="file-upload"
                                                                        type="file"
                                                                        className="sr-only"
                                                                        accept="image/*,.pdf"
                                                                        onChange={handleFileSelect}
                                                                    />
                                                                </label>
                                                                <p className="pl-1">hoặc kéo thả vào đây</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                PNG, JPG, PDF tối đa 5MB
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedFile && (
                                                <button
                                                    onClick={() => setSelectedFile(null)}
                                                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Xóa file đã chọn
                                                </button>
                                            )}
                                        </div>

                                        {/* Date inputs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ngày bắt đầu *
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newLicenseData.startDate}
                                                    onChange={(e) => setNewLicenseData({
                                                        ...newLicenseData,
                                                        startDate: e.target.value
                                                    })}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ngày hết hạn *
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newLicenseData.expiryDate}
                                                    onChange={(e) => setNewLicenseData({
                                                        ...newLicenseData,
                                                        expiryDate: e.target.value
                                                    })}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button
                                                onClick={() => {
                                                    setShowUploadModal(false);
                                                    resetUploadForm();
                                                }}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                disabled={uploading}
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleUpload}
                                                disabled={!selectedFile || !newLicenseData.startDate || !newLicenseData.expiryDate || uploading}
                                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                            >
                                                {uploading ? (
                                                    <>
                                                        <FaSpinner className="animate-spin mr-2" />
                                                        Đang upload...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaUpload className="mr-2" />
                                                        Cập nhật giấy phép
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
};

export default SellerLicensesTemp;
