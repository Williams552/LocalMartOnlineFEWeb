import React, { useState } from "react";

const sellerInfoMap = {
    "Nguyễn Văn A": {
        phone: "0909123456",
        address: "123 Lý Thường Kiệt, Ninh Kiều, Cần Thơ",
    },
    "Trần Thị B": {
        phone: "0912345678",
        address: "456 Nguyễn Trãi, Ninh Kiều, Cần Thơ",
    },
};

const proxyShoppers = [
    {
        name: "Lê Thị D",
        phone: "0987654321",
        area: "Chợ Tân An",
    },
    {
        name: "Phạm Văn E",
        phone: "0978123456",
        area: "Chợ An Hòa",
    },
];

const CartPage = () => {
    const [cartItems, setCartItems] = useState([
        { id: 1, name: "Rau muống", quantity: 2, price: 12000, seller: "Nguyễn Văn A" },
        { id: 2, name: "Cà rốt", quantity: 1, price: 15000, seller: "Nguyễn Văn A" },
        { id: 3, name: "Ớt hiểm", quantity: 3, price: 10000, seller: "Trần Thị B" },
    ]);

    const [selectedSeller, setSelectedSeller] = useState(null);
    const [showProxyListFor, setShowProxyListFor] = useState(null);

    const handleRemove = (id) => {
        const updated = cartItems.filter(item => item.id !== id);
        setCartItems(updated);
    };

    const groupedBySeller = cartItems.reduce((acc, item) => {
        if (!acc[item.seller]) acc[item.seller] = [];
        acc[item.seller].push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-5xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-supply-primary text-center mb-8">Giỏ hàng của bạn</h1>

                {cartItems.length === 0 ? (
                    <p className="text-center text-gray-500">Giỏ hàng hiện đang trống.</p>
                ) : (
                    <div className="space-y-10">
                        {Object.entries(groupedBySeller).map(([seller, items], idx) => {
                            const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                            const quantity = items.reduce((sum, item) => sum + item.quantity, 0);

                            return (
                                <div key={idx} className="bg-white rounded shadow p-4 space-y-4">
                                    <h2 className="text-lg font-bold text-supply-primary">Người bán: {seller}</h2>

                                    <div className="space-y-4">
                                        {items.map(item => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center border-b pb-2"
                                            >
                                                <div>
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Giá: {item.price.toLocaleString()}đ
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-gray-700 font-medium">
                                                        {(item.quantity * item.price).toLocaleString()}đ
                                                    </p>
                                                    <button
                                                        onClick={() => handleRemove(item.id)}
                                                        className="text-red-500 text-sm hover:underline mt-1"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 justify-end pt-4 border-t">
                                        <button
                                            onClick={() => setSelectedSeller(seller)}
                                            className="px-4 py-2 bg-supply-primary text-white rounded-full hover:opacity-90"
                                        >
                                            Liên hệ người bán
                                        </button>
                                        <button
                                            onClick={() => setShowProxyListFor(seller)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                        >
                                            Tìm người đi chợ giùm
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modal liên hệ người bán */}
            {selectedSeller && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg relative">
                        <button
                            className="absolute top-2 right-3 text-gray-500 hover:text-red-500"
                            onClick={() => setSelectedSeller(null)}
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-supply-primary mb-4">
                            Thông tin người bán
                        </h3>
                        <div className="space-y-3 text-sm text-gray-700">
                            <p><strong>Họ tên:</strong> {selectedSeller}</p>
                            <p><strong>Số điện thoại:</strong> {sellerInfoMap[selectedSeller]?.phone}</p>
                            <p><strong>Địa chỉ:</strong> {sellerInfoMap[selectedSeller]?.address}</p>
                        </div>
                        <div className="mt-5 text-right">
                            <a
                                href={`https://zalo.me/${sellerInfoMap[selectedSeller]?.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-5 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                            >
                                Liên hệ qua Zalo
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal người đi chợ giùm */}
            {showProxyListFor && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg relative">
                        <button
                            className="absolute top-2 right-3 text-gray-500 hover:text-red-500"
                            onClick={() => setShowProxyListFor(null)}
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-blue-600 mb-4">Người đi chợ giùm gần bạn</h3>
                        <ul className="space-y-3 text-sm text-gray-700">
                            {proxyShoppers.map((ps, idx) => (
                                <li key={idx} className="border-b pb-2">
                                    <p><strong>Họ tên:</strong> {ps.name}</p>
                                    <div className="flex items-center gap-2">
                                        <p><strong>SĐT:</strong> {ps.phone}</p>
                                        <a
                                            href={`https://zalo.me/${ps.phone.replace(/\D/g, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                                        >
                                            Liên hệ
                                        </a>
                                    </div>
                                    <p><strong>Khu vực:</strong> {ps.area}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
