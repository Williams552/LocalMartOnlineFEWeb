// src/pages/Admin/Market/MarketDashboard.js
import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Space,
    Tag,
    Progress,
    Button,
    List,
    Avatar,
    Typography,
    Alert,
    Tooltip
} from 'antd';
import {
    ShopOutlined,
    TeamOutlined,
    TrophyOutlined,
    DollarOutlined,
    AlertOutlined,
    RiseOutlined,
    EnvironmentOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { marketService } from '../../../services/marketService';
import MarketNavigation from './MarketNavigation';
import { Line, Pie, Column } from '@ant-design/plots';

const { Title, Text } = Typography;

const MarketDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [marketStats, setMarketStats] = useState({
        totalMarkets: 0,
        activeMarkets: 0,
        totalStalls: 0,
        totalRevenue: 0
    });
    const [marketList, setMarketList] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load market statistics
            console.log('🔍 MarketDashboard - Loading dashboard data...');
            const markets = await marketService.getAllMarkets();
            console.log('🔍 MarketDashboard - API response:', markets);

            // Handle different response structures
            let marketsData = [];

            if (Array.isArray(markets)) {
                marketsData = markets;
            } else if (markets?.data && Array.isArray(markets.data)) {
                marketsData = markets.data;
            } else if (markets && typeof markets === 'object') {
                marketsData = Object.values(markets).filter(item =>
                    item && typeof item === 'object' && item.id
                );
            }

            if (marketsData.length > 0) {
                const stats = calculateStats(marketsData);
                setMarketStats(stats);
                setMarketList(marketsData.slice(0, 5)); // Top 5 markets

                // Generate chart data
                const chartData = generateChartData(marketsData);
                setChartData(chartData);
            } else {
                console.warn('🔍 MarketDashboard - No markets data found');
            }

            // Mock recent activities (có thể thay bằng API thực)
            setRecentActivities([
                {
                    id: 1,
                    type: 'market_created',
                    title: 'Chợ Bến Thành mới được tạo',
                    time: '2 giờ trước',
                    icon: <ShopOutlined style={{ color: '#52c41a' }} />
                },
                {
                    id: 2,
                    type: 'market_updated',
                    title: 'Cập nhật thông tin Chợ Đầm',
                    time: '4 giờ trước',
                    icon: <RiseOutlined style={{ color: '#1890ff' }} />
                },
                {
                    id: 3,
                    type: 'market_suspended',
                    title: 'Tạm ngưng Chợ Cũ',
                    time: '1 ngày trước',
                    icon: <AlertOutlined style={{ color: '#ff4d4f' }} />
                }
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (markets) => {
        const totalMarkets = markets.length;
        const activeMarkets = markets.filter(m => m.status === 'Active').length;
        const totalStalls = markets.reduce((sum, m) => sum + (m.stallCount || 0), 0);
        const totalRevenue = markets.reduce((sum, m) => sum + (m.rentFee || 0) * (m.stallCount || 0), 0);

        return {
            totalMarkets,
            activeMarkets,
            totalStalls,
            totalRevenue
        };
    };

    const generateChartData = (markets) => {
        return markets.map(market => ({
            market: market.name,
            stalls: market.stallCount || 0,
            status: market.status
        }));
    };

    const marketColumns = [
        {
            title: 'Tên chợ',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Số cửa hàng',
            dataIndex: 'stallCount',
            key: 'stallCount',
            render: (count) => (
                <Statistic
                    value={count || 0}
                    suffix="cửa hàng"
                    valueStyle={{ fontSize: '14px' }}
                />
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                    {status === 'Active' ? 'Hoạt động' : 'Tạm ngưng'}
                </Tag>
            )
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            render: (address) => (
                <Tooltip title={address}>
                    <Text>{address}</Text>
                </Tooltip>
            )
        }
    ];

    const pieConfig = {
        appendPadding: 10,
        data: [
            { type: 'Hoạt động', value: marketStats.activeMarkets },
            { type: 'Tạm ngưng', value: marketStats.totalMarkets - marketStats.activeMarkets }
        ],
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        color: ['#52c41a', '#ff4d4f'],
        label: {
            type: 'spider',
            labelHeight: 28,
            content: (data) => `${data.type}\n${(data.percent * 100).toFixed(0)}%`
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }]
    };

    const stallChartConfig = {
        data: chartData,
        xField: 'market',
        yField: 'stalls',
        seriesField: 'status',
        color: ['#52c41a', '#ff4d4f'],
        columnWidthRatio: 0.8,
        meta: {
            stalls: { alias: 'Số cửa hàng' },
            market: { alias: 'Chợ' }
        }
    };

    return (
        <div>
            <MarketNavigation />
            <div style={{ padding: '0 24px 24px' }}>
                <Title level={2}>
                    <ShopOutlined /> Dashboard Quản lý Chợ
                </Title>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng số chợ"
                                value={marketStats.totalMarkets}
                                prefix={<ShopOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Chợ hoạt động"
                                value={marketStats.activeMarkets}
                                prefix={<TrophyOutlined />}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng cửa hàng"
                                value={marketStats.totalStalls}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Doanh thu dự kiến"
                                value={marketStats.totalRevenue}
                                prefix={<DollarOutlined />}
                                suffix="VNĐ"
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Charts and Tables */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card
                            title="Phân bố trạng thái chợ"
                            extra={<Button size="small">Chi tiết</Button>}
                        >
                            <Pie {...pieConfig} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card
                            title="Số cửa hàng theo chợ"
                            extra={<Button size="small">Xem tất cả</Button>}
                        >
                            <Column {...stallChartConfig} />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                    <Col xs={24} lg={16}>
                        <Card
                            title="Danh sách chợ chính"
                            extra={
                                <Button type="primary" href="/admin/markets">
                                    Quản lý chợ
                                </Button>
                            }
                        >
                            <Table
                                columns={marketColumns}
                                dataSource={marketList}
                                pagination={false}
                                loading={loading}
                                size="small"
                                rowKey="id"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card title="Hoạt động gần đây">
                            <List
                                dataSource={recentActivities}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar icon={item.icon} />}
                                            title={item.title}
                                            description={
                                                <Text type="secondary">
                                                    <CalendarOutlined /> {item.time}
                                                </Text>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Performance Alerts */}
                <Row style={{ marginTop: '16px' }}>
                    <Col span={24}>
                        <Alert
                            message="Thông báo hệ thống"
                            description={`Hiện có ${marketStats.totalMarkets} chợ trong hệ thống, với ${marketStats.activeMarkets} chợ đang hoạt động (${Math.round((marketStats.activeMarkets / marketStats.totalMarkets) * 100) || 0}%). Tổng cộng ${marketStats.totalStalls} cửa hàng đang kinh doanh.`}
                            type="info"
                            showIcon
                            icon={<RiseOutlined />}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default MarketDashboard;
