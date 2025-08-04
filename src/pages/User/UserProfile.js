import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import profileService from "../../services/profileService";
import {
    FaUserCircle, FaHeart, FaShoppingBag, FaStore, FaStar,
    FaMapMarkerAlt, FaShieldAlt, FaSave, FaTimes, FaEdit, FaTruck
} from "react-icons/fa";
import {
    FiEdit3, FiTruck, FiAward, FiSettings, FiUser,
    FiMail, FiPhone, FiMapPin, FiCalendar, FiShield
} from "react-icons/fi";

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    // Load profile data on component mount
    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const response = await profileService.getCurrentUserProfile();

            if (response.success && response.data) {
                const formattedData = profileService.formatUserData(response.data);
                setProfileData(formattedData);
                setEditForm(formattedData);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            // Fallback to user data from auth context
            if (user) {
                const fallbackData = profileService.formatUserData(user);
                setProfileData(fallbackData);
                setEditForm(fallbackData);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const updateData = {
                username: editForm.username,
                email: editForm.email,
                fullName: editForm.fullName,
                phoneNumber: editForm.phoneNumber,
                address: editForm.address
            };

            const response = await profileService.updateCurrentUserProfile(updateData);

            if (response.success) {
                setProfileData(editForm);
                setIsEditing(false);

                // Update auth context
                if (updateUser) {
                    updateUser(editForm);
                }

                alert('Cập nhật hồ sơ thành công!');
            } else {
                throw new Error(response.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Lỗi: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditForm(profileData);
        setIsEditing(false);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'Admin': return <FaShieldAlt className="text-blue-600" />;
            case 'Seller': return <FaStore className="text-green-600" />;
            case 'Proxy Shopper': return <FiTruck className="text-purple-600" />;
            default: return <FaUserCircle className="text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-supply-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaUserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Không thể tải thông tin hồ sơ</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                        <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                            <div className="relative">
                                {(
                                    <div className="w-24 h-24 bg-supply-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {profileData.fullName?.charAt(0) || profileData.username?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg">
                                    {getRoleIcon(profileData.role)}
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{profileData.fullName || profileData.username}</h1>
                                <p className="text-supply-primary font-medium text-lg">
                                    {profileService.getRoleDisplayName(profileData.role)}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center space-x-1">
                                        <FiCalendar />
                                        <span>Tham gia: {profileData.createdAt}</span>
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${profileService.getStatusDisplay(profileData.status).color}`}>
                                        {profileService.getStatusDisplay(profileData.status).name}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center space-x-2 bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                        >
                            <FiEdit3 />
                            <span>Chỉnh sửa hồ sơ</span>
                        </button>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="bg-white shadow-sm border rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                            <FiUser className="mr-3 text-supply-primary" />
                            Thông tin cá nhân
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <FiUser className="text-gray-500 w-5" />
                                <div className="flex-1">
                                    <span className="text-gray-500 text-sm">Tên đăng nhập:</span>
                                    <p className="font-medium text-gray-800">{profileData.username}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <FiUser className="text-gray-500 w-5" />
                                <div className="flex-1">
                                    <span className="text-gray-500 text-sm">Họ và tên:</span>
                                    <p className="font-medium text-gray-800">{profileData.fullName || 'Chưa cập nhật'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <FiMail className="text-gray-500 w-5" />
                                <div className="flex-1">
                                    <span className="text-gray-500 text-sm">Email:</span>
                                    <p className="font-medium text-gray-800">{profileData.email}</p>
                                    {profileData.isEmailVerified && (
                                        <span className="text-green-600 text-xs flex items-center space-x-1 mt-1">
                                            <FiShield />
                                            <span>Đã xác thực</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <FiPhone className="text-gray-500 w-5" />
                                <div className="flex-1">
                                    <span className="text-gray-500 text-sm">Số điện thoại:</span>
                                    <p className="font-medium text-gray-800">{profileData.phoneNumber || 'Chưa cập nhật'}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <FiMapPin className="text-gray-500 w-5 mt-1" />
                                <div className="flex-1">
                                    <span className="text-gray-500 text-sm">Địa chỉ:</span>
                                    <p className="font-medium text-gray-800">{profileData.address || 'Chưa cập nhật'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <FiShield className="text-gray-500 w-5" />
                                <div className="flex-1">
                                    <span className="text-gray-500 text-sm">Vai trò:</span>
                                    <div className="flex items-center space-x-2">
                                        {getRoleIcon(profileData.role)}
                                        <span className="font-medium text-gray-800">
                                            {profileService.getRoleDisplayName(profileData.role)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <FiCalendar className="text-gray-500 w-5" />
                                <div className="flex-1">
                                    <span className="text-gray-500 text-sm">Ngày tham gia:</span>
                                    <p className="font-medium text-gray-800">{profileData.createdAt}</p>
                                </div>
                            </div>

                            {profileData.operatingArea && (
                                <div className="flex items-center space-x-3">
                                    <FaMapMarkerAlt className="text-gray-500 w-5" />
                                    <div className="flex-1">
                                        <span className="text-gray-500 text-sm">Khu vực hoạt động:</span>
                                        <p className="font-medium text-gray-800">{profileData.operatingArea}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${profileData.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div className="flex-1">
                                    <span className="text-gray-500 text-sm">Trạng thái tài khoản:</span>
                                    <span className={`font-medium ml-2 ${profileService.getStatusDisplay(profileData.status).color}`}>
                                        {profileService.getStatusDisplay(profileData.status).name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security & Account Information */}
                    <div className="bg-white shadow-sm border rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                            <FiSettings className="mr-3 text-supply-primary" />
                            Bảo mật & Thông tin tài khoản
                        </h2>

                        <div className="space-y-6">
                            {/* Security Status */}
                            <div>
                                <h3 className="flex items-center space-x-2 mb-3">
                                    <FaShieldAlt className="text-gray-500" />
                                    <span className="font-medium text-gray-700">Trạng thái bảo mật</span>
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm">Email đã xác thực</span>
                                        <span className={`text-sm font-medium flex items-center space-x-1 ${profileData.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                                            <FiShield />
                                            <span>{profileData.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm">Xác thực 2 bước</span>
                                        <span className={`text-sm font-medium ${profileData.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                            {profileData.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Account Details */}
                            <div>
                                <h3 className="flex items-center space-x-2 mb-3">
                                    <FiCalendar className="text-gray-500" />
                                    <span className="font-medium text-gray-700">Chi tiết tài khoản</span>
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ID tài khoản:</span>
                                        <span className="font-mono text-gray-800">{profileData.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày tạo:</span>
                                        <span className="text-gray-800">{profileData.createdAt}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cập nhật lần cuối:</span>
                                        <span className="text-gray-800">{profileData.updatedAt}</span>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition"
                                            onClick={() => window.location.href = '/change-password'}
                                        >
                                            Đổi mật khẩu
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Role-specific Information */}
                            {profileData.role === 'Seller' && (
                                <div>
                                    <h3 className="flex items-center space-x-2 mb-3">
                                        <FaStore className="text-gray-500" />
                                        <span className="font-medium text-gray-700">Thông tin người bán</span>
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trạng thái cửa hàng:</span>
                                            <span className="text-green-600">Đang hoạt động</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Đánh giá trung bình:</span>
                                            <span className="text-yellow-600 flex items-center space-x-1">
                                                <FaStar />
                                                <span>4.8/5.0</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {profileData.role === 'Proxy Shopper' && (
                                <div>
                                    <h3 className="flex items-center space-x-2 mb-3">
                                        <FiTruck className="text-gray-500" />
                                        <span className="font-medium text-gray-700">Thông tin người đi chợ</span>
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Khu vực phục vụ:</span>
                                            <span className="text-gray-800">{profileData.operatingArea || 'Chưa cập nhật'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trạng thái hoạt động:</span>
                                            <span className="text-green-600">Sẵn sàng</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-[90%] max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center space-x-2">
                            <FaEdit />
                            <span>Chỉnh sửa hồ sơ</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên đăng nhập <span className="text-gray-400">(Không thể thay đổi)</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editForm.username || ''}
                                    onChange={handleEditChange}
                                    disabled
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    placeholder="Tên đăng nhập"
                                />
                                <p className="text-xs text-gray-500 mt-1">Tên đăng nhập không thể thay đổi vì lý do bảo mật</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={editForm.fullName || ''}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    placeholder="Nhập họ và tên đầy đủ"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editForm.email || ''}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    placeholder="Nhập địa chỉ email"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={editForm.phoneNumber || ''}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    placeholder="Nhập số điện thoại (VD: 0901234567)"
                                    pattern="[0-9]{10,11}"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ
                                </label>
                                <textarea
                                    name="address"
                                    value={editForm.address || ''}
                                    onChange={handleEditChange}
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                                />
                            </div>

                            {/* Role-specific fields */}
                            {profileData.role === 'Proxy Shopper' && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Khu vực hoạt động
                                    </label>
                                    <input
                                        type="text"
                                        name="operatingArea"
                                        value={editForm.operatingArea || ''}
                                        onChange={handleEditChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                        placeholder="Nhập khu vực hoạt động (VD: Quận 1, TP.HCM)"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Lưu ý:</span> Những trường có dấu (*) là bắt buộc.
                                Thông tin email đã xác thực không thể thay đổi trực tiếp.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8">
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                <FaTimes className="inline mr-2" />
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-3 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang lưu...</span>
                                    </div>
                                ) : (
                                    <>
                                        <FaSave className="inline mr-2" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
