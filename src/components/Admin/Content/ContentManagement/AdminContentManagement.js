import React from "react";

const AdminContentManagement = () => {
    return (
        <div className="admin-content-management p-4">
            <h2 className="text-2xl font-bold mb-4">Quản lý Nội dung</h2>
            <ul className="space-y-2 list-disc list-inside">
                <li>
                    <a href="/system/admin/faq-management" className="text-blue-600 hover:underline">
                        Quản lý Câu hỏi thường gặp (FAQ)
                    </a>
                </li>
                <li>
                    <a href="/system/admin/policy-management" className="text-blue-600 hover:underline">
                        Cập nhật Chính sách sử dụng
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default AdminContentManagement;
