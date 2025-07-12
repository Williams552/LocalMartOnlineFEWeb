// src/pages/Admin/MarketManagement.js
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
    TimePicker
} from 'antd';
import {
    ShopOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ExportOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    PoweroffOutlined
} from '@ant-design/icons';
import { marketService } from '../../../services/marketService';
import MarketNavigation from './MarketNavigation';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const MarketManagement = () => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: ''
    });
    const [searchTerm, setSearchTerm] = useState(''); // Separate state for actual search execution
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [searchLoading, setSearchLoading] = useState(false);

    const marketStatuses = [
        { value: 'Active', label: 'Hoạt động', color: 'green' },
        { value: 'Suspended', label: 'Không hoạt động', color: 'red' },
        { value: 'Maintenance', label: 'Bảo trì', color: 'orange' }
    ];

    useEffect(() => {
        loadMarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, filters.status]); // Only trigger when searchTerm or status changes

    const loadMarkets = async () => {
        setLoading(true);
        try {
            console.log('🔍 MarketManagement - Loading markets with searchTerm:', searchTerm, 'status:', filters.status);
            
            let response;
            let usedFallback = false;
            
            // Use appropriate endpoint based on filters
            try {
                if (searchTerm && searchTerm.trim() && filters.status) {
                    // Both search and status filter
                    // First search, then filter results on frontend
                    response = await marketService.searchMarkets(searchTerm.trim());
                    console.log('🔍 MarketManagement - Used search endpoint, filtering by status on frontend');
                    
                    // Apply status filter on frontend
                    if (Array.isArray(response)) {
                        response = response.filter(market => market.status === filters.status);
                    } else if (response?.data && Array.isArray(response.data)) {
                        response.data = response.data.filter(market => market.status === filters.status);
                    }
                } else if (searchTerm && searchTerm.trim()) {
                    // Only search
                    response = await marketService.searchMarkets(searchTerm.trim());
                    console.log('🔍 MarketManagement - Used search endpoint');
                } else if (filters.status) {
                    // Only status filter
                    response = await marketService.filterMarkets({ status: filters.status });
                    console.log('🔍 MarketManagement - Used filter endpoint');
                } else {
                    // No filters - use regular getAllMarkets
                    response = await marketService.getAllMarkets();
                    console.log('🔍 MarketManagement - Used getAllMarkets endpoint');
                }
            } catch (searchFilterError) {
                console.warn('🔄 MarketManagement - Search/Filter failed, falling back to getAllMarkets:', searchFilterError.message);
                response = await marketService.getAllMarkets();
                usedFallback = true;
            }
            
            console.log('🔍 MarketManagement - API response:', response);

            // Handle different response structures
            let marketsData = [];
            let total = 0;

            if (Array.isArray(response)) {
                // Direct array response
                marketsData = response;
                total = response.length;
            } else if (response?.data && Array.isArray(response.data)) {
                // Response with data property
                marketsData = response.data;
                total = response.total || response.data.length;
            } else if (response && typeof response === 'object') {
                // Response is an object, might contain markets directly
                marketsData = Object.values(response).filter(item =>
                    item && typeof item === 'object' && item.id
                );
                total = marketsData.length;
            }

            console.log('🔍 MarketManagement - Processed markets data:', marketsData);

            setMarkets(marketsData);
            setPagination(prev => ({
                ...prev,
                total
            }));
            
            // Show appropriate messages
            if ((searchTerm || filters.status) && marketsData.length === 0 && !usedFallback) {
                message.info('Không tìm thấy chợ nào phù hợp với điều kiện tìm kiếm');
            } else if (usedFallback && (searchTerm || filters.status)) {
                message.warning('API search/filter không khả dụng. Đang hiển thị tất cả chợ.');
            } else if (searchTerm && !usedFallback) {
                message.success(`Tìm thấy ${marketsData.length} chợ khớp với "${searchTerm}"`);
            } else if (filters.status && !usedFallback) {
                message.success(`Tìm thấy ${marketsData.length} chợ có trạng thái "${filters.status}"`);
            }
        } catch (error) {
            console.error('❌ MarketManagement - Error loading markets:', error);
            let errorMessage = 'Lỗi khi tải danh sách chợ';
            
            if (searchTerm && filters.status) {
                errorMessage = 'Lỗi khi tìm kiếm và lọc chợ';
            } else if (searchTerm) {
                errorMessage = 'Lỗi khi tìm kiếm chợ';
            } else if (filters.status) {
                errorMessage = 'Lỗi khi lọc chợ theo trạng thái';
            }
            
            message.error(`${errorMessage}: ${error.message}`);
            setMarkets([]);
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    };

    const handleTableChange = (paginationData) => {
        // For search/filter results, we don't support server-side pagination
        // Only allow pagination change for normal getAllMarkets
        if (!searchTerm && !filters.status) {
            setPagination({
                ...pagination,
                current: paginationData.current,
                pageSize: paginationData.pageSize
            });
        }
    };

    const handleSearch = (value) => {
        setSearchLoading(true);
        
        // Update the searchTerm which will trigger useEffect to reload data
        const trimmedValue = value ? value.trim() : '';
        setSearchTerm(trimmedValue);
        setPagination(prev => ({ ...prev, current: 1 }));
        
        console.log('🔍 MarketManagement - Search triggered with value:', trimmedValue);
    };

    const handleFilterChange = (key, value) => {
        console.log(`🔍 MarketManagement - Filter ${key} changed to:`, value);
        setFilters(prev => ({ ...prev, [key]: value || '' }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleCreateMarket = () => {
        setSelectedMarket(null);
        setEditMode(false);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditMarket = (market) => {
        setSelectedMarket(market);
        setEditMode(true);
        
        // Parse operatingHours back to openTime and closeTime for the form
        let openTime = null;
        let closeTime = null;
        
        if (market.operatingHours) {
            // Handle different formats: "HH:mm-HH:mm", "HH:mm - HH:mm", etc.
            const timeRange = market.operatingHours.split(/[-–]/).map(t => t.trim());
            if (timeRange.length === 2 && timeRange[0] && timeRange[1]) {
                try {
                    openTime = moment(timeRange[0], 'HH:mm');
                    closeTime = moment(timeRange[1], 'HH:mm');
                    
                    // Validate the parsed times
                    if (!openTime.isValid()) openTime = null;
                    if (!closeTime.isValid()) closeTime = null;
                } catch (error) {
                    console.warn('MarketManagement - Could not parse operatingHours:', market.operatingHours);
                }
            }
        }
        
        console.log('🔄 MarketManagement - Editing market with parsed times:', {
            original: market.operatingHours,
            openTime: openTime?.format('HH:mm'),
            closeTime: closeTime?.format('HH:mm')
        });
        
        form.setFieldsValue({
            ...market,
            openTime,
            closeTime,
        });
        setModalVisible(true);
    };

    const handleViewMarket = (market) => {
        setSelectedMarket(market);
        setDrawerVisible(true);
    };

    const handleDeleteMarket = async (marketId) => {
        try {
            await marketService.deleteMarket(marketId);
            message.success('Xóa chợ thành công');
            loadMarkets();
        } catch (error) {
            console.error('Error deleting market:', error);
            message.error('Lỗi khi xóa chợ');
        }
    };

    const handleToggleMarketStatus = async (marketId, currentStatus) => {
        try {
            await marketService.toggleMarketStatus(marketId);
            const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
            message.success(`Đã chuyển trạng thái chợ thành ${newStatus === 'Active' ? 'Hoạt động' : 'Tạm ngừng'}`);
            loadMarkets();
        } catch (error) {
            console.error('Error toggling market status:', error);
            message.error('Lỗi khi thay đổi trạng thái chợ');
        }
    };

    const handleSubmit = async (values) => {
        try {
            // Prepare market data with operatingHours format for backend
            const { openTime, closeTime, ...otherValues } = values;
            
            let operatingHours = null;
            if (openTime && closeTime) {
                operatingHours = `${openTime.format('HH:mm')}-${closeTime.format('HH:mm')}`;
            } else if (openTime) {
                operatingHours = `${openTime.format('HH:mm')}-23:59`;
            } else if (closeTime) {
                operatingHours = `00:00-${closeTime.format('HH:mm')}`;
            }

            const marketData = {
                ...otherValues,
                operatingHours: operatingHours || undefined, // Don't send null, send undefined to omit field
            };

            console.log('🔄 MarketManagement - Submitting market data:', marketData);

            if (editMode) {
                // Check if status has changed
                const originalStatus = selectedMarket.status;
                const newStatus = values.status;

                if (originalStatus !== newStatus) {
                    // Status changed - use toggle endpoint
                    console.log('🔄 MarketManagement - Status changed, using toggle endpoint');
                    await marketService.toggleMarketStatus(selectedMarket.id);
                    message.success('Cập nhật trạng thái chợ thành công');
                }

                // Update other fields (excluding status from the data)
                const { status, ...updateData } = marketData;
                if (Object.keys(updateData).length > 2) { // More than just openTime/closeTime
                    await marketService.updateMarket(selectedMarket.id, updateData);
                    if (originalStatus === newStatus) {
                        message.success('Cập nhật thông tin chợ thành công');
                    }
                }
            } else {
                // Creating new market - status can be set via create endpoint
                await marketService.createMarket(marketData);
                message.success('Tạo chợ thành công');
            }

            setModalVisible(false);
            form.resetFields();
            loadMarkets();
        } catch (error) {
            console.error('Error saving market:', error);
            message.error(editMode ? 'Lỗi khi cập nhật chợ' : 'Lỗi khi tạo chợ');
        }
    };

    const getStatusColor = (status) => {
        const statusObj = marketStatuses.find(s => s.value === status);
        return statusObj?.color || 'default';
    };

    const getStatusLabel = (status) => {
        const statusObj = marketStatuses.find(s => s.value === status);
        return statusObj?.label || status;
    };

    const columns = [
        {
            title: 'Chợ',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <ShopOutlined style={{ fontSize: '18px' }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            <EnvironmentOutlined /> {record.address}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusLabel(status)}
                </Tag>
            ),
        },
        {
            title: 'Giờ hoạt động',
            key: 'operatingHours',
            render: (_, record) => (
                <div>
                    <ClockCircleOutlined /> {record.operatingHours || 'Không rõ'}
                </div>
            ),
        },

        {
            title: 'Số lượng cửa hàng',
            dataIndex: 'storeCount',
            key: 'storeCount',
            render: (count) => count || 0,
        },
        {
            title: 'Phí thuê',
            dataIndex: 'rentFee',
            key: 'rentFee',
            render: (fee) => fee ? `${fee.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
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
                        onClick={() => handleViewMarket(record)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditMarket(record)}
                        title="Chỉnh sửa"
                    />
                    <Popconfirm
                        title={`Bạn có chắc chắn muốn ${record.status === 'Active' ? 'tạm ngừng' : 'kích hoạt'} chợ này?`}
                        onConfirm={() => handleToggleMarketStatus(record.id, record.status)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="text"
                            icon={<PoweroffOutlined />}
                            title={record.status === 'Active' ? 'Tạm ngừng' : 'Kích hoạt'}
                            style={{
                                color: record.status === 'Active' ? '#ff4d4f' : '#52c41a'
                            }}
                        />
                    </Popconfirm>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa chợ này?"
                        onConfirm={() => handleDeleteMarket(record.id)}
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


                {/* Header */}
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Quản lý chợ</h2>
                        <p style={{ margin: 0, color: '#666' }}>Quản lý tất cả các chợ trong hệ thống</p>
                    </div>
                    <Space>
                        <Button icon={<ExportOutlined />}>Xuất Excel</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateMarket}>
                            Thêm chợ mới
                        </Button>
                    </Space>
                </div>

                {/* Statistics */}
                <Row gutter={16} style={{ marginBottom: '24px' }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tổng số chợ"
                                value={pagination.total}
                                prefix={<ShopOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đang hoạt động"
                                value={markets.filter(m => m.status === 'Active').length}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Bảo trì"
                                value={markets.filter(m => m.status === 'Maintenance').length}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tổng cửa hàng"
                                value={markets.reduce((sum, m) => sum + (m.storeCount || 0), 0)}
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
                                placeholder="Tìm kiếm theo tên chợ, địa chỉ..."
                                allowClear
                                loading={searchLoading}
                                value={filters.search}
                                onChange={(e) => {
                                    // Handle real-time input change for controlled component
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
                                {marketStatuses.map(status => (
                                    <Option key={status.value} value={status.value}>
                                        {status.label}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Button 
                                onClick={() => {
                                    setFilters({ search: '', status: '' });
                                    setSearchTerm(''); // Also reset searchTerm
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
                        dataSource={markets}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} chợ`,
                        }}
                        onChange={handleTableChange}
                    />
                </Card>

                {/* Create/Edit Modal */}
                <Modal
                    title={editMode ? 'Chỉnh sửa chợ' : 'Thêm chợ mới'}
                    open={modalVisible}
                    onCancel={() => {
                        setModalVisible(false);
                        form.resetFields();
                    }}
                    footer={null}
                    width={800}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="Tên chợ"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên chợ!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="status"
                                    label="Trạng thái"
                                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                                >
                                    <Select>
                                        {marketStatuses.map(status => (
                                            <Option key={status.value} value={status.value}>
                                                {status.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="address"
                            label="Địa chỉ"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô tả"
                        >
                            <TextArea rows={4} />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="openTime"
                                    label="Giờ mở cửa"
                                    tooltip="Giờ mở cửa và giờ đóng cửa sẽ được kết hợp thành giờ hoạt động"
                                >
                                    <TimePicker 
                                        format="HH:mm" 
                                        style={{ width: '100%' }}
                                        placeholder="Chọn giờ mở cửa"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="closeTime"
                                    label="Giờ đóng cửa"
                                    dependencies={['openTime']}
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                const openTime = getFieldValue('openTime');
                                                if (openTime && value && value.isBefore(openTime)) {
                                                    return Promise.reject(new Error('Giờ đóng cửa phải sau giờ mở cửa'));
                                                }
                                                return Promise.resolve();
                                            },
                                        }),
                                    ]}
                                >
                                    <TimePicker 
                                        format="HH:mm" 
                                        style={{ width: '100%' }}
                                        placeholder="Chọn giờ đóng cửa"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="rentFee"
                                    label="Phí thuê (VNĐ)"
                                >
                                    <Input type="number" placeholder="Nhập phí thuê..." />
                                </Form.Item>
                            </Col>
                        </Row>
                        
                        <Form.Item
                            shouldUpdate={(prevValues, currentValues) => 
                                prevValues.openTime !== currentValues.openTime || 
                                prevValues.closeTime !== currentValues.closeTime
                            }
                        >
                            {({ getFieldValue }) => {
                                const openTime = getFieldValue('openTime');
                                const closeTime = getFieldValue('closeTime');
                                let previewText = 'Chưa thiết lập giờ hoạt động';
                                
                                if (openTime && closeTime) {
                                    previewText = `Giờ hoạt động: ${openTime.format('HH:mm')} - ${closeTime.format('HH:mm')}`;
                                } else if (openTime) {
                                    previewText = `Giờ hoạt động: ${openTime.format('HH:mm')} - 23:59 (mặc định)`;
                                } else if (closeTime) {
                                    previewText = `Giờ hoạt động: 00:00 - ${closeTime.format('HH:mm')} (mặc định)`;
                                }
                                
                                return (
                                    <div style={{ 
                                        padding: '8px 12px', 
                                        backgroundColor: '#f6f8fa', 
                                        border: '1px solid #d0d7de',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        color: '#656d76'
                                    }}>
                                        <ClockCircleOutlined style={{ marginRight: '8px' }} />
                                        {previewText}
                                    </div>
                                );
                            }}
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="phoneNumber"
                                    label="Số điện thoại liên hệ"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="email"
                                    label="Email liên hệ"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="facilities"
                            label="Tiện ích"
                        >
                            <TextArea rows={2} placeholder="Ví dụ: Bãi đỗ xe, WiFi, Điều hòa..." />
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

                {/* View Market Drawer */}
                <Drawer
                    title="Chi tiết chợ"
                    placement="right"
                    size="large"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                >
                    {selectedMarket && (
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
                                    <ShopOutlined style={{ fontSize: '32px' }} />
                                </div>
                                <h3>{selectedMarket.name}</h3>
                                <Tag color={getStatusColor(selectedMarket.status)}>
                                    {getStatusLabel(selectedMarket.status)}
                                </Tag>
                            </div>

                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="Địa chỉ">
                                    {selectedMarket.address}
                                </Descriptions.Item>
                                <Descriptions.Item label="Mô tả">
                                    {selectedMarket.description || 'Chưa có mô tả'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Giờ hoạt động">
                                    {selectedMarket.operatingHours || 'Chưa cập nhật'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phí thuê">
                                    {selectedMarket.rentFee ? `${selectedMarket.rentFee.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    {selectedMarket.phoneNumber || 'Chưa cập nhật'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    {selectedMarket.email || 'Chưa cập nhật'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tiện ích">
                                    {selectedMarket.facilities || 'Chưa có thông tin'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số lượng cửa hàng">
                                    {selectedMarket.storeCount || 0} cửa hàng
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày tạo">
                                    {selectedMarket.createdAt ? new Date(selectedMarket.createdAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}
                                </Descriptions.Item>
                            </Descriptions>

                            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setDrawerVisible(false);
                                            handleEditMarket(selectedMarket);
                                        }}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        icon={<ShopOutlined />}
                                        onClick={() => {
                                            // Navigate to stores of this market
                                            // navigate(`/admin/stores?marketId=${selectedMarket.id}`);
                                        }}
                                    >
                                        Xem cửa hàng
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

export default MarketManagement;
