import React, { useState } from "react";
import { FaLock, FaSave } from "react-icons/fa";

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { changePassword } = require("../../services/authService");
    const navigate = require("react-router-dom").useNavigate();

    const validateForm = () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin.");
            return false;
        }
        if (newPassword.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return false;
        }
        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới và xác nhận không khớp.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!validateForm()) return;
        setLoading(true);
        try {
            const result = await changePassword(oldPassword, newPassword);
            if (result.success) {
                setSuccess("Đổi mật khẩu thành công! Đang chuyển về trang hồ sơ...");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => {
                    navigate("/profile");
                }, 500);
            } else {
                setError(result.message || "Đổi mật khẩu thất bại.");
            }
        } catch (err) {
            setError(err.message || "Đổi mật khẩu thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center space-x-2">
                    <FaLock />
                    <span>Đổi mật khẩu</span>
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-supply-primary"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    {success && <div className="text-green-600 text-sm">{success}</div>}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                        ) : (
                            <FaSave className="mr-2" />
                        )}
                        Đổi mật khẩu
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
