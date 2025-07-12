import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Select,
    Button,
    Space,
    message,
    Row,
    Col,
    Steps,
    Divider
} from 'antd';
import { 
    UserAddOutlined, 
    ArrowLeftOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import userService from '../../../services/userService';

const { Option } = Select;
const { Step } = Steps;

const CreateUser = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const response = await userService.createUser(values);
            if (response.success) {
                message.success('Tạo người dùng thành công');
                form.resetFields();
                navigate('/admin/users');
            } else {
                message.error(response.message || 'Tạo người dùng thất bại');
            }
        } catch (error) {
            message.error('Tạo người dùng thất bại: ' + error.message);
        }
        setLoading(false);
    };

    const handleNext = () => {
        form.validateFields(['username', 'password', 'email', 'fullName'])
            .then(() => {
                setCurrentStep(1);
            })
            .catch(() => {
                message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            });
    };

    const handlePrev = () => {
        setCurrentStep(0);
    };

    const steps = [
        {
            title: 'Thông tin cơ bản',
            icon: <UserOutlined />,
            description: 'Tên đăng nhập, mật khẩu, email'
        },
        {
            title: 'Thông tin chi tiết',
            icon: <PhoneOutlined />,
            description: 'Số điện thoại, địa chỉ, vai trò'
        }
    ];

    return (
        <div>
            <Card 
                title={
                    <Space>
                        <UserAddOutlined />
                        Thêm người dùng mới
                    </Space>
                }
                extra={
                    <Button 
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/users')}
                    >
                        Quay lại
                    </Button>
                }
                style={{ marginBottom: 24 }}
            >
                <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        role: 'Buyer'
                    }}
                >
                    {currentStep === 0 && (
                        <div>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        name="username"
                                        label="Tên đăng nhập"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                                            { min: 3, message: 'Tên đăng nhập ít nhất 3 ký tự' },
                                            { max: 50, message: 'Tên đăng nhập tối đa 50 ký tự' },
                                            { 
                                                pattern: /^[a-zA-Z0-9_.-]+$/, 
                                                message: 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới, chấm và gạch ngang' 
                                            }
                                        ]}
                                    >
                                        <Input 
                                            prefix={<UserOutlined />}
                                            placeholder="Nhập tên đăng nhập" 
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="password"
                                        label="Mật khẩu"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                                            { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' }
                                        ]}
                                    >
                                        <Input.Password placeholder="Nhập mật khẩu" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        name="fullName"
                                        label="Họ và tên"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập họ và tên' },
                                            { min: 2, message: 'Họ và tên ít nhất 2 ký tự' }
                                        ]}
                                    >
                                        <Input 
                                            prefix={<UserOutlined />}
                                            placeholder="Nhập họ và tên đầy đủ" 
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email' },
                                            { type: 'email', message: 'Email không hợp lệ' }
                                        ]}
                                    >
                                        <Input 
                                            prefix={<MailOutlined />}
                                            placeholder="Nhập địa chỉ email" 
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div style={{ textAlign: 'right', marginTop: 24 }}>
                                <Button type="primary" onClick={handleNext}>
                                    Tiếp theo
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Số điện thoại"
                                        rules={[
                                            { 
                                                pattern: /^[0-9+\-\s()]+$/, 
                                                message: 'Số điện thoại không hợp lệ' 
                                            }
                                        ]}
                                    >
                                        <Input 
                                            prefix={<PhoneOutlined />}
                                            placeholder="Nhập số điện thoại" 
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="role"
                                        label="Vai trò"
                                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                                    >
                                        <Select placeholder="Chọn vai trò">
                                            <Option value="Admin">
                                                <Space>
                                                    <UserOutlined style={{ color: '#1890ff' }} />
                                                    Admin
                                                </Space>
                                            </Option>
                                            <Option value="Seller">
                                                <Space>
                                                    <UserOutlined style={{ color: '#52c41a' }} />
                                                    Người bán
                                                </Space>
                                            </Option>
                                            <Option value="Buyer">
                                                <Space>
                                                    <UserOutlined style={{ color: '#722ed1' }} />
                                                    Người mua
                                                </Space>
                                            </Option>
                                            <Option value="ProxyShopper">
                                                <Space>
                                                    <UserOutlined style={{ color: '#fa8c16' }} />
                                                    Người mua hộ
                                                </Space>
                                            </Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                            >
                                <Input.TextArea 
                                    rows={3} 
                                    placeholder="Nhập địa chỉ chi tiết"
                                />
                            </Form.Item>

                            <Divider />

                            <div style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button onClick={handlePrev}>
                                        Quay lại
                                    </Button>
                                    <Button onClick={() => form.resetFields()}>
                                        Đặt lại
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit"
                                        loading={loading}
                                        icon={<UserAddOutlined />}
                                    >
                                        Tạo người dùng
                                    </Button>
                                </Space>
                            </div>
                        </div>
                    )}
                </Form>
            </Card>

            {/* Help Card */}
            <Card title="Hướng dẫn" size="small">
                <Row gutter={16}>
                    <Col span={8}>
                        <div>
                            <strong>Tên đăng nhập:</strong>
                            <ul style={{ fontSize: '12px', marginTop: 4 }}>
                                <li>Từ 3-50 ký tự</li>
                                <li>Chỉ chứa chữ, số, _, ., -</li>
                                <li>Không được trùng</li>
                            </ul>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div>
                            <strong>Mật khẩu:</strong>
                            <ul style={{ fontSize: '12px', marginTop: 4 }}>
                                <li>Tối thiểu 6 ký tự</li>
                                <li>Nên kết hợp chữ và số</li>
                                <li>Có thể thay đổi sau</li>
                            </ul>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div>
                            <strong>Vai trò:</strong>
                            <ul style={{ fontSize: '12px', marginTop: 4 }}>
                                <li>Admin: Toàn quyền hệ thống</li>
                                <li>Seller: Bán hàng</li>
                                <li>Buyer: Mua hàng (mặc định)</li>
                                <li>ProxyShopper: Mua hộ</li>
                            </ul>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default CreateUser;
