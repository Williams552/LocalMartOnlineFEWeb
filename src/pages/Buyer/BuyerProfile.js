import React, { useState } from "react";
import products from "../../data/products";
import ProductCard from "../../components/ProductCard/ProductCard";
import { FaUserCircle, FaHeart, FaShoppingBag, FaStore, FaStar, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { FiEdit3, FiTruck, FiClock, FiAward } from "react-icons/fi";

const BuyerProfile = () => {
    const [userInfo, setUserInfo] = useState({
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        phone: "0123 456 789",
        address: "123 Trần Hưng Đạo, Ninh Kiều, Cần Thơ",
        memberSince: "Tháng 1, 2024",
        totalOrders: 28,
        loyaltyPoints: 1250,
        level: "Khách hàng thân thiết"
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...userInfo });

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setUserInfo(editForm);
        setIsEditing(false);
    };

    const recentOrders = products.slice(0, 4);

    const [followedSellers, setFollowedSellers] = useState([
        {
            name: "Cô Lan",
            market: "Chợ Tân An",
            phone: "0909123456",
            rating: 4.8,
            products: 25,
            avatar: "👩‍🌾"
        },
        {
            name: "Anh Minh",
            market: "Chợ An Hòa",
            phone: "0912345678",
            rating: 4.9,
            products: 18,
            avatar: "👨‍🌾"
        },
        {
            name: "Chú Tám",
            market: "Chợ Xuân Khánh",
            phone: "0987654321",
            rating: 4.7,
            products: 32,
            avatar: "👨‍🌾"
        },
    ]);

    const handleUnfollow = (name) => {
        setFollowedSellers(followedSellers.filter(seller => seller.name !== name));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Header với stats */}
                <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <FaUserCircle className="text-supply-primary w-20 h-20" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <FaStar className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{userInfo.fullName}</h1>
                                <p className="text-supply-primary font-medium text-lg">{userInfo.level}</p>
                                <p className="text-gray-600 text-sm">Thành viên từ {userInfo.memberSince}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center space-x-2 bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                        >
                            <FiEdit3 />
                            <span>Chỉnh sửa hồ sơ</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <FiTruck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-600">{userInfo.totalOrders}</p>
                            <p className="text-gray-600 text-sm">Đơn hàng đã mua</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                            <FaHeart className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-yellow-600">{followedSellers.length}</p>
                            <p className="text-gray-600 text-sm">Gian hàng theo dõi</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <FiAward className="w-8 h-8 text-supply-primary mx-auto mb-2" />
                            <p className="text-2xl font-bold text-supply-primary">{userInfo.loyaltyPoints.toLocaleString()}</p>
                            <p className="text-gray-600 text-sm">Điểm thành viên</p>
                        </div>
                    </div>
                </div>

                {/* Thông tin cá nhân */}
                <section className="bg-white shadow-sm border rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <FaUserCircle className="mr-3 text-supply-primary" />
                        Thông tin cá nhân
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-gray-500 text-sm w-20">Họ tên:</span>
                                <span className="font-medium text-gray-800">{userInfo.fullName}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-gray-500 text-sm w-20">Email:</span>
                                <span className="text-gray-800">{userInfo.email}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <FaPhone className="text-gray-500 w-4" />
                                <span className="text-gray-800">{userInfo.phone}</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <FaMapMarkerAlt className="text-gray-500 w-4 mt-1" />
                                <span className="text-gray-800">{userInfo.address}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gian hàng đang theo dõi */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <FaHeart className="mr-3 text-red-500" />
                        Gian hàng đang theo dõi ({followedSellers.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {followedSellers.map((seller, idx) => (
                            <div key={idx} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-3xl">{seller.avatar}</span>
                                        <div>
                                            <p className="font-semibold text-gray-800">{seller.name}</p>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                                                {seller.market}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnfollow(seller.name)}
                                        className="text-red-500 hover:text-red-700 transition"
                                    >
                                        <FaHeart className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Đánh giá:</span>
                                        <div className="flex items-center space-x-1">
                                            <FaStar className="w-4 h-4 text-yellow-500" />
                                            <span className="font-medium">{seller.rating}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Sản phẩm:</span>
                                        <span className="font-medium">{seller.products} món</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Liên hệ:</span>
                                        <span className="font-medium">{seller.phone}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t flex space-x-2">
                                    <button className="flex-1 bg-supply-primary text-white py-2 px-3 rounded-lg text-sm hover:bg-green-600 transition">
                                        Xem gian hàng
                                    </button>
                                    <button className="flex-1 border border-gray-300 py-2 px-3 rounded-lg text-sm hover:bg-gray-50 transition">
                                        Nhắn tin
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Đơn hàng gần đây */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <FiClock className="mr-3 text-blue-500" />
                            Đơn hàng gần đây
                        </h2>
                        <button className="text-supply-primary hover:underline text-sm">
                            Xem tất cả đơn hàng
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {recentOrders.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                seller={product.seller}
                                market={product.market}
                            />
                        ))}
                    </div>
                </section>
            </main>

            {/* Modal chỉnh sửa */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-[90%] max-w-lg shadow-2xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                            ✏️ Chỉnh sửa hồ sơ
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={editForm.fullName}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    placeholder="Nhập email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                                <textarea
                                    name="address"
                                    value={editForm.address}
                                    onChange={handleEditChange}
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                    placeholder="Nhập địa chỉ đầy đủ"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyerProfile;
