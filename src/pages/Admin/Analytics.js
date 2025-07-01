// src/pages/Admin/Analytics.js
import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Table,
    Tabs,
    Select,
    DatePicker,
    Space,
    Button
} from 'antd';
import {
    UserOutlined,
    ShoppingCartOutlined,
    DollarCircleOutlined,
    ShopOutlined,
    RiseOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const { Title } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
    const [dateRange, setDateRange] = useState('7days');
    const [loading, setLoading] = useState(false);

    // Mock data for charts
    const revenueData = [
        { date: '2024-01-01', revenue: 12000000, orders: 45 },
        { date: '2024-01-02', revenue: 15000000, orders: 52 },
        { date: '2024-01-03', revenue: 18000000, orders: 61 },
        { date: '2024-01-04', revenue: 14000000, orders: 48 },
        { date: '2024-01-05', revenue: 22000000, orders: 73 },
        { date: '2024-01-06', revenue: 19000000, orders: 65 },
        { date: '2024-01-07', revenue: 25000000, orders: 82 },
    ];

    const userGrowthData = [
        { month: 'Tháng 1', users: 1200, sellers: 89, buyers: 1111 },
        { month: 'Tháng 2', users: 1450, sellers: 102, buyers: 1348 },
        { month: 'Tháng 3', users: 1680, sellers: 115, buyers: 1565 },
        { month: 'Tháng 4', users: 1920, sellers: 128, buyers: 1792 },
        { month: 'Tháng 5', users: 2150, sellers: 145, buyers: 2005 },
        { month: 'Tháng 6', users: 2380, sellers: 162, buyers: 2218 },
    ];

    const categoryData = [
        { name: 'Thực phẩm tươi sống', value: 35, color: '#8884d8' },
        { name: 'Đồ gia dụng', value: 25, color: '#82ca9d' },
        { name: 'Thời trang', value: 20, color: '#ffc658' },
        { name: 'Điện tử', value: 15, color: '#ff7300' },
        { name: 'Khác', value: 5, color: '#00ff00' },
    ];

    const topProducts = [
        { id: 1, name: 'Rau xanh hữu cơ', sales: 1250, revenue: 25000000 },
        { id: 2, name: 'Thịt heo tươi', sales: 980, revenue: 48000000 },
        { id: 3, name: 'Cá tươi sống', sales: 875, revenue: 35000000 },
        { id: 4, name: 'Trái cây nhập khẩu', sales: 750, revenue: 22000000 },
        { id: 5, name: 'Gia vị đặc sản', sales: 650, revenue: 18000000 },
    ];

    const statsCards = [
        {
            title: 'Doanh thu tháng này',
            value: 125000000,
            prefix: <DollarCircleOutlined />,
            suffix: 'VNĐ',
            precision: 0,
            valueStyle: { color: '#3f8600' },
            change: '+12.5%'
        },
        {
            title: 'Đơn hàng mới',
            value: 1847,
            prefix: <ShoppingCartOutlined />,
            valueStyle: { color: '#1890ff' },
            change: '+8.2%'
        },
        {
            title: 'Người dùng mới',
            value: 230,
            prefix: <UserOutlined />,
            valueStyle: { color: '#722ed1' },
            change: '+15.3%'
        },
        {
            title: 'Cửa hàng hoạt động',
            value: 162,
            prefix: <ShopOutlined />,
            valueStyle: { color: '#fa8c16' },
            change: '+5.1%'
        },
    ];

    const productColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Lượt bán',
            dataIndex: 'sales',
            key: 'sales',
            sorter: (a, b) => a.sales - b.sales,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => `${value.toLocaleString('vi-VN')} VNĐ`,
            sorter: (a, b) => a.revenue - b.revenue,
        },
    ];

    const formatCurrency = (value) => {
        return `${(value / 1000000).toFixed(1)}M`;
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Báo cáo & Thống kê</Title>
                    <p style={{ margin: 0, color: '#666' }}>Phân tích dữ liệu kinh doanh</p>
                </div>
                <Space>
                    <Select
                        value={dateRange}
                        onChange={setDateRange}
                        style={{ width: 120 }}
                    >
                        <Option value="7days">7 ngày</Option>
                        <Option value="30days">30 ngày</Option>
                        <Option value="3months">3 tháng</Option>
                        <Option value="1year">1 năm</Option>
                    </Select>
                    <Button icon={<DownloadOutlined />}>
                        Xuất báo cáo
                    </Button>
                </Space>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                {statsCards.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.prefix}
                                suffix={stat.suffix}
                                precision={stat.precision}
                                valueStyle={stat.valueStyle}
                            />
                            <div style={{
                                marginTop: '8px',
                                fontSize: '12px',
                                color: stat.change.startsWith('+') ? '#3f8600' : '#cf1322'
                            }}>
                                <RiseOutlined /> {stat.change} so với tháng trước
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={16}>
                    <Card title="Doanh thu theo ngày" extra={<Button size="small">Xem chi tiết</Button>}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis tickFormatter={formatCurrency} />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === 'revenue' ? `${value.toLocaleString('vi-VN')} VNĐ` : value,
                                        name === 'revenue' ? 'Doanh thu' : 'Đơn hàng'
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Phân bố theo danh mục">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ marginTop: '16px' }}>
                            {categoryData.map((item, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <div>
                                        <span style={{
                                            display: 'inline-block',
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: item.color,
                                            marginRight: '8px'
                                        }}></span>
                                        {item.name}
                                    </div>
                                    <span>{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Tabs for different analytics */}
            <Card>
                <Tabs defaultActiveKey="users">
                    <TabPane tab="Tăng trưởng người dùng" key="users">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="buyers" stackId="a" fill="#8884d8" name="Người mua" />
                                <Bar dataKey="sellers" stackId="a" fill="#82ca9d" name="Người bán" />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabPane>

                    <TabPane tab="Sản phẩm bán chạy" key="products">
                        <Table
                            columns={productColumns}
                            dataSource={topProducts}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>

                    <TabPane tab="Xu hướng đơn hàng" key="orders">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                    name="Số đơn hàng"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default Analytics;
