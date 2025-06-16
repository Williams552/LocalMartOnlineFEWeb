// src/pages/Guest/ContactPage.js
import React from "react";

const ContactPage = () => {
    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-4 text-supply-primary">Liên hệ</h1>
            <p className="mb-4 text-gray-700">Bạn có thể liên hệ với chúng tôi qua thông tin dưới đây:</p>
            <ul className="text-gray-600">
                <li>Email: support@localmart.vn</li>
                <li>Số điện thoại: 0123 456 789</li>
                <li>Địa chỉ: 123 Đường A, Quận B, TP. Cần Thơ</li>
            </ul>
        </div>
    );
};

export default ContactPage;