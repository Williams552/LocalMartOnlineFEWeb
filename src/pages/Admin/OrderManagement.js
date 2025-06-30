// src/pages/Admin/OrderManagement.js
import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Input,
    Select,
    Modal,
    message,
    Drawer,
    Descriptions,
    Row,
    Col,
    Statistic,
    Steps,
    Timeline,
    Avatar
} from 'antd';
import {
    ShoppingCartOutlined,
    EyeOutlined,
    SearchOutlined,
    ExportOutlined,
    DollarCircleOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    ShopOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { Step } = Steps;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        paymentStatus: ''
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const orderStatuses = [
        { value: 'Pending', label: 'Chờ xác nhận', color: 'orange' },
        { value: 'Confirmed', label: 'Đã xác nhận', color: 'blue' },
        { value: 'Processing', label: 'Đang xử lý', color: 'cyan' },
        { value: 'Shipping', label: 'Đang giao hàng', color: 'purple' },
        { value: 'Delivered', label: 'Đã giao', color: 'green' },
        { value: 'Cancelled', label: 'Đã hủy', color: 'red' },
        { value: 'Returned', label: 'Đã trả hàng', color: 'volcano' }
    ];

    const paymentStatuses = [
        { value: 'Pending', label: 'Chờ thanh toán', color: 'orange' },
        { value: 'Paid', label: 'Đã thanh toán', color: 'green' },
        { value: 'Failed', label: 'Thanh toán thất bại', color: 'red' },
        { value: 'Refunded', label: 'Đã hoàn tiền', color: 'purple' }
    ];

    // Mock data - thay thế bằng API call thực tế
    const mockOrders = [
        {
            id: 1,
            orderNumber: 'ORD-2024-001',
            customer: { name: 'Nguyễn Văn A', email: 'customer1@example.com' },
            seller: { name: 'Cửa hàng ABC', email: 'seller1@example.com' },
            items: [
                { name: 'Sản phẩm 1', quantity: 2, price: 100000 },
                { name: 'Sản phẩm 2', quantity: 1, price: 50000 }
            ],
            totalAmount: 250000,
            status: 'Processing',
            paymentStatus: 'Paid',
            paymentMethod: 'VnPay',
            createdAt: '2024-01-15T10:30:00Z',
            deliveryAddress: '123 Nguyễn Văn Linh, Quận 7, TP.HCM'
        },
        // Thêm mock data khác...
    ];

    useEffect(() => {
        loadOrders();
    }, [pagination.current, pagination.pageSize, filters]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            // Mock API call - thay thế bằng service thực tế
            setTimeout(() => {
                setOrders(mockOrders);
                setPagination(prev => ({
                    ...prev,
                    total: mockOrders.length
                }));
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error loading orders:', error);
            message.error('Lỗi khi tải danh sách đơn hàng');
            setLoading(false);
        }
    };

    const getStatusColor = (status, type = 'order') => {
        const statuses = type === 'order' ? orderStatuses : paymentStatuses;
        const statusObj = statuses.find(s => s.value === status);
        return statusObj?.color || 'default';
    };

    const getStatusLabel = (status, type = 'order') => {
        const statuses = type === 'order' ? orderStatuses : paymentStatuses;
        const statusObj = statuses.find(s => s.value === status);
        return statusObj?.label || status;
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setDrawerVisible(true);
    };

    const getOrderStatusStep = (status) => {
        const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipping', 'Delivered'];
        return statusOrder.indexOf(status);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: 150,
            render: (text) => (
                <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</div>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
            width: 200,
            render: (customer) => (
                <Space>
                    <Avatar icon={<UserOutlined />} size="small" />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{customer.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{customer.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Người bán',
            dataIndex: 'seller',
            key: 'seller',
            width: 200,
            render: (seller) => (
                <Space>
                    <Avatar icon={<ShopOutlined />} size="small" />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{seller.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{seller.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 120,
            render: (amount) => (
                <div style={{ fontWeight: 'bold', color: '#f5222d' }}>
                    {amount?.toLocaleString('vi-VN')} VNĐ
                </div>
            ),
        },
        {
            title: 'Trạng thái đơn hàng',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status) => (
                <Tag color={getStatusColor(status, 'order')}>
                    {getStatusLabel(status, 'order')}
                </Tag>
            ),
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status, 'payment')}>
                    {getStatusLabel(status, 'payment')}
                </Tag>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewOrder(record)}
                    title="Xem chi tiết"
                />
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Quản lý đơn hàng</h2>
                    <p style={{ margin: 0, color: '#666' }}>Theo dõi và xử lý tất cả đơn hàng</p>
                </div>
                <Space>
                    <Button icon={<ExportOutlined />}>Xuất Excel</Button>
                </Space>
            </div>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={pagination.total}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Chờ xử lý"
                            value={orders.filter(o => ['Pending', 'Confirmed'].includes(o.status)).length}
                            valueStyle={{ color: '#fa8c16' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={orders.filter(o => o.status === 'Delivered').length}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={2850000}
                            precision={0}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<DollarCircleOutlined />}
                            suffix="VNĐ"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Search
                            placeholder="Tìm kiếm mã đơn hàng, khách hàng..."
                            allowClear
                            onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái đơn hàng"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        >
                            {orderStatuses.map(status => (
                                <Option key={status.value} value={status.value}>
                                    {status.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái thanh toán"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}
                        >
                            {paymentStatuses.map(status => (
                                <Option key={status.value} value={status.value}>
                                    {status.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button onClick={loadOrders}>Làm mới</Button>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đơn hàng`,
                    }}
                    onChange={setPagination}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Order Detail Drawer */}
            <Drawer
                title="Chi tiết đơn hàng"
                placement="right"
                size="large"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                {selectedOrder && (
                    <div>
                        {/* Order Header */}
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <h3>{selectedOrder.orderNumber}</h3>
                            <Space>
                                <Tag color={getStatusColor(selectedOrder.status, 'order')}>
                                    {getStatusLabel(selectedOrder.status, 'order')}
                                </Tag>
                                <Tag color={getStatusColor(selectedOrder.paymentStatus, 'payment')}>
                                    {getStatusLabel(selectedOrder.paymentStatus, 'payment')}
                                </Tag>
                            </Space>
                        </div>

                        {/* Order Progress */}
                        <Card title="Tiến trình đơn hàng" style={{ marginBottom: '16px' }}>
                            <Steps
                                current={getOrderStatusStep(selectedOrder.status)}
                                status={selectedOrder.status === 'Cancelled' ? 'error' : 'process'}
                                size="small"
                            >
                                <Step title="Chờ xác nhận" />
                                <Step title="Đã xác nhận" />
                                <Step title="Đang xử lý" />
                                <Step title="Đang giao hàng" />
                                <Step title="Đã giao" />
                            </Steps>
                        </Card>

                        {/* Order Information */}
                        <Descriptions bordered column={1} style={{ marginBottom: '16px' }}>
                            <Descriptions.Item label="Khách hàng">
                                <Space>
                                    <Avatar icon={<UserOutlined />} />
                                    <div>
                                        <div>{selectedOrder.customer.name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {selectedOrder.customer.email}
                                        </div>
                                    </div>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Người bán">
                                <Space>
                                    <Avatar icon={<ShopOutlined />} />
                                    <div>
                                        <div>{selectedOrder.seller.name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {selectedOrder.seller.email}
                                        </div>
                                    </div>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng">
                                {selectedOrder.deliveryAddress}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">
                                {selectedOrder.paymentMethod}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt hàng">
                                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Order Items */}
                        <Card title="Sản phẩm đặt hàng" style={{ marginBottom: '16px' }}>
                            <Table
                                dataSource={selectedOrder.items}
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Sản phẩm',
                                        dataIndex: 'name',
                                        key: 'name',
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        key: 'quantity',
                                        width: 100,
                                    },
                                    {
                                        title: 'Đơn giá',
                                        dataIndex: 'price',
                                        key: 'price',
                                        width: 120,
                                        render: (price) => `${price.toLocaleString('vi-VN')} VNĐ`,
                                    },
                                    {
                                        title: 'Thành tiền',
                                        key: 'total',
                                        width: 120,
                                        render: (_, record) =>
                                            `${(record.price * record.quantity).toLocaleString('vi-VN')} VNĐ`,
                                    },
                                ]}
                            />
                            <div style={{
                                textAlign: 'right',
                                marginTop: '16px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#f5222d'
                            }}>
                                Tổng cộng: {selectedOrder.totalAmount.toLocaleString('vi-VN')} VNĐ
                            </div>
                        </Card>

                        {/* Actions */}
                        <div style={{ textAlign: 'center' }}>
                            <Space>
                                <Button type="primary">
                                    Cập nhật trạng thái
                                </Button>
                                <Button>
                                    Liên hệ khách hàng
                                </Button>
                                <Button>
                                    In đơn hàng
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default OrderManagement;
