import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag, Image } from 'antd';
import axios from 'axios';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const { Title } = Typography;

const ProductAnalytics = () => {
    const [categoryStats, setCategoryStats] = useState(null);
    const [productStats, setProductStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategoryStats = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5183/api/report/category-statistics?period=30d');
                if (response.data && response.data.success) {
                    setCategoryStats(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching category statistics:', error);
            }
            setLoading(false);
        };

        const fetchProductStats = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5183/api/report/product-statistics?period=30d');
                if (response.data && response.data.success) {
                    setProductStats(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching product statistics:', error);
            }
            setLoading(false);
        };

        fetchCategoryStats();
        fetchProductStats();
    }, []);

    const categoryColumns = [
        {
            title: 'Danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
        },
        {
            title: 'Số sản phẩm',
            dataIndex: 'productCount',
            key: 'productCount',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue) => `${Math.round(revenue).toLocaleString('vi-VN')}đ`,
        },
        {
            title: 'Thị phần (%)',
            dataIndex: 'revenuePercentage',
            key: 'revenuePercentage',
            render: (percentage) => `${percentage.toFixed(2)}%`,
        },
    ];

    const bestSellingColumns = [
        {
            title: 'Hạng',
            dataIndex: 'rank',
            key: 'rank',
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Cửa hàng',
            dataIndex: 'storeName',
            key: 'storeName',
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${Math.round(price).toLocaleString('vi-VN')}đ`,
        },
        {
            title: 'Số lượng mua',
            dataIndex: 'purchaseCount',
            key: 'purchaseCount',
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'primaryImageUrl',
            key: 'primaryImageUrl',
            render: (url) => <Image width={50} src={url} />,
        },
    ];

    const priceRangeColumns = [
        {
            title: 'Khoảng giá',
            dataIndex: 'rangeName',
            key: 'rangeName',
        },
        {
            title: 'Số sản phẩm',
            dataIndex: 'productCount',
            key: 'productCount',
        },
        {
            title: 'Tỷ lệ (%)',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (percentage) => `${percentage.toFixed(2)}%`,
        },
    ];

    const topStoresColumns = [
        {
            title: 'Hạng',
            dataIndex: 'rank',
            key: 'rank',
        },
        {
            title: 'Tên cửa hàng',
            dataIndex: 'storeName',
            key: 'storeName',
        },
        {
            title: 'Chợ',
            dataIndex: 'marketName',
            key: 'marketName',
        },
        {
            title: 'Số sản phẩm',
            dataIndex: 'productCount',
            key: 'productCount',
        },
        {
            title: 'Sản phẩm hoạt động',
            dataIndex: 'activeProducts',
            key: 'activeProducts',
        },
        {
            title: 'Giá trung bình',
            dataIndex: 'averagePrice',
            key: 'averagePrice',
            render: (price) => `${Math.round(price).toLocaleString('vi-VN')}đ`,
        },
    ];

    const getPriceRangeChartData = () => {
        if (!productStats || !productStats.priceRangeDistribution) return null;

        const labels = productStats.priceRangeDistribution.map((item) => item.rangeName);
        const data = productStats.priceRangeDistribution.map((item) => item.percentage);

        return {
            labels,
            datasets: [
                {
                    label: 'Tỷ lệ (%)',
                    data,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                    ],
                    hoverBackgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                    ],
                },
            ],
        };
    };

    const getCategoryDistributionChartData = () => {
        if (!categoryStats || !categoryStats.categoryDistribution) return null;

        const labels = categoryStats.categoryDistribution.map((item) => item.categoryName);
        const data = categoryStats.categoryDistribution.map((item) => item.percentage);

        return {
            labels,
            datasets: [
                {
                    label: 'Tỷ lệ (%)',
                    data,
                    backgroundColor: [
                        '#FF6384', // Red
                        '#36A2EB', // Blue
                        '#FFCE56', // Yellow
                        '#4BC0C0', // Teal
                        '#9966FF', // Purple
                        '#FF9F40', // Orange
                    ],
                    hoverBackgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                    ],
                },
            ],
        };
    };

    const getCategoryTrendsChartData = () => {
        if (!categoryStats || !categoryStats.categoryTrends) return null;

        const labels = categoryStats.categoryTrends[0]?.dataPoints.map((point) => new Date(point.date).toLocaleDateString('vi-VN'));
        const datasets = categoryStats.categoryTrends.map((trend, index) => ({
            label: trend.categoryName,
            data: trend.dataPoints.map((point) => point.revenue),
            borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index % 6],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index % 6] + '33',
            fill: true,
            tension: 0.4,
        }));

        return {
            labels,
            datasets,
        };
    };

    const options = {
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Thống kê danh mục</Title>

            {categoryStats && (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
                        <Col span={12}>
                            <Card title="Phân bổ danh mục">
                                <div style={{ width: '100%', height: 300 }}>
                                    <Pie data={getCategoryDistributionChartData()} />
                                </div>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Xu hướng danh mục">
                                <div style={{ width: '100%', height: 300 }}>
                                    <Line data={getCategoryTrendsChartData()} options={options} />
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Title level={4} style={{ marginTop: 24 }}>Phân bổ theo danh mục</Title>
                    <Table
                        dataSource={categoryStats.categoryDistribution.map((item, index) => ({ ...item, key: index }))}
                        columns={categoryColumns}
                        pagination={{ pageSize: 5 }}
                        loading={loading}
                        bordered
                    />
                </>
            )}

            <Title level={2} style={{ marginTop: 48 }}>Thống kê sản phẩm</Title>

            {productStats && (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col span={24}>
                            <Card title="Phân bổ theo khoảng giá">
                                <div style={{ width: 500, height: 250, margin: '0 auto' }}>
                                    <Pie data={getPriceRangeChartData()} />
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col span={6}>
                            <Card>
                                <Statistic title="Tổng số sản phẩm" value={productStats.totalProducts} />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic title="Sản phẩm hoạt động" value={productStats.activeProducts} valueStyle={{ color: '#52c41a' }} />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic title="Sản phẩm hết hàng" value={productStats.outOfStockProducts} valueStyle={{ color: '#faad14' }} />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic title="Sản phẩm bị khóa" value={productStats.suspendedProducts} valueStyle={{ color: '#ff4d4f' }} />
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                            <Card>
                                <Statistic title="Giá trung bình" value={`${Math.round(productStats.averagePrice).toLocaleString('vi-VN')}đ`} />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic title="Giá thấp nhất" value={`${Math.round(productStats.minPrice).toLocaleString('vi-VN')}đ`} />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic title="Giá cao nhất" value={`${Math.round(productStats.maxPrice).toLocaleString('vi-VN')}đ`} />
                            </Card>
                        </Col>
                    </Row>
                    <Title level={4} style={{ marginTop: 24 }}>Sản phẩm bán chạy</Title>
                    <Table
                        dataSource={productStats.bestSellingProducts.map((item, index) => ({ ...item, key: index }))}
                        columns={bestSellingColumns}
                        pagination={{ pageSize: 5 }}
                        loading={loading}
                        bordered
                    />

                    <Title level={4} style={{ marginTop: 24 }}>Cửa hàng hàng đầu</Title>
                    <Table
                        dataSource={productStats.topStoresByProducts.map((item, index) => ({ ...item, key: index }))}
                        columns={topStoresColumns}
                        pagination={{ pageSize: 5 }}
                        loading={loading}
                        bordered
                    />
                </>
            )}
        </div>
    );
};

export default ProductAnalytics;
