// src/pages/Guest/FAQPage.js
import React from "react";

const FAQPage = () => {
    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6 text-supply-primary">Câu hỏi thường gặp</h1>
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold">Làm sao để mua hàng?</h2>
                    <p className="text-gray-700">Bạn có thể tìm kiếm sản phẩm, thêm vào giỏ và đăng nhập để đặt hàng.</p>
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Tôi có thể bán hàng như thế nào?</h2>
                    <p className="text-gray-700">Hãy đăng ký tài khoản và nộp yêu cầu mở gian hàng để bắt đầu bán.</p>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;