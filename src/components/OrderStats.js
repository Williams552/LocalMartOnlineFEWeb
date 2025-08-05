// src/components/OrderStats.js
import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import {
    ShoppingCartOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';

const OrderStats = ({ statistics, loading = false }) => {
    const {
        totalOrders = 0,
        pendingOrders = 0,
        completedOrders = 0,
        cancelledOrders = 0,
        completionRate = 0
    } = statistics;

    const getCompletionRate = () => {
        if (totalOrders === 0) return 0;
        return Math.round((completedOrders / totalOrders) * 100);
    };

    const getCancellationRate = () => {
        if (totalOrders === 0) return 0;
        return Math.round((cancelledOrders / totalOrders) * 100);
    };

    return (
        <Row gutter={16}>
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
                        title="Đã hủy"
                        value={cancelledOrders}
                        prefix={<CloseCircleOutlined />}
                        valueStyle={{ color: '#f5222d' }}
                    />
                    <div style={{ marginTop: 8 }}>
                        <Progress
                            percent={getCancellationRate()}
                            size="small"
                            strokeColor="#f5222d"
                            showInfo={false}
                        />
                        <small style={{ color: '#666' }}>
                            Tỷ lệ hủy: {getCancellationRate()}%
                        </small>
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

export default OrderStats;
