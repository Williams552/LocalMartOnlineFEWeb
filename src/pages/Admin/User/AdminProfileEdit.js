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
import authService from '../../../services/authService';

const { Title, Text } = Typography;

const AdminProfileEdit = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [profileData, setProfileData] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Load profile data from API
    const loadProfileData = async () => {
        setDataLoading(true);
        try {
            const userId = user?.id;
            if (userId) {
                try {
                    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5183';
                    const response = await fetch(`${API_URL}/api/user/${userId}`, {
                        method: 'GET',
                        headers: {
                            'accept': '*/*',
                            'Authorization': `Bearer ${authService.getToken()}`
                        }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data) {
                            const userData = result.data;
                            console.log('AdminProfileEdit - API response:', userData);

                            setProfileData(userData);

                            // Set form values with API data
                            form.setFieldsValue({
                                username: userData.username || '',
                                fullName: userData.fullName || '',
                                email: userData.email || '',
                                phone: userData.phoneNumber || ''
                            });
                            return;
                        }
                    }
                } catch (apiError) {
                    console.error('API call failed in Edit, using fallback:', apiError);
                }
            }

            // Fallback to user object
            form.setFieldsValue({
                username: user?.username || '',
                fullName: user?.fullName || '',
                email: user?.email || '',
                phone: user?.phoneNumber || '',
                department: 'Công nghệ thông tin',
                position: 'Quản trị viên hệ thống'
            });
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        loadProfileData();
    }, [user, form]);

    const handleSubmit = async (values) => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const userId = user?.id;
            if (!userId) {
                throw new Error('Không tìm thấy ID người dùng');
            }

            // Prepare update data
            const updateData = {
                fullName: values.fullName,
                email: values.email,
                phoneNumber: values.phone
            };

            console.log('AdminProfileEdit - Updating profile:', updateData);

            // Call API to update profile
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5183';
            const response = await fetch(`${API_URL}/api/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setSuccess("Cập nhật thông tin thành công!");

                    // Reload user data from API to ensure we have the latest info
                    try {
                        const getResponse = await fetch(`${API_URL}/api/user/${userId}`, {
                            method: 'GET',
                            headers: {
                                'accept': '*/*',
                                'Authorization': `Bearer ${authService.getToken()}`
                            }
                        });

                        if (getResponse.ok) {
                            const getResult = await getResponse.json();
                            if (getResult.success && getResult.data) {
                                console.log('AdminProfileEdit - Refreshed user data after update:', getResult.data);
                                // Optionally update the auth context here if needed
                                // authService.setUser(getResult.data);
                            }
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing user data:', refreshError);
                    }

                    setTimeout(() => {
                        navigate('/admin/profile');
                    }, 1500);
                } else {
                    throw new Error(result.message || 'Cập nhật thất bại');
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật');
            }
        } catch (err) {
            console.error("Update profile error:", err);
            setError(err.message || "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Space direction="vertical" align="center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <Text>Đang tải thông tin...</Text>
                </Space>
            </div>
        );
    }

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
                                            placeholder="Nhập địa chỉ email"
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

                            {/* <Row gutter={16}>
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
                            </Row> */}

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
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminProfileEdit;
