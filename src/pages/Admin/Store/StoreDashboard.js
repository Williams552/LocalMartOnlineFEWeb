// src/pages/Admin/Store/StoreDashboard.js
import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Space,
    Tag,
    Button,
    List,
    Avatar,
    Typography,
    Alert,
    Tooltip,
    Progress
} from 'antd';
import {
    ShopOutlined,
    TeamOutlined,
    TrophyOutlined,
    StarOutlined,
    AlertOutlined,
    RiseOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    UserOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { storeService } from '../../../services/storeService';
import { marketService } from '../../../services/marketService';
import StoreNavigation from './StoreNavigation';
import { Pie, Column, Line } from '@ant-design/plots';

const { Title, Text } = Typography;

const StoreDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [storeStats, setStoreStats] = useState({
        totalStores: 0,
        activeStores: 0,
        closedStores: 0,
        suspendedStores: 0,
        avgRating: 0
    });
    const [topStores, setTopStores] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [marketDistribution, setMarketDistribution] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            console.log('🔍 StoreDashboard - Loading dashboard data...');
            
            // Load stores data
            const stores = await storeService.getAllStores();
            console.log('🔍 StoreDashboard - API response:', stores);
            
            // Handle different response structures
            let storesData = [];
            
            if (Array.isArray(stores)) {
                storesData = stores;
            } else if (stores?.data && Array.isArray(stores.data)) {
                storesData = stores.data;
            } else if (stores && typeof stores === 'object') {
                storesData = Object.values(stores).filter(item => 
                    item && typeof item === 'object' && item.id
                );
            }
            
            if (storesData.length > 0) {
                const stats = calculateStats(storesData);
                setStoreStats(stats);
                
                // Get top rated stores
                const topRated = storesData
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 5);
                setTopStores(topRated);
                
                // Generate chart data
                const statusChart = generateStatusChartData(storesData);
                setChartData(statusChart);
                
                // Generate market distribution
                const marketDist = await generateMarketDistribution(storesData);
                setMarketDistribution(marketDist);
            } else {
                console.warn('🔍 StoreDashboard - No stores data found');
            }

            // Mock recent activities
            setRecentActivities([
                {
                    id: 1,
                    type: 'store_created',
                    title: 'Cửa hàng "Bánh mì Hà Nội" được tạo',
                    time: '2 giờ trước',
                    icon: <ShopOutlined style={{ color: '#52c41a' }} />
                },
                {
                    id: 2,
                    type: 'store_updated',
                    title: 'Cập nhật thông tin "Tạp hóa An Khang"',
                    time: '4 giờ trước',
                    icon: <RiseOutlined style={{ color: '#1890ff' }} />
                },
                {
                    id: 3,
                    type: 'store_suspended',
                    title: 'Tạm ngưng "Cửa hàng XYZ"',
                    time: '1 ngày trước',
                    icon: <AlertOutlined style={{ color: '#ff4d4f' }} />
                },
                {
                    id: 4,
                    type: 'new_review',
                    title: 'Đánh giá mới cho "Cửa hàng ABC"',
                    time: '2 ngày trước',
                    icon: <StarOutlined style={{ color: '#faad14' }} />
                }
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (stores) => {
        const totalStores = stores.length;
        const activeStores = stores.filter(s => s.status === 'Open').length;
        const closedStores = stores.filter(s => s.status === 'Closed').length;
        const suspendedStores = stores.filter(s => s.status === 'Suspended').length;
        const avgRating = stores.length > 0 ? 
            stores.reduce((sum, s) => sum + (s.rating || 0), 0) / stores.length : 0;

        return {
            totalStores,
            activeStores,
            closedStores,
            suspendedStores,
            avgRating
        };
    };

    const generateStatusChartData = (stores) => {
        const statusCount = stores.reduce((acc, store) => {
            const status = store.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(statusCount).map(status => ({
            status: getStatusLabel(status),
            count: statusCount[status]
        }));
    };

    const generateMarketDistribution = async (stores) => {
        try {
            const markets = await marketService.getActiveMarkets();
            const marketsData = Array.isArray(markets) ? markets : 
                              markets?.data ? markets.data : [];
            
            const marketCount = stores.reduce((acc, store) => {
                const marketId = store.marketId;
                acc[marketId] = (acc[marketId] || 0) + 1;
                return acc;
            }, {});

            return marketsData.map(market => ({
                market: market.name,
                count: marketCount[market.id] || 0
            })).filter(item => item.count > 0);
        } catch (error) {
            console.error('Error generating market distribution:', error);
            return [];
        }
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'Open': 'Đang mở',
            'Closed': 'Đã đóng',
            'Suspended': 'Tạm ngưng'
        };
        return statusMap[status] || status;
    };

    const storeColumns = [
        {
            title: 'Cửa hàng',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <Avatar 
                        src={record.storeImageUrl} 
                        icon={<ShopOutlined />}
                        size={32}
                    />
                    <div>
                        <Text strong>{text}</Text>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            ID: {record.id}
                        </div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => (
                <div>
                    <StarOutlined style={{ color: '#faad14' }} />
                    <span style={{ marginLeft: 4 }}>
                        {(rating || 0).toFixed(1)}
                    </span>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Open' ? 'green' : status === 'Closed' ? 'red' : 'orange'}>
                    {getStatusLabel(status)}
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
        data: chartData,
        angleField: 'count',
        colorField: 'status',
        radius: 0.8,
        color: ['#52c41a', '#ff4d4f', '#fa8c16'],
        label: {
            type: 'spider',
            labelHeight: 28,
            content: '{name}\n{percentage}'
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }]
    };

    const marketChartConfig = {
        data: marketDistribution,
        xField: 'market',
        yField: 'count',
        color: '#1890ff',
        columnWidthRatio: 0.8,
        meta: {
            count: { alias: 'Số cửa hàng' },
            market: { alias: 'Chợ' }
        }
    };

    return (
        <div>
            <StoreNavigation />
            <div style={{ padding: '0 24px 24px' }}>
                <Title level={2}>
                    <ShopOutlined /> Dashboard Quản lý Cửa hàng
                </Title>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng số cửa hàng"
                                value={storeStats.totalStores}
                                prefix={<ShopOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Đang hoạt động"
                                value={storeStats.activeStores}
                                prefix={<TrophyOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Đã đóng"
                                value={storeStats.closedStores}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Đánh giá trung bình"
                                value={storeStats.avgRating}
                                precision={1}
                                prefix={<StarOutlined />}
                                suffix="/ 5.0"
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Charts */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card 
                            title="Phân bố trạng thái cửa hàng" 
                            extra={<Button size="small">Chi tiết</Button>}
                        >
                            <Pie {...pieConfig} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card 
                            title="Phân bố theo chợ" 
                            extra={<Button size="small">Xem tất cả</Button>}
                        >
                            <Column {...marketChartConfig} />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                    <Col xs={24} lg={16}>
                        <Card 
                            title="Top cửa hàng đánh giá cao" 
                            extra={
                                <Button type="primary" href="/admin/stores">
                                    Quản lý cửa hàng
                                </Button>
                            }
                        >
                            <Table
                                columns={storeColumns}
                                dataSource={topStores}
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
                            description={`Hiện có ${storeStats.totalStores} cửa hàng trong hệ thống, với ${storeStats.activeStores} cửa hàng đang hoạt động (${Math.round((storeStats.activeStores / storeStats.totalStores) * 100) || 0}%). Đánh giá trung bình: ${storeStats.avgRating.toFixed(1)}/5.0 ⭐`}
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

export default StoreDashboard;
