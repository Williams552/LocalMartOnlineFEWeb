import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Typography,
    Alert,
    Spin,
    message,
    Row,
    Col,
    Statistic,
    Button
} from 'antd';
import {
    DollarOutlined,
    InfoCircleOutlined,
    ReloadOutlined,
    ShopOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import storeService from '../../services/storeService';
import marketService from "../../services/marketService";
import SellerLayout from '../../layouts/SellerLayout';

const { Title, Text } = Typography;

const MarketFees = () => {
    const [loading, setLoading] = useState(true);
    const [storeInfo, setStoreInfo] = useState(null);
    const [marketFees, setMarketFees] = useState([]);
    const [marketInfo, setMarketInfo] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        loadStoreInfo();
    }, []);

    const loadStoreInfo = async () => {
        try {
            setLoading(true);
            
            // Get store information first
            const storeResult = await storeService.getMyStore();
            if (storeResult.success && storeResult.data) {
                setStoreInfo(storeResult.data);
                
                // Load market fees if we have marketId
                if (storeResult.data.marketId) {
                    await loadMarketFees(storeResult.data.marketId);
                    await fetchMarketInfo(storeResult.data.marketId);
                }
            }
        } catch (error) {
            console.error('Error loading store info:', error);
            message.error('Lỗi khi tải thông tin cửa hàng');
        } finally {
            setLoading(false);
        }
    };

        const fetchMarketInfo = async (marketId) => {
        try {
            const result = await marketService.getMarketById(marketId);
            
            if (result) {
                console.log('📍 Market Info Data:', result); // Debug để xem cấu trúc dữ liệu
                setMarketInfo(result);
            }
        } catch (error) {
            console.error('❌ Error fetching market info:', error);
        }
    };

    const loadMarketFees = async (marketId) => {
        try {
            const response = await storeService.getMarketFees(marketId);
            if (response.success) {
                setMarketFees(response.data || []);
            } else {
                message.error(response.message || 'Không thể tải danh sách phí chợ');
            }
        } catch (error) {
            console.error('Error loading market fees:', error);
            message.error('Lỗi khi tải danh sách phí chợ');
        }
    };

    const refreshData = () => {
        loadStoreInfo();
    };

    const columns = [
        {
            title: 'Tên loại phí',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <Text strong>{text}</Text>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text || 'Không có mô tả',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {storeService.formatCurrency(amount)}
                </Text>
            ),
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'paymentDay',
            key: 'paymentDay',
            render: (day) => (
                <Text>
                    Ngày {day} hàng tháng
                </Text>
            ),
        },
    ];

    const calculateStats = () => {
        const total = marketFees.length;
        const totalAmount = marketFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);

        return { total, totalAmount };
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px' 
            }}>
                <Spin size="large" />
            </div>
        );
    }

    const stats = calculateStats();

    return (
        <SellerLayout>
            <div style={{ padding: '16px 24px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                            <DollarOutlined style={{ marginRight: '12px' }} />
                            Loại phí chợ
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            Xem danh sách các loại phí áp dụng trong chợ
                        </Text>
                    </div>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={refreshData}
                        type="default"
                        size="middle"
                    >
                        Làm mới
                    </Button>
                </div>

                {/* Store Information */}
                {storeInfo && (
                    <Alert
                        message={`Cửa hàng: ${storeInfo.name || 'N/A'}`}
                        description={`Chợ: ${marketInfo?.name || 'N/A'} | 
                                    Trạng thái: ${storeInfo.status === 'Open' ? 'Đang hoạt động' : 'Đóng cửa'}`}
                        type="info"
                        showIcon
                        style={{ marginBottom: '24px' }}
                    />
                )}
            </div>

            {/* Statistics Overview */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={12}>
                    <Card>
                        <Statistic
                            title="Tổng loại phí"
                            value={stats.total}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12}>
                    <Card>
                        <Statistic
                            title="Tổng số tiền phí"
                            value={stats.totalAmount}
                            prefix={<DollarOutlined />}
                            formatter={(value) => storeService.formatCurrency(value)}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Market Fees Table */}
            <Card 
                title={
                    <div>
                        <ShopOutlined style={{ marginRight: '8px' }} />
                        Danh sách loại phí
                    </div>
                }
                extra={
                    <Text type="secondary">
                        {marketFees.length} loại phí
                    </Text>
                }
            >
                {marketFees.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <DollarOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                        <Title level={4} style={{ color: '#999', marginTop: '16px' }}>
                            Chưa có loại phí nào
                        </Title>
                        <Text type="secondary">
                            Chợ này chưa thiết lập các loại phí
                        </Text>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={marketFees}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} loại phí`,
                        }}
                        size="middle"
                    />
                )}
            </Card>

            {/* Information Note */}
            <Card style={{ marginTop: '24px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Alert
                    message="Thông tin về loại phí"
                    description={
                        <div>
                            <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                                <li>Đây là danh sách các loại phí áp dụng trong chợ mà cửa hàng của bạn đang hoạt động</li>
                                <li>Các khoản phí sẽ được tính vào hóa đơn thanh toán hàng tháng</li>
                                <li>Ngày thanh toán được quy định cụ thể cho từng loại phí</li>
                                <li>Thông tin chi tiết về từng khoản phí, vui lòng liên hệ với ban quản lý chợ</li>
                                <li>Để xem các khoản phí cần thanh toán, vào mục <strong>"Thanh toán"</strong></li>
                            </ul>
                        </div>
                    }
                    type="info"
                    showIcon
                />
            </Card>
        </div>
        </SellerLayout>
    );
};

export default MarketFees;
