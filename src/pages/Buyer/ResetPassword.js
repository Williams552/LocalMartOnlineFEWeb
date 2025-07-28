import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../services/authService";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || !email) {
            toast.error("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
            navigate("/login");
        }
    }, [token, email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            const res = await resetPassword(email, token, newPassword);
            if (res.success) {
                toast.success("Đặt lại mật khẩu thành công.");
                navigate("/login");
            } else {
                toast.error(res.message || "Lỗi đặt lại mật khẩu.");
            }
        } catch (err) {
            toast.error("Đã xảy ra lỗi khi đặt lại mật khẩu.");
        }
    };

    return (
        <div className="reset-password-page">
            <h2>Đặt lại mật khẩu</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit">Xác nhận</button>
            </form>
        </div>
    );
};

export default ResetPassword;
