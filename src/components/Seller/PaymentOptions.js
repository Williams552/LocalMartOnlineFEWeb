import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    message,
    Typography,
    Alert,
    Modal,
    Descriptions,
    Tooltip,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    CreditCardOutlined,
    DollarOutlined,
    CalendarOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    PayCircleOutlined
} from '@ant-design/icons';
import storeService from '../../services/storeService';
import moment from 'moment';

const { Title, Text } = Typography;

const PaymentOptions = ({ sellerId }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentDetailVisible, setPaymentDetailVisible] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(null);

    useEffect(() => {
        if (sellerId) {
            loadPendingPayments();
        }
    }, [sellerId]);

    const loadPendingPayments = async () => {
        if (!sellerId) {
            console.warn('No sellerId provided for PaymentOptions');
            return;
        }
        
        setLoading(true);
        try {
            const response = await storeService.getPendingPayments(sellerId);
            if (response.success) {
                setPayments(response.data || []);
            } else {
                message.error(response.message || 'Không thể tải danh sách phí cần thanh toán');
            }
        } catch (error) {
            console.error('Error loading pending payments:', error);
            message.error('Lỗi khi tải danh sách phí cần thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (payment) => {
        try {
            setProcessingPayment(payment.paymentId);
            
            const response = await storeService.createVnPayPaymentUrl(payment.paymentId);
            
            if (response.success && response.data?.paymentUrl) {
                // Redirect to VnPay payment page
                window.open(response.data.paymentUrl, '_blank');
                message.success('Chuyển hướng đến trang thanh toán VnPay');
            } else {
                message.error(response.message || 'Không thể tạo URL thanh toán');
            }
        } catch (error) {
            console.error('Error creating payment URL:', error);
            message.error('Lỗi khi tạo URL thanh toán');
        } finally {
            setProcessingPayment(null);
        }
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setPaymentDetailVisible(true);
    };

    const getPaymentStatusTag = (paymentStatus, isOverdue, daysOverdue) => {
        if (paymentStatus === 'Pending') {
            if (isOverdue) {
                return (
                    <Tag color="volcano" icon={<ExclamationCircleOutlined />}>
                        Quá hạn ({daysOverdue} ngày)
                    </Tag>
                );
            }
            return (
                <Tag color="orange" icon={<ClockCircleOutlined />}>
                    Chờ thanh toán
                </Tag>
            );
        }
        
        const statusMap = {
            'Completed': { color: 'green', text: 'Đã thanh toán' },
            'Failed': { color: 'red', text: 'Thất bại' },
            'Processing': { color: 'blue', text: 'Đang xử lý' }
        };
        
        const statusInfo = statusMap[paymentStatus] || { color: 'default', text: paymentStatus };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
    };

    const calculateTotalAmount = () => {
        return payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    };

    const getPendingCount = () => {
        return payments.filter(p => p.paymentStatus === 'Pending').length;
    };

    const getOverdueCount = () => {
        return payments.filter(p => p.paymentStatus === 'Pending' && p.isOverdue).length;
    };

    const columns = [
        {
            title: 'Loại phí',
            dataIndex: 'feeTypeName',
            key: 'feeTypeName',
            render: (text) => (
                <Text strong>{text}</Text>
            ),
        },
        {
            title: 'Chợ',
            dataIndex: 'marketName',
            key: 'marketName',
            render: (text) => (
                <Text>{text}</Text>
            ),
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
            title: 'Hạn thanh toán',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => {
                const isOverdue = moment().isAfter(moment(date));
                return (
                    <div>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
                            {moment(date).format('DD/MM/YYYY')}
                        </span>
                    </div>
                );
            },
        },
        {
            title: 'Trạng thái',
            key: 'paymentStatus',
            render: (_, record) => getPaymentStatusTag(record.paymentStatus, record.isOverdue, record.daysOverdue),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<InfoCircleOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    {record.paymentStatus === 'Pending' && (
                        <Button
                            type="primary"
                            icon={<PayCircleOutlined />}
                            size="small"
                            loading={processingPayment === record.paymentId}
                            onClick={() => handlePayment(record)}
                        >
                            Thanh toán
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    if (!sellerId) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <CreditCardOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                    <Title level={4} style={{ color: '#999', marginTop: '16px' }}>
                        Đang tải thông tin thanh toán...
                    </Title>
                    <Text type="secondary">
                        Vui lòng đợi trong giây lát
                    </Text>
                </div>
            </Card>
        );
    }

    if (!payments.length && !loading) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <CreditCardOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                    <Title level={4} style={{ color: '#999', marginTop: '16px' }}>
                        Không có khoản phí nào cần thanh toán
                    </Title>
                    <Text type="secondary">
                        Tất cả các khoản phí của bạn đã được thanh toán
                    </Text>
                </div>
            </Card>
        );
    }

    return (
        <div>
            <Card>
                <div style={{ marginBottom: '16px' }}>
                    <Title level={4}>
                        <CreditCardOutlined /> Tùy chọn thanh toán
                    </Title>
                    
                    {payments.length > 0 && (
                        <Alert
                            message="Thông báo thanh toán"
                            description={`Bạn có ${getPendingCount()} khoản phí cần thanh toán${getOverdueCount() > 0 ? `, trong đó ${getOverdueCount()} khoản đã quá hạn` : ''}.`}
                            type={getOverdueCount() > 0 ? "error" : "warning"}
                            showIcon
                            style={{ marginTop: '8px' }}
                        />
                    )}
                </div>

                {/* Statistics */}
                <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={8}>
                        <Statistic
                            title="Tổng số phí"
                            value={payments.length}
                            prefix={<CreditCardOutlined />}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Chờ thanh toán"
                            value={getPendingCount()}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Tổng tiền"
                            value={calculateTotalAmount()}
                            prefix={<DollarOutlined />}
                            formatter={(value) => storeService.formatCurrency(value)}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                </Row>

                {/* Payment Table */}
                <Table
                    columns={columns}
                    dataSource={payments}
                    rowKey="paymentId"
                    loading={loading}
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: false,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} khoản phí`,
                    }}
                    size="middle"
                />
            </Card>

            {/* Payment Detail Modal */}
            <Modal
                title="Chi tiết thanh toán"
                open={paymentDetailVisible}
                onCancel={() => {
                    setPaymentDetailVisible(false);
                    setSelectedPayment(null);
                }}
                footer={[
                    <Button 
                        key="close" 
                        onClick={() => {
                            setPaymentDetailVisible(false);
                            setSelectedPayment(null);
                        }}
                    >
                        Đóng
                    </Button>,
                    selectedPayment?.paymentStatus === 'Pending' && (
                        <Button
                            key="pay"
                            type="primary"
                            icon={<PayCircleOutlined />}
                            loading={processingPayment === selectedPayment?.paymentId}
                            onClick={() => {
                                setPaymentDetailVisible(false);
                                handlePayment(selectedPayment);
                            }}
                        >
                            Thanh toán ngay
                        </Button>
                    )
                ]}
                width={600}
            >
                {selectedPayment && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <CreditCardOutlined style={{ fontSize: '32px' }} />
                            </div>
                            <Title level={4}>Chi tiết khoản phí</Title>
                        </div>

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Loại phí">
                                <Text strong>{selectedPayment.feeTypeName}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {selectedPayment.description || 'Không có mô tả'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tiền">
                                <Text strong style={{ color: '#1890ff', fontSize: '18px' }}>
                                    {storeService.formatCurrency(selectedPayment.amount)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Hạn thanh toán">
                                <span style={{ 
                                    color: selectedPayment.isOverdue ? '#ff4d4f' : 'inherit' 
                                }}>
                                    {moment(selectedPayment.dueDate).format('DD/MM/YYYY HH:mm')}
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {getPaymentStatusTag(selectedPayment.paymentStatus, selectedPayment.isOverdue, selectedPayment.daysOverdue)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {moment(selectedPayment.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            {selectedPayment.notes && (
                                <Descriptions.Item label="Ghi chú">
                                    {selectedPayment.notes}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {selectedPayment.paymentStatus === 'Pending' && selectedPayment.isOverdue && (
                            <Alert
                                message="Khoản phí này đã quá hạn"
                                description="Vui lòng thanh toán ngay để tránh bị tính phí phạt."
                                type="error"
                                showIcon
                                style={{ marginTop: '16px' }}
                            />
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PaymentOptions;
