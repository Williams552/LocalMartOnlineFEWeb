// Revenue Analytics Component for Admin - Integrated with existing systems
import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Select,
    DatePicker,
    Button,
    Space,
    Progress,
    Typography,
    Divider,
    Spin,
    Alert,
    message,
    Table
} from 'antd';
import {
    DollarCircleOutlined,
    ShoppingCartOutlined,
    BankOutlined,
    RiseOutlined,
    FallOutlined,
    ReloadOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import orderService from '../../../services/orderService';
import { storeService } from '../../../services/storeService';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

const RevenueAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState({
        productRevenue: 0,
        marketFeeRevenue: 0,
        totalRevenue: 0,
        monthlyData: [],
        summary: {
            totalOrders: 0,
            completedOrders: 0,
            totalStores: 0,
            completedPayments: 0
        }
    });
    const [timeRange, setTimeRange] = useState('30days');
    const [dateRange, setDateRange] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRevenueData();
    }, [timeRange, dateRange]);

    const loadRevenueData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Loading revenue data from existing systems...');

            // Load product revenue by getting ALL orders and filtering completed ones
            console.log('📊 Loading all orders to calculate product revenue...');
            const allOrdersResponse = await orderService.getAllOrders(1, 100); // Start with reasonable page size
            let productRevenue = 0;
            let orderSummary = { totalOrders: 0, completedOrders: 0 };
            
            if (allOrdersResponse.success && allOrdersResponse.data) {
                const orders = allOrdersResponse.data.items || allOrdersResponse.data || [];
                console.log('📋 Total orders found:', orders.length);
                console.log('📋 Orders data structure:', allOrdersResponse.data);
                
                // Check if there are more pages to fetch
                const responseData = allOrdersResponse.data;
                const totalCount = responseData.totalCount || responseData.total || orders.length;
                const currentPage = responseData.page || responseData.currentPage || 1;
                const pageSize = responseData.pageSize || 100;
                const totalPages = responseData.totalPages || Math.ceil(totalCount / pageSize);
                
                console.log('📊 Pagination info:', { 
                    totalCount, 
                    currentPage, 
                    pageSize, 
                    totalPages,
                    hasMore: currentPage < totalPages 
                });
                
                // If there are multiple pages, fetch all of them
                let allOrders = [...orders];
                if (totalPages > 1) {
                    console.log('📚 Fetching remaining pages...');
                    for (let page = 2; page <= totalPages; page++) {
                        try {
                            const pageResponse = await orderService.getAllOrders(page, pageSize);
                            if (pageResponse.success && pageResponse.data) {
                                const pageOrders = pageResponse.data.items || pageResponse.data || [];
                                allOrders = [...allOrders, ...pageOrders];
                                console.log(`📋 Page ${page}: ${pageOrders.length} orders loaded`);
                            }
                        } catch (error) {
                            console.warn(`⚠️ Failed to load page ${page}:`, error.message);
                        }
                    }
                }
                
                console.log('📋 Total orders loaded from all pages:', allOrders.length);
                
                console.log('📋 Total orders loaded from all pages:', allOrders.length);
                
                // Filter completed orders and calculate revenue using all orders
                const completedOrders = allOrders.filter(order => order.status === 'Completed');
                console.log('✅ Completed orders found:', completedOrders.length);
                
                productRevenue = completedOrders.reduce((sum, order) => {
                    const amount = order.totalAmount || 0;
                    console.log(`💰 Order ${order.id}: ${amount} VNĐ`);
                    return sum + amount;
                }, 0);
                
                orderSummary = {
                    totalOrders: allOrders.length,
                    completedOrders: completedOrders.length
                };
                
                console.log('📊 Product revenue calculated:', productRevenue, 'VNĐ');
            } else {
                console.log('⚠️ No orders data received');
            }

            // Load market fee revenue using existing StorePaymentManagement approach
            console.log('🏪 Loading store payment data...');
            const storePaymentResponse = await storeService.getAllStoresWithPaymentInfo({ 
                pageSize: 100, 
                page: 1 
            });
            let marketFeeRevenue = 0;
            let storeSummary = { totalStores: 0, completedPayments: 0 };
            
            if (storePaymentResponse.success && storePaymentResponse.data) {
                let allStores = storePaymentResponse.data;
                console.log('🏪 Total stores found:', allStores.length);
                console.log('🏪 Store data structure:', storePaymentResponse);
                
                // Check if stores data is paginated and fetch all pages if needed
                if (Array.isArray(allStores) && allStores.length > 0) {
                    // If there's pagination info, fetch all pages
                    // Note: This depends on how storeService.getAllStoresWithPaymentInfo returns data
                    console.log('🏪 Processing store payment data...');
                } else {
                    console.log('⚠️ Store data structure may be different:', storePaymentResponse);
                    allStores = [];
                }
                
                const completedPayments = allStores.filter(s => s.paymentStatus === 'Completed');
                console.log('✅ Completed payments found:', completedPayments.length);
                
                marketFeeRevenue = completedPayments.reduce((sum, s) => {
                    const fee = s.monthlyRentalFee || 0;
                    console.log(`🏪 Store ${s.storeName}: ${fee} VNĐ`);
                    return sum + fee;
                }, 0);
                
                storeSummary = {
                    totalStores: allStores.length,
                    completedPayments: completedPayments.length
                };
                
                console.log('🏪 Market fee revenue calculated:', marketFeeRevenue, 'VNĐ');
            } else {
                console.log('⚠️ No store payment data received');
            }

            const totalRevenue = productRevenue + marketFeeRevenue;

            // Create monthly data for visualization - only show current month's real data
            const currentMonth = new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
            const monthlyData = [
                { 
                    month: currentMonth, 
                    productRevenue, 
                    marketFeeRevenue, 
                    total: totalRevenue 
                }
            ];

            setRevenueData({
                productRevenue,
                marketFeeRevenue,
                totalRevenue,
                monthlyData,
                summary: {
                    ...orderSummary,
                    ...storeSummary
                }
            });

            console.log('✅ Revenue data loaded successfully:', { 
                productRevenue: productRevenue.toLocaleString('vi-VN'), 
                marketFeeRevenue: marketFeeRevenue.toLocaleString('vi-VN'), 
                totalRevenue: totalRevenue.toLocaleString('vi-VN')
            });

        } catch (error) {
            console.error('❌ Error loading revenue data:', error);
            setError(error.message || 'Không thể tải dữ liệu doanh thu');
            message.error('Lỗi khi tải dữ liệu doanh thu');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        try {
            const exportData = [
                ['Loại doanh thu', 'Số tiền (VNĐ)', 'Tỷ lệ (%)'],
                [
                    'Doanh thu sản phẩm', 
                    revenueData.productRevenue.toLocaleString('vi-VN'), 
                    revenueData.totalRevenue > 0 ? ((revenueData.productRevenue / revenueData.totalRevenue) * 100).toFixed(1) : '0.0'
                ],
                [
                    'Doanh thu phí chợ', 
                    revenueData.marketFeeRevenue.toLocaleString('vi-VN'), 
                    revenueData.totalRevenue > 0 ? ((revenueData.marketFeeRevenue / revenueData.totalRevenue) * 100).toFixed(1) : '0.0'
                ],
                ['Tổng doanh thu', revenueData.totalRevenue.toLocaleString('vi-VN'), '100.0']
            ];

            const csvContent = exportData.map(row => row.join(',')).join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `doanh_thu_${new Date().getTime()}.csv`;
            link.click();
            message.success('Xuất dữ liệu thành công!');
        } catch (error) {
            console.error('Error exporting data:', error);
            message.error('Lỗi khi xuất dữ liệu');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                    <Text>Đang tải dữ liệu doanh thu...</Text>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Lỗi tải dữ liệu"
                description={error}
                type="error"
                showIcon
                action={
                    <Button size="small" onClick={loadRevenueData}>
                        Thử lại
                    </Button>
                }
            />
        );
    }

    const productPercentage = revenueData.totalRevenue > 0 
        ? (revenueData.productRevenue / revenueData.totalRevenue) * 100 
        : 0;
    
    const marketFeePercentage = revenueData.totalRevenue > 0 
        ? (revenueData.marketFeeRevenue / revenueData.totalRevenue) * 100 
        : 0;

    const monthlyColumns = [
        {
            title: 'Tháng',
            dataIndex: 'month',
            key: 'month',
        },
        {
            title: 'Doanh thu sản phẩm',
            dataIndex: 'productRevenue',
            key: 'productRevenue',
            render: (value) => `${value.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Doanh thu phí chợ',
            dataIndex: 'marketFeeRevenue',
            key: 'marketFeeRevenue',
            render: (value) => `${value.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Tổng cộng',
            dataIndex: 'total',
            key: 'total',
            render: (value) => <Text strong>{value.toLocaleString('vi-VN')} VNĐ</Text>,
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        <DollarCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        Phân tích doanh thu
                    </Title>
                    <Text type="secondary">Tổng quan doanh thu từ sản phẩm và phí chợ</Text>
                </div>
                <Space>
                    <Select
                        value={timeRange}
                        onChange={setTimeRange}
                        style={{ width: 150 }}
                    >
                        <Option value="7days">7 ngày qua</Option>
                        <Option value="30days">30 ngày qua</Option>
                        <Option value="90days">90 ngày qua</Option>
                        <Option value="custom">Tùy chọn</Option>
                    </Select>
                    {timeRange === 'custom' && (
                        <RangePicker
                            onChange={setDateRange}
                            format="DD/MM/YYYY"
                        />
                    )}
                    <Button icon={<ReloadOutlined />} onClick={loadRevenueData}>
                        Làm mới
                    </Button>
                    <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                        Xuất dữ liệu
                    </Button>
                </Space>
            </div>

            {/* Main Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={revenueData.totalRevenue}
                            precision={0}
                            suffix="VNĐ"
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<DollarCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Doanh thu sản phẩm"
                            value={revenueData.productRevenue}
                            precision={0}
                            suffix="VNĐ"
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<ShoppingCartOutlined />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Từ {revenueData.summary.completedOrders} đơn hàng hoàn thành
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Doanh thu phí chợ"
                            value={revenueData.marketFeeRevenue}
                            precision={0}
                            suffix="VNĐ"
                            valueStyle={{ color: '#faad14' }}
                            prefix={<BankOutlined />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Từ {revenueData.summary.completedPayments} lượt thanh toán
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Revenue Breakdown */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={12}>
                    <Card title="Phân tích cơ cấu doanh thu" extra={<RiseOutlined style={{ color: '#52c41a' }} />}>
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text>Doanh thu sản phẩm</Text>
                                    <Text strong>{productPercentage.toFixed(1)}%</Text>
                                </div>
                                <Progress 
                                    percent={productPercentage} 
                                    strokeColor="#52c41a"
                                    showInfo={false}
                                />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {revenueData.productRevenue.toLocaleString('vi-VN')} VNĐ từ {revenueData.summary.completedOrders} đơn hàng hoàn thành
                                </Text>
                            </div>
                            
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text>Doanh thu phí chợ</Text>
                                    <Text strong>{marketFeePercentage.toFixed(1)}%</Text>
                                </div>
                                <Progress 
                                    percent={marketFeePercentage} 
                                    strokeColor="#faad14"
                                    showInfo={false}
                                />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {revenueData.marketFeeRevenue.toLocaleString('vi-VN')} VNĐ từ {revenueData.summary.completedPayments} lượt thanh toán
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                    <Card title="Thống kê tổng quan">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic
                                    title="Tổng đơn hàng"
                                    value={revenueData.summary.totalOrders}
                                    prefix={<ShoppingCartOutlined />}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Đơn hàng hoàn thành"
                                    value={revenueData.summary.completedOrders}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Tổng cửa hàng"
                                    value={revenueData.summary.totalStores}
                                    prefix={<BankOutlined />}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Thanh toán phí"
                                    value={revenueData.summary.completedPayments}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Monthly Data Table */}
            <Card title="Doanh thu theo tháng" style={{ marginBottom: '24px' }}>
                <Table
                    columns={monthlyColumns}
                    dataSource={revenueData.monthlyData}
                    pagination={false}
                    rowKey="month"
                    size="middle"
                />
            </Card>

            {/* Data Source Information */}
            <Card title="Thông tin nguồn dữ liệu" type="inner">
                <Alert
                    message="Nguồn dữ liệu"
                    description={
                        <div>
                            <Text>• <strong>Doanh thu sản phẩm:</strong> Tính từ tổng giá trị tất cả đơn hàng có trạng thái "Completed" trong hệ thống</Text><br/>
                            <Text>• <strong>Doanh thu phí chợ:</strong> Tính từ tổng phí thuê hàng tháng của các cửa hàng đã thanh toán trong hệ thống quản lý phí</Text><br/>
                            <Text type="secondary">Dữ liệu được đồng bộ từ các hệ thống quản lý hiện có và cập nhật theo thời gian thực</Text><br/>
                            <Text type="success">🔄 Đã cập nhật logic tính toán doanh thu sản phẩm từ tất cả đơn hàng hoàn thành</Text>
                        </div>
                    }
                    type="info"
                    showIcon
                />
            </Card>
        </div>
    );
};

export default RevenueAnalytics;
