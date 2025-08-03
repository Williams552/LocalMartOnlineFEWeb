import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Alert,
    Button,
    Space,
    Statistic,
    Spin
} from 'antd';
import {
    CreditCardOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import SellerLayout from '../../layouts/SellerLayout';
import PaymentOptions from '../../components/Seller/PaymentOptions';
import storeService from '../../services/storeService';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const SellerPayments = () => {
    const [loading, setLoading] = useState(true);
    const [storeInfo, setStoreInfo] = useState(null);
    const [payments, setPayments] = useState([]);
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
                
                // Load payments if we have sellerId
                if (storeResult.data.sellerId) {
                    await loadPayments(storeResult.data.sellerId);
                }
            }
        } catch (error) {
            console.error('Error loading store info:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPayments = async (sellerId) => {
        try {
            const response = await storeService.getPendingPayments(sellerId);
            if (response.success) {
                setPayments(response.data || []);
            }
        } catch (error) {
            console.error('Error loading payments:', error);
        }
    };

    const calculateStats = () => {
        const total = payments.length;
        const pending = payments.filter(p => p.paymentStatus === 'Pending').length;
        const overdue = payments.filter(p => p.paymentStatus === 'Pending' && p.isOverdue).length;
        const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        return { total, pending, overdue, totalAmount };
    };

    const refreshData = () => {
        loadStoreInfo();
    };

    if (loading) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Spin size="large" />
                </div>
            </SellerLayout>
        );
    }

    const stats = calculateStats();

    return (
        <SellerLayout>
            <div style={{ padding: '24px' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <Title level={2} style={{ margin: 0 }}>
                                <CreditCardOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                                Quản lý Thanh toán
                            </Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>
                                Theo dõi và thanh toán các khoản phí cửa hàng
                            </Text>
                        </div>
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={refreshData}
                            type="default"
                        >
                            Làm mới
                        </Button>
                    </div>

                    {/* Store Information */}
                    {storeInfo && (
                        <Alert
                            message={`Cửa hàng: ${storeInfo.name || 'N/A'}`}
                            description={`Trạng thái: ${storeInfo.status === 'Open' ? 'Đang hoạt động' : 'Đóng cửa'} | 
                                        Địa chỉ: ${storeInfo.address || 'Chưa cập nhật'}`}
                            type="info"
                            showIcon
                            style={{ marginBottom: '24px' }}
                        />
                    )}
                </div>

                {/* Statistics Overview */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng khoản phí"
                                value={stats.total}
                                prefix={<CreditCardOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Chờ thanh toán"
                                value={stats.pending}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Quá hạn"
                                value={stats.overdue}
                                prefix={<ExclamationCircleOutlined />}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng số tiền"
                                value={stats.totalAmount}
                                prefix={<DollarOutlined />}
                                formatter={(value) => storeService.formatCurrency(value)}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Alerts for overdue payments */}
                {stats.overdue > 0 && (
                    <Alert
                        message="Cảnh báo thanh toán quá hạn"
                        description={`Bạn có ${stats.overdue} khoản phí đã quá hạn thanh toán. Vui lòng thanh toán ngay để tránh bị tính phí phạt.`}
                        type="error"
                        showIcon
                        style={{ marginBottom: '24px' }}
                        action={
                            <Space>
                                <Button size="small" type="primary" danger>
                                    Thanh toán quá hạn
                                </Button>
                                <Button size="small">
                                    Xem chi tiết
                                </Button>
                            </Space>
                        }
                    />
                )}

                {/* Quick Actions */}

                {/* Payment Options Component */}
                <div data-payment-options>
                    <div style={{ marginBottom: '16px' }}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Title level={4} style={{ margin: 0 }}>
                                    <CreditCardOutlined style={{ marginRight: '8px' }} />
                                    Danh sách thanh toán
                                </Title>
                            </Col>
                        </Row>
                    </div>
                    
                    {/* Thông báo khi không có payments */}
                    {stats.total === 0 && (
                        <Alert
                            message="Không có khoản phí nào"
                            description="Hiện tại bạn không có khoản phí nào cần thanh toán. Hệ thống sẽ thông báo khi có phí mới phát sinh."
                            type="success"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />
                    )}
                    
                    <PaymentOptions sellerId={storeInfo?.sellerId} />
                </div>

                {/* Additional Information */}
                <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                    <Col xs={24} md={12}>
                        <Card 
                            title="Hướng dẫn thanh toán" 
                            style={{ height: '100%' }}
                        >
                            <div style={{ lineHeight: '1.8' }}>
                                <Text strong>Các bước thanh toán qua VnPay:</Text>
                                <ol style={{ marginTop: '12px', paddingLeft: '20px' }}>
                                    <li>Chọn khoản phí cần thanh toán</li>
                                    <li>Nhấn nút "Thanh toán" để tạo link VnPay</li>
                                    <li>Được chuyển hướng đến trang VnPay</li>
                                    <li>Chọn phương thức thanh toán (ATM, QR, v.v.)</li>
                                    <li>Hoàn tất thanh toán theo hướng dẫn</li>
                                    <li>Hệ thống tự động cập nhật trạng thái</li>
                                </ol>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card 
                            title="Lưu ý quan trọng" 
                            style={{ height: '100%' }}
                        >
                            <div style={{ lineHeight: '1.8' }}>
                                <ul style={{ paddingLeft: '20px' }}>
                                    <li><Text strong>Thanh toán đúng hạn:</Text> Tránh phí phạt chậm trễ</li>
                                    <li><Text strong>Kiểm tra thông tin:</Text> Xác nhận số tiền và nội dung</li>
                                    <li><Text strong>Lưu biên lai:</Text> Giữ lại để đối soát sau này</li>
                                    <li><Text strong>Liên hệ hỗ trợ:</Text> Nếu có vấn đề về thanh toán</li>
                                    <li><Text strong>Theo dõi thường xuyên:</Text> Kiểm tra có phí mới phát sinh</li>
                                </ul>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </SellerLayout>
    );
};

export default SellerPayments;
