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
    List,
    Alert,
    Spin
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
    PlusOutlined,
    AppstoreOutlined,
    ReloadOutlined,
    BankOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../../services/dashboardService';
import { formatUserData, getRoleColor, getStatusColor } from '../../../utils/userValidation';

const { Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalMarkets: 0,
        totalStores: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCategories: 0,
        totalProductUnits: 0,
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
        setError(null);
        try {
            console.log('🔄 AdminDashboard - Loading dashboard data...');
            
            // Load dashboard statistics từ API
            const stats = await dashboardService.getDashboardStats();
            console.log('📊 AdminDashboard - Dashboard stats received:', stats);
            setDashboardStats(stats);

            // Load recent users từ API
            const users = await dashboardService.getRecentUsers();
            console.log('👥 AdminDashboard - Recent users received:', users);
            setRecentUsers(users.map(formatUserData));

            // Load recent activities
            const activities = await dashboardService.getRecentActivities();
            console.log('📝 AdminDashboard - Recent activities received:', activities);
            setRecentActivities(activities);

        } catch (error) {
            console.error('❌ AdminDashboard - Error loading dashboard data:', error);
            setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadDashboardData();
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
            icon: <BankOutlined />,
            color: '#52c41a',
            suffix: 'chợ'
        },
        {
            title: 'Tổng số cửa hàng',
            value: dashboardStats.totalStores,
            icon: <ShopOutlined />,
            color: '#13c2c2',
            suffix: 'cửa hàng'
        },
        {
            title: 'Tổng danh mục',
            value: dashboardStats.totalCategories,
            icon: <AppstoreOutlined />,
            color: '#722ed1',
            suffix: 'danh mục'
        },
        {
            title: 'Đơn vị sản phẩm',
            value: dashboardStats.totalProductUnits,
            icon: <AppstoreOutlined />,
            color: '#fa8c16',
            suffix: 'đơn vị'
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
            title: 'Quản lý đơn vị sản phẩm',
            description: 'Quản lý đơn vị đo lường',
            icon: <AppstoreOutlined />,
            color: '#722ed1',
            onClick: () => navigate('/admin/product-units')
        },
        {
            title: 'Quản lý cửa hàng',
            description: 'Quản lý các cửa hàng trong hệ thống',
            icon: <ShopOutlined />,
            color: '#faad14',
            onClick: () => navigate('/admin/stores')
        },
        {
            title: 'Báo cáo',
            description: 'Xem báo cáo và thống kê',
            icon: <RiseOutlined />,
            color: '#13c2c2',
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
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2}>Dashboard Quản trị</Title>
                    <Text type="secondary">Tổng quan hệ thống LocalMart</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<ReloadOutlined />} 
                    onClick={handleRefresh}
                    loading={loading}
                >
                    Làm mới
                </Button>
            </div>

            {error && (
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: '24px' }}
                />
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>
                        <Text>Đang tải dữ liệu dashboard...</Text>
                    </div>
                </div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                        {statsCards.map((stat, index) => (
                            <Col xs={24} sm={12} lg={8} xl={4.8} key={index}>
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
                        <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={index}>
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
                                <Text strong>
                                    {dashboardStats.totalUsers > 0 
                                        ? `${((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100).toFixed(1)}%`
                                        : '0%'
                                    }
                                </Text>
                            </div>
                            <Progress
                                percent={dashboardStats.totalUsers > 0 
                                    ? (dashboardStats.activeUsers / dashboardStats.totalUsers) * 100
                                    : 0
                                }
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
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
