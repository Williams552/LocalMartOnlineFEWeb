// src/pages/Admin/Store/StoreManagement.js
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
    Avatar,
    Rate,
    Tooltip
} from 'antd';
import {
    ShopOutlined,
    SearchOutlined,
    ExportOutlined,
    EyeOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    StopOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import storeService from '../../../services/storeService';
import { marketService } from '../../../services/marketService';
import StoreNavigation from './StoreNavigation';

const { Search } = Input;
const { Option } = Select;

const StoreManagement = () => {
    const [stores, setStores] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        marketId: ''
    });
    const [selectedStore, setSelectedStore] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const storeStatuses = [
        { value: 'Open', label: 'Đang mở', color: 'green' },
        { value: 'Closed', label: 'Đã đóng', color: 'red' },
        { value: 'Suspended', label: 'Tạm ngưng', color: 'orange' }
    ];

    useEffect(() => {
        loadInitialStores();
        loadMarkets();
    }, []); // Only run once on mount

    // Separate useEffect for pagination changes (not including filters to avoid loops)
    useEffect(() => {
        if (filters.search || filters.status || filters.marketId) {
            // If there are active filters, don't reload - let the filter functions handle it
            return;
        }
        // Only reload if no filters are active and pagination changed
        loadInitialStores();
    }, [pagination.current, pagination.pageSize]);

    const loadInitialStores = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                limit: pagination.pageSize
            };

            console.log('🔍 StoreManagement - Loading initial stores with params:', params);
            const response = await storeService.getAllStores(params);
            console.log('🔍 StoreManagement - API response:', response);

            // Handle backend response structure: { success, message, data }
            let storesData = [];
            let total = 0;

            if (response && response.success && response.data) {
                if (Array.isArray(response.data)) {
                    storesData = response.data;
                    total = response.total || response.data.length;
                } else if (response.data.items && Array.isArray(response.data.items)) {
                    // Paginated response
                    storesData = response.data.items;
                    total = response.data.totalCount || response.data.total || response.data.items.length;
                }
            } else if (Array.isArray(response)) {
                storesData = response;
                total = response.length;
            }

            setStores(storesData);
            setPagination(prev => ({
                ...prev,
                total
            }));
        } catch (error) {
            console.error('❌ StoreManagement - Error loading stores:', error);
            message.error(`Lỗi khi tải danh sách cửa hàng: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadStores = async () => {
        // This function is for manual refresh only
        setLoading(true);
        try {
            // Reset filters and pagination
            const newFilters = {
                search: '',
                status: '',
                marketId: ''
            };
            setFilters(newFilters);

            const params = {
                page: 1,
                limit: pagination.pageSize
            };

            console.log('� StoreManagement - Refreshing all stores');
            const response = await storeService.getAllStores(params);

            // Handle backend response structure: { success, message, data }
            let storesData = [];
            let total = 0;

            if (response && response.success && response.data) {
                if (Array.isArray(response.data)) {
                    storesData = response.data;
                    total = response.total || response.data.length;
                } else if (response.data.items && Array.isArray(response.data.items)) {
                    storesData = response.data.items;
                    total = response.data.totalCount || response.data.total || response.data.items.length;
                }
            } else if (Array.isArray(response)) {
                storesData = response;
                total = response.length;
            }

            setStores(storesData);
            setPagination(prev => ({
                ...prev,
                current: 1,
                total
            }));

            // Removed success message for refresh as requested
        } catch (error) {
            console.error('❌ StoreManagement - Error refreshing stores:', error);
            message.error(`Lỗi khi làm mới: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadMarkets = async () => {
        try {
            const response = await marketService.getActiveMarkets();
            const marketsData = Array.isArray(response) ? response :
                response?.data ? response.data : [];
            setMarkets(marketsData);
        } catch (error) {
            console.error('Error loading markets:', error);
        }
    };

    const handleTableChange = (paginationData) => {
        setPagination({
            ...pagination,
            current: paginationData.current,
            pageSize: paginationData.pageSize
        });
    };

    const handleSearch = async (value) => {
        if (!value || value.trim() === '') {
            // If search is empty, reload initial stores
            setFilters(prev => ({ ...prev, search: '' }));
            setPagination(prev => ({ ...prev, current: 1 }));
            await loadInitialStores();
            return;
        }

        setLoading(true);
        try {
            console.log('🔍 Searching stores with keyword:', value);

            // Use searchStores API for actual search
            const searchParams = {
                keyword: value.trim(),
                page: 1,
                pageSize: pagination.pageSize,
                status: filters.status || undefined, // Only send if status is selected
                marketId: filters.marketId || undefined // Only send if marketId is selected
            };

            const response = await storeService.searchStores(searchParams);
            console.log('🔍 Search response:', response);

            // Handle search response
            let storesData = [];
            let total = 0;

            if (response && response.success && response.data) {
                if (Array.isArray(response.data)) {
                    storesData = response.data;
                    total = response.total || response.data.length;
                } else if (response.data.items && Array.isArray(response.data.items)) {
                    storesData = response.data.items;
                    total = response.data.totalCount || response.data.total || response.data.items.length;
                }
            } else if (Array.isArray(response)) {
                storesData = response;
                total = response.length;
            }

            setStores(storesData);
            setPagination(prev => ({
                ...prev,
                current: 1,
                total
            }));
            setFilters(prev => ({ ...prev, search: value }));

            // Removed success message for search as requested
        } catch (error) {
            console.error('❌ Error searching stores:', error);
            message.error(`Lỗi khi tìm kiếm: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async (key, value) => {
        const updatedFilters = { ...filters, [key]: value };
        setFilters(updatedFilters);
        setPagination(prev => ({ ...prev, current: 1 }));

        setLoading(true);
        try {
            const searchParams = {
                keyword: updatedFilters.search || undefined,
                page: 1,
                pageSize: pagination.pageSize,
                status: updatedFilters.status || undefined,
                marketId: updatedFilters.marketId || undefined
            };

            const response = await storeService.searchStores(searchParams);
            console.log('🔎 Filter response:', response);

            let storesData = [];
            let total = 0;

            if (response?.success && response.data) {
                if (Array.isArray(response.data)) {
                    storesData = response.data;
                    total = response.total || response.data.length;
                } else if (Array.isArray(response.data.items)) {
                    storesData = response.data.items;
                    total = response.data.totalCount || response.data.total || response.data.items.length;
                }
            }

            setStores(storesData);
            setPagination(prev => ({
                ...prev,
                total,
                current: 1
            }));
        } catch (error) {
            console.error('❌ Error filtering stores:', error);
            message.error('Lỗi khi lọc cửa hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleViewStore = (store) => {
        setSelectedStore(store);
        setDrawerVisible(true);
    };

    const handleSuspendStore = async (storeId) => {
        Modal.confirm({
            title: 'Tạm ngưng cửa hàng',
            content: (
                <div>
                    <p>Bạn có chắc chắn muốn tạm ngưng cửa hàng này?</p>
                    <Input.TextArea
                        placeholder="Nhập lý do tạm ngưng..."
                        id="suspend-reason"
                        rows={3}
                    />
                </div>
            ),
            onOk: async () => {
                try {
                    const reason = document.getElementById('suspend-reason').value;
                    await storeService.suspendStore(storeId, reason);
                    message.success('Tạm ngưng cửa hàng thành công');
                    loadStores();
                } catch (error) {
                    console.error('Error suspending store:', error);
                    message.error('Lỗi khi tạm ngưng cửa hàng');
                }
            }
        });
    };

    const handleReactivateStore = async (storeId) => {
        try {
            await storeService.reactivateStore(storeId);
            message.success('Kích hoạt lại cửa hàng thành công');
            loadStores();
        } catch (error) {
            console.error('Error reactivating store:', error);
            message.error('Lỗi khi kích hoạt lại cửa hàng');
        }
    };

    const handleFindNearbyStores = async () => {
        // Get user's current location
        if (!navigator.geolocation) {
            message.error('Trình duyệt không hỗ trợ định vị');
            return;
        }

        setLoading(true);
        try {
            // Get current position
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;
            console.log('🌍 Current location:', { latitude, longitude });

            // Find nearby stores within 10km
            const response = await storeService.findNearbyStores(
                latitude,
                longitude,
                10, // 10km radius
                1,
                pagination.pageSize
            );

            console.log('🌍 Nearby stores response:', response);

            // Handle response
            let storesData = [];
            let total = 0;

            if (response && response.success && response.data) {
                if (Array.isArray(response.data)) {
                    storesData = response.data;
                    total = response.total || response.data.length;
                } else if (response.data.items && Array.isArray(response.data.items)) {
                    storesData = response.data.items;
                    total = response.data.totalCount || response.data.total || response.data.items.length;
                }
            } else if (Array.isArray(response)) {
                storesData = response;
                total = response.length;
            }

            setStores(storesData);
            setPagination(prev => ({
                ...prev,
                current: 1,
                total
            }));

            // Removed success message for nearby search as requested
        } catch (error) {
            console.error('❌ Error finding nearby stores:', error);
            if (error.code === error.PERMISSION_DENIED) {
                message.error('Bạn cần cho phép truy cập vị trí để sử dụng tính năng này');
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                message.error('Không thể xác định vị trí hiện tại');
            } else if (error.code === error.TIMEOUT) {
                message.error('Hết thời gian chờ xác định vị trí');
            } else {
                message.error(`Lỗi khi tìm cửa hàng gần đây: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusObj = storeStatuses.find(s => s.value === status);
        return statusObj?.color || 'default';
    };

    const getStatusLabel = (status) => {
        const statusObj = storeStatuses.find(s => s.value === status);
        return statusObj?.label || status;
    };

    const getMarketName = (marketId) => {
        const market = markets.find(m => m.id === marketId);
        return market?.name || 'Không xác định';
    };

    const columns = [
        {
            title: 'Cửa hàng',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            ellipsis: true,
            render: (text, record) => (
                <Space>
                    <Avatar
                        size={32}
                        src={record.storeImageUrl}
                        icon={<ShopOutlined />}
                        style={{ backgroundColor: '#f56a00' }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <Tooltip title={text}>
                            <div style={{
                                fontWeight: 'bold',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {text}
                            </div>
                        </Tooltip>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            ID: {record.id?.substring(0, 8)}...
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Chợ',
            dataIndex: 'marketId',
            key: 'marketId',
            width: 150,
            render: (marketId) => (
                <div>
                    <EnvironmentOutlined /> {getMarketName(marketId)}
                </div>
            ),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: 200,
            ellipsis: true,
            render: (address) => (
                <Tooltip title={address}>
                    <div>
                        <EnvironmentOutlined /> {address}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Liên hệ',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
            width: 120,
            render: (phone) => (
                <div>
                    <PhoneOutlined /> {phone || 'N/A'}
                </div>
            ),
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 90,
            align: 'center',
            render: (rating) => (
                <div style={{ textAlign: 'center' }}>
                    <Rate
                        disabled
                        allowHalf
                        value={rating || 0}
                        style={{ fontSize: '12px' }}
                    />
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {(rating || 0).toFixed(1)}
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            align: 'center',
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
            width: 100,
            align: 'center',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewStore(record)}
                        />
                    </Tooltip>
                    {record.status !== 'Suspended' ? (
                        <Tooltip title="Tạm ngưng">
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<StopOutlined />}
                                onClick={() => handleSuspendStore(record.id)}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Kích hoạt lại">
                            <Button
                                type="text"
                                size="small"
                                style={{ color: '#52c41a' }}
                                icon={<PlayCircleOutlined />}
                                onClick={() => handleReactivateStore(record.id)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <StoreNavigation />
            <div style={{ padding: '0 24px 24px' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Quản lý cửa hàng</h2>
                        <p style={{ margin: 0, color: '#666' }}>Quản lý tất cả các cửa hàng trong hệ thống</p>
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
                                title="Tổng số cửa hàng"
                                value={pagination.total}
                                prefix={<ShopOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đang hoạt động"
                                value={stores.filter(s => s.status === 'Open').length}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đã đóng"
                                value={stores.filter(s => s.status === 'Closed').length}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tạm ngưng"
                                value={stores.filter(s => s.status === 'Suspended').length}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Filters */}
                <Card style={{ marginBottom: '24px' }}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Search
                                placeholder="Tìm kiếm theo tên cửa hàng..."
                                allowClear
                                onSearch={handleSearch}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col span={4}>
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                onChange={(value) => handleFilterChange('status', value)}
                            >
                                {storeStatuses.map(status => (
                                    <Option key={status.value} value={status.value}>
                                        {status.label}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Select
                                placeholder="Chọn chợ"
                                allowClear
                                style={{ width: '100%' }}
                                onChange={(value) => handleFilterChange('marketId', value)}
                            >
                                {markets.map(market => (
                                    <Option key={market.id} value={market.id}>
                                        {market.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Button onClick={loadStores}>Làm mới</Button>
                        </Col>
                        <Col span={6}>
                            <Button
                                type="dashed"
                                onClick={handleFindNearbyStores}
                                loading={loading}
                            >
                                🌍 Tìm cửa hàng gần đây
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Table */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={stores}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} cửa hàng`,
                        }}
                        onChange={handleTableChange}
                        size="middle"
                    />
                </Card>

                {/* Create/Edit Modal - REMOVED */}
                {/* Modal and Form functionality has been removed as requested */}

                {/* View Store Drawer */}
                <Drawer
                    title="Chi tiết cửa hàng"
                    placement="right"
                    size="large"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                >
                    {selectedStore && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <Avatar
                                    size={80}
                                    src={selectedStore.storeImageUrl}
                                    icon={<ShopOutlined />}
                                    style={{ backgroundColor: '#f56a00' }}
                                />
                                <h3 style={{ marginTop: '16px' }}>{selectedStore.name}</h3>
                                <Tag color={getStatusColor(selectedStore.status)}>
                                    {getStatusLabel(selectedStore.status)}
                                </Tag>
                            </div>

                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="ID cửa hàng">
                                    {selectedStore.id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Người bán">
                                    {selectedStore.sellerId}
                                </Descriptions.Item>
                                <Descriptions.Item label="Chợ">
                                    {getMarketName(selectedStore.marketId)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">
                                    {selectedStore.address}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tọa độ">
                                    {selectedStore.latitude}, {selectedStore.longitude}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    {selectedStore.contactNumber || 'Chưa cập nhật'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Đánh giá">
                                    <Rate
                                        disabled
                                        allowHalf
                                        value={selectedStore.rating || 0}
                                    />
                                    <span style={{ marginLeft: 8 }}>
                                        {(selectedStore.rating || 0).toFixed(1)} / 5.0
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày tạo">
                                    {selectedStore.createdAt ?
                                        new Date(selectedStore.createdAt).toLocaleString('vi-VN') :
                                        'Chưa có thông tin'
                                    }
                                </Descriptions.Item>
                                <Descriptions.Item label="Cập nhật lần cuối">
                                    {selectedStore.updatedAt ?
                                        new Date(selectedStore.updatedAt).toLocaleString('vi-VN') :
                                        'Chưa có thông tin'
                                    }
                                </Descriptions.Item>
                            </Descriptions>

                            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                {/* Edit and Toggle buttons removed as requested */}
                                <p style={{ color: '#666', fontStyle: 'italic' }}>
                                    Chỉ có thể xem chi tiết và thực hiện các thao tác tạm ngưng/kích hoạt từ bảng danh sách
                                </p>
                            </div>
                        </div>
                    )}
                </Drawer>
            </div>
        </div>
    );
};

export default StoreManagement;
