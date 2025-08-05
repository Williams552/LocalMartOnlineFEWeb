// src/components/OrderStats.js
import React from 'react';
import { Card, Row, Col, Statistic, Progress, Tooltip, Divider, Typography } from 'antd';
import {
    ShoppingCartOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DollarCircleOutlined,
    RiseOutlined,
    CalendarOutlined,
    CreditCardOutlined,
    TruckOutlined,
    ToolOutlined,
    BankOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const OrderStats = ({ statistics, loading = false }) => {
    const {
        totalOrders = 0,
        pendingOrders = 0,
        completedOrders = 0,
        cancelledOrders = 0,
        paidOrders = 0,
        todayRevenue = 0,
        monthlyRevenue = 0,
        totalRevenue = 0,
        averageOrderValue = 0,
        completionRate = 0,
        paymentRate = 0,
        revenueBreakdown = {}
    } = statistics;

    const getCompletionRate = () => {
        if (totalOrders === 0) return 0;
        return Math.round((completedOrders / totalOrders) * 100);
    };

    const getCancellationRate = () => {
        if (totalOrders === 0) return 0;
        return Math.round((cancelledOrders / totalOrders) * 100);
    };

    const getPaymentRate = () => {
        if (totalOrders === 0) return 0;
        return Math.round((paidOrders / totalOrders) * 100);
    };

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={totalOrders}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <small style={{ color: '#666' }}>
                                Tất cả thời gian
                            </small>
                        </div>
                    </Card>
                </Col>

                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Chờ xử lý"
                            value={pendingOrders}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Progress
                                percent={totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0}
                                size="small"
                                strokeColor="#fa8c16"
                                showInfo={false}
                            />
                        </div>
                    </Card>
                </Col>

                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Hoàn thành"
                            value={completedOrders}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Progress
                                percent={getCompletionRate()}
                                size="small"
                                strokeColor="#52c41a"
                                showInfo={false}
                            />
                            <small style={{ color: '#666' }}>
                                Tỷ lệ: {getCompletionRate()}%
                            </small>
                        </div>
                    </Card>
                </Col>

                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Đã thanh toán"
                            value={paidOrders}
                            prefix={<CreditCardOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Progress
                                percent={getPaymentRate()}
                                size="small"
                                strokeColor="#722ed1"
                                showInfo={false}
                            />
                            <small style={{ color: '#666' }}>
                                Tỷ lệ: {getPaymentRate()}%
                            </small>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card loading={loading}>
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={todayRevenue}
                            precision={0}
                            prefix={<DollarCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                            suffix="VNĐ"
                        />
                        <div style={{ marginTop: 8 }}>
                            <small style={{ color: '#666' }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {new Date().toLocaleDateString('vi-VN')}
                            </small>
                        </div>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card loading={loading}>
                        <Statistic
                            title="Doanh thu tháng này"
                            value={monthlyRevenue}
                            precision={0}
                            prefix={<DollarCircleOutlined />}
                            valueStyle={{ color: '#eb2f96' }}
                            suffix="VNĐ"
                        />
                        <div style={{ marginTop: 8 }}>
                            <small style={{ color: '#666' }}>
                                Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                            </small>
                        </div>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card loading={loading}>
                        <Tooltip title="Doanh thu trung bình mỗi đơn hàng đã thanh toán">
                            <Statistic
                                title="Giá trị TB/đơn"
                                value={averageOrderValue}
                                precision={0}
                                prefix={<RiseOutlined />}
                                valueStyle={{ color: '#13c2c2' }}
                                suffix="VNĐ"
                            />
                        </Tooltip>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default OrderStats;
