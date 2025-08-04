import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Descriptions,
    Avatar,
    Button,
    Space,
    Tag,
    Divider,
    Statistic,
    Alert,
    Spin,
    Badge
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    SafetyCertificateOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DashboardOutlined,
    TeamOutlined,
    ShopOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import authService from '../../../services/authService';

const { Title, Text, Paragraph } = Typography;

const AdminProfile = () => {
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Mock admin statistics - trong thực tế sẽ lấy từ API
    const [adminStats, setAdminStats] = useState({
        totalUsers: 0,
        totalStores: 0,
        totalOrders: 0,
        systemUptime: '99.9%',
        lastLogin: null,
        loginCount: 0
    });

    useEffect(() => {
        console.log('AdminProfile - Current user data:', user);
        loadProfileData();
        loadAdminStatistics();
    }, []); // Remove user dependency to avoid infinite loops

    // Separate effect to reload when user changes
    useEffect(() => {
        if (user?.id) {
            console.log('AdminProfile - User changed, reloading profile data');
            loadProfileData();
        }
    }, [user?.id]);

    // Reload data when component becomes visible (e.g., navigating back from edit)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && user?.id) {
                console.log('AdminProfile - Page became visible, reloading data');
                loadProfileData();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user?.id]);

    const loadProfileData = async () => {
        setLoading(true);
        console.log('AdminProfile - Loading profile data for user:', user);
        try {
            // Lấy thông tin user hiện tại từ API thay vì dùng cache
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
                            console.log('AdminProfile - API response:', userData);
                            
                            setProfileData({
                                id: userData.id,
                                username: userData.username,
                                fullName: userData.fullName,
                                email: userData.email,
                                phoneNumber: userData.phoneNumber,
                                role: userData.role,
                                status: userData.status,
                                createdAt: userData.createdAt,
                                lastLogin: userData.updatedAt,
                                department: 'Công nghệ thông tin',
                                level: 'Admin'
                            });
                            return; // Exit early if API call successful
                        }
                    }
                } catch (apiError) {
                    console.error('API call failed, falling back to user data:', apiError);
                }
            }
            
            // Fallback: sử dụng dữ liệu từ user object nếu API call thất bại
            console.log('AdminProfile - Using fallback user data:', user);
            setProfileData({
                id: user?.id || 'admin-001',
                username: user?.username || 'admin',
                fullName: user?.fullName || 'Quản trị viên hệ thống',
                email: user?.email || 'Chưa cập nhật',
                phoneNumber: user?.phoneNumber || 'Chưa cập nhật',
                role: user?.role || 'Admin',
                status: user?.status || 'Active',
                createdAt: user?.createdAt || '2024-01-01T00:00:00Z',
                lastLogin: new Date().toISOString(),
                permissions: [
                    'Quản lý người dùng',
                    'Quản lý cửa hàng',
                    'Quản lý sản phẩm',
                    'Quản lý đơn hàng',
                    'Quản lý hệ thống',
                    'Xem báo cáo'
                ],
                department: 'Công nghệ thông tin',
                level: 'Admin'
            });
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAdminStatistics = async () => {
        try {
            // Mock statistics - trong thực tế sẽ gọi API
            setAdminStats({
                totalUsers: 1248,
                totalStores: 89,
                totalOrders: 5674,
                systemUptime: '99.9%',
                lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                loginCount: 234
            });
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'green';
            case 'Inactive': return 'red';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="mb-6">
                <Title level={2} className="flex items-center gap-2 mb-2">
                    <UserOutlined className="text-blue-600" />
                    Hồ sơ quản trị viên
                </Title>
            </div>

            <Row gutter={[24, 24]}>
                {/* Profile Information */}
                <Col span={16}>
                    <Card
                        title={
                            <Space>
                                <SafetyCertificateOutlined />
                                <span>Thông tin cá nhân</span>
                            </Space>
                        }
                        extra={
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => navigate('/admin/profile/edit')}
                            >
                                Chỉnh sửa
                            </Button>
                        }
                        className="shadow-sm"
                    >
                        <div className="flex items-start space-x-6 mb-6">
                            <Avatar 
                                size={80} 
                                icon={<UserOutlined />}
                                className="bg-blue-500"
                            />
                            <div className="flex-1">
                                <Title level={3} className="mb-2">
                                    {profileData?.fullName}
                                </Title>
                                <Space wrap>
                                    <Tag color="blue" icon={<UserOutlined />}>
                                        {profileData?.role}
                                    </Tag>
                                    <Tag color={getStatusColor(profileData?.status)}>
                                        {profileData?.status === 'Active' ? 'Hoạt động' : 'Ngưng hoạt động'}
                                    </Tag>
                                </Space>
                                <Paragraph className="mt-3 mb-0" type="secondary">
                                    ID: {profileData?.id}
                                </Paragraph>
                            </div>
                        </div>

                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="Tên đăng nhập" span={1}>
                                <Text strong>{profileData?.username}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Họ và tên" span={1}>
                                {profileData?.fullName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email" span={1}>
                                <Space>
                                    <MailOutlined />
                                    {profileData?.email}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại" span={1}>
                                <Space>
                                    <PhoneOutlined />
                                    {profileData?.phoneNumber}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phòng ban" span={1}>
                                {profileData?.department}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cấp độ" span={1}>
                                <Tag color="gold">{profileData?.level}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo tài khoản" span={1}>
                                <Space>
                                    <CalendarOutlined />
                                    {formatDate(profileData?.createdAt)}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Đăng nhập lần cuối" span={1}>
                                <Space>
                                    <ClockCircleOutlined />
                                    {formatDate(profileData?.lastLogin)}
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Permissions */}
                    <Card
                        title={
                            <Space>
                                <SafetyCertificateOutlined />
                                <span>Quyền hạn hệ thống</span>
                            </Space>
                        }
                        className="mt-6 shadow-sm"
                    >
                        <Alert
                            message="Quyền quản trị cao nhất"
                            description="Tài khoản này có quyền truy cập và quản lý toàn bộ hệ thống LocalMart."
                            type="info"
                            showIcon
                            className="mb-4"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                            {profileData?.permissions?.map((permission, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                    <SafetyCertificateOutlined className="text-green-500" />
                                    <span>{permission}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>

                {/* Statistics & Quick Actions */}
                <Col span={8}>
                    {/* Quick Actions */}
                    <Card
                        title={
                            <Space>
                                <SettingOutlined />
                                <span>Thao tác nhanh</span>
                            </Space>
                        }
                        className="mb-6 shadow-sm"
                    >
                        <Space direction="vertical" className="w-full">
                            <Button
                                type="primary"
                                icon={<LockOutlined />}
                                block
                                onClick={() => navigate('/admin/change-password')}
                            >
                                Đổi mật khẩu
                            </Button>
                            <Button
                                icon={<DashboardOutlined />}
                                block
                                onClick={() => navigate('/admin')}
                            >
                                Về Dashboard
                            </Button>
                        </Space>
                    </Card>

                    {/* Admin Statistics */}
                    <Card>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Text type="secondary">Số lần đăng nhập:</Text>
                                <Badge count={adminStats.loginCount} showZero />
                            </div>
                            <div className="flex justify-between items-center">
                                <Text type="secondary">Đăng nhập gần nhất:</Text>
                                <Text>{adminStats.lastLogin ? formatDate(adminStats.lastLogin) : 'Chưa xác định'}</Text>
                            </div>
                        </div>
                    </Card>

                    {/* Security Info */}
                    <Card
                        title={
                            <Space>
                                <SafetyCertificateOutlined />
                                <span>Bảo mật</span>
                            </Space>
                        }
                        className="mt-6 shadow-sm"
                    >
                        <div className="space-y-4">
                            <Alert
                                message="Tài khoản được bảo mật"
                                description="Tài khoản admin của bạn được bảo vệ bởi các biện pháp bảo mật cao nhất."
                                type="success"
                                showIcon
                                size="small"
                            />
                            
                            <div className="text-sm space-y-2">
                                <div className="flex items-center justify-between">
                                    <span>Xác thực 2 lớp:</span>
                                    <Tag color="green">Đã bật</Tag>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Mã hóa dữ liệu:</span>
                                    <Tag color="green">AES-256</Tag>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Session timeout:</span>
                                    <Tag color="blue">8 giờ</Tag>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminProfile;
