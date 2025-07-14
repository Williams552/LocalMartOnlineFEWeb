// src/pages/Admin/Market/MarketRuleManagement.js
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
    Popconfirm,
    Drawer,
    Descriptions,
    Row,
    Col,
    Typography,
    Alert,
    Switch,
    Radio,
    Divider
} from 'antd';
import {
    FileTextOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    BookOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { marketService } from '../../../services/marketService';
import { marketRuleService } from '../../../services/marketRuleService';
import MarketNavigation from './MarketNavigation';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const MarketRuleManagement = () => {
    const [rules, setRules] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        marketId: '',
        category: '',
        status: ''
    });
    const [selectedRule, setSelectedRule] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();

    const ruleCategories = [
        { value: 'general', label: 'Quy tắc chung', color: 'blue' },
        { value: 'safety', label: 'An toàn - Vệ sinh', color: 'green' },
        { value: 'business', label: 'Kinh doanh', color: 'orange' },
        { value: 'behavior', label: 'Hành vi - Ứng xử', color: 'purple' },
        { value: 'environment', label: 'Môi trường', color: 'cyan' },
        { value: 'penalty', label: 'Xử phạt', color: 'red' }
    ];

    const ruleStatuses = [
        { value: 'active', label: 'Có hiệu lực', color: 'green' },
        { value: 'draft', label: 'Bản nháp', color: 'orange' },
        { value: 'suspended', label: 'Tạm ngưng', color: 'red' },
        { value: 'archived', label: 'Lưu trữ', color: 'gray' }
    ];

    const priorityLevels = [
        { value: 'high', label: 'Cao', color: 'red' },
        { value: 'medium', label: 'Trung bình', color: 'orange' },
        { value: 'low', label: 'Thấp', color: 'green' }
    ];

    useEffect(() => {
        loadMarkets();
        loadRules();
    }, [pagination.current, pagination.pageSize, filters]);

    const loadMarkets = async () => {
        try {
            const response = await marketService.getAllMarkets();
            if (response?.data) {
                setMarkets(response.data);
            }
        } catch (error) {
            console.error('Error loading markets:', error);
        }
    };

    const loadRules = async () => {
        setLoading(true);
        try {
            // Mock data - thay bằng API thực
            const mockRules = [
                {
                    id: '1',
                    ruleCode: 'BTH-001',
                    marketId: 'market1',
                    marketName: 'Chợ Bến Thành',
                    title: 'Quy tắc về giờ hoạt động',
                    description: 'Chợ hoạt động từ 5:00 - 22:00 hàng ngày. Nghiêm cấm mua bán ngoài giờ quy định.',
                    category: 'general',
                    priority: 'high',
                    status: 'active',
                    effectiveDate: '2024-01-01',
                    expiryDate: null,
                    createdBy: 'Admin',
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                },
                {
                    id: '2',
                    ruleCode: 'BTH-002',
                    marketId: 'market1',
                    marketName: 'Chợ Bến Thành',
                    title: 'Quy tắc về vệ sinh thực phẩm',
                    description: 'Tất cả thực phẩm phải đảm bảo chất lượng, có nguồn gốc rõ ràng. Khu vực bán thực phẩm phải được vệ sinh sạch sẽ.',
                    category: 'safety',
                    priority: 'high',
                    status: 'active',
                    effectiveDate: '2024-01-01',
                    expiryDate: null,
                    createdBy: 'Admin',
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                },
                {
                    id: '3',
                    ruleCode: 'DAM-001',
                    marketId: 'market2',
                    marketName: 'Chợ Đầm',
                    title: 'Quy tắc về trông giữ xe',
                    description: 'Phí trông giữ xe máy: 5,000 VNĐ/lượt. Xe ô tô: 20,000 VNĐ/lượt. Chợ không chịu trách nhiệm về tài sản bị mất cắp.',
                    category: 'business',
                    priority: 'medium',
                    status: 'active',
                    effectiveDate: '2024-01-01',
                    expiryDate: null,
                    createdBy: 'Admin',
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                }
            ];

            setRules(mockRules);
            setPagination(prev => ({
                ...prev,
                total: mockRules.length
            }));
        } catch (error) {
            console.error('Error loading rules:', error);
            message.error('Lỗi khi tải danh sách quy tắc');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (paginationData) => {
        setPagination({
            ...pagination,
            current: paginationData.current,
            pageSize: paginationData.pageSize
        });
    };

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleCreateRule = () => {
        setSelectedRule(null);
        setEditMode(false);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditRule = (rule) => {
        setSelectedRule(rule);
        setEditMode(true);
        form.setFieldsValue({
            ...rule,
            effectiveDate: rule.effectiveDate ? moment(rule.effectiveDate) : null,
            expiryDate: rule.expiryDate ? moment(rule.expiryDate) : null,
        });
        setModalVisible(true);
    };

    const handleViewRule = (rule) => {
        setSelectedRule(rule);
        setDrawerVisible(true);
    };

    const handleDeleteRule = async (ruleId) => {
        try {
            // API call to delete rule
            message.success('Xóa quy tắc thành công');
            loadRules();
        } catch (error) {
            console.error('Error deleting rule:', error);
            message.error('Lỗi khi xóa quy tắc');
        }
    };

    const handleToggleStatus = async (ruleId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
            // API call to toggle status
            message.success(`${newStatus === 'active' ? 'Kích hoạt' : 'Tạm ngưng'} quy tắc thành công`);
            loadRules();
        } catch (error) {
            console.error('Error toggling status:', error);
            message.error('Lỗi khi thay đổi trạng thái');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const ruleData = {
                ...values,
                effectiveDate: values.effectiveDate?.format('YYYY-MM-DD'),
                expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
                ruleCode: values.ruleCode || generateRuleCode(values.marketId),
            };

            if (editMode) {
                // API call to update rule
                message.success('Cập nhật quy tắc thành công');
            } else {
                // API call to create rule
                message.success('Tạo quy tắc thành công');
            }

            setModalVisible(false);
            form.resetFields();
            loadRules();
        } catch (error) {
            console.error('Error saving rule:', error);
            message.error(editMode ? 'Lỗi khi cập nhật quy tắc' : 'Lỗi khi tạo quy tắc');
        }
    };

    const generateRuleCode = (marketId) => {
        const market = markets.find(m => m.id === marketId);
        const prefix = market?.name?.substring(0, 3).toUpperCase() || 'MKT';
        const timestamp = Date.now().toString().slice(-3);
        return `${prefix}-${timestamp}`;
    };

    const getStatusColor = (status) => {
        const statusObj = ruleStatuses.find(s => s.value === status);
        return statusObj?.color || 'default';
    };

    const getStatusLabel = (status) => {
        const statusObj = ruleStatuses.find(s => s.value === status);
        return statusObj?.label || status;
    };

    const getCategoryLabel = (category) => {
        const categoryObj = ruleCategories.find(c => c.value === category);
        return categoryObj?.label || category;
    };

    const getCategoryColor = (category) => {
        const categoryObj = ruleCategories.find(c => c.value === category);
        return categoryObj?.color || 'default';
    };

    const getPriorityLabel = (priority) => {
        const priorityObj = priorityLevels.find(p => p.value === priority);
        return priorityObj?.label || priority;
    };

    const getPriorityColor = (priority) => {
        const priorityObj = priorityLevels.find(p => p.value === priority);
        return priorityObj?.color || 'default';
    };

    const columns = [
        {
            title: 'Mã quy tắc',
            dataIndex: 'ruleCode',
            key: 'ruleCode',
            width: 120,
            render: (text) => <Text code>{text}</Text>
        },
        {
            title: 'Chợ',
            dataIndex: 'marketName',
            key: 'marketName',
            width: 150,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Phân loại',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (category) => (
                <Tag color={getCategoryColor(category)}>
                    {getCategoryLabel(category)}
                </Tag>
            ),
        },
        {
            title: 'Mức độ',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: (priority) => (
                <Tag color={getPriorityColor(priority)}>
                    {getPriorityLabel(priority)}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status, record) => (
                <Space>
                    <Tag color={getStatusColor(status)}>
                        {getStatusLabel(status)}
                    </Tag>
                    <Switch
                        size="small"
                        checked={status === 'active'}
                        onChange={() => handleToggleStatus(record.id, status)}
                        title={status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                    />
                </Space>
            ),
        },
        {
            title: 'Ngày hiệu lực',
            dataIndex: 'effectiveDate',
            key: 'effectiveDate',
            width: 120,
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : '',
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
                        onClick={() => handleViewRule(record)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditRule(record)}
                        title="Chỉnh sửa"
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa quy tắc này?"
                        onConfirm={() => handleDeleteRule(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            title="Xóa"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <MarketNavigation />
            <div style={{ padding: '0 24px 24px' }}>
                <Card>
                <div style={{ marginBottom: '16px' }}>
                    <Title level={3}>
                        <FileTextOutlined /> Quản lý Quy tắc Chợ
                    </Title>
                    <Alert
                        message="Thông tin"
                        description="Quy tắc chợ giúp duy trì trật tự và đảm bảo môi trường kinh doanh văn minh, an toàn cho tất cả người tham gia."
                        type="info"
                        showIcon
                        style={{ marginTop: '8px' }}
                    />
                </div>

                {/* Filters */}
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col xs={24} sm={8} lg={6}>
                        <Search
                            placeholder="Tìm kiếm quy tắc..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={8} lg={4}>
                        <Select
                            placeholder="Chọn chợ"
                            allowClear
                            value={filters.marketId}
                            onChange={(value) => handleFilterChange('marketId', value)}
                            style={{ width: '100%' }}
                        >
                            {markets.map(market => (
                                <Option key={market.id} value={market.id}>
                                    {market.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} lg={4}>
                        <Select
                            placeholder="Phân loại"
                            allowClear
                            value={filters.category}
                            onChange={(value) => handleFilterChange('category', value)}
                            style={{ width: '100%' }}
                        >
                            {ruleCategories.map(category => (
                                <Option key={category.value} value={category.value}>
                                    {category.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} lg={4}>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            value={filters.status}
                            onChange={(value) => handleFilterChange('status', value)}
                            style={{ width: '100%' }}
                        >
                            {ruleStatuses.map(status => (
                                <Option key={status.value} value={status.value}>
                                    {status.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} lg={4}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateRule}
                            style={{ width: '100%' }}
                        >
                            Tạo quy tắc
                        </Button>
                    </Col>
                </Row>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={rules}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} quy tắc`,
                    }}
                    loading={loading}
                    onChange={handleTableChange}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editMode ? 'Chỉnh sửa quy tắc' : 'Tạo quy tắc mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="marketId"
                                label="Chọn chợ"
                                rules={[{ required: true, message: 'Vui lòng chọn chợ!' }]}
                            >
                                <Select placeholder="Chọn chợ">
                                    {markets.map(market => (
                                        <Option key={market.id} value={market.id}>
                                            {market.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ruleCode"
                                label="Mã quy tắc"
                                tooltip="Để trống để tự động tạo mã"
                            >
                                <Input placeholder="VD: BTH-001" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="title"
                        label="Tiêu đề quy tắc"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề quy tắc..." />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Nội dung quy tắc"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung quy tắc!' }]}
                    >
                        <TextArea
                            rows={6}
                            placeholder="Mô tả chi tiết nội dung quy tắc..."
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="category"
                                label="Phân loại"
                                rules={[{ required: true, message: 'Vui lòng chọn phân loại!' }]}
                            >
                                <Select placeholder="Chọn phân loại">
                                    {ruleCategories.map(category => (
                                        <Option key={category.value} value={category.value}>
                                            {category.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="priority"
                                label="Mức độ ưu tiên"
                                rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
                            >
                                <Select placeholder="Chọn mức độ">
                                    {priorityLevels.map(priority => (
                                        <Option key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                initialValue="active"
                            >
                                <Radio.Group>
                                    <Radio value="active">Có hiệu lực</Radio>
                                    <Radio value="draft">Bản nháp</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editMode ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Rule Drawer */}
            <Drawer
                title="Chi tiết quy tắc"
                placement="right"
                size="large"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                {selectedRule && (
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
                                <BookOutlined style={{ fontSize: '32px' }} />
                            </div>
                            <h3>{selectedRule.title}</h3>
                            <Space>
                                <Tag color={getStatusColor(selectedRule.status)}>
                                    {getStatusLabel(selectedRule.status)}
                                </Tag>
                                <Tag color={getCategoryColor(selectedRule.category)}>
                                    {getCategoryLabel(selectedRule.category)}
                                </Tag>
                                <Tag color={getPriorityColor(selectedRule.priority)}>
                                    {getPriorityLabel(selectedRule.priority)}
                                </Tag>
                            </Space>
                        </div>

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Mã quy tắc">
                                <Text code>{selectedRule.ruleCode}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Chợ áp dụng">
                                {selectedRule.marketName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nội dung">
                                <Paragraph>{selectedRule.description}</Paragraph>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày hiệu lực">
                                {selectedRule.effectiveDate ? moment(selectedRule.effectiveDate).format('DD/MM/YYYY') : 'Chưa xác định'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày hết hạn">
                                {selectedRule.expiryDate ? moment(selectedRule.expiryDate).format('DD/MM/YYYY') : 'Không thời hạn'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người tạo">
                                {selectedRule.createdBy || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {selectedRule.createdAt ? moment(selectedRule.createdAt).format('DD/MM/YYYY HH:mm') : 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật cuối">
                                {selectedRule.updatedAt ? moment(selectedRule.updatedAt).format('DD/MM/YYYY HH:mm') : 'Chưa cập nhật'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <div style={{ textAlign: 'center' }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setDrawerVisible(false);
                                        handleEditRule(selectedRule);
                                    }}
                                >
                                    Chỉnh sửa
                                </Button>
                                <Button
                                    icon={selectedRule.status === 'active' ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                                    onClick={() => {
                                        handleToggleStatus(selectedRule.id, selectedRule.status);
                                        setDrawerVisible(false);
                                    }}
                                >
                                    {selectedRule.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
        </div>
    );
};

export default MarketRuleManagement;
