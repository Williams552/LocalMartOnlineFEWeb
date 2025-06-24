// src/pages/ProxyShopper/ProxyShopperList.js
import React from "react";

const proxyShoppers = [
    {
        id: 1,
        name: "Lê Thị B",
        phone: "0911223344",
        area: "Ninh Kiều",
        note: "Có xe máy, đi nhiều chợ",
    },
    {
        id: 2,
        name: "Nguyễn Văn C",
        phone: "0933555666",
        area: "Hưng Lợi",
        note: "Đi buổi sáng, ưu tiên rau củ",
    },
];

const ProxyShopperList = () => {
    const handleContact = (phone) => {
        window.open(`https://zalo.me/${phone.replace(/\D/g, "")}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-supply-primary text-center mb-8">
                Danh sách người đi chợ dùm
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {proxyShoppers.map((shopper) => (
                    <div key={shopper.id} className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold text-supply-primary">{shopper.name}</h2>
                        <p className="text-sm text-gray-600 mb-1">Khu vực: {shopper.area}</p>
                        <p className="text-sm text-gray-600 mb-1">Ghi chú: {shopper.note}</p>
                        <p className="text-sm text-gray-600 mb-3">SĐT: {shopper.phone}</p>
                        <button
                            onClick={() => handleContact(shopper.phone)}
                            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                        >
                            Liên hệ qua Zalo
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProxyShopperList;
