// src/pages/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
    Layout,
    Menu,
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Button,
    Space,
    Avatar,
    Badge,
    Typography,
    Divider,
    Progress,
    List
} from 'antd';
import {
    UserOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    DollarCircleOutlined,
    RiseOutlined,
    WarningOutlined,
    BellOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import userService from '../../../services/userService';
import { formatUserData, getRoleColor, getStatusColor } from '../../../utils/userValidation';
import TestAPI from '../../../components/TestAPI';

const { Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalMarkets: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeUsers: 0,
        pendingApprovals: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load recent users
            const usersResponse = await userService.getAllUsers({ page: 1, limit: 5 });
            if (usersResponse?.data) {
                setRecentUsers(usersResponse.data.map(formatUserData));
            }

            // Mock statistics - thay thế bằng API calls thực tế
            setDashboardStats({
                totalUsers: 1247,
                totalMarkets: 89,
                totalOrders: 3421,
                totalRevenue: 2847391,
                activeUsers: 1098,
                pendingApprovals: 23
            });

            // Mock recent activities
            setRecentActivities([
                { id: 1, action: 'Đăng ký người dùng mới', user: 'Nguyễn Văn A', time: '5 phút trước', type: 'user' },
                { id: 2, action: 'Tạo cửa hàng mới', user: 'Trần Thị B', time: '10 phút trước', type: 'store' },
                { id: 3, action: 'Đặt hàng mới', user: 'Lê Văn C', time: '15 phút trước', type: 'order' },
                { id: 4, action: 'Yêu cầu hỗ trợ', user: 'Phạm Thị D', time: '20 phút trước', type: 'support' },
                { id: 5, action: 'Báo cáo vi phạm', user: 'Hoàng Văn E', time: '25 phút trước', type: 'report' }
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statsCards = [
        {
            title: 'Tổng số người dùng',
            value: dashboardStats.totalUsers,
            icon: <UserOutlined />,
            color: '#1890ff',
            suffix: 'người dùng'
        },
        {
            title: 'Tổng số chợ',
            value: dashboardStats.totalMarkets,
            icon: <ShopOutlined />,
            color: '#52c41a',
            suffix: 'chợ'
        },
        {
            title: 'Tổng số đơn hàng',
            value: dashboardStats.totalOrders,
            icon: <ShoppingCartOutlined />,
            color: '#faad14',
            suffix: 'đơn hàng'
        },
        {
            title: 'Doanh thu tổng',
            value: dashboardStats.totalRevenue,
            icon: <DollarCircleOutlined />,
            color: '#f5222d',
            formatter: (value) => `${value?.toLocaleString('vi-VN')} VNĐ`
        }
    ];

    const quickActions = [
        {
            title: 'Quản lý người dùng',
            description: 'Thêm, sửa, xóa người dùng',
            icon: <UserOutlined />,
            color: '#1890ff',
            onClick: () => navigate('/admin/users')
        },
        {
            title: 'Quản lý chợ',
            description: 'Quản lý các chợ trong hệ thống',
            icon: <ShopOutlined />,
            color: '#52c41a',
            onClick: () => navigate('/admin/markets')
        },
        {
            title: 'Quản lý đơn hàng',
            description: 'Theo dõi và xử lý đơn hàng',
            icon: <ShoppingCartOutlined />,
            color: '#faad14',
            onClick: () => navigate('/admin/orders')
        },
        {
            title: 'Báo cáo',
            description: 'Xem báo cáo và thống kê',
            icon: <RiseOutlined />,
            color: '#722ed1',
            onClick: () => navigate('/admin/reports')
        }
    ];

    const userColumns = [
        {
            title: 'Người dùng',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.fullName || text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={getRoleColor(role)}>
                    {role}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/admin/users/${record.id}`)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/admin/users/edit/${record.id}`)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2}>Dashboard Quản trị</Title>
                <Text type="secondary">Tổng quan hệ thống LocalMart</Text>
            </div>

            {/* Debug Component - Temporarily added */}
            <TestAPI />

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                {statsCards.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                                suffix={stat.suffix}
                                formatter={stat.formatter}
                                valueStyle={{ color: stat.color }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Quick Actions */}
            <Card title="Thao tác nhanh" style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]}>
                    {quickActions.map((action, index) => (
                        <Col xs={24} sm={12} lg={6} key={index}>
                            <Card
                                hoverable
                                onClick={action.onClick}
                                style={{ textAlign: 'center', cursor: 'pointer' }}
                            >
                                <div style={{ fontSize: '32px', color: action.color, marginBottom: '16px' }}>
                                    {action.icon}
                                </div>
                                <Title level={4}>{action.title}</Title>
                                <Text type="secondary">{action.description}</Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>

            <Row gutter={[16, 16]}>
                {/* Recent Users */}
                <Col xs={24} lg={14}>
                    <Card
                        title="Người dùng mới nhất"
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/admin/users/create')}
                            >
                                Thêm người dùng
                            </Button>
                        }
                    >
                        <Table
                            dataSource={recentUsers}
                            columns={userColumns}
                            pagination={false}
                            loading={loading}
                            size="small"
                        />
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Button onClick={() => navigate('/admin/users')}>
                                Xem tất cả
                            </Button>
                        </div>
                    </Card>
                </Col>

                {/* Recent Activities */}
                <Col xs={24} lg={10}>
                    <Card title="Hoạt động gần đây">
                        <List
                            dataSource={recentActivities}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                icon={
                                                    item.type === 'user' ? <UserOutlined /> :
                                                        item.type === 'store' ? <ShopOutlined /> :
                                                            item.type === 'order' ? <ShoppingCartOutlined /> :
                                                                item.type === 'support' ? <BellOutlined /> :
                                                                    <WarningOutlined />
                                                }
                                                style={{
                                                    backgroundColor:
                                                        item.type === 'user' ? '#1890ff' :
                                                            item.type === 'store' ? '#52c41a' :
                                                                item.type === 'order' ? '#faad14' :
                                                                    item.type === 'support' ? '#722ed1' :
                                                                        '#f5222d'
                                                }}
                                            />
                                        }
                                        title={item.action}
                                        description={
                                            <div>
                                                <div>Bởi: {item.user}</div>
                                                <div style={{ fontSize: '11px', color: '#999' }}>{item.time}</div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>

                    {/* System Status */}
                    <Card title="Trạng thái hệ thống" style={{ marginTop: '16px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <Text>Người dùng hoạt động</Text>
                                <Text strong>{((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100).toFixed(1)}%</Text>
                            </div>
                            <Progress
                                percent={(dashboardStats.activeUsers / dashboardStats.totalUsers) * 100}
                                strokeColor="#52c41a"
                                showInfo={false}
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <Text>Yêu cầu chờ duyệt</Text>
                                <Badge count={dashboardStats.pendingApprovals} />
                            </div>
                            <Button
                                type="link"
                                size="small"
                                onClick={() => navigate('/admin/approvals')}
                            >
                                Xem chi tiết
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
