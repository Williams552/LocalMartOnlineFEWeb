import React, { useState } from "react";

const PolicyManagement = () => {
    const [policyContent, setPolicyContent] = useState("");

    const handleChange = (e) => {
        setPolicyContent(e.target.value);
    };

    const handleSave = () => {
        // TODO: Gửi policyContent lên server qua API
        alert("Chính sách đã được lưu!");
    };

    return (
        <div className="policy-management p-4">
            <h2 className="text-2xl font-bold mb-4">Cập nhật Chính sách sử dụng</h2>
            <textarea
                value={policyContent}
                onChange={handleChange}
                rows="12"
                className="w-full border border-gray-300 p-3 rounded-lg mb-4"
                placeholder="Nhập nội dung chính sách tại đây..."
            ></textarea>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Lưu thay đổi
            </button>
        </div>
    );
};

export default PolicyManagement;
