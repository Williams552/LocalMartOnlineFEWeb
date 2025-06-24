// src/pages/ProxyShopper/RegisterProxyShopper.js
import React, { useState } from "react";

const RegisterProxyShopper = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        area: "",
        availability: "",
        note: "",
    });

    const markets = [
        "Chợ Tân An",
        "Chợ An Hòa",
        "Chợ Xuân Khánh",
        "Chợ Cái Khế",
        "Chợ Hưng Lợi",
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Đăng ký thành công! (Gửi dữ liệu này đến backend trong tương lai)");
        console.log("Dữ liệu đăng ký:", formData);
        setFormData({
            name: "",
            phone: "",
            area: "",
            availability: "",
            note: "",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-supply-primary text-center mb-8">
                Đăng ký làm người đi chợ dùm
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow space-y-5"
            >
                <div>
                    <label className="block text-sm font-medium mb-1">Họ và tên</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Khu vực hoạt động</label>
                    <select
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 text-sm bg-white"
                    >
                        <option value="">-- Chọn chợ --</option>
                        {markets.map((market, idx) => (
                            <option key={idx} value={market}>
                                {market}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Thời gian rảnh</label>
                    <input
                        type="text"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="VD: sáng 7h-10h"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Ghi chú</label>
                    <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border rounded px-3 py-2 text-sm"
                    />
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-supply-primary text-white rounded-full hover:opacity-90"
                    >
                        Gửi đăng ký
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterProxyShopper;
