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
    Button,
    Empty
} from 'antd';
import {
    FileTextOutlined,
    InfoCircleOutlined,
    ReloadOutlined,
    ShopOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import storeService from '../../services/storeService';
import marketService from "../../services/marketService";
import SellerLayout from '../../layouts/SellerLayout';
import moment from 'moment';

const { Title, Text } = Typography;

const MarketRules = () => {
    const [loading, setLoading] = useState(true);
    const [storeInfo, setStoreInfo] = useState(null);
    const [marketRules, setMarketRules] = useState([]);
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
                
                // Load market rules if we have marketId
                if (storeResult.data.marketId) {
                    await loadMarketRules(storeResult.data.marketId);
                    fetchMarketInfo(storeResult.data.marketId);
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

    const loadMarketRules = async (marketId) => {
        try {
            const response = await storeService.getMarketRules(marketId);
            if (response.success) {
                setMarketRules(response.data || []);
            } else {
                message.error(response.message || 'Không thể tải quy định chợ');
            }
        } catch (error) {
            console.error('Error loading market rules:', error);
            message.error('Lỗi khi tải quy định chợ');
        }
    };

    const refreshData = () => {
        loadStoreInfo();
    };

    const columns = [
        {
            title: 'Tên quy định',
            dataIndex: 'ruleName',
            key: 'ruleName',
            render: (text) => (
                <Text strong>{text}</Text>
            ),
        },
        {
            title: 'Mô tả chi tiết',
            dataIndex: 'description',
            key: 'description',
            render: (text) => (
                <div style={{ maxWidth: '400px' }}>
                    <Text>{text || 'Không có mô tả'}</Text>
                </div>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <div>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {moment(date).format('DD/MM/YYYY')}
                </div>
            ),
        },
        {
            title: 'Cập nhật lần cuối',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => (
                <div>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {moment(date).format('DD/MM/YYYY')}
                </div>
            ),
        },
    ];

    const calculateStats = () => {
        const total = marketRules.length;
        const latestUpdate = marketRules.length > 0 
            ? moment.max(marketRules.map(rule => moment(rule.updatedAt)))
            : null;

        return { total, latestUpdate };
    };

    if (loading) {
        return (
            <SellerLayout>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px' 
                }}>
                    <Spin size="large" />
                </div>
            </SellerLayout>
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
                                <FileTextOutlined style={{ marginRight: '12px' }} />
                                Quy định chợ
                            </Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>
                                Xem các quy định và điều khoản của chợ
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
                                title="Tổng số quy định"
                                value={stats.total}
                                prefix={<FileTextOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Card>
                            <Statistic
                                title="Cập nhật gần nhất"
                                value={stats.latestUpdate ? stats.latestUpdate.format('DD/MM/YYYY') : 'Chưa có'}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Market Rules Table */}
                <Card 
                    title={
                        <div>
                            <ShopOutlined style={{ marginRight: '8px' }} />
                            Danh sách quy định
                        </div>
                    }
                    extra={
                        <Text type="secondary">
                            {marketRules.length} quy định
                        </Text>
                    }
                >
                    {marketRules.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <Title level={4} style={{ color: '#999', marginTop: '16px' }}>
                                        Chưa có quy định nào
                                    </Title>
                                    <Text type="secondary">
                                        Chợ này chưa thiết lập các quy định cụ thể
                                    </Text>
                                </div>
                            }
                        />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={marketRules}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: false,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} của ${total} quy định`,
                            }}
                            size="middle"
                        />
                    )}
                </Card>

                {/* Information Note */}
                <Card style={{ marginTop: '24px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                    <Alert
                        message="Thông tin về quy định chợ"
                        description={
                            <div>
                                <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                                    <li>Đây là danh sách các quy định và điều khoản mà cửa hàng cần tuân thủ</li>
                                    <li>Vui lòng đọc kỹ và tuân thủ tất cả các quy định được liệt kê</li>
                                    <li>Việc vi phạm quy định có thể dẫn đến cảnh báo hoặc tạm ngưng hoạt động</li>
                                    <li>Nếu có thắc mắc về bất kỳ quy định nào, vui lòng liên hệ với ban quản lý chợ</li>
                                    <li>Quy định có thể được cập nhật theo thời gian, vui lòng kiểm tra thường xuyên</li>
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

export default MarketRules;
