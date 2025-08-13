import React, { useState, useEffect } from 'react';
import { FaStore, FaEdit, FaSave, FaTimes, FaMapMarkerAlt, FaPhone, FaUser, FaClock, FaPlus, FaImage, FaCalendarAlt, FaIdCard, FaStar, FaComments } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import storeService from '../../services/storeService';
import authService from '../../services/authService';
import { toast } from 'react-toastify';
import SellerLayout from '../../layouts/SellerLayout';
import { ReviewListWithResponse } from '../../components/Review';

const StoreProfile = () => {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contactNumber: '',
        storeImageUrl: '',
        coverImageUrl: ''
    });

    useEffect(() => {
        fetchStoreData();
    }, []);

    const fetchStoreData = async () => {
        try {
            setLoading(true);
            setError("");

            // Check if user is authenticated
            if (!authService.isAuthenticated()) {
                setError("Vui lòng đăng nhập để xem thông tin gian hàng");
                return;
            }

            // Gọi API /api/Store/my-store
            const response = await storeService.getMyStore();
            if (response.success && response.data) {
                setStore(response.data);
                setFormData({
                    name: response.data.name || '',
                    address: response.data.address || '',
                    contactNumber: response.data.contactNumber || '',
                    storeImageUrl: response.data.storeImageUrl || '',
                    coverImageUrl: response.data.coverImageUrl || ''
                });
            } else {
                setError(response.message || "Không tìm thấy thông tin gian hàng");
            }
        } catch (error) {
            console.error('Error in fetchStoreData:', error);
            setError(error.message || "Có lỗi xảy ra khi tải thông tin gian hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            if (!store?.id) {
                toast.error("Không tìm thấy ID gian hàng");
                return;
            }

            // Call API to update store
            const response = await storeService.updateStore(store.id, formData);

            if (response.success) {
                toast.success("Cập nhật thông tin gian hàng thành công!");
                setIsEditing(false);
                // Refresh store data
                await fetchStoreData();
            } else {
                toast.error(response.message || "Cập nhật thất bại");
            }

        } catch (error) {
            console.error('Error updating store:', error);
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data to original store data
        if (store) {
            setFormData({
                name: store.name || '',
                address: store.address || '',
                contactNumber: store.contactNumber || '',
                storeImageUrl: store.storeImageUrl || '',
                coverImageUrl: store.coverImageUrl || ''
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Open': { color: 'bg-green-100 text-green-800 border-green-200', text: 'Đang hoạt động' },
            'Closed': { color: 'bg-red-100 text-red-800 border-red-200', text: 'Đã đóng' },
            'Pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Chờ duyệt' },
            'Suspended': { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Tạm ngưng' }
        };

        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', text: status || 'Không xác định' };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                {config.text}
            </span>
        );
    };

    // Debug info component

    if (loading) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-supply-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Đang tải thông tin gian hàng...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    if (error) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaStore className="text-red-500 text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Không thể tải thông tin</h3>
                        <p className="text-gray-600 mb-6">{error}</p>

                        <button
                            onClick={() => window.location.href = '/register-seller'}
                            className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center mx-auto"
                        >
                            <FaPlus className="mr-2" />
                            Đăng ký làm Seller
                        </button>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    if (!store) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaStore className="text-blue-500 text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Chưa có gian hàng</h3>
                        <p className="text-gray-600">Không tìm thấy thông tin gian hàng của bạn</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <FaStore className="mr-3 text-supply-primary" />
                            Thông tin gian hàng
                        </h1>
                        <p className="text-gray-600 mt-1">Quản lý thông tin và cài đặt gian hàng của bạn</p>
                    </div>

                    {/* Store Profile Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Cover Image */}
                        <div className="relative h-48 bg-gradient-to-r from-supply-primary to-green-600">
                            {store.coverImageUrl && (
                                <img
                                    src={store.coverImageUrl}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-30"></div>

                            {/* Store Avatar */}
                            <div className="absolute -bottom-16 left-8">
                                <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-lg">
                                    {store.storeImageUrl ? (
                                        <img
                                            src={store.storeImageUrl}
                                            alt={store.name}
                                            className="w-full h-full object-cover rounded-xl"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-r from-supply-primary to-green-600 rounded-xl flex items-center justify-center">
                                            <FaStore className="text-white text-4xl" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Edit Button */}
                            <div className="absolute top-4 right-4">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg hover:bg-white transition-colors flex items-center shadow-md"
                                    >
                                        <FaEdit className="mr-2" />
                                        Chỉnh sửa
                                    </button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <FiLoader className="mr-2 animate-spin" />
                                            ) : (
                                                <FaSave className="mr-2" />
                                            )}
                                            Lưu
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg hover:bg-white transition-colors flex items-center disabled:opacity-50"
                                        >
                                            <FaTimes className="mr-2" />
                                            Hủy
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Store Info */}
                        <div className="pt-20 pb-8 px-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name || 'Chưa đặt tên'}</h1>
                                    <div className="flex items-center space-x-4">
                                        {getStatusBadge(store.status)}
                                        {typeof store.rating === 'number' && (
                                            <div className="flex items-center">
                                                <FaStar className="text-yellow-400 mr-1" />
                                                <span className="text-gray-700 font-medium">{store.rating}/5</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                            <FaUser className="mr-2 text-supply-primary" />
                                            Thông tin cơ bản
                                        </h2>

                                        <div className="space-y-4">
                                            {/* Store Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <FaStore className="inline mr-2 text-supply-primary" />
                                                    Tên gian hàng
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập tên gian hàng"
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                                    />
                                                ) : (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900">
                                                        {store.name || 'Chưa cập nhật'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contact Number */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <FaPhone className="inline mr-2 text-supply-primary" />
                                                    Số điện thoại
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        name="contactNumber"
                                                        value={formData.contactNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập số điện thoại"
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                                    />
                                                ) : (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900">
                                                        {store.contactNumber || 'Chưa cập nhật'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Address */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <FaMapMarkerAlt className="inline mr-2 text-supply-primary" />
                                                    Địa chỉ
                                                </label>
                                                {isEditing ? (
                                                    <textarea
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập địa chỉ gian hàng"
                                                        rows={3}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent resize-none"
                                                    />
                                                ) : (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 min-h-[84px]">
                                                        {store.address || 'Chưa cập nhật'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image URLs - Only show when editing */}
                                    {isEditing && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                                <FaImage className="mr-2 text-supply-primary" />
                                                Hình ảnh
                                            </h2>

                                            <div className="space-y-4">
                                                {/* Store Image URL */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        URL ảnh gian hàng
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="storeImageUrl"
                                                        value={formData.storeImageUrl}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập URL ảnh gian hàng"
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                                    />
                                                </div>

                                                {/* Cover Image URL */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        URL ảnh bìa
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="coverImageUrl"
                                                        value={formData.coverImageUrl}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập URL ảnh bìa"
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* System Information */}
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                        <FaClock className="mr-2 text-supply-primary" />
                                        Thông tin hệ thống
                                    </h2>

                                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                    Trạng thái:
                                                </span>
                                                {getStatusBadge(store.status)}
                                            </div>

                                            {typeof store.rating === 'number' && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-600 flex items-center">
                                                        <FaStar className="mr-2" />
                                                        Đánh giá:
                                                    </span>
                                                    <div className="flex items-center">
                                                        <FaStar className="text-yellow-400 mr-1" />
                                                        <span className="text-sm text-gray-900 font-medium">{store.rating}/5</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600 flex items-center">
                                                    <FaCalendarAlt className="mr-2" />
                                                    Ngày tạo:
                                                </span>
                                                <span className="text-sm text-gray-900">
                                                    {formatDate(store.createdAt)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600 flex items-center">
                                                    <FaClock className="mr-2" />
                                                    Cập nhật cuối:
                                                </span>
                                                <span className="text-sm text-gray-900">
                                                    {formatDate(store.updatedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store Reviews Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <FaComments className="mr-3 text-supply-primary" />
                                Đánh giá của khách hàng
                            </h2>
                            <p className="text-gray-600 mt-1">Xem và phản hồi đánh giá về cửa hàng của bạn</p>
                        </div>

                        <div className="p-6">
                            <ReviewListWithResponse
                                targetType="Store"
                                targetId={store.id}
                                maxHeight="500px"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default StoreProfile;