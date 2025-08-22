import React, { useState } from "react";
import { Card, Form, Input, Button, Alert, Typography, Space, Divider } from "antd";
import { LockOutlined, SaveOutlined, KeyOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../../../services/authService";

const { Title, Text } = Typography;

const AdminChangePassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const validatePassword = (_, value) => {
        if (!value) {
            return Promise.reject(new Error('Vui lòng nhập mật khẩu mới!'));
        }
        if (value.length < 8) {
            return Promise.reject(new Error('Mật khẩu phải có ít nhất 8 ký tự!'));
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!'));
        }
        return Promise.resolve();
    };

    const validateConfirmPassword = ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
        },
    });

    const handleSubmit = async (values) => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const result = await authService.changePassword(values.oldPassword, values.newPassword);
            
            if (result.success) {
                setSuccess("Đổi mật khẩu thành công! Hệ thống sẽ tự động đăng xuất sau 3 giây...");
                form.resetFields();
                
                // Auto logout after 3 seconds for security
                setTimeout(() => {
                    authService.logout();
                    navigate("/login");
                }, 3000);
            } else {
                setError(result.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
            }
        } catch (err) {
            console.error("Change password error:", err);
            setError(err.message || "Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2} className="flex items-center gap-2 mb-2">
                    <SafetyCertificateOutlined className="text-blue-600" />
                    Đổi mật khẩu
                </Title>
            </div>

            <div className="max-w-2xl">
                <Card 
                    title={
                        <Space>
                            <LockOutlined />
                            <span>Thông tin mật khẩu</span>
                        </Space>
                    }
                    className="shadow-sm"
                >

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        size="large"
                        className="space-y-4"
                    >
                        <Form.Item
                            label="Mật khẩu hiện tại"
                            name="oldPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<KeyOutlined />}
                                placeholder="Nhập mật khẩu hiện tại"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Divider />

                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { validator: validatePassword }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Nhập mật khẩu mới"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                validateConfirmPassword
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Nhập lại mật khẩu mới"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        {/* Error and Success Messages */}
                        {error && (
                            <Alert
                                message="Lỗi"
                                description={error}
                                type="error"
                                showIcon
                                closable
                                onClose={() => setError("")}
                            />
                        )}

                        {success && (
                            <Alert
                                message="Thành công"
                                description={success}
                                type="success"
                                showIcon
                            />
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button 
                                onClick={() => navigate("/admin")}
                                size="large"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<SaveOutlined />}
                                size="large"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                            </Button>
                        </div>
                    </Form>
                </Card>

                {/* Additional Security Information */}
                <Card className="mt-6 shadow-sm">
                    <Title level={4} className="flex items-center gap-2 mb-4">
                        <SafetyCertificateOutlined className="text-green-600" />
                        Bảo mật tài khoản
                    </Title>
                    <div className="space-y-3 text-gray-600">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                                <strong>Đăng xuất tự động:</strong> Sau khi đổi mật khẩu thành công, 
                                hệ thống sẽ tự động đăng xuất để đảm bảo bảo mật.
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                                <strong>Bảo mật cao:</strong> Mật khẩu được mã hóa và lưu trữ an toàn 
                                trong hệ thống.
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                            <div>
                                <strong>Khuyến nghị:</strong> Thường xuyên thay đổi mật khẩu và không 
                                chia sẻ thông tin đăng nhập với người khác.
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminChangePassword;
