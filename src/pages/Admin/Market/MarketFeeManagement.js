// src/pages/Admin/Market/MarketFeeManagement.js
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
    Statistic,
    InputNumber,
    DatePicker,
    Typography
} from 'antd';
import {
    DollarOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    CalendarOutlined,
    BankOutlined
} from '@ant-design/icons';
import { marketService } from '../../../services/marketService';
import { marketFeeService } from '../../../services/marketFeeService';
import MarketNavigation from './MarketNavigation';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const MarketFeeManagement = () => {
    const [fees, setFees] = useState([]);
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
        feeType: '',
        status: ''
    });
    const [selectedFee, setSelectedFee] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();

    const feeTypes = [
        { value: 'monthly_rent', label: 'Phí thuê tháng', color: 'blue' },
        { value: 'setup_fee', label: 'Phí thiết lập', color: 'green' },
        { value: 'service_fee', label: 'Phí dịch vụ', color: 'orange' },
        { value: 'maintenance_fee', label: 'Phí bảo trì', color: 'purple' },
        { value: 'penalty_fee', label: 'Phí phạt', color: 'red' }
    ];

    const feeStatuses = [
        { value: 'pending', label: 'Chờ thanh toán', color: 'orange' },
        { value: 'paid', label: 'Đã thanh toán', color: 'green' },
        { value: 'overdue', label: 'Quá hạn', color: 'red' },
        { value: 'cancelled', label: 'Đã hủy', color: 'gray' }
    ];

    useEffect(() => {
        loadMarkets();
        loadFees();
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

    const loadFees = async () => {
        setLoading(true);
        try {
            // Mock data - thay bằng API thực
            const mockFees = [
                {
                    id: '1',
                    marketId: 'market1',
                    marketName: 'Chợ Bến Thành',
                    feeType: 'monthly_rent',
                    amount: 2000000,
                    description: 'Phí thuê tháng 12/2024',
                    dueDate: '2024-12-31',
                    status: 'pending',
                    createdAt: '2024-12-01'
                },
                {
                    id: '2',
                    marketId: 'market2',
                    marketName: 'Chợ Đầm',
                    feeType: 'service_fee',
                    amount: 500000,
                    description: 'Phí dịch vụ quý 4/2024',
                    dueDate: '2024-12-15',
                    status: 'paid',
                    createdAt: '2024-11-15'
                }
            ];

            setFees(mockFees);
            setPagination(prev => ({
                ...prev,
                total: mockFees.length
            }));
        } catch (error) {
            console.error('Error loading fees:', error);
            message.error('Lỗi khi tải danh sách phí');
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

    const handleCreateFee = () => {
        setSelectedFee(null);
        setEditMode(false);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditFee = (fee) => {
        setSelectedFee(fee);
        setEditMode(true);
        form.setFieldsValue({
            ...fee,
            dueDate: fee.dueDate ? moment(fee.dueDate) : null,
        });
        setModalVisible(true);
    };

    const handleViewFee = (fee) => {
        setSelectedFee(fee);
        setDrawerVisible(true);
    };

    const handleDeleteFee = async (feeId) => {
        try {
            // API call to delete fee
            message.success('Xóa phí thành công');
            loadFees();
        } catch (error) {
            console.error('Error deleting fee:', error);
            message.error('Lỗi khi xóa phí');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const feeData = {
                ...values,
                dueDate: values.dueDate?.format('YYYY-MM-DD'),
            };

            if (editMode) {
                // API call to update fee
                message.success('Cập nhật phí thành công');
            } else {
                // API call to create fee
                message.success('Tạo phí thành công');
            }

            setModalVisible(false);
            form.resetFields();
            loadFees();
        } catch (error) {
            console.error('Error saving fee:', error);
            message.error(editMode ? 'Lỗi khi cập nhật phí' : 'Lỗi khi tạo phí');
        }
    };

    const getStatusColor = (status) => {
        const statusObj = feeStatuses.find(s => s.value === status);
        return statusObj?.color || 'default';
    };

    const getStatusLabel = (status) => {
        const statusObj = feeStatuses.find(s => s.value === status);
        return statusObj?.label || status;
    };

    const getFeeTypeLabel = (type) => {
        const typeObj = feeTypes.find(t => t.value === type);
        return typeObj?.label || type;
    };

    const getFeeTypeColor = (type) => {
        const typeObj = feeTypes.find(t => t.value === type);
        return typeObj?.color || 'default';
    };

    const columns = [
        {
            title: 'Mã phí',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: 'Chợ',
            dataIndex: 'marketName',
            key: 'marketName',
            width: 150,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Loại phí',
            dataIndex: 'feeType',
            key: 'feeType',
            width: 120,
            render: (type) => (
                <Tag color={getFeeTypeColor(type)}>
                    {getFeeTypeLabel(type)}
                </Tag>
            ),
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount) => (
                <Text strong style={{ color: '#52c41a' }}>
                    {amount?.toLocaleString('vi-VN')} VNĐ
                </Text>
            ),
        },
        {
            title: 'Hạn thanh toán',
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 120,
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : '',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusLabel(status)}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
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
                        onClick={() => handleViewFee(record)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditFee(record)}
                        title="Chỉnh sửa"
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa phí này?"
                        onConfirm={() => handleDeleteFee(record.id)}
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
                        <DollarOutlined /> Quản lý Phí Chợ
                    </Title>
                </div>

                {/* Filters */}
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col xs={24} sm={8} lg={6}>
                        <Search
                            placeholder="Tìm kiếm..."
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
                            placeholder="Loại phí"
                            allowClear
                            value={filters.feeType}
                            onChange={(value) => handleFilterChange('feeType', value)}
                            style={{ width: '100%' }}
                        >
                            {feeTypes.map(type => (
                                <Option key={type.value} value={type.value}>
                                    {type.label}
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
                            {feeStatuses.map(status => (
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
                            onClick={handleCreateFee}
                            style={{ width: '100%' }}
                        >
                            Tạo phí mới
                        </Button>
                    </Col>
                </Row>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={fees}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} phí`,
                    }}
                    loading={loading}
                    onChange={handleTableChange}
                    rowKey="id"
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editMode ? 'Chỉnh sửa phí' : 'Tạo phí mới'}
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
                                name="feeType"
                                label="Loại phí"
                                rules={[{ required: true, message: 'Vui lòng chọn loại phí!' }]}
                            >
                                <Select placeholder="Chọn loại phí">
                                    {feeTypes.map(type => (
                                        <Option key={type.value} value={type.value}>
                                            {type.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="amount"
                                label="Số tiền (VNĐ)"
                                rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Nhập số tiền"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dueDate"
                                label="Hạn thanh toán"
                                rules={[{ required: true, message: 'Vui lòng chọn hạn thanh toán!' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày hạn"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả cho phí này..."
                        />
                    </Form.Item>

                    {editMode && (
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                        >
                            <Select placeholder="Chọn trạng thái">
                                {feeStatuses.map(status => (
                                    <Option key={status.value} value={status.value}>
                                        {status.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

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

            {/* View Fee Drawer */}
            <Drawer
                title="Chi tiết phí"
                placement="right"
                size="large"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                {selectedFee && (
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
                                <DollarOutlined style={{ fontSize: '32px' }} />
                            </div>
                            <h3>Chi tiết phí #{selectedFee.id}</h3>
                            <Tag color={getStatusColor(selectedFee.status)}>
                                {getStatusLabel(selectedFee.status)}
                            </Tag>
                        </div>

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Chợ">
                                {selectedFee.marketName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại phí">
                                <Tag color={getFeeTypeColor(selectedFee.feeType)}>
                                    {getFeeTypeLabel(selectedFee.feeType)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tiền">
                                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                    {selectedFee.amount?.toLocaleString('vi-VN')} VNĐ
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {selectedFee.description}
                            </Descriptions.Item>
                            <Descriptions.Item label="Hạn thanh toán">
                                {selectedFee.dueDate ? moment(selectedFee.dueDate).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {selectedFee.createdAt ? moment(selectedFee.createdAt).format('DD/MM/YYYY HH:mm') : 'Chưa cập nhật'}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setDrawerVisible(false);
                                        handleEditFee(selectedFee);
                                    }}
                                >
                                    Chỉnh sửa
                                </Button>
                                <Button
                                    icon={<BankOutlined />}
                                    onClick={() => {
                                        // Handle payment tracking
                                    }}
                                >
                                    Theo dõi thanh toán
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

export default MarketFeeManagement;
