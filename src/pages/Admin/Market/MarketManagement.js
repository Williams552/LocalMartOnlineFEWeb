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
    Upload,
    Image,
    TimePicker,
    Alert
} from 'antd';
import {
    ShopOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
    ExportOutlined,
    EyeOutlined,
    UploadOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    PoweroffOutlined
} from '@ant-design/icons';
import { marketService } from '../../../services/marketService';
import { marketFeeService } from '../../../services/marketFeeService';
import MarketNavigation from './MarketNavigation';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const MarketManagement = () => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [marketFees, setMarketFees] = useState({}); // Store rental fees by marketId
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: ''
    });
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [searchLoading, setSearchLoading] = useState(false);
    const [statistics, setStatistics] = useState({
        totalMarkets: 0,
        activeMarkets: 0,
        maintenanceMarkets: 0,
        suspendedMarkets: 0
    });

    const marketStatuses = [
        { value: 'Active', label: 'Hoạt động', color: 'green' },
        { value: 'Suspended', label: 'Không hoạt động', color: 'red' },
        { value: 'Maintenance', label: 'Bảo trì', color: 'orange' }
    ];

    useEffect(() => {
        loadMarkets();
        loadStatistics(); // Load statistics separately
    }, [pagination.current, pagination.pageSize, filters.search, filters.status]);

    // Load statistics from all markets
    const loadStatistics = async () => {
        try {
            console.log('📊 MarketManagement - Loading statistics...');
            
            // Get all markets without pagination for statistics
            const allMarketsResponse = await marketService.getAllMarkets(1, 1000); // Get a large number to get all
            
            let allMarketsData = [];
            
            if (Array.isArray(allMarketsResponse)) {
                allMarketsData = allMarketsResponse;
            } else if (allMarketsResponse && typeof allMarketsResponse === 'object') {
                allMarketsData = allMarketsResponse.items || allMarketsResponse.data || [];
            }
            
            console.log('📊 MarketManagement - All markets for statistics:', allMarketsData);
            
            // Calculate statistics from all markets
            const stats = {
                totalMarkets: allMarketsData.length,
                activeMarkets: allMarketsData.filter(m => m.status === 'Active').length,
                maintenanceMarkets: allMarketsData.filter(m => m.status === 'Maintenance').length,
                suspendedMarkets: allMarketsData.filter(m => m.status === 'Suspended').length
            };
            
            console.log('📊 MarketManagement - Calculated statistics:', stats);
            setStatistics(stats);
        } catch (error) {
            console.error('❌ MarketManagement - Error loading statistics:', error);
            // Don't show error message for statistics, just log it
        }
    };

    // Load rental fees for markets
    const loadMarketRentalFees = async (marketsData) => {
        try {
            console.log('🏷️ Loading rental fees for markets:', marketsData.map(m => ({ id: m.id, name: m.name })));
            
            const feePromises = marketsData.map(async (market) => {
                try {
                    console.log(`🔍 Loading fees for market: ${market.name} (${market.id})`);
                    
                    // Use the correct API parameter - MarketFeeId but pass marketId
                    const feesResult = await marketFeeService.getAllMarketFees({ 
                        MarketFeeId: market.id 
                    });
                    
                    console.log(`📊 Fees result for ${market.name}:`, feesResult);
                    
                    if (feesResult.success && feesResult.data) {
                        console.log(`💰 All fees for ${market.name}:`, feesResult.data);
                        
                        // Find monthly rental fee with exact match for "Phí Thuê Tháng"
                        const rentalFee = feesResult.data.find(fee => 
                            fee.marketFeeTypeName === 'Phí Thuê Tháng'
                        );
                        
                        console.log(`🎯 Found rental fee for ${market.name}:`, rentalFee);
                        
                        return {
                            marketId: market.id,
                            rentalFee: rentalFee ? rentalFee.amount : 0
                        };
                    }
                    return { marketId: market.id, rentalFee: 0 };
                } catch (error) {
                    console.warn(`Failed to load fees for market ${market.id}:`, error);
                    return { marketId: market.id, rentalFee: 0 };
                }
            });

            const feeResults = await Promise.all(feePromises);
            const feeMap = {};
            feeResults.forEach(result => {
                feeMap[result.marketId] = result.rentalFee;
            });
            
            console.log('💼 Final fee map:', feeMap);
            setMarketFees(feeMap);
        } catch (error) {
            console.error('Error loading market rental fees:', error);
        }
    };

    const loadMarkets = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                pageSize: pagination.pageSize,
                search: filters.search,
                status: filters.status
            };

            console.log('🔍 MarketManagement - Loading markets with params:', params);
            
            let response;
            
            // Use appropriate endpoint based on filters
            try {
                if (filters.search && filters.search.trim() && filters.status) {
                    // Both search and status filter - need to combine results or use search then filter
                    // For now, prioritize search over status filter
                    response = await marketService.searchMarkets(filters.search.trim());
                    console.log('🔍 MarketManagement - Used search endpoint with search term:', filters.search);
                    
                    // Apply status filter on frontend if needed
                    if (Array.isArray(response)) {
                        response = response.filter(market => market.status === filters.status);
                    }
                } else if (filters.search && filters.search.trim()) {
                    // Only search
                    response = await marketService.searchMarkets(filters.search.trim());
                    console.log('🔍 MarketManagement - Used search endpoint with search term:', filters.search);
                } else if (filters.status) {
                    // Only status filter
                    response = await marketService.filterMarkets({ status: filters.status });
                    console.log('🔍 MarketManagement - Used filter endpoint with status:', filters.status);
                } else {
                    // No filters - use regular getAllMarkets with pagination
                    response = await marketService.getAllMarkets(pagination.current, pagination.pageSize, params);
                    console.log('🔍 MarketManagement - Used getAllMarkets endpoint');
                }
            } catch (apiError) {
                console.warn('🔄 MarketManagement - API call failed, will show error to user:', apiError.message);
                throw apiError; // Re-throw to be caught by outer catch
            }
            
            console.log('🔍 MarketManagement - API response:', response);

            // Handle different response structures
            let marketsData = [];
            let total = 0;

            if (Array.isArray(response)) {
                // Direct array response (search/filter results)
                marketsData = response;
                total = response.length;
            } else if (response && typeof response === 'object') {
                // Response with pagination info or data property
                marketsData = response.items || response.data || response;
                total = response.totalCount || response.total || marketsData.length;
            }

            console.log('🔍 MarketManagement - Processed markets:', marketsData);

            setMarkets(marketsData);
            setPagination(prev => ({
                ...prev,
                total
            }));

            // Load rental fees for the markets
            if (marketsData.length > 0) {
                loadMarketRentalFees(marketsData);
            }
            
            // Show appropriate message for search/filter results
            if ((filters.search || filters.status) && marketsData.length === 0) {
                // No message for empty search results
            }
            // Removed success messages for search/filter results
        } catch (error) {
            console.error('❌ MarketManagement - Error loading markets:', error);
            let errorMessage = 'Lỗi khi tải danh sách chợ';
            
            if (filters.search && filters.status) {
                errorMessage = 'Lỗi khi tìm kiếm và lọc chợ';
            } else if (filters.search) {
                errorMessage = 'Lỗi khi tìm kiếm chợ';
            } else if (filters.status) {
                errorMessage = 'Lỗi khi lọc chợ theo trạng thái';
            }
            
            message.error(`${errorMessage}: ${error.message}`);
            
            // On error, clear the results but keep the previous pagination
            setMarkets([]);
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    };

    const handleTableChange = (paginationData) => {
        // For search/filter results, we don't support server-side pagination
        // Only allow pagination change for normal getAllMarkets
        if (!filters.search && !filters.status) {
            setPagination({
                ...pagination,
                current: paginationData.current,
                pageSize: paginationData.pageSize
            });
        }
    };

    const handleSearch = (value) => {
        setSearchLoading(true);
        
        // Trim the search value and handle empty searches
        const trimmedValue = value ? value.trim() : '';
        
        console.log('🔍 MarketManagement - Search triggered with value:', trimmedValue);
        
        setFilters(prev => ({ ...prev, search: trimmedValue }));
        setPagination(prev => ({ ...prev, current: 1 }));
        
        // Clear search loading will be handled in loadMarkets
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
            loadStatistics(); // Reload statistics after delete
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
            loadStatistics(); // Reload statistics after status change
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
            loadStatistics(); // Reload statistics after create/update
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
            dataIndex: 'stallCount',
            key: 'stallCount',
            render: (count) => count || 0,
        },
        {
            title: 'Email liên hệ',
            dataIndex: 'contactInfo',
            key: 'contactInfo',
            render: (email) => email || 'Chưa cập nhật',
        },
        {
            title: 'Phí thuê tháng',
            key: 'rentalFee',
            render: (_, record) => {
                const fee = marketFees[record.id];
                if (fee === undefined) {
                    return <span style={{ color: '#999' }}>Đang tải...</span>;
                }
                return fee > 0 ? `${fee.toLocaleString('vi-VN')} VNĐ` : 'Chưa thiết lập';
            },
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
                                value={statistics.totalMarkets}
                                prefix={<ShopOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đang hoạt động"
                                value={statistics.activeMarkets}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Bảo trì"
                                value={statistics.maintenanceMarkets}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Không hoạt động"
                                value={statistics.suspendedMarkets}
                                valueStyle={{ color: '#cf1322' }}
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
                                onChange={(e) => {
                                    // Handle real-time input change for controlled component
                                    if (!e.target.value) {
                                        // If cleared, immediately search with empty value
                                        handleSearch('');
                                    }
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
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                    loadStatistics(); // Reload statistics when refresh
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
                            name="contactInfo"
                            label="Email liên hệ"
                        >
                            <Input type="email" placeholder="Nhập email liên hệ..." />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô tả"
                        >
                            <TextArea rows={4} />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
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
                            <Col span={12}>
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
                                            }
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
                                <Descriptions.Item label="Email liên hệ">
                                    {selectedMarket.contactInfo || 'Chưa cập nhật'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số lượng cửa hàng">
                                    {selectedMarket.stallCount || 0} cửa hàng
                                </Descriptions.Item>
                                <Descriptions.Item label="Phí thuê tháng">
                                    {(() => {
                                        const fee = marketFees[selectedMarket.id];
                                        if (fee === undefined) {
                                            return <span style={{ color: '#999' }}>Đang tải...</span>;
                                        }
                                        if (fee > 0) {
                                            return (
                                                <div>
                                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                                                        {fee.toLocaleString('vi-VN')} VNĐ/tháng
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div>
                                                <div style={{ color: '#999' }}>Chưa thiết lập</div>
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                    Thiết lập tại: <strong>Quản lý cửa hàng → Phí thuê</strong>
                                                </div>
                                            </div>
                                        );
                                    })()}
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
