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
} from 'antd';
import {
    AppstoreOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ExportOutlined,
    EyeOutlined,
    PoweroffOutlined,
    CheckCircleOutlined,
    StopOutlined,
} from '@ant-design/icons';
import categoryService from '../../../services/categoryService';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        alphabet: ''
    });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [searchLoading, setSearchLoading] = useState(false);

    // Alphabet filter options
    const alphabetOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
        value: letter,
        label: letter
    }));

    useEffect(() => {
        loadCategories();
    }, [pagination.current, pagination.pageSize, filters.search, filters.status, filters.alphabet]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            console.log('🔍 CategoryManagement - Loading categories with filters:', filters);

            let response;
            let usedFallback = false;

            try {
                if (filters.search && filters.search.trim()) {
                    // Search by name
                    response = await categoryService.searchCategories(filters.search.trim());
                    console.log('🔍 CategoryManagement - Used search endpoint');
                } else if (filters.alphabet) {
                    // Filter by alphabet
                    response = await categoryService.filterCategories(filters.alphabet);
                    console.log('🔍 CategoryManagement - Used filter endpoint');
                } else {
                    // Get all categories
                    response = await categoryService.getAllCategories(pagination.current, pagination.pageSize);
                    console.log('🔍 CategoryManagement - Used getAllCategories endpoint');
                }
            } catch (searchFilterError) {
                console.warn('🔄 CategoryManagement - Search/Filter failed, falling back to getAllCategories:', searchFilterError.message);
                response = await categoryService.getAllCategories(pagination.current, pagination.pageSize);
                usedFallback = true;
            }

            console.log('🔍 CategoryManagement - API response:', response);

            // Handle different response structures
            let categoriesData = [];
            let total = 0;

            if (Array.isArray(response)) {
                // Direct array response
                categoriesData = response;
                total = response.length;
            } else if (response?.data && Array.isArray(response.data)) {
                // Response with data property
                categoriesData = response.data;
                total = response.total || response.data.length;
            } else if (response?.items && Array.isArray(response.items)) {
                // Paginated response structure
                categoriesData = response.items;
                total = response.totalCount || response.items.length;
                setPagination(prev => ({
                    ...prev,
                    total: response.totalCount || 0
                }));
            }

            // Apply frontend status filter if needed
            if (filters.status) {
                if (filters.status === 'active') {
                    categoriesData = categoriesData.filter(cat => cat.isActive === true);
                } else if (filters.status === 'inactive') {
                    categoriesData = categoriesData.filter(cat => cat.isActive === false);
                }
            }

            console.log('🔍 CategoryManagement - Processed categories data:', categoriesData);

            setCategories(categoriesData);

            if (!response?.items) {
                setPagination(prev => ({
                    ...prev,
                    total: categoriesData.length
                }));
            }

            // Show appropriate messages
            if ((filters.search || filters.alphabet) && categoriesData.length === 0 && !usedFallback) {
                message.info('Không tìm thấy danh mục nào phù hợp với điều kiện tìm kiếm');
            } else if (usedFallback && (filters.search || filters.alphabet)) {
                message.warning('API search/filter không khả dụng. Đang hiển thị tất cả danh mục.');
            } else if (filters.search && !usedFallback) {
                message.success(`Tìm thấy ${categoriesData.length} danh mục khớp với "${filters.search}"`);
            } else if (filters.alphabet && !usedFallback) {
                message.success(`Tìm thấy ${categoriesData.length} danh mục bắt đầu bằng "${filters.alphabet}"`);
            }
        } catch (error) {
            console.error('❌ CategoryManagement - Error loading categories:', error);
            message.error(`Lỗi khi tải danh sách danh mục: ${error.message}`);
            setCategories([]);
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    };

    const handleTableChange = (paginationData) => {
        if (!filters.search && !filters.alphabet) {
            setPagination({
                ...pagination,
                current: paginationData.current,
                pageSize: paginationData.pageSize
            });
        }
    };

    const handleSearch = (value) => {
        setSearchLoading(true);
        const trimmedValue = value ? value.trim() : '';
        setFilters(prev => ({ ...prev, search: trimmedValue }));
        setPagination(prev => ({ ...prev, current: 1 }));
        console.log('🔍 CategoryManagement - Search triggered with value:', trimmedValue);
    };

    const handleFilterChange = (key, value) => {
        console.log(`🔍 CategoryManagement - Filter ${key} changed to:`, value);
        setFilters(prev => ({ ...prev, [key]: value || '' }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleCreateCategory = () => {
        setSelectedCategory(null);
        setEditMode(false);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditCategory = (category) => {
        setSelectedCategory(category);
        setEditMode(true);
        form.setFieldsValue({
            name: category.name,
            description: category.description,
        });
        setModalVisible(true);
    };

    const handleViewCategory = (category) => {
        setSelectedCategory(category);
        setDrawerVisible(true);
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            await categoryService.deleteCategory(categoryId);
            message.success('Xóa danh mục thành công');
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            message.error('Lỗi khi xóa danh mục');
        }
    };

    const handleToggleCategoryStatus = async (categoryId, currentStatus) => {
        try {
            await categoryService.toggleCategoryStatus(categoryId);
            const newStatus = currentStatus ? 'Tạm ngừng' : 'Kích hoạt';
            message.success(`Đã ${newStatus} danh mục thành công`);
            loadCategories();
        } catch (error) {
            console.error('Error toggling category status:', error);
            message.error('Lỗi khi thay đổi trạng thái danh mục');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editMode) {
                await categoryService.updateCategory(selectedCategory.id, values);
                message.success('Cập nhật danh mục thành công');
            } else {
                await categoryService.createCategory(values);
                message.success('Tạo danh mục thành công');
            }

            setModalVisible(false);
            form.resetFields();
            loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            message.error(editMode ? 'Lỗi khi cập nhật danh mục' : 'Lỗi khi tạo danh mục');
        }
    };

    const columns = [
        {
            title: 'Danh mục',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        backgroundColor: record.isActive ? '#e6f7ff' : '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <AppstoreOutlined style={{
                            fontSize: '18px',
                            color: record.isActive ? '#1890ff' : '#999'
                        }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.description ? record.description.substring(0, 50) + '...' : 'Chưa có mô tả'}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'} icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}>
                    {isActive ? 'Đang hoạt động' : 'Tạm ngừng'}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '',
        },
        {
            title: 'Cập nhật cuối',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 160,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewCategory(record)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCategory(record)}
                        title="Chỉnh sửa"
                    />
                    <Popconfirm
                        title={`Bạn có chắc chắn muốn ${record.isActive ? 'tạm ngừng' : 'kích hoạt'} danh mục này?`}
                        onConfirm={() => handleToggleCategoryStatus(record.id, record.isActive)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="text"
                            icon={<PoweroffOutlined />}
                            title={record.isActive ? 'Tạm ngừng' : 'Kích hoạt'}
                            style={{
                                color: record.isActive ? '#ff4d4f' : '#52c41a'
                            }}
                        />
                    </Popconfirm>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa danh mục này?"
                        onConfirm={() => handleDeleteCategory(record.id)}
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
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Quản lý danh mục</h2>
                    <p style={{ margin: 0, color: '#666' }}>Quản lý tất cả các danh mục sản phẩm trong hệ thống</p>
                </div>
                <Space>
                    <Button icon={<ExportOutlined />}>Xuất Excel</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCategory}>
                        Thêm danh mục mới
                    </Button>
                </Space>
            </div>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số danh mục"
                            value={pagination.total}
                            prefix={<AppstoreOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={categories.filter(c => c.isActive).length}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tạm ngừng"
                            value={categories.filter(c => !c.isActive).length}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tạo trong tháng"
                            value={categories.filter(c => {
                                const createdDate = new Date(c.createdAt);
                                const now = new Date();
                                return createdDate.getMonth() === now.getMonth() &&
                                    createdDate.getFullYear() === now.getFullYear();
                            }).length}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Search
                            placeholder="Tìm kiếm theo tên danh mục..."
                            allowClear
                            loading={searchLoading}
                            value={filters.search}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFilters(prev => ({ ...prev, search: value }));
                            }}
                            onSearch={handleSearch}
                            style={{ width: '100%' }}
                            enterButton="Tìm kiếm"
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            value={filters.status || undefined}
                            style={{ width: '100%' }}
                            onChange={(value) => handleFilterChange('status', value)}
                        >
                            <Option value="active">Đang hoạt động</Option>
                            <Option value="inactive">Tạm ngừng</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Chữ cái đầu"
                            allowClear
                            value={filters.alphabet || undefined}
                            style={{ width: '100%' }}
                            onChange={(value) => handleFilterChange('alphabet', value)}
                            showSearch
                        >
                            {alphabetOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button
                            onClick={() => {
                                setFilters({ search: '', status: '', alphabet: '' });
                                setPagination(prev => ({ ...prev, current: 1 }));
                            }}
                            loading={loading}
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
                    dataSource={categories}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} danh mục`,
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên danh mục!' },
                            { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' },
                            { max: 100, message: 'Tên danh mục không được quá 100 ký tự!' }
                        ]}
                    >
                        <Input placeholder="Nhập tên danh mục..." />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[
                            { max: 500, message: 'Mô tả không được quá 500 ký tự!' }
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả cho danh mục..."
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
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

            {/* View Category Drawer */}
            <Drawer
                title="Chi tiết danh mục"
                placement="right"
                size="large"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                {selectedCategory && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: selectedCategory.isActive ? '#e6f7ff' : '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <AppstoreOutlined style={{
                                    fontSize: '32px',
                                    color: selectedCategory.isActive ? '#1890ff' : '#999'
                                }} />
                            </div>
                            <h3>{selectedCategory.name}</h3>
                            <Tag color={selectedCategory.isActive ? 'green' : 'red'}>
                                {selectedCategory.isActive ? 'Đang hoạt động' : 'Tạm ngừng'}
                            </Tag>
                        </div>

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Tên danh mục">
                                {selectedCategory.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {selectedCategory.description || 'Chưa có mô tả'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedCategory.isActive ? 'green' : 'red'}>
                                    {selectedCategory.isActive ? 'Đang hoạt động' : 'Tạm ngừng'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {selectedCategory.createdAt ? new Date(selectedCategory.createdAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật cuối">
                                {selectedCategory.updatedAt ? new Date(selectedCategory.updatedAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setDrawerVisible(false);
                                        handleEditCategory(selectedCategory);
                                    }}
                                >
                                    Chỉnh sửa
                                </Button>
                                <Button
                                    icon={selectedCategory.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                                    onClick={() => {
                                        setDrawerVisible(false);
                                        handleToggleCategoryStatus(selectedCategory.id, selectedCategory.isActive);
                                    }}
                                    style={{
                                        color: selectedCategory.isActive ? '#ff4d4f' : '#52c41a'
                                    }}
                                >
                                    {selectedCategory.isActive ? 'Tạm ngừng' : 'Kích hoạt'}
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default CategoryManagement;
