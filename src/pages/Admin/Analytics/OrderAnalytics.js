import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Button, Space } from 'antd';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ArcElement);

const { Title } = Typography;

const OrderAnalytics = () => {
    const [orderStats, setOrderStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrderStats = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5183/api/report/order-statistics?period=30d');
                if (response.data && response.data.success) {
                    setOrderStats(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching order statistics:', error);
            }
            setLoading(false);
        };

        fetchOrderStats();
    }, []);

    const getOrderTrendsChartData = () => {
    // support both `orderTrends` (API) and legacy `trends`
    const trends = (orderStats && (orderStats.orderTrends || orderStats.trends)) || null;
    if (!trends) return null;

    const labels = trends.map((point) => new Date(point.date).toLocaleDateString('vi-VN'));
    const data = trends.map((point) => Number(point.orderCount) || 0);

        return {
            labels,
            datasets: [
                {
                    label: 'Số lượng đơn hàng',
                    data,
                    borderColor: '#36A2EB',
                    backgroundColor: '#36A2EB33',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    };
    const getRevenueChartData = () => {
        const trends = (orderStats && (orderStats.orderTrends || orderStats.trends)) || null;
        if (!trends) return null;

        const labels = trends.map((point) => new Date(point.date).toLocaleDateString('vi-VN'));
        const data = trends.map((point) => Number(point.revenue ?? point.totalValue ?? point.totalRevenue ?? 0));

        const hasRevenue = data.some((v) => v > 0) || Number(orderStats.totalRevenue || 0) > 0;
        if (!hasRevenue) return null;

        return {
            labels,
            datasets: [
                {
                    label: 'Doanh thu',
                    data,
                    borderColor: '#FF8C42',
                    backgroundColor: '#FF8C4233',
                    fill: true,
                    tension: 0.3,
                },
            ],
        };
    };

    const getStatusDistributionData = () => {
        if (!orderStats) return null;

        // support API field `ordersByStatus` or legacy computation from orderDetails
        const byStatus = orderStats.ordersByStatus || null;
        if (byStatus && Array.isArray(byStatus) && byStatus.length > 0) {
            const labels = byStatus.map((s) => s.status || 'Unknown');
            const data = byStatus.map((s) => Number(s.count) || 0);
            const backgroundColors = ['#36A2EB', '#52c41a', '#ff4d4f', '#faad14', '#722ed1'];
            return {
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: labels.map((_, i) => backgroundColors[i % backgroundColors.length]),
                    },
                ],
            };
        }

        // fallback: empty
        return null;
    };

    const computeExtraStats = () => {
        if (!orderStats) return {};
        const avgFromApi = Number(orderStats.averageOrderValue ?? orderStats.averageOrder ?? 0);
        const avg = avgFromApi || Math.round(((Number(orderStats.totalRevenue || 0)) / (Number(orderStats.totalOrders || 1)))) || 0;
        const pending = Number(orderStats.pendingOrders ?? 0);
        return { avgOrderValue: Math.round(avg), pendingOrders: pending };
    };

    const extra = computeExtraStats();
    const trendsData = getOrderTrendsChartData();
    const revenueData = getRevenueChartData();
    const statusData = getStatusDistributionData();

    // prepare safe details source array
    const detailsBaseArray = Array.isArray(orderStats?.ordersByStatus)
        ? orderStats.ordersByStatus
        : Array.isArray(orderStats?.orderDetails)
            ? orderStats.orderDetails
            : [];

    const detailsSource = detailsBaseArray.map((item, index) => ({ ...item, key: index }));

    const detailsColumns = Array.isArray(orderStats?.ordersByStatus)
        ? [
            { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
            { title: 'Số lượng', dataIndex: 'count', key: 'count' },
            { title: 'Tỉ lệ(%)', dataIndex: 'percentage', key: 'percentage' },
            { title: 'Tổng giá trị', dataIndex: 'totalValue', key: 'totalValue', render: (v) => `${Math.round(Number(v||0)).toLocaleString('vi-VN')}đ` },
            { title: 'Giá trung bình', dataIndex: 'averageValue', key: 'averageValue', render: (v) => `${Math.round(Number(v||0)).toLocaleString('vi-VN')}đ` },
        ]
        : [
            {
                title: 'Mã đơn hàng',
                dataIndex: 'orderId',
                key: 'orderId',
                render: (v) => v || '-',
            },
            {
                title: 'Khách hàng',
                dataIndex: 'customerName',
                key: 'customerName',
                render: (v) => v || 'Khách vãng lai',
            },
            {
                title: 'Tổng giá trị',
                dataIndex: 'totalValue',
                key: 'totalValue',
                render: (value) => {
                    const n = Number(value) || 0;
                    return `${n.toLocaleString('vi-VN')}đ`;
                },
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status) => {
                    const s = (status || 'Unknown').toString();
                    let color = 'default';
                    if (s.toLowerCase().includes('complete') || s.toLowerCase().includes('completed') || s.toLowerCase().includes('hoàn')) color = 'green';
                    if (s.toLowerCase().includes('cancel') || s.toLowerCase().includes('hủy')) color = 'red';
                    if (s.toLowerCase().includes('pending') || s.toLowerCase().includes('đang')) color = 'orange';
                    return <span style={{ color }}>{s}</span>;
                },
            },
            {
                title: 'Hành động',
                key: 'actions',
                render: (_, record) => (
                    <Space>
                        <Button size="small" type="link">Xem</Button>
                    </Space>
                ),
            },
        ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Thống kê đơn hàng</Title>

            {orderStats && (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={14}>
                            <Card title="Xu hướng đơn hàng">
                                <div style={{ width: '100%', height: 320 }}>
                                    {trendsData ? (
                                        <Line data={trendsData} options={{ maintainAspectRatio: false }} />
                                    ) : (
                                        <div style={{ padding: 24 }}>Không có dữ liệu xu hướng đơn hàng</div>
                                    )}
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} lg={10}>
                            <Card title="Phân bố trạng thái đơn hàng">
                                <div style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {statusData ? (
                                        <Pie data={statusData} options={{ maintainAspectRatio: false }} />
                                    ) : (
                                        <div>Không có dữ liệu trạng thái</div>
                                    )}
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {revenueData && (
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col span={24}>
                                <Card title="Xu hướng doanh thu">
                                    <div style={{ width: '100%', height: 300 }}>
                                        <Line data={revenueData} options={{ maintainAspectRatio: false }} />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic title="Tổng số đơn hàng" value={orderStats.totalOrders || 0} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic title="Đơn hàng đã hoàn thành" value={orderStats.completedOrders || 0} valueStyle={{ color: '#52c41a' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic title="Đơn hàng bị hủy" value={orderStats.cancelledOrders || 0} valueStyle={{ color: '#ff4d4f' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic title="Giá trị trung bình/đơn" value={extra.avgOrderValue || 0} prefix="đ" />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col span={24}>
                            <Title level={4} style={{ marginTop: 0 }}>Chi tiết đơn hàng</Title>
                            <Table
                                dataSource={detailsSource}
                                columns={detailsColumns}
                                pagination={{ pageSize: 5 }}
                                loading={loading}
                                bordered
                            />
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default OrderAnalytics;