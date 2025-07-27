import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Select,
    DatePicker,
    Space,
    Button,
    Progress,
    Divider
} from 'antd';
import {
    UserOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    DollarCircleOutlined,
    RiseOutlined,
    FallOutlined,
    EyeOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import userService from '../../../services/userService';

const { Option } = Select;
const { RangePicker } = DatePicker;

const UserAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('30days');
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalBuyers: 0,
        totalSellers: 0,
        totalProxyShoppers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        newUsersThisMonth: 0,
        userGrowthRate: 0
    });

    const [usersByRole, setUsersByRole] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            // Load user statistics
            const statsResponse = await userService.getUserStatistics();
            if (statsResponse.success) {
                setStatistics(statsResponse.data);
            }

            // Load all users to analyze
            const usersResponse = await userService.getAllUsers();
            if (usersResponse.success) {
                const users = usersResponse.data.Data || usersResponse.data.data || [];
                processUserData(users);
            }
        } catch (error) {
            console.error('Lỗi khi tải analytics:', error);
        }
        setLoading(false);
    };

    const processUserData = (users) => {
        // Group users by role for chart
        const roleGroups = users.reduce((acc, user) => {
            const role = user.role || 'Unknown';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});

        const roleData = Object.entries(roleGroups).map(([role, count]) => ({
            role,
            count,
            percentage: ((count / users.length) * 100).toFixed(1)
        }));

        setUsersByRole(roleData);

        // Get recent users (sort by createdAt or id)
        const sortedUsers = users
            .filter(user => user.createdAt || user.id)
            .sort((a, b) => {
                const dateA = new Date(a.createdAt || a.id);
                const dateB = new Date(b.createdAt || b.id);
                return dateB - dateA;
            })
            .slice(0, 10);

        setRecentUsers(sortedUsers);
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin': return 'geekblue';
            case 'Seller': return 'volcano';
            case 'Buyer': return 'green';
            case 'Proxy Shopper': return 'orange';
            default: return 'gray';
        }
    };

    const exportData = () => {
        // Export analytics data to CSV
        const csvData = [
            ['Vai trò', 'Số lượng', 'Phần trăm'],
            ...usersByRole.map(item => [item.role, item.count, item.percentage + '%'])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user-analytics.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const recentUsersColumns = [
        {
            title: 'Người dùng',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{record.fullName || text}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
                </div>
            )
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={getRoleColor(role)}>{role}</Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                const isActive = status === 'Active' || record.isActive === true;
                return (
                    <Tag color={isActive ? 'green' : 'red'}>
                        {isActive ? 'Hoạt động' : 'Bị khóa'}
                    </Tag>
                );
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
        }
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Phân tích người dùng</h2>
                    <p style={{ color: '#666', margin: 0 }}>Thống kê và phân tích dữ liệu người dùng hệ thống</p>
                </div>
                <Space>
                    <Select value={timeRange} onChange={setTimeRange} style={{ width: 150 }}>
                        <Option value="7days">7 ngày qua</Option>
                        <Option value="30days">30 ngày qua</Option>
                        <Option value="90days">90 ngày qua</Option>
                        <Option value="1year">1 năm qua</Option>
                    </Select>
                    <Button icon={<DownloadOutlined />} onClick={exportData}>
                        Xuất dữ liệu
                    </Button>
                </Space>
            </div>

            {/* Key Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng người dùng"
                            value={statistics.totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Người bán"
                            value={statistics.totalSellers}
                            valueStyle={{ color: '#52c41a' }}
                            suffix={
                                <small style={{ color: '#666' }}>
                                    ({((statistics.totalSellers / statistics.totalUsers) * 100 || 0).toFixed(1)}%)
                                </small>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Người mua"
                            value={statistics.totalBuyers}
                            valueStyle={{ color: '#722ed1' }}
                            suffix={
                                <small style={{ color: '#666' }}>
                                    ({((statistics.totalBuyers / statistics.totalUsers) * 100 || 0).toFixed(1)}%)
                                </small>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ hoạt động"
                            value={(statistics.activeUsers / statistics.totalUsers * 100 || 0).toFixed(1)}
                            suffix="%"
                            valueStyle={{ color: '#52c41a' }}
                            prefix={statistics.userGrowthRate > 0 ? <RiseOutlined /> : <FallOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* User Distribution by Role */}
                <Col xs={24} lg={12}>
                    <Card title="Phân bố theo vai trò" loading={loading}>
                        <div style={{ padding: '20px 0' }}>
                            {usersByRole.map((item, index) => (
                                <div key={index} style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span>
                                            <Tag color={getRoleColor(item.role)}>{item.role}</Tag>
                                        </span>
                                        <span style={{ fontWeight: 'bold' }}>
                                            {item.count} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <Progress
                                        percent={parseFloat(item.percentage)}
                                        strokeColor={
                                            item.role === 'Admin' ? '#1890ff' :
                                                item.role === 'Seller' ? '#52c41a' :
                                                    item.role === 'Buyer' ? '#722ed1' : '#fa8c16'
                                        }
                                        showInfo={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>

                {/* Recent Users */}
                <Col xs={24} lg={12}>
                    <Card
                        title="Người dùng mới nhất"
                        loading={loading}
                        extra={
                            <Button
                                type="link"
                                icon={<EyeOutlined />}
                                onClick={() => window.location.href = '/admin/users'}
                            >
                                Xem tất cả
                            </Button>
                        }
                    >
                        <Table
                            dataSource={recentUsers}
                            columns={recentUsersColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Additional Statistics */}
            <Card title="Thống kê chi tiết" style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Statistic
                            title="Quản trị viên"
                            value={statistics.totalAdmins}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Người mua hộ"
                            value={statistics.totalProxyShoppers}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Tài khoản bị khóa"
                            value={statistics.blockedUsers}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default UserAnalytics;
