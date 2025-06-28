import React, { useState } from "react";
import {
    FaStore, FaEdit, FaCamera, FaSave, FaTimes, FaMapMarkerAlt,
    FaPhone, FaEnvelope, FaClock, FaLeaf, FaCertificate, FaAward,
    FaUsers, FaStar, FaShoppingBag, FaChartLine, FaEye, FaHeart
} from "react-icons/fa";
import SellerLayout from "../../layouts/SellerLayout";

const SellerProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("info");

    const [profileData, setProfileData] = useState({
        name: "Gian hàng Cô Lan",
        description: "Chuyên cung cấp rau củ quả tươi sạch từ nông trại gia đình. Với hơn 10 năm kinh nghiệm trong lĩnh vực nông nghiệp, chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng nhất.",
        avatar: "https://i.pravatar.cc/150?img=1",
        coverImage: "https://via.placeholder.com/800x200/22c55e/ffffff?text=Farm+Background",
        phone: "0909123456",
        email: "gianhhangcolan@gmail.com",
        address: "Gian A12, Chợ Tân An, Ninh Kiều, Cần Thơ",
        businessHours: {
            open: "05:00",
            close: "18:00",
            days: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
        },
        specialties: ["Rau sạch", "Rau hữu cơ", "Trái cây tươi", "Gia vị"],
        certifications: ["Chứng nhận VietGAP", "An toàn thực phẩm", "Organic"],
        achievements: ["Top seller 2023", "5 sao đánh giá", "1000+ đơn hàng thành công"]
    });

    const [editForm, setEditForm] = useState({ ...profileData });

    // Mock statistics
    const stats = {
        totalProducts: 25,
        totalOrders: 128,
        totalCustomers: 95,
        rating: 4.8,
        followers: 340,
        totalViews: 15670,
        totalLikes: 892,
        joinDate: "Tháng 3, 2023"
    };

    const recentActivities = [
        { type: "order", message: "Đơn hàng #DH001 đã được giao thành công", time: "2 giờ trước" },
        { type: "product", message: "Thêm sản phẩm 'Rau muống tươi'", time: "1 ngày trước" },
        { type: "review", message: "Nhận đánh giá 5 sao từ khách hàng", time: "2 ngày trước" },
        { type: "follower", message: "5 người theo dõi mới", time: "3 ngày trước" }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        setProfileData(editForm);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditForm({ ...profileData });
        setIsEditing(false);
    };

    const tabs = [
        { id: "info", label: "Thông tin cơ bản", icon: FaStore },
        { id: "stats", label: "Thống kê", icon: FaChartLine },
        { id: "activities", label: "Hoạt động gần đây", icon: FaClock }
    ];

    return (
        <SellerLayout>
            {/* Cover Image */}
            <div className="relative h-48 bg-gradient-to-r from-supply-primary to-green-600">
                <img
                    src={profileData.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30"></div>
                {isEditing && (
                    <button className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg hover:bg-white transition">
                        <FaCamera className="text-gray-600" />
                    </button>
                )}
            </div>

            {/* Profile Header */}
            <div className="relative -mt-16 max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                        {/* Avatar & Basic Info */}
                        <div className="flex items-start space-x-6">
                            <div className="relative">
                                <img
                                    src={profileData.avatar}
                                    alt={profileData.name}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                                />
                                {isEditing && (
                                    <button className="absolute -bottom-2 -right-2 bg-supply-primary text-white p-2 rounded-full hover:bg-green-600 transition">
                                        <FaCamera size={12} />
                                    </button>
                                )}
                            </div>
                            <div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleInputChange}
                                        className="text-2xl font-bold text-gray-800 border-b-2 border-supply-primary focus:outline-none bg-transparent"
                                    />
                                ) : (
                                    <h1 className="text-2xl font-bold text-gray-800">{profileData.name}</h1>
                                )}
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <FaStar className="text-yellow-500" />
                                        <span>{stats.rating}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <FaUsers />
                                        <span>{stats.followers} theo dõi</span>
                                    </div>
                                    <span>Tham gia {stats.joinDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center space-x-2 bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                                    >
                                        <FaSave />
                                        <span>Lưu</span>
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center space-x-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                                    >
                                        <FaTimes />
                                        <span>Hủy</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center space-x-2 bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                                >
                                    <FaEdit />
                                    <span>Chỉnh sửa</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
                        <div className="text-sm text-gray-600">Sản phẩm</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.totalOrders}</div>
                        <div className="text-sm text-gray-600">Đơn hàng</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
                        <div className="text-sm text-gray-600">Khách hàng</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.rating}</div>
                        <div className="text-sm text-gray-600">Đánh giá</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.totalViews.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Lượt xem</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-pink-600">{stats.totalLikes}</div>
                        <div className="text-sm text-gray-600">Lượt thích</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition ${activeTab === tab.id
                                            ? "border-supply-primary text-supply-primary"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <Icon />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Thông tin cơ bản */}
                        {activeTab === "info" && (
                            <div className="space-y-8">
                                {/* Mô tả */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Mô tả gian hàng</h3>
                                    {isEditing ? (
                                        <textarea
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-supply-primary"
                                        />
                                    ) : (
                                        <p className="text-gray-600 leading-relaxed">{profileData.description}</p>
                                    )}
                                </div>

                                {/* Thông tin liên hệ */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <FaPhone className="text-gray-400" />
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        value={editForm.phone}
                                                        onChange={handleInputChange}
                                                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-supply-primary"
                                                    />
                                                ) : (
                                                    <span>{profileData.phone}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <FaEnvelope className="text-gray-400" />
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={editForm.email}
                                                        onChange={handleInputChange}
                                                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-supply-primary"
                                                    />
                                                ) : (
                                                    <span>{profileData.email}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-start space-x-3">
                                                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                                                {isEditing ? (
                                                    <textarea
                                                        name="address"
                                                        value={editForm.address}
                                                        onChange={handleInputChange}
                                                        rows={3}
                                                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-supply-primary"
                                                    />
                                                ) : (
                                                    <span>{profileData.address}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Giờ hoạt động */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Giờ hoạt động</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <FaClock className="text-gray-400" />
                                            <span className="font-medium">
                                                {profileData.businessHours.open} - {profileData.businessHours.close}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {profileData.businessHours.days.join(", ")}
                                        </div>
                                    </div>
                                </div>

                                {/* Chuyên môn */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Chuyên môn</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profileData.specialties.map((specialty, index) => (
                                            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Chứng nhận */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Chứng nhận</h3>
                                    <div className="space-y-2">
                                        {profileData.certifications.map((cert, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <FaCertificate className="text-blue-500" />
                                                <span>{cert}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Thành tích */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thành tích</h3>
                                    <div className="space-y-2">
                                        {profileData.achievements.map((achievement, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <FaAward className="text-yellow-500" />
                                                <span>{achievement}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Thống kê */}
                        {activeTab === "stats" && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                                        <h4 className="font-semibold text-blue-800 mb-4">Thống kê sản phẩm</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Tổng sản phẩm:</span>
                                                <span className="font-bold text-blue-800">{stats.totalProducts}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Lượt xem:</span>
                                                <span className="font-bold text-blue-800">{stats.totalViews.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Lượt thích:</span>
                                                <span className="font-bold text-blue-800">{stats.totalLikes}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                                        <h4 className="font-semibold text-green-800 mb-4">Thống kê bán hàng</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Tổng đơn hàng:</span>
                                                <span className="font-bold text-green-800">{stats.totalOrders}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Khách hàng:</span>
                                                <span className="font-bold text-green-800">{stats.totalCustomers}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Đánh giá TB:</span>
                                                <span className="font-bold text-green-800">{stats.rating}/5 ⭐</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h4 className="font-semibold text-gray-800 mb-4">Hiệu suất theo tháng</h4>
                                    <div className="text-center py-8 text-gray-500">
                                        <FaChartLine size={48} className="mx-auto mb-4" />
                                        <p>Biểu đồ thống kê sẽ được hiển thị ở đây</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hoạt động gần đây */}
                        {activeTab === "activities" && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800">Hoạt động gần đây</h3>
                                <div className="space-y-3">
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                            <div className={`w-2 h-2 rounded-full ${activity.type === "order" ? "bg-green-500" :
                                                activity.type === "product" ? "bg-blue-500" :
                                                    activity.type === "review" ? "bg-yellow-500" :
                                                        "bg-purple-500"
                                                }`}></div>
                                            <div className="flex-1">
                                                <p className="text-gray-800">{activity.message}</p>
                                                <p className="text-sm text-gray-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerProfile;
