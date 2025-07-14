// src/pages/Admin/Store/StoreAnalytics.js
import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    DatePicker,
    Select,
    Button,
    Space,
    Typography,
    Table,
    Tag
} from 'antd';
import {
    ShopOutlined,
    RiseOutlined,
    StarOutlined,
    EnvironmentOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import storeService from '../../../services/storeService';
import { marketService } from '../../../services/marketService';
import StoreNavigation from './StoreNavigation';
import { Line, Pie, Column, Area } from '@ant-design/plots';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const StoreAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [analytics, setAnalytics] = useState({
        totalStores: 0,
        newStores: 0,
        avgRating: 0,
        topPerformers: []
    });

    useEffect(() => {
        loadAnalyticsData();
        loadMarkets();
    }, [selectedMarket, dateRange]);

    const loadAnalyticsData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedMarket) params.marketId = selectedMarket;

            const response = await storeService.getAllStores(params);
            const storesData = Array.isArray(response) ? response :
                response?.data ? response.data : [];

            setStores(storesData);

            // Calculate analytics
            const analytics = calculateAnalytics(storesData);
            setAnalytics(analytics);

        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMarkets = async () => {
        try {
            const response = await marketService.getActiveMarkets();
            const marketsData = Array.isArray(response) ? response :
                response?.data ? response.data : [];
            setMarkets(marketsData);
        } catch (error) {
            console.error('Error loading markets:', error);
        }
    };

    const calculateAnalytics = (storesData) => {
        const total = storesData.length;
        const newThisMonth = storesData.filter(store => {
            const createdDate = new Date(store.createdAt);
            const currentMonth = new Date();
            return createdDate.getMonth() === currentMonth.getMonth() &&
                createdDate.getFullYear() === currentMonth.getFullYear();
        }).length;

        const avgRating = total > 0 ?
            storesData.reduce((sum, store) => sum + (store.rating || 0), 0) / total : 0;

        const topPerformers = storesData
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 10);

        return {
            totalStores: total,
            newStores: newThisMonth,
            avgRating,
            topPerformers
        };
    };

    const getStatusDistribution = () => {
        const distribution = stores.reduce((acc, store) => {
            const status = store.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(distribution).map(status => ({
            type: getStatusLabel(status),
            value: distribution[status]
        }));
    };

    const getMarketDistribution = () => {
        const distribution = stores.reduce((acc, store) => {
            const marketId = store.marketId;
            const market = markets.find(m => m.id === marketId);
            const marketName = market?.name || 'Không xác định';
            acc[marketName] = (acc[marketName] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(distribution).map(market => ({
            market,
            count: distribution[market]
        }));
    };

    const getRatingDistribution = () => {
        const ratingRanges = {
            '4.5-5.0': 0,
            '4.0-4.4': 0,
            '3.5-3.9': 0,
            '3.0-3.4': 0,
            '0-2.9': 0
        };

        stores.forEach(store => {
            const rating = store.rating || 0;
            if (rating >= 4.5) ratingRanges['4.5-5.0']++;
            else if (rating >= 4.0) ratingRanges['4.0-4.4']++;
            else if (rating >= 3.5) ratingRanges['3.5-3.9']++;
            else if (rating >= 3.0) ratingRanges['3.0-3.4']++;
            else ratingRanges['0-2.9']++;
        });

        return Object.keys(ratingRanges).map(range => ({
            range,
            count: ratingRanges[range]
        }));
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'Open': 'Đang mở',
            'Closed': 'Đã đóng',
            'Suspended': 'Tạm ngưng'
        };
        return statusMap[status] || status;
    };

    const topPerformersColumns = [
        {
            title: 'Thứ hạng',
            key: 'rank',
            width: 80,
            render: (_, __, index) => (
                <div style={{ textAlign: 'center' }}>
                    {index < 3 ? (
                        <span style={{ fontSize: '20px' }}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                    ) : (
                        <span style={{ fontWeight: 'bold' }}>{index + 1}</span>
                    )}
                </div>
            )
        },
        {
            title: 'Cửa hàng',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <ShopOutlined />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.address}
                        </div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 100,
            render: (rating) => (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#faad14' }}>
                        ⭐ {(rating || 0).toFixed(1)}
                    </div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={status === 'Open' ? 'green' : status === 'Closed' ? 'red' : 'orange'}>
                    {getStatusLabel(status)}
                </Tag>
            )
        }
    ];

    const statusPieConfig = {
        appendPadding: 10,
        data: getStatusDistribution(),
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        color: ['#52c41a', '#ff4d4f', '#fa8c16'],
        label: {
            type: 'spider',
            labelHeight: 28,
            content: '{name}\n{percentage}'
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }]
    };

    const marketColumnConfig = {
        data: getMarketDistribution(),
        xField: 'market',
        yField: 'count',
        color: '#1890ff',
        columnWidthRatio: 0.8,
        meta: {
            count: { alias: 'Số cửa hàng' },
            market: { alias: 'Chợ' }
        }
    };

    const ratingColumnConfig = {
        data: getRatingDistribution(),
        xField: 'range',
        yField: 'count',
        color: '#faad14',
        columnWidthRatio: 0.8,
        meta: {
            count: { alias: 'Số cửa hàng' },
            range: { alias: 'Khoảng đánh giá' }
        }
    };

    return (
        <div>
            <StoreNavigation />
            <div style={{ padding: '0 24px 24px' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={2}>
                        <BarChartOutlined /> Thống kê Cửa hàng
                    </Title>
                    <Space>
                        <Select
                            placeholder="Chọn chợ"
                            allowClear
                            style={{ width: 200 }}
                            value={selectedMarket}
                            onChange={setSelectedMarket}
                        >
                            {markets.map(market => (
                                <Option key={market.id} value={market.id}>
                                    {market.name}
                                </Option>
                            ))}
                        </Select>
                        <RangePicker
                            onChange={setDateRange}
                            format="DD/MM/YYYY"
                        />
                        <Button onClick={loadAnalyticsData}>
                            Làm mới
                        </Button>
                    </Space>
                </div>

                {/* Key Metrics */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng số cửa hàng"
                                value={analytics.totalStores}
                                prefix={<ShopOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Cửa hàng mới tháng này"
                                value={analytics.newStores}
                                prefix={<RiseOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Đánh giá trung bình"
                                value={analytics.avgRating}
                                precision={1}
                                prefix={<StarOutlined />}
                                suffix="/ 5.0"
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Cửa hàng đang mở"
                                value={stores.filter(s => s.status === 'Open').length}
                                prefix={<ShopOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Charts */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} lg={8}>
                        <Card title="Phân bố trạng thái" size="small">
                            <Pie {...statusPieConfig} height={250} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card title="Phân bố theo chợ" size="small">
                            <Column {...marketColumnConfig} height={250} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card title="Phân bố đánh giá" size="small">
                            <Column {...ratingColumnConfig} height={250} />
                        </Card>
                    </Col>
                </Row>

                {/* Top Performers Table */}
                <Card title="🏆 Top cửa hàng đánh giá cao" size="small">
                    <Table
                        columns={topPerformersColumns}
                        dataSource={analytics.topPerformers}
                        pagination={false}
                        loading={loading}
                        rowKey="id"
                        size="small"
                    />
                </Card>
            </div>
        </div>
    );
};

export default StoreAnalytics;
