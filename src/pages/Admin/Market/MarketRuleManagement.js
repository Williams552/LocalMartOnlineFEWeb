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
    const [loadingMarkets, setLoadingMarkets] = useState(false);
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
        setLoadingMarkets(true);
        try {
            const response = await marketService.getAllMarkets();
            if (response?.data) {
                setMarkets(response.data);
            } else if (response && Array.isArray(response)) {
                // Trường hợp response trực tiếp là array
                setMarkets(response);
            } else {
                setMarkets([]);
            }
        } catch (error) {
            console.error('Error loading markets:', error);
            message.error(error.message || 'Lỗi khi tải danh sách chợ');
            setMarkets([]);
        } finally {
            setLoadingMarkets(false);
        }
    };

    const loadRules = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters
            };

            console.log('Loading rules with params:', params);
            
            // Gọi API thông qua marketRuleService
            const response = await marketRuleService.getAllMarketRules(params);
            
            console.log('API response:', response);
            
            // Sửa lại để xử lý đúng cấu trúc response từ API
            if (response && response.marketRules) {
                console.log('Rules loaded:', response.marketRules);
                // Map dữ liệu để thêm các trường thiếu
                const processedRules = response.marketRules.map(rule => ({
                    ...rule,
                    title: rule.title || rule.description || 'Quy tắc chưa có tiêu đề', // Fallback nếu thiếu title
                    ruleCode: rule.ruleCode || `RULE-${rule.id.slice(-6)}`, // Tạo ruleCode nếu thiếu
                    category: rule.category || 'general',
                    priority: rule.priority || 'medium',
                    status: rule.status || 'active',
                }));
                
                setRules(processedRules);
                setPagination(prev => ({
                    ...prev,
                    total: response.totalCount || processedRules.length
                }));
            } else if (response && response.data) {
                // Fallback cho trường hợp API trả về data
                console.log('Rules loaded from data field:', response.data);
                setRules(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.totalCount || response.total || response.data.length
                }));
            } else {
                console.log('No data in response, setting empty array');
                setRules([]);
                setPagination(prev => ({ ...prev, total: 0 }));
            }
        } catch (error) {
            console.error('Error loading rules:', error);
            message.error(error.message || 'Lỗi khi tải danh sách quy tắc');
            setRules([]);
            setPagination(prev => ({ ...prev, total: 0 }));
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

    // Thêm hàm tìm kiếm riêng biệt
    const handleAdvancedSearch = async (keyword) => {
        if (!keyword.trim()) {
            loadRules();
            return;
        }

        setLoading(true);
        try {
            const params = {
                ...filters,
                page: 1,
                limit: pagination.pageSize
            };

            const response = await marketRuleService.searchMarketRules(keyword, params);
            
            if (response && response.data) {
                setRules(response.data);
                setPagination(prev => ({
                    ...prev,
                    current: 1,
                    total: response.totalCount || response.total || response.data.length
                }));
            }
        } catch (error) {
            console.error('Error searching rules:', error);
            message.error(error.message || 'Lỗi khi tìm kiếm quy tắc');
        } finally {
            setLoading(false);
        }
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
        // Set 3 trường từ backend
        form.setFieldsValue({
            marketId: rule.marketId,
            ruleName: rule.ruleName,
            description: rule.description
        });
        setModalVisible(true);
    };

    const handleViewRule = async (rule) => {
        try {
            // Lấy thông tin chi tiết của quy tắc từ API
            const detailedRule = await marketRuleService.getMarketRuleById(rule.id);
            setSelectedRule(detailedRule.data || rule);
            setDrawerVisible(true);
        } catch (error) {
            console.error('Error loading rule details:', error);
            // Nếu không tải được chi tiết, vẫn hiển thị thông tin cơ bản
            setSelectedRule(rule);
            setDrawerVisible(true);
        }
    };

    const handleDeleteRule = async (ruleId) => {
        try {
            await marketRuleService.deleteMarketRule(ruleId);
            message.success('Xóa quy tắc thành công');
            loadRules();
        } catch (error) {
            console.error('Error deleting rule:', error);
            message.error(error.message || 'Lỗi khi xóa quy tắc');
        }
    };

    const handleToggleStatus = async (ruleId, currentStatus) => {
        try {
            await marketRuleService.toggleRuleStatus(ruleId);
            const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
            message.success(`${newStatus === 'active' ? 'Kích hoạt' : 'Tạm ngưng'} quy tắc thành công`);
            loadRules();
        } catch (error) {
            console.error('Error toggling status:', error);
            message.error(error.message || 'Lỗi khi thay đổi trạng thái');
        }
    };

    const handleSubmit = async (values) => {
        try {
            console.log('Form values:', values);
            
            // Backend cần marketId, ruleName và description
            const ruleData = {
                marketId: values.marketId,
                ruleName: values.ruleName,
                description: values.description,
            };

            console.log('Sending rule data:', ruleData);

            if (editMode && selectedRule) {
                const result = await marketRuleService.updateMarketRule(selectedRule.id, ruleData);
                console.log('Update result:', result);
                message.success('Cập nhật quy tắc thành công');
            } else {
                const result = await marketRuleService.createMarketRule(ruleData);
                console.log('Create result:', result);
                message.success('Tạo quy tắc thành công');
            }

            setModalVisible(false);
            form.resetFields();
            loadRules();
        } catch (error) {
            console.error('Error saving rule:', error);
            message.error(error.message || (editMode ? 'Lỗi khi cập nhật quy tắc' : 'Lỗi khi tạo quy tắc'));
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
            render: (text, record) => {
                // Nếu có thông tin market object
                return record.market?.name || text || 'Chưa xác định';
            }
        },
        {
            title: 'Tên quy tắc',
            dataIndex: 'ruleName',
            key: 'ruleName',
            width: 200,
            render: (text) => (
                <Text strong>{text || 'Chưa đặt tên'}</Text>
            ),
        },
        {
            title: 'Nội dung quy tắc',
            dataIndex: 'description',
            key: 'description',
            width: 250,
            render: (text) => (
                <div>
                    <Text>{text}</Text>
                </div>
            ),
            ellipsis: {
                showTitle: false,
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date) => {
                if (!date) return '';
                try {
                    return moment(date).format('DD/MM/YYYY HH:mm');
                } catch {
                    return date;
                }
            },
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
                            onSearch={handleAdvancedSearch}
                            onChange={(e) => {
                                if (!e.target.value.trim()) {
                                    handleSearch('');
                                }
                            }}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={8} lg={4}>
                        <Select
                            placeholder="Chọn chợ"
                            allowClear
                            loading={loadingMarkets}
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
                    <Col xs={24} sm={8} lg={6}>
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
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    {/* 3 trường: marketId, ruleName và description */}
                    <Form.Item
                        name="marketId"
                        label="Chọn chợ"
                        rules={[{ required: true, message: 'Vui lòng chọn chợ!' }]}
                    >
                        <Select 
                            placeholder="Chọn chợ" 
                            loading={loadingMarkets}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {markets.map(market => (
                                <Option key={market.id} value={market.id}>
                                    {market.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="ruleName"
                        label="Tên quy tắc"
                        rules={[{ required: true, message: 'Vui lòng nhập tên quy tắc!' }]}
                    >
                        <Input placeholder="Nhập tên quy tắc..." />
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
                            <h3>{selectedRule.ruleName || selectedRule.description}</h3>
                            {/* Chỉ hiển thị market name */}
                            <Tag color="blue">
                                {selectedRule.market?.name || selectedRule.marketName || 'Chưa xác định'}
                            </Tag>
                        </div>

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Mã quy tắc">
                                <Text code>{selectedRule.ruleCode}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Chợ áp dụng">
                                {selectedRule.market?.name || selectedRule.marketName || 'Chưa xác định'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên quy tắc">
                                <Text strong>{selectedRule.ruleName || 'Chưa đặt tên'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Nội dung">
                                <Paragraph>{selectedRule.description}</Paragraph>
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
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
        </div>
    );
};

export default MarketRuleManagement;
