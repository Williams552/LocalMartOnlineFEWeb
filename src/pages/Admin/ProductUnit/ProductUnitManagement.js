import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    message,
    Popconfirm,
    Row,
    Col,
    Statistic,
    Tooltip,
    Badge,
    InputNumber,
    Spin,
    Alert
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    ReloadOutlined,
    SortAscendingOutlined,
    FilterOutlined
} from '@ant-design/icons';
import productUnitService from '../../../services/productUnitService';

const { Option } = Select;
const { Search } = Input;

const ProductUnitManagement = () => {
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState([]);
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });
    const [unitTypes, setUnitTypes] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [form] = Form.useForm();

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        byType: {}
    });

    useEffect(() => {
        loadUnits();
        loadUnitTypes();
    }, [pagination.current, pagination.pageSize]);

    useEffect(() => {
        applyFilters();
    }, [units, searchText, filterStatus]);

    const loadUnits = async () => {
        setLoading(true);
        try {
            const response = await productUnitService.getAllUnits({
                page: pagination.current,
                pageSize: pagination.pageSize
            });

            const unitsData = response.items || response.data || [];
            console.log('Raw units data from API:', unitsData); // Debug log

            const formattedUnits = unitsData.map(unit => {
                const formatted = productUnitService.formatUnitDisplay(unit);
                console.log('Formatted unit:', formatted); // Debug log
                return formatted;
            });

            setUnits(formattedUnits);
            setPagination(prev => ({
                ...prev,
                total: response.totalItems || response.total || formattedUnits.length
            }));

            // Calculate statistics
            calculateStats(formattedUnits);

        } catch (error) {
            console.error('Error loading units:', error);
            message.error(error.message || 'Không thể tải danh sách đơn vị');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        // Reset về trang đầu
        setPagination(prev => ({
            ...prev,
            current: 1
        }));
        
        // Reset filters
        setSearchText('');
        setFilterStatus('all');
        
        // Load lại dữ liệu
        setLoading(true);
        try {
            const response = await productUnitService.getAllUnits({
                page: 1,
                pageSize: pagination.pageSize
            });

            const unitsData = response.items || response.data || [];
            const formattedUnits = unitsData.map(unit => {
                return productUnitService.formatUnitDisplay(unit);
            });

            setUnits(formattedUnits);
            setPagination(prev => ({
                ...prev,
                current: 1,
                total: response.totalItems || response.total || formattedUnits.length
            }));

            calculateStats(formattedUnits);
            message.success('Đã làm mới dữ liệu');

        } catch (error) {
            console.error('Error refreshing units:', error);
            message.error(error.message || 'Không thể làm mới dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const loadUnitTypes = async () => {
        try {
            const types = await productUnitService.getUnitTypes();
            setUnitTypes(types);
        } catch (error) {
            console.error('Error loading unit types:', error);
        }
    };

    const calculateStats = (unitsData) => {
        const totalUnits = unitsData.length;
        const activeUnits = unitsData.filter(unit => unit.isActive).length;
        const inactiveUnits = totalUnits - activeUnits;

        const byType = unitsData.reduce((acc, unit) => {
            const type = unit.unitType;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        setStats({
            total: totalUnits,
            active: activeUnits,
            inactive: inactiveUnits,
            byType
        });
    };

    const applyFilters = () => {
        let filtered = [...units];

        // Filter by search text
        if (searchText) {
            filtered = filtered.filter(unit =>
                unit.name.toLowerCase().includes(searchText.toLowerCase()) ||
                unit.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
                unit.description.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by status
        if (filterStatus !== 'all') {
            const isActive = filterStatus === 'active';
            filtered = filtered.filter(unit => unit.isActive === isActive);
        }

        setFilteredUnits(filtered);
    };

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    const showModal = (mode, unit = null) => {
        setModalMode(mode);
        setSelectedUnit(unit);
        setIsModalVisible(true);

        if (unit && (mode === 'edit' || mode === 'view')) {
            form.setFieldsValue({
                name: unit.name,
                displayName: unit.displayName,
                description: unit.description,
                unitType: unit.unitType,
                requiresIntegerQuantity: unit.requiresIntegerQuantity,
                sortOrder: unit.sortOrder
            });
        } else {
            form.resetFields();
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setSelectedUnit(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        try {
            if (modalMode === 'create') {
                await productUnitService.createUnit(values);
                message.success('Tạo đơn vị mới thành công');
            } else if (modalMode === 'edit') {
                await productUnitService.updateUnit(selectedUnit.id, values);
                message.success('Cập nhật đơn vị thành công');
            }

            setIsModalVisible(false);
            form.resetFields();
            await loadUnits();
        } catch (error) {
            console.error('Error submitting form:', error);
            message.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await productUnitService.toggleUnitStatus(id);
            message.success(`${currentStatus ? 'Vô hiệu hóa' : 'Kích hoạt'} đơn vị thành công`);
            await loadUnits();
        } catch (error) {
            console.error('Error toggling status:', error);
            message.error(error.message || 'Không thể thay đổi trạng thái');
        }
    };

    const handleDelete = async (id) => {
        try {
            await productUnitService.deleteUnit(id);
            message.success('Xóa đơn vị thành công');
            await loadUnits();
        } catch (error) {
            console.error('Error deleting unit:', error);
            message.error(error.message || 'Không thể xóa đơn vị');
        }
    };

    const columns = [
        {
            title: 'Tên đơn vị',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{text}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{record.displayName}</div>
                </div>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Loại đơn vị',
            dataIndex: 'unitType',
            key: 'unitType',
            render: (type, record) => (
                <Tag color={record.unitTypeColor}>
                    {record.unitTypeDisplay}
                </Tag>
            ),
            filters: unitTypes.map(type => ({
                text: String(productUnitService.getUnitTypeDisplayName(type.value)),
                value: String(type.value),
            })),

           onFilter: (value, record) => String(record.unitType) === String(value),

        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: {
                showTitle: false,
            },
            render: (text) => (
                <Tooltip placement="topLeft" title={text}>
                    {text || '-'}
                </Tooltip>
            ),
            responsive: ['md'],
        },
        {
            title: 'Yêu cầu số nguyên',
            dataIndex: 'requiresIntegerQuantity',
            key: 'requiresIntegerQuantity',
            render: (value) => (
                <Badge
                    status={value ? 'success' : 'default'}
                    text={value ? 'Có' : 'Không'}
                />
            ),
            filters: [
                { text: 'Có', value: true },
                { text: 'Không', value: false },
            ],
            onFilter: (value, record) => record.requiresIntegerQuantity === value,
            responsive: ['lg'],
        },
        {
            title: 'Thứ tự',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
            sorter: (a, b) => a.sortOrder - b.sortOrder,
            width: 100,
            responsive: ['md'],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => (
                <Tag color={record.statusColor}>
                    {record.statusText}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Không hoạt động', value: false },
            ],
            onFilter: (value, record) => record.isActive === value,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => showModal('view', record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => showModal('edit', record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                        <Popconfirm
                            title={`Bạn có chắc muốn ${record.isActive ? 'vô hiệu hóa' : 'kích hoạt'} đơn vị này?`}
                            onConfirm={() => handleToggleStatus(record.id, record.isActive)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="text"
                                danger={record.isActive}
                                style={{ color: record.isActive ? undefined : '#52c41a' }}
                            >
                                {record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            </Button>
                        </Popconfirm>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc muốn xóa đơn vị này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
            width: 200,
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h2>Quản lý Đơn vị Sản phẩm</h2>
                <p style={{ color: '#666' }}>Quản lý các đơn vị đo lường cho sản phẩm</p>
            </div>

            {/* Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Tổng số đơn vị"
                            value={stats.total}
                            prefix={<SortAscendingOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.active}
                            prefix={<Badge status="success" />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Không hoạt động"
                            value={stats.inactive}
                            prefix={<Badge status="default" />}
                            valueStyle={{ color: '#d9d9d9' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Loại đơn vị"
                            value={Object.keys(stats.byType).length}
                            prefix={<FilterOutlined style={{ color: '#722ed1' }} />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters and Actions */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder="Tìm kiếm đơn vị..."
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            value={filterStatus === 'all' ? undefined : filterStatus}
                            onChange={(value) => setFilterStatus(value || 'all')}
                            style={{ width: '100%' }}
                        >
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Không hoạt động</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={10}>
                        <Space style={{ float: 'right' }}>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => showModal('create')}
                            >
                                Thêm đơn vị mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredUnits}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đơn vị`,
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            {/* Modal */}
            <Modal
                title={
                    modalMode === 'create' ? 'Thêm đơn vị mới' :
                        modalMode === 'edit' ? 'Chỉnh sửa đơn vị' :
                            'Chi tiết đơn vị'
                }
                open={isModalVisible}
                onCancel={handleModalCancel}
                footer={
                    modalMode === 'view' ? [
                        <Button key="close" onClick={handleModalCancel}>
                            Đóng
                        </Button>
                    ] : [
                        <Button key="cancel" onClick={handleModalCancel}>
                            Hủy
                        </Button>,
                        <Button key="submit" type="primary" onClick={() => form.submit()}>
                            {modalMode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                        </Button>
                    ]
                }
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    disabled={modalMode === 'view'}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên đơn vị"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên đơn vị' },
                                    { max: 20, message: 'Tên đơn vị không được vượt quá 20 ký tự' }
                                ]}
                            >
                                <Input placeholder="VD: kg, con, chai..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="displayName"
                                label="Tên hiển thị"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên hiển thị' },
                                    { max: 50, message: 'Tên hiển thị không được vượt quá 50 ký tự' }
                                ]}
                            >
                                <Input placeholder="VD: Kilogram, Con, Chai..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[
                            { max: 200, message: 'Mô tả không được vượt quá 200 ký tự' }
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Mô tả chi tiết về đơn vị..."
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="unitType"
                                label="Loại đơn vị"
                                rules={[{ required: true, message: 'Vui lòng chọn loại đơn vị' }]}
                            >
                                <Select placeholder="Chọn loại đơn vị">
                                    {unitTypes.map(type => (
                                        <Option key={type.value} value={type.value}>
                                            {type.displayName}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="sortOrder"
                                label="Thứ tự sắp xếp"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập thứ tự' },
                                    { type: 'number', min: 0, message: 'Thứ tự phải >= 0' }
                                ]}
                                initialValue={0}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="requiresIntegerQuantity"
                        label="Yêu cầu số lượng nguyên"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Switch checkedChildren="Có" unCheckedChildren="Không" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductUnitManagement;
