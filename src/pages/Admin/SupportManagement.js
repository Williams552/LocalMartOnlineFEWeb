// src/pages/Admin/SupportManagement.js
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
    Form,
    message,
    Drawer,
    Descriptions,
    Row,
    Col,
    Statistic,
    Timeline,
    Avatar,
    Badge,
    Tabs
} from 'antd';
import {
    CustomerServiceOutlined,
    EyeOutlined,
    MessageOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const SupportManagement = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        priority: '',
        category: ''
    });
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [responseModal, setResponseModal] = useState(false);
    const [form] = Form.useForm();

    // Mock data for support requests
    const mockRequests = [
        {
            id: 1,
            ticketNumber: 'SUP-2024-001',
            user: {
                name: 'Nguyễn Văn A',
                email: 'customer1@example.com',
                phone: '0901234567'
            },
            subject: 'Không thể thanh toán đơn hàng',
            category: 'payment',
            priority: 'high',
            status: 'open',
            description: 'Tôi gặp lỗi khi thanh toán đơn hàng qua VnPay. Hệ thống báo lỗi "Transaction failed".',
            createdAt: '2024-01-15T10:30:00Z',
            assignedTo: 'Admin User',
            responses: [
                {
                    id: 1,
                    author: 'Nguyễn Văn A',
                    message: 'Tôi gặp lỗi khi thanh toán đơn hàng qua VnPay.',
                    timestamp: '2024-01-15T10:30:00Z',
                    isCustomer: true
                }
            ]
        },
        {
            id: 2,
            ticketNumber: 'SUP-2024-002',
            user: {
                name: 'Trần Thị B',
                email: 'customer2@example.com',
                phone: '0901234568'
            },
            subject: 'Sản phẩm giao không đúng',
            category: 'delivery',
            priority: 'medium',
            status: 'in_progress',
            description: 'Đơn hàng của tôi giao sai sản phẩm. Tôi đặt rau xanh nhưng nhận được thịt.',
            createdAt: '2024-01-14T14:20:00Z',
            assignedTo: 'Support Agent 1'
        },
        {
            id: 3,
            ticketNumber: 'SUP-2024-003',
            user: {
                name: 'Lê Văn C',
                email: 'seller1@example.com',
                phone: '0901234569'
            },
            subject: 'Tài khoản bị khóa',
            category: 'account',
            priority: 'urgent',
            status: 'resolved',
            description: 'Tài khoản bán hàng của tôi bị khóa mà không có thông báo.',
            createdAt: '2024-01-13T09:15:00Z',
            assignedTo: 'Admin User'
        }
    ];

    const categories = [
        { value: 'payment', label: 'Thanh toán', color: 'blue' },
        { value: 'delivery', label: 'Giao hàng', color: 'green' },
        { value: 'account', label: 'Tài khoản', color: 'orange' },
        { value: 'product', label: 'Sản phẩm', color: 'purple' },
        { value: 'technical', label: 'Kỹ thuật', color: 'red' },
        { value: 'other', label: 'Khác', color: 'default' }
    ];

    const priorities = [
        { value: 'low', label: 'Thấp', color: 'default' },
        { value: 'medium', label: 'Trung bình', color: 'orange' },
        { value: 'high', label: 'Cao', color: 'red' },
        { value: 'urgent', label: 'Khẩn cấp', color: 'volcano' }
    ];

    const statuses = [
        { value: 'open', label: 'Mở', color: 'orange' },
        { value: 'in_progress', label: 'Đang xử lý', color: 'blue' },
        { value: 'resolved', label: 'Đã giải quyết', color: 'green' },
        { value: 'closed', label: 'Đã đóng', color: 'default' }
    ];

    useEffect(() => {
        loadRequests();
    }, [pagination.current, pagination.pageSize, filters]);

    const loadRequests = () => {
        setLoading(true);
        // Mock API call
        setTimeout(() => {
            setRequests(mockRequests);
            setPagination(prev => ({
                ...prev,
                total: mockRequests.length
            }));
            setLoading(false);
        }, 1000);
    };

    const getColorByValue = (value, type) => {
        let options = [];
        switch (type) {
            case 'category':
                options = categories;
                break;
            case 'priority':
                options = priorities;
                break;
            case 'status':
                options = statuses;
                break;
            default:
                return 'default';
        }
        const option = options.find(opt => opt.value === value);
        return option?.color || 'default';
    };

    const getLabelByValue = (value, type) => {
        let options = [];
        switch (type) {
            case 'category':
                options = categories;
                break;
            case 'priority':
                options = priorities;
                break;
            case 'status':
                options = statuses;
                break;
            default:
                return value;
        }
        const option = options.find(opt => opt.value === value);
        return option?.label || value;
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setDrawerVisible(true);
    };

    const handleResponse = (request) => {
        setSelectedRequest(request);
        form.resetFields();
        setResponseModal(true);
    };

    const handleSubmitResponse = async (values) => {
        try {
            // Mock API call to add response
            const newResponse = {
                id: Date.now(),
                author: 'Admin User',
                message: values.message,
                timestamp: new Date().toISOString(),
                isCustomer: false
            };

            setRequests(prev => prev.map(req =>
                req.id === selectedRequest.id
                    ? {
                        ...req,
                        responses: [...(req.responses || []), newResponse],
                        status: values.status || req.status
                    }
                    : req
            ));

            message.success('Phản hồi đã được gửi');
            setResponseModal(false);
            form.resetFields();
        } catch (error) {
            message.error('Lỗi khi gửi phản hồi');
        }
    };

    const columns = [
        {
            title: 'Mã ticket',
            dataIndex: 'ticketNumber',
            key: 'ticketNumber',
            width: 120,
            render: (text) => (
                <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</div>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            width: 200,
            render: (user) => (
                <Space>
                    <Avatar icon={<UserOutlined />} size="small" />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'subject',
            key: 'subject',
            width: 250,
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (category) => (
                <Tag color={getColorByValue(category, 'category')}>
                    {getLabelByValue(category, 'category')}
                </Tag>
            ),
        },
        {
            title: 'Độ ưu tiên',
            dataIndex: 'priority',
            key: 'priority',
            width: 120,
            render: (priority) => (
                <Tag color={getColorByValue(priority, 'priority')}>
                    {getLabelByValue(priority, 'priority')}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getColorByValue(status, 'status')}>
                    {getLabelByValue(status, 'status')}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewRequest(record)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<MessageOutlined />}
                        onClick={() => handleResponse(record)}
                        title="Phản hồi"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Hỗ trợ khách hàng</h2>
                    <p style={{ margin: 0, color: '#666' }}>Quản lý yêu cầu hỗ trợ và phản hồi khách hàng</p>
                </div>
            </div>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng yêu cầu"
                            value={pagination.total}
                            prefix={<CustomerServiceOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Chờ xử lý"
                            value={requests.filter(r => r.status === 'open').length}
                            valueStyle={{ color: '#fa8c16' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đang xử lý"
                            value={requests.filter(r => r.status === 'in_progress').length}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<ExclamationCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã giải quyết"
                            value={requests.filter(r => r.status === 'resolved').length}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Search
                            placeholder="Tìm kiếm theo mã ticket, khách hàng..."
                            allowClear
                            onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        >
                            {statuses.map(status => (
                                <Option key={status.value} value={status.value}>
                                    {status.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Độ ưu tiên"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                        >
                            {priorities.map(priority => (
                                <Option key={priority.value} value={priority.value}>
                                    {priority.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Danh mục"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                        >
                            {categories.map(category => (
                                <Option key={category.value} value={category.value}>
                                    {category.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button onClick={loadRequests}>Làm mới</Button>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={requests}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} yêu cầu`,
                    }}
                    onChange={setPagination}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Request Detail Drawer */}
            <Drawer
                title="Chi tiết yêu cầu hỗ trợ"
                placement="right"
                size="large"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                {selectedRequest && (
                    <div>
                        {/* Request Header */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3>{selectedRequest.ticketNumber}</h3>
                            <Space>
                                <Tag color={getColorByValue(selectedRequest.status, 'status')}>
                                    {getLabelByValue(selectedRequest.status, 'status')}
                                </Tag>
                                <Tag color={getColorByValue(selectedRequest.priority, 'priority')}>
                                    {getLabelByValue(selectedRequest.priority, 'priority')}
                                </Tag>
                                <Tag color={getColorByValue(selectedRequest.category, 'category')}>
                                    {getLabelByValue(selectedRequest.category, 'category')}
                                </Tag>
                            </Space>
                        </div>

                        {/* Customer Information */}
                        <Descriptions bordered column={1} style={{ marginBottom: '16px' }}>
                            <Descriptions.Item label="Khách hàng">
                                <Space>
                                    <Avatar icon={<UserOutlined />} />
                                    <div>
                                        <div>{selectedRequest.user.name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            <MailOutlined /> {selectedRequest.user.email}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            <PhoneOutlined /> {selectedRequest.user.phone}
                                        </div>
                                    </div>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiêu đề">
                                {selectedRequest.subject}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {selectedRequest.description}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người phụ trách">
                                {selectedRequest.assignedTo}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Conversation Timeline */}
                        <Card title="Lịch sử trao đổi" style={{ marginBottom: '16px' }}>
                            <Timeline>
                                {selectedRequest.responses?.map((response, index) => (
                                    <Timeline.Item
                                        key={response.id}
                                        color={response.isCustomer ? 'blue' : 'green'}
                                    >
                                        <div style={{ marginBottom: '8px' }}>
                                            <Badge
                                                status={response.isCustomer ? 'processing' : 'success'}
                                                text={response.author}
                                            />
                                            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                                                {new Date(response.timestamp).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                        <div style={{
                                            padding: '12px',
                                            backgroundColor: response.isCustomer ? '#f0f9ff' : '#f6ffed',
                                            borderRadius: '8px',
                                            border: `1px solid ${response.isCustomer ? '#d1ecf1' : '#d9f7be'}`
                                        }}>
                                            {response.message}
                                        </div>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        </Card>

                        {/* Actions */}
                        <div style={{ textAlign: 'center' }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<MessageOutlined />}
                                    onClick={() => {
                                        setDrawerVisible(false);
                                        handleResponse(selectedRequest);
                                    }}
                                >
                                    Phản hồi
                                </Button>
                                <Button>
                                    Chuyển phụ trách
                                </Button>
                                <Button>
                                    Đóng ticket
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Response Modal */}
            <Modal
                title="Phản hồi yêu cầu hỗ trợ"
                open={responseModal}
                onCancel={() => setResponseModal(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitResponse}
                >
                    <Form.Item
                        name="message"
                        label="Nội dung phản hồi"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi!' }]}
                    >
                        <TextArea rows={6} placeholder="Nhập phản hồi cho khách hàng..." />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Cập nhật trạng thái"
                    >
                        <Select placeholder="Chọn trạng thái mới">
                            {statuses.map(status => (
                                <Option key={status.value} value={status.value}>
                                    {status.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setResponseModal(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Gửi phản hồi
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SupportManagement;
