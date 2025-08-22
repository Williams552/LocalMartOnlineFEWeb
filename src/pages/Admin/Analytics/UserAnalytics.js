import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
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
import axios from 'axios';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
const { Option } = Select;
const { RangePicker } = DatePicker;

const UserAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const [period, setPeriod] = useState(30);

    useEffect(() => {
        loadUserAnalytics();
    }, [period]);

    const loadUserAnalytics = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5183/api/user/statistics?period=${period}`);
            if (res.data && res.data.success) {
                setUserStats(res.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải user analytics:', error);
        }
        setLoading(false);
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

    const chartData = useMemo(() => {
        if (!userStats) return { labels: [], datasets: [] };

        const trendsByRole = userStats.registrationTrendsByRole || {};
        const roles = Object.keys(trendsByRole || {});
        const firstRole = roles.length > 0 ? roles[0] : null;
        const labels = firstRole ? (trendsByRole[firstRole] || []).map(item => new Date(item.date).toLocaleDateString('vi-VN')) : [];
        const colorMap = {
            'Buyer': '#1890ff',
            'Seller': '#faad14',
            'Proxy Shopper': '#52c41a',
            'Admin': '#722ed1',
            '': '#d9d9d9'
        };
        const datasets = (roles || []).map(role => {
            const dataArr = (trendsByRole[role] || []).map(item => item.count || 0);
            return {
                label: role || 'Khác',
                data: dataArr,
                backgroundColor: colorMap[role] || '#d9d9d9',
                borderColor: colorMap[role] || '#d9d9d9',
                type: 'line',
                fill: false,
                tension: 0.2,
                hidden: dataArr.every(v => v === 0)
            };
        }).filter(ds => !ds.hidden);

        return { labels, datasets: datasets || [] };
    }, [userStats]);

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
            <div style={{ marginBottom: 24 }}>
                <h2>Phân tích người dùng</h2>
                <p style={{ color: '#666', margin: 0 }}>Thống kê và phân tích dữ liệu người dùng trên hệ thống</p>
                <Space style={{ marginTop: 8 }}>
                    <span>Chọn kỳ thống kê:</span>
                    <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
                        <Select.Option value={7}>7 ngày</Select.Option>
                        <Select.Option value={30}>30 ngày</Select.Option>
                        <Select.Option value={90}>90 ngày</Select.Option>
                    </Select>
                </Space>
            </div>
            {userStats && (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Tổng số người dùng"
                                    value={userStats.totalUsers}
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Đăng ký mới"
                                    value={userStats.newRegistrations}
                                    valueStyle={{ color: '#fa8c16' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Người dùng hoạt động"
                                    value={userStats.activeUsers}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Người dùng bị khóa	"
                                    value={userStats.inactiveUsers}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} lg={8}>
                            <Card>
                                <Statistic
                                    title="Tỷ lệ tăng trưởng"
                                    value={userStats.userGrowthRate}
                                    suffix="%"
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                            <Card>
                                <Statistic
                                    title="Thời điểm thống kê"
                                    value={new Date(userStats.generatedAt).toLocaleString('vi-VN')}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                            <Card>
                                <Statistic
                                    title="Kỳ thống kê"
                                    value={`${new Date(userStats.periodStart).toLocaleDateString('vi-VN')} - ${new Date(userStats.periodEnd).toLocaleDateString('vi-VN')}`}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Divider orientation="left">Biểu đồ tăng trưởng người dùng mới</Divider>
                    <Card style={{ marginBottom: 24 }}>
                        <Bar
                            data={chartData}
                            options={{
                                plugins: { legend: { display: true } },
                                scales: {
                                    x: { title: { display: true, text: 'Ngày' } },
                                    y: { title: { display: true, text: 'Số lượng' }, beginAtZero: true }
                                },
                                maintainAspectRatio: false
                            }}
                            height={220}
                        />
                    </Card>
                    <Divider orientation="left">Phân bổ vai trò người dùng</Divider>
                    <Card style={{ marginBottom: 24 }}>
                        <Bar
                            data={{
                                labels: Object.keys(userStats.roleDistribution || {}),
                                datasets: [{
                                    label: 'Số lượng',
                                    data: Object.values(userStats.roleDistribution || {}),
                                    backgroundColor: '#faad14',
                                    barPercentage: 0.5,
                                    categoryPercentage: 0.7
                                }]
                            }}
                            options={{
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { title: { display: true, text: 'Vai trò' } },
                                    y: { title: { display: true, text: 'Số lượng' }, beginAtZero: true }
                                },
                                maintainAspectRatio: false
                            }}
                            height={180}
                        />
                    </Card>
                    <Divider orientation="left">Top người mua</Divider>
                    <Table
                        dataSource={userStats.topBuyers?.map((item, idx) => ({ ...item, key: idx })) || []}
                        columns={[
                            { title: 'Tên', dataIndex: 'fullName', key: 'fullName' },
                            { title: 'Username', dataIndex: 'username', key: 'username' },
                            { title: 'Hoạt động', dataIndex: 'activityCount', key: 'activityCount' },
                            { title: 'Đánh giá', dataIndex: 'rating', key: 'rating' }
                        ]}
                        pagination={false}
                        style={{ marginBottom: 24 }}
                    />
                    <Divider orientation="left">Top người bán</Divider>
                    <Table
                        dataSource={userStats.topSellers?.map((item, idx) => ({ ...item, key: idx })) || []}
                        columns={[
                            { title: 'Tên', dataIndex: 'fullName', key: 'fullName' },
                            { title: 'Username', dataIndex: 'username', key: 'username' },
                            { title: 'Hoạt động', dataIndex: 'activityCount', key: 'activityCount' },
                            { title: 'Đánh giá', dataIndex: 'rating', key: 'rating' }
                        ]}
                        pagination={false}
                    />
                </>
            )}
        </div>
    );
};

export default UserAnalytics;
