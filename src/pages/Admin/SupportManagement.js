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
    Tabs,
    Popconfirm
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
    MailOutlined,
    DeleteOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import SupportService from '../../services/supportService';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const SupportManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0
    });
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

    // Helper function to handle API errors
    const handleApiError = (error, defaultMessage) => {
        console.error('API Error:', error);
        let errorMessage = defaultMessage;

        if (error?.message) {
            errorMessage = error.message;
        } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        message.error(errorMessage);
    };

    // Mock data for support requests
    const mockRequests = [];

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
        { value: 'Open', label: 'Mở', color: 'orange' },
        { value: 'InProgress', label: 'Đang xử lý', color: 'blue' },
        { value: 'Resolved', label: 'Đã giải quyết', color: 'green' }
    ];

    useEffect(() => {
        loadRequests();
        loadStatistics();
    }, [pagination.current, pagination.pageSize, filters]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            let response;
            if (filters.status) {
                response = await SupportService.getSupportRequestsByStatus(filters.status);
            } else {
                response = await SupportService.getAllSupportRequests();
            }

            if (response.success && response.data) {
                let filteredRequests = response.data;

                // Apply search filter
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    filteredRequests = filteredRequests.filter(request =>
                        request.subject?.toLowerCase().includes(searchLower) ||
                        request.userName?.toLowerCase().includes(searchLower) ||
                        request.userEmail?.toLowerCase().includes(searchLower) ||
                        request.id?.toLowerCase().includes(searchLower)
                    );
                }

                setRequests(filteredRequests);
                setPagination(prev => ({
                    ...prev,
                    total: filteredRequests.length
                }));
            }
        } catch (error) {
            handleApiError(error, 'Lỗi khi tải danh sách yêu cầu hỗ trợ');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await SupportService.getAllSupportRequests();
            if (response.success && response.data) {
                const data = response.data;
                setStatistics({
                    total: data.length,
                    open: data.filter(r => r.status === 'Open').length,
                    inProgress: data.filter(r => r.status === 'InProgress').length,
                    resolved: data.filter(r => r.status === 'Resolved').length
                });
            }
        } catch (error) {
            handleApiError(error, 'Lỗi khi tải thống kê');
        }
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

    const handleResponse = async (request) => {
        try {
            // Load fresh data for the request
            const response = await SupportService.getSupportRequestById(request.id);
            if (response.success && response.data) {
                setSelectedRequest(response.data);
            } else {
                setSelectedRequest(request);
            }
            form.resetFields();
            setResponseModal(true);
        } catch (error) {
            handleApiError(error, 'Lỗi khi tải chi tiết yêu cầu hỗ trợ');
            setSelectedRequest(request);
            form.resetFields();
            setResponseModal(true);
        }
    };

    const handleSubmitResponse = async (values) => {
        try {
            const responseData = {
                response: values.message,
                status: values.status || selectedRequest.status
            };

            await SupportService.respondToSupportRequest(selectedRequest.id, responseData);
            message.success('Phản hồi đã được gửi thành công');

            setResponseModal(false);
            form.resetFields();

            // Reload data
            await loadRequests();
            await loadStatistics();

            // If drawer is open, refresh the selected request
            if (drawerVisible) {
                const updatedRequest = await SupportService.getSupportRequestById(selectedRequest.id);
                if (updatedRequest.success && updatedRequest.data) {
                    setSelectedRequest(updatedRequest.data);
                }
            }
        } catch (error) {
            handleApiError(error, 'Lỗi khi gửi phản hồi');
        }
    };

    const handleDeleteRequest = async (requestId) => {
        try {
            await SupportService.deleteSupportRequest(requestId);
            message.success('Đã xóa yêu cầu hỗ trợ');
            await loadRequests();
            await loadStatistics();
        } catch (error) {
            handleApiError(error, 'Lỗi khi xóa yêu cầu hỗ trợ');
        }
    };

    const handleUpdateStatus = async (requestId, newStatus) => {
        try {
            await SupportService.updateSupportRequestStatus(requestId, newStatus);
            message.success('Đã cập nhật trạng thái');
            await loadRequests();
            await loadStatistics();

            // If drawer is open and this is the selected request, refresh it
            if (drawerVisible && selectedRequest?.id === requestId) {
                const updatedRequest = await SupportService.getSupportRequestById(requestId);
                if (updatedRequest.success && updatedRequest.data) {
                    setSelectedRequest(updatedRequest.data);
                }
            }
        } catch (error) {
            handleApiError(error, 'Lỗi khi cập nhật trạng thái');
        }
    };

    const columns = [
        {
            title: 'Khách hàng',
            dataIndex: ['userName', 'userEmail'],
            key: 'user',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} size="small" />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.userName || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail || 'N/A'}</div>
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
            width: 200,
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
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa yêu cầu này?"
                        onConfirm={() => handleDeleteRequest(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            title="Xóa"
                        />
                    </Popconfirm>
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
                            value={statistics.total}
                            prefix={<CustomerServiceOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Chờ xử lý"
                            value={statistics.open}
                            valueStyle={{ color: '#fa8c16' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đang xử lý"
                            value={statistics.inProgress}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<ExclamationCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã giải quyết"
                            value={statistics.resolved}
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
                            placeholder="Tìm kiếm theo ID, tiêu đề, khách hàng..."
                            allowClear
                            onSearch={(value) => {
                                setFilters(prev => ({ ...prev, search: value }));
                                setPagination(prev => ({ ...prev, current: 1 }));
                            }}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => {
                                setFilters(prev => ({ ...prev, status: value }));
                                setPagination(prev => ({ ...prev, current: 1 }));
                            }}
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
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                loadRequests();
                                loadStatistics();
                            }}
                        >
                            Làm mới
                        </Button>
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
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={(paginationData) => {
                        setPagination({
                            current: paginationData.current,
                            pageSize: paginationData.pageSize,
                            total: pagination.total
                        });
                    }}
                    scroll={{ x: 1200 }}
                    size="middle"
                    locale={{
                        emptyText: loading ? 'Đang tải...' : 'Không có yêu cầu hỗ trợ nào'
                    }}
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
                            <h3>ID: {selectedRequest.id}</h3>
                            <Space>
                                <Tag color={getColorByValue(selectedRequest.status, 'status')}>
                                    {getLabelByValue(selectedRequest.status, 'status')}
                                </Tag>
                            </Space>
                        </div>

                        {/* Customer Information */}
                        <Descriptions bordered column={1} style={{ marginBottom: '16px' }}>
                            <Descriptions.Item label="Khách hàng">
                                <Space>
                                    <Avatar icon={<UserOutlined />} />
                                    <div>
                                        <div>{selectedRequest.userName || 'N/A'}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            <MailOutlined /> {selectedRequest.userEmail || 'N/A'}
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
                            <Descriptions.Item label="Ngày tạo">
                                {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lần cuối">
                                {new Date(selectedRequest.updatedAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                            {selectedRequest.response && (
                                <Descriptions.Item label="Phản hồi">
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: '#f6ffed',
                                        borderRadius: '8px',
                                        border: '1px solid #d9f7be'
                                    }}>
                                        {selectedRequest.response}
                                    </div>
                                </Descriptions.Item>
                            )}
                        </Descriptions>

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
                                <Select
                                    placeholder="Cập nhật trạng thái"
                                    style={{ width: 150 }}
                                    onChange={(value) => handleUpdateStatus(selectedRequest.id, value)}
                                    value={selectedRequest.status}
                                >
                                    {statuses.map(status => (
                                        <Option key={status.value} value={status.value}>
                                            {status.label}
                                        </Option>
                                    ))}
                                </Select>
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xóa yêu cầu này?"
                                    onConfirm={() => {
                                        handleDeleteRequest(selectedRequest.id);
                                        setDrawerVisible(false);
                                    }}
                                    okText="Có"
                                    cancelText="Không"
                                >
                                    <Button danger icon={<DeleteOutlined />}>
                                        Xóa
                                    </Button>
                                </Popconfirm>
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
                        initialValue={selectedRequest?.status}
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
