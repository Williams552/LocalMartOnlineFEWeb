import React, { useState } from "react";

const RegisterSeller = () => {
    const [form, setForm] = useState({
        storeName: "",
        market: "",
        phone: "",
        description: "",
        contractFile: null,
    });

    const [success, setSuccess] = useState(false);

    const markets = [
        "Chợ Tân An",
        "Chợ An Hòa",
        "Chợ Xuân Khánh",
        "Chợ Cái Khế",
        "Chợ Hưng Lợi",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setForm((prev) => ({ ...prev, contractFile: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Thông tin đăng ký người bán:", form);
        if (form.contractFile) {
            console.log("File đính kèm:", form.contractFile.name);
        }
        setSuccess(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-supply-primary mb-4">
                    Đăng ký trở thành người bán
                </h2>

                {success ? (
                    <div className="text-green-600 font-medium">
                        ✅ Đăng ký thành công! Chúng tôi sẽ liên hệ xác nhận sớm.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên gian hàng</label>
                            <input
                                type="text"
                                name="storeName"
                                value={form.storeName}
                                onChange={handleChange}
                                required
                                className="w-full border rounded px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Chợ bạn muốn đăng ký</label>
                            <select
                                name="market"
                                value={form.market}
                                onChange={handleChange}
                                required
                                className="w-full border rounded px-3 py-2 text-sm bg-white"
                            >
                                <option value="">-- Chọn chợ --</option>
                                {markets.map((m, idx) => (
                                    <option key={idx} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Số điện thoại liên hệ</label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                className="w-full border rounded px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Mô tả gian hàng</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full border rounded px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Tải ảnh hoặc hợp đồng buôn bán</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="w-full text-sm"
                            />
                            {form.contractFile && (
                                <p className="mt-1 text-sm text-green-600">
                                    📎 {form.contractFile.name}
                                </p>
                            )}
                        </div>

                        <div className="text-right">
                            <button
                                type="submit"
                                className="bg-supply-primary text-white px-6 py-2 rounded-full hover:opacity-90"
                            >
                                Gửi đăng ký
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RegisterSeller;
