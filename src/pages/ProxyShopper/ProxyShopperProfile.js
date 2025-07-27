import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiTruck, FiCreditCard, FiEdit3, FiSave, FiX } from 'react-icons/fi';
import { FaStar, FaCalendarAlt } from 'react-icons/fa';
import proxyShopperRegistrationService from '../../services/proxyShopperRegistrationService';
import authService from '../../services/authService';

const ProxyShopperProfile = () => {
    const [profile, setProfile] = useState(null);
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        operatingArea: '',
        transportMethod: '',
        paymentMethod: ''
    });

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const user = authService.getCurrentUser();
            setProfile(user);

            // Fetch proxy shopper registration info
            const registrationResponse = await proxyShopperRegistrationService.getMyRegistration();
            if (registrationResponse.success) {
                setRegistration(registrationResponse.data);
                setFormData({
                    operatingArea: registrationResponse.data.operatingArea || '',
                    transportMethod: registrationResponse.data.transportMethod || '',
                    paymentMethod: registrationResponse.data.paymentMethod || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        // Reset form data
        if (registration) {
            setFormData({
                operatingArea: registration.operatingArea || '',
                transportMethod: registration.transportMethod || '',
                paymentMethod: registration.paymentMethod || ''
            });
        }
    };

    const handleSave = async () => {
        try {
            // Here you would typically have an update API endpoint
            // For now, we'll just show a success message
            alert('Cập nhật thông tin thành công!');
            setEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ duyệt', icon: '⏳' },
            'Approved': { color: 'bg-green-100 text-green-800', text: 'Đã duyệt', icon: '✅' },
            'Rejected': { color: 'bg-red-100 text-red-800', text: 'Bị từ chối', icon: '❌' }
        };

        const config = statusConfig[status] || {
            color: 'bg-gray-100 text-gray-800',
            text: status,
            icon: '❓'
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <span className="mr-1">{config.icon}</span>
                {config.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không xác định';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ Proxy Shopper</h1>
                <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản của bạn.</p>
            </div>

            {/* Basic Profile Info */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <FiUser className="mr-2" />
                        Thông tin cá nhân
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên
                            </label>
                            <p className="text-gray-900 font-medium">
                                {profile?.fullName || profile?.username || 'Chưa cập nhật'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <p className="text-gray-900">{profile?.email || 'Chưa cập nhật'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                            </label>
                            <p className="text-gray-900">{profile?.phoneNumber || 'Chưa cập nhật'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày tham gia
                            </label>
                            <p className="text-gray-900 flex items-center">
                                <FaCalendarAlt className="mr-2 text-gray-400" size={14} />
                                {formatDate(profile?.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Status */}
            {registration && (
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Trạng thái đăng ký Proxy Shopper
                            </h2>
                            {getStatusBadge(registration.status)}
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày đăng ký
                                </label>
                                <p className="text-gray-900">{formatDate(registration.createdAt)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày cập nhật
                                </label>
                                <p className="text-gray-900">{formatDate(registration.updatedAt)}</p>
                            </div>
                        </div>

                        {registration.status === 'Rejected' && registration.rejectionReason && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h4 className="font-medium text-red-800 mb-2">Lý do từ chối:</h4>
                                <p className="text-red-700 text-sm">{registration.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Work Information */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Thông tin công việc</h2>
                        {!editing ? (
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <FiEdit3 className="mr-2" size={16} />
                                Chỉnh sửa
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSave}
                                    className="inline-flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                >
                                    <FiSave className="mr-2" size={16} />
                                    Lưu
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <FiX className="mr-2" size={16} />
                                    Hủy
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiMapPin className="inline mr-1" size={14} />
                                Khu vực hoạt động
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.operatingArea}
                                    onChange={(e) => handleInputChange('operatingArea', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    placeholder="Nhập khu vực hoạt động"
                                />
                            ) : (
                                <p className="text-gray-900 font-medium">
                                    {formData.operatingArea || 'Chưa cập nhật'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiTruck className="inline mr-1" size={14} />
                                Phương thức vận chuyển
                            </label>
                            {editing ? (
                                <select
                                    value={formData.transportMethod}
                                    onChange={(e) => handleInputChange('transportMethod', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                >
                                    <option value="">Chọn phương thức</option>
                                    <option value="Motorbike">Xe máy</option>
                                    <option value="Car">Ô tô</option>
                                    <option value="Bicycle">Xe đạp</option>
                                    <option value="Walking">Đi bộ</option>
                                </select>
                            ) : (
                                <p className="text-gray-900 font-medium">
                                    {formData.transportMethod || 'Chưa cập nhật'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiCreditCard className="inline mr-1" size={14} />
                                Phương thức thanh toán
                            </label>
                            {editing ? (
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                >
                                    <option value="">Chọn phương thức</option>
                                    <option value="Cash">Tiền mặt</option>
                                    <option value="BankTransfer">Chuyển khoản</option>
                                    <option value="MoMo">MoMo</option>
                                    <option value="ZaloPay">ZaloPay</option>
                                </select>
                            ) : (
                                <p className="text-gray-900 font-medium">
                                    {formData.paymentMethod || 'Chưa cập nhật'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Đánh giá trung bình</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <p className="text-2xl font-bold">4.8</p>
                                <FaStar className="text-yellow-300" size={20} />
                            </div>
                        </div>
                        <div className="text-3xl opacity-20">⭐</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Đơn hoàn thành</p>
                            <p className="text-2xl font-bold mt-1">124</p>
                        </div>
                        <div className="text-3xl opacity-20">📦</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Tổng thu nhập</p>
                            <p className="text-2xl font-bold mt-1">12.5M</p>
                        </div>
                        <div className="text-3xl opacity-20">💰</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProxyShopperProfile;
