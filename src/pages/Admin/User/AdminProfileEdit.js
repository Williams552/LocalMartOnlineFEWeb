import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Alert,
    Typography,
    Space,
    Row,
    Col,
    Avatar,
    Upload,
    message
} from 'antd';
import {
    UserOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    UploadOutlined,
    MailOutlined,
    PhoneOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const { Title, Text } = Typography;

const AdminProfileEdit = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Set initial form values
        form.setFieldsValue({
            username: user?.username || '',
            fullName: user?.fullName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            department: 'Công nghệ thông tin',
            position: 'Quản trị viên hệ thống'
        });
    }, [user, form]);

    const handleSubmit = async (values) => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // Trong thực tế sẽ gọi API để cập nhật thông tin
            // const result = await adminService.updateProfile(values);
            
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccess("Cập nhật thông tin thành công!");
            
            setTimeout(() => {
                navigate('/admin/profile');
            }, 1500);
        } catch (err) {
            console.error("Update profile error:", err);
            setError("Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            message.success('Cập nhật ảnh đại diện thành công');
            setLoading(false);
        }
        if (info.file.status === 'error') {
            message.error('Lỗi khi tải ảnh lên');
            setLoading(false);
        }
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Chỉ được tải lên file JPG/PNG!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Ảnh phải nhỏ hơn 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Title level={2} className="flex items-center gap-2 mb-2">
                            <EditOutlined className="text-blue-600" />
                            Chỉnh sửa hồ sơ
                        </Title>
                        <Text type="secondary">
                            Cập nhật thông tin cá nhân của tài khoản quản trị viên
                        </Text>
                    </div>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/profile')}
                    >
                        Quay lại
                    </Button>
                </div>
            </div>

            <Row gutter={24}>
                <Col span={16}>
                    <Card
                        title={
                            <Space>
                                <UserOutlined />
                                <span>Thông tin cá nhân</span>
                            </Space>
                        }
                        className="shadow-sm"
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            size="large"
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Tên đăng nhập"
                                        name="username"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên đăng nhập!' }
                                        ]}
                                    >
                                        <Input
                                            prefix={<UserOutlined />}
                                            disabled
                                            placeholder="Tên đăng nhập"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Họ và tên"
                                        name="fullName"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập họ và tên!' }
                                        ]}
                                    >
                                        <Input
                                            prefix={<UserOutlined />}
                                            placeholder="Họ và tên"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không hợp lệ!' }
                                        ]}
                                    >
                                        <Input
                                            prefix={<MailOutlined />}
                                            placeholder="Email"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Số điện thoại"
                                        name="phone"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số điện thoại!' }
                                        ]}
                                    >
                                        <Input
                                            prefix={<PhoneOutlined />}
                                            placeholder="Số điện thoại"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Phòng ban"
                                        name="department"
                                    >
                                        <Input
                                            placeholder="Phòng ban"
                                            disabled
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Chức vụ"
                                        name="position"
                                    >
                                        <Input
                                            placeholder="Chức vụ"
                                            disabled
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Error and Success Messages */}
                            {error && (
                                <Alert
                                    message="Lỗi"
                                    description={error}
                                    type="error"
                                    showIcon
                                    closable
                                    onClose={() => setError("")}
                                    className="mb-4"
                                />
                            )}

                            {success && (
                                <Alert
                                    message="Thành công"
                                    description={success}
                                    type="success"
                                    showIcon
                                    className="mb-4"
                                />
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-4">
                                <Button 
                                    onClick={() => navigate('/admin/profile')}
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
                                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>

                <Col span={8}>
                    {/* Avatar Upload */}
                    <Card
                        title={
                            <Space>
                                <UserOutlined />
                                <span>Ảnh đại diện</span>
                            </Space>
                        }
                        className="shadow-sm mb-6"
                    >
                        <div className="text-center">
                            <Avatar 
                                size={120} 
                                icon={<UserOutlined />}
                                className="bg-blue-500 mb-4"
                            />
                        </div>
                    </Card>

                    {/* Security Note */}
                    <Card
                        title="Lưu ý bảo mật"
                        className="shadow-sm"
                    >
                        <div className="space-y-3 text-sm">
                            <Alert
                                message="Thông tin quan trọng"
                                description="Một số thông tin như tên đăng nhập, phòng ban và chức vụ không thể thay đổi vì lý do bảo mật."
                                type="info"
                                showIcon
                                size="small"
                            />
                            
                            <div className="space-y-2 text-gray-600">
                                <div>• Email sẽ được sử dụng để khôi phục tài khoản</div>
                                <div>• Số điện thoại dùng cho xác thực 2 lớp</div>
                                <div>• Mọi thay đổi sẽ được ghi log hệ thống</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminProfileEdit;
