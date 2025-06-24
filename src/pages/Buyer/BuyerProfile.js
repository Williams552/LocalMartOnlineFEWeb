import React, { useState } from "react";
import products from "../../data/products";
import ProductCard from "../../components/ProductCard/ProductCard";
import { FaUserCircle } from "react-icons/fa";

const BuyerProfile = () => {
    const [userInfo, setUserInfo] = useState({
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        phone: "0123 456 789",
        address: "123 Trần Hưng Đạo, Ninh Kiều, Cần Thơ",
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
        { name: "Nguyễn Văn A", market: "Chợ Tân An", phone: "0909123456" },
        { name: "Trần Thị B", market: "Chợ An Hòa", phone: "0912345678" },
        { name: "Phạm Văn C", market: "Chợ Xuân Khánh", phone: "0987654321" },
    ]);

    const handleUnfollow = (name) => {
        setFollowedSellers(followedSellers.filter(seller => seller.name !== name));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-5xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-supply-primary text-center mb-8">Hồ sơ của tôi</h1>

                {/* Thông tin cá nhân */}
                <section className="bg-white shadow p-6 rounded-lg mb-10 relative">
                    <div className="flex items-center gap-4 mb-6">
                        <FaUserCircle className="text-supply-primary" size={40} />
                        <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
                    </div>
                    <div className="space-y-2 text-gray-700 text-sm">
                        <p><strong>Họ tên:</strong> {userInfo.fullName}</p>
                        <p><strong>Email:</strong> {userInfo.email}</p>
                        <p><strong>Số điện thoại:</strong> {userInfo.phone}</p>
                        <p><strong>Địa chỉ:</strong> {userInfo.address}</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute top-6 right-6 text-sm px-4 py-1 bg-supply-primary text-white rounded-full hover:opacity-90"
                    >
                        Chỉnh sửa
                    </button>
                </section>

                {/* Gian hàng đang theo dõi */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">Gian hàng đang theo dõi</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {followedSellers.map((seller, idx) => (
                            <div key={idx} className="bg-white shadow rounded-lg p-4 text-center hover:shadow-lg transition">
                                <div className="flex justify-center mb-2">
                                    <img
                                        src={`https://i.pravatar.cc/150?img=${idx + 10}`}
                                        alt={seller.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                </div>
                                <p className="font-medium text-supply-primary">{seller.name}</p>
                                <p className="text-sm text-gray-500">{seller.market}</p>
                                <div className="mt-3">
                                    <button
                                        onClick={() => handleUnfollow(seller.name)}
                                        className="text-xs px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-100"
                                    >
                                        Bỏ theo dõi
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Đơn hàng gần đây */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Đơn hàng gần đây</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg relative">
                        <h3 className="text-xl font-bold mb-4 text-supply-primary text-center">
                            Chỉnh sửa hồ sơ
                        </h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                name="fullName"
                                value={editForm.fullName}
                                onChange={handleEditChange}
                                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary"
                                placeholder="Họ tên"
                            />
                            <input
                                type="email"
                                name="email"
                                value={editForm.email}
                                onChange={handleEditChange}
                                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary"
                                placeholder="Email"
                            />
                            <input
                                type="text"
                                name="phone"
                                value={editForm.phone}
                                onChange={handleEditChange}
                                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary"
                                placeholder="Số điện thoại"
                            />
                            <input
                                type="text"
                                name="address"
                                value={editForm.address}
                                onChange={handleEditChange}
                                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary"
                                placeholder="Địa chỉ"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm bg-supply-primary text-white rounded hover:opacity-90"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyerProfile;
