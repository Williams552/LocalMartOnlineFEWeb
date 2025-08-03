// src/pages/Admin/Store/StorePaymentManagement.js
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
    DatePicker,
    Typography,
    Alert,
    Row,
    Col,
    Badge,
    Tooltip,
    Drawer,
    Descriptions,
    Statistic
} from 'antd';
import {
    CreditCardOutlined,
    EditOutlined,
    EyeOutlined,
    ExportOutlined,
    ReloadOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    DollarOutlined,
    CalendarOutlined,
    ShopOutlined,
    UserOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import storeService from '../../../services/storeService';
import { marketService } from '../../../services/marketService';
import { marketFeeTypeService } from '../../../services/marketFeeTypeService';
import userService from '../../../services/userService';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const StorePaymentManagement = () => {
    const [stores, setStores] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        overdue: 0,
        totalAmount: 0
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        marketId: '',
        paymentStatus: '',
        month: null,
        year: null,
        searchKeyword: '',
        feeId: ''
    });
    const [selectedStore, setSelectedStore] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [createPaymentModalVisible, setCreatePaymentModalVisible] = useState(false);
    const [createMarketPaymentModalVisible, setCreateMarketPaymentModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [createPaymentForm] = Form.useForm();
    const [createMarketPaymentForm] = Form.useForm();

    useEffect(() => {
        loadMarkets();
        loadFeeTypes();
        loadUsers();
    }, []); // Load markets, fee types and users only once

    useEffect(() => {
        loadStoresWithPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, pagination.current, pagination.pageSize]);

    const loadMarkets = async () => {
        try {
            const response = await marketService.getAllMarkets();
            if (response?.data) {
                setMarkets(response.data);
            } else if (response && Array.isArray(response)) {
                setMarkets(response);
            } else {
                setMarkets([]);
            }
        } catch (error) {
            console.error('Error loading markets:', error);
            message.error('Lỗi khi tải danh sách chợ');
            setMarkets([]);
        }
    };

    const loadFeeTypes = async () => {
        try {
            const response = await marketFeeTypeService.getAllMarketFeeTypes();
            if (response?.success && response.data) {
                setFeeTypes(response.data);
            } else {
                setFeeTypes([]);
            }
        } catch (error) {
            console.error('Error loading fee types:', error);
            message.error('Lỗi khi tải danh sách loại phí');
            setFeeTypes([]);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await userService.getAllUsers({ 
                pageNumber: 1, 
                pageSize: 100, 
                role: 'Seller', 
                sortOrder: 'asc' 
            });
            if (response?.success && response?.data) {
                setUsers(response.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            message.error('Lỗi khi tải danh sách người dùng');
            setUsers([]);
        }
    };

    const loadStoresWithPayment = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                pageSize: pagination.pageSize,
                ...filters
            };

            // Remove empty values
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            console.log('Loading stores with payment params:', params);

            const response = await storeService.getAllStoresWithPaymentInfo(params);
            
            if (response.success) {
                setStores(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.totalCount,
                    totalPages: response.totalPages
                }));
                
                // Load statistics separately
                await loadStatistics();
            } else {
                message.error(response.message || 'Lỗi khi tải dữ liệu thanh toán');
                setStores([]);
            }
        } catch (error) {
            console.error('Error loading stores with payment:', error);
            message.error('Lỗi khi tải dữ liệu thanh toán');
            setStores([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            // Load all data without pagination to calculate statistics
            const allDataParams = {
                pageSize: 9999, // Large number to get all records
                page: 1,
                ...filters
            };

            // Remove empty values
            Object.keys(allDataParams).forEach(key => {
                if (allDataParams[key] === '' || allDataParams[key] === null || allDataParams[key] === undefined) {
                    delete allDataParams[key];
                }
            });

            console.log('Loading statistics with params:', allDataParams);

            const response = await storeService.getAllStoresWithPaymentInfo(allDataParams);
            
            if (response.success && response.data) {
                const allStores = response.data;
                
                const stats = {
                    total: allStores.length,
                    pending: allStores.filter(s => s.paymentStatus === 'Pending').length,
                    completed: allStores.filter(s => s.paymentStatus === 'Completed').length,
                    overdue: allStores.filter(s => s.isOverdue).length,
                    totalAmount: allStores.filter(s => s.paymentStatus === 'Completed').reduce((sum, s) => sum + (s.monthlyRentalFee || 0), 0)
                };
                
                setStatistics(stats);
                console.log('Statistics calculated:', stats);
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
            // Keep current statistics in case of error
        }
    };

    const handleTableChange = (paginationData) => {
        setPagination(prev => ({
            ...prev,
            current: paginationData.current,
            pageSize: paginationData.pageSize
        }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, searchKeyword: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleResetFilters = () => {
        setFilters({
            marketId: '',
            paymentStatus: '',
            month: null,
            year: null,
            searchKeyword: '',
            feeId: ''
        });
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleViewDetails = (store) => {
        setSelectedStore(store);
        setDrawerVisible(true);
    };

    const handleUpdatePaymentStatus = (store) => {
        setSelectedStore(store);
        form.setFieldsValue({
            paymentStatus: store.paymentStatus,
            paymentDate: store.paymentDate ? moment(store.paymentDate) : moment()
        });
        setModalVisible(true);
    };

    const handleSubmitUpdate = async (values) => {
        try {
            if (!selectedStore?.paymentId) {
                message.error('Không tìm thấy thông tin thanh toán');
                return;
            }

            const updateData = {
                paymentStatus: values.paymentStatus,
                paymentDate: values.paymentDate ? values.paymentDate.toISOString() : null
            };

            const response = await storeService.updateStorePaymentStatus(selectedStore.paymentId, updateData);
            
            if (response.success) {
                message.success('Cập nhật trạng thái thanh toán thành công');
                setModalVisible(false);
                form.resetFields();
                loadStoresWithPayment();
            } else {
                message.error(response.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            message.error('Lỗi khi cập nhật trạng thái thanh toán');
        }
    };

    const handleExportData = async () => {
        try {
            const params = { ...filters };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await storeService.exportPaymentData(params);
            if (response.success) {
                message.success('Xuất dữ liệu thành công');
            } else {
                message.error(response.message || 'Xuất dữ liệu thất bại');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            message.error('Lỗi khi xuất dữ liệu');
        }
    };

    const handleCreatePaymentForSeller = async (values) => {
        try {
            const paymentData = {
                userId: values.userId,
                feeId: values.feeId
            };

            const response = await storeService.createPaymentForSeller(paymentData);
            if (response.success) {
                message.success('Tạo phí thanh toán cho seller thành công');
                setCreatePaymentModalVisible(false);
                createPaymentForm.resetFields();
                loadStoresWithPayment();
            } else {
                message.error(response.message || 'Tạo phí thanh toán thất bại');
            }
        } catch (error) {
            console.error('Error creating payment for seller:', error);
            message.error('Lỗi khi tạo phí thanh toán');
        }
    };

    const handleCreatePaymentForMarket = async (values) => {
        try {
            const paymentData = {
                marketId: values.marketId,
                feeId: values.feeId
            };

            const response = await storeService.createPaymentForMarket(paymentData);
            if (response.success) {
                message.success('Tạo phí thanh toán cho chợ thành công');
                setCreateMarketPaymentModalVisible(false);
                createMarketPaymentForm.resetFields();
                loadStoresWithPayment();
            } else {
                message.error(response.message || 'Tạo phí thanh toán thất bại');
            }
        } catch (error) {
            console.error('Error creating payment for market:', error);
            message.error('Lỗi khi tạo phí thanh toán');
        }
    };

    const getPaymentStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircleOutlined />;
            case 'Failed': return <CloseCircleOutlined />;
            case 'Pending': return <ClockCircleOutlined />;
            default: return <ExclamationCircleOutlined />;
        }
    };

    const getPaymentStatusTag = (status, isOverdue, daysOverdue) => {
        const statusInfo = storeService.formatPaymentStatus(status);
        
        if (isOverdue && status === 'Pending') {
            return (
                <Tooltip title={`Quá hạn ${daysOverdue} ngày`}>
                    <Tag color="volcano" icon={<ExclamationCircleOutlined />}>
                        Quá hạn ({daysOverdue} ngày)
                    </Tag>
                </Tooltip>
            );
        }

        return (
            <Tag color={statusInfo.color} icon={getPaymentStatusIcon(status)}>
                {statusInfo.text}
            </Tag>
        );
    };

    const columns = [
        {
            title: 'Cửa hàng',
            key: 'store',
            width: 200,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        <ShopOutlined style={{ marginRight: 4 }} />
                        {record.storeName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        <UserOutlined style={{ marginRight: 4 }} />
                        {record.sellerName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        <PhoneOutlined style={{ marginRight: 4 }} />
                        {record.sellerPhone}
                    </div>
                </div>
            ),
        },
        {
            title: 'Chợ',
            dataIndex: 'marketName',
            key: 'marketName',
            width: 120,
        },
        {
            title: 'Loại phí',
            dataIndex: 'feeTypeName',
            key: 'feeTypeName',
            width: 120,
        },
        {
            title: 'Phí thuê tháng',
            dataIndex: 'monthlyRentalFee',
            key: 'monthlyRentalFee',
            width: 120,
            render: (amount) => (
                <Text strong style={{ color: '#52c41a' }}>
                    {storeService.formatCurrency(amount)}
                </Text>
            ),
        },
        {
            title: 'Hạn thanh toán',
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 120,
            render: (date) => (
                <div>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {moment(date).format('DD/MM/YYYY')}
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'paymentStatus',
            width: 140,
            render: (_, record) => getPaymentStatusTag(record.paymentStatus, record.isOverdue, record.daysOverdue),
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            width: 120,
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Cập nhật trạng thái">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleUpdatePaymentStatus(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Statistics are now calculated and stored in state

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{ marginBottom: '16px' }}>
                    <Title level={3}>
                        <CreditCardOutlined /> Quản lý Thanh toán Cửa hàng
                    </Title>
                    <Alert
                        message="Thông tin"
                        description="Quản lý và theo dõi trạng thái thanh toán phí thuê của các cửa hàng trong chợ."
                        type="info"
                        showIcon
                        style={{ marginTop: '8px' }}
                    />
                </div>

                {/* Statistics */}
                <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={4}>
                        <Statistic
                            title="Tổng cửa hàng"
                            value={statistics.total}
                            prefix={<ShopOutlined />}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Chờ thanh toán"
                            value={statistics.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Đã thanh toán"
                            value={statistics.completed}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Quá hạn"
                            value={statistics.overdue}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Tổng doanh thu đã thu"
                            value={statistics.totalAmount}
                            prefix={<DollarOutlined />}
                            formatter={(value) => storeService.formatCurrency(value)}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Col>
                </Row>

                {/* Filters */}
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col xs={24} sm={5}>
                        <Search
                            placeholder="Tìm kiếm cửa hàng, người bán..."
                            allowClear
                            value={filters.searchKeyword}
                            onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
                            onSearch={handleSearch}
                        />
                    </Col>
                    <Col xs={24} sm={3}>
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
                    <Col xs={24} sm={3}>
                        <Select
                            placeholder="Loại phí"
                            allowClear
                            value={filters.feeId}
                            onChange={(value) => handleFilterChange('feeId', value)}
                            style={{ width: '100%' }}
                        >
                            {feeTypes.map(feeType => (
                                <Option key={feeType.id} value={feeType.id}>
                                    {feeType.feeType}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={3}>
                        <Select
                            placeholder="Trạng thái thanh toán"
                            allowClear
                            value={filters.paymentStatus}
                            onChange={(value) => handleFilterChange('paymentStatus', value)}
                            style={{ width: '100%' }}
                        >
                            <Option value="Pending">Chờ thanh toán</Option>
                            <Option value="Completed">Đã thanh toán</Option>
                            <Option value="Failed">Thanh toán thất bại</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={2}>
                        <Select
                            placeholder="Tháng"
                            allowClear
                            value={filters.month}
                            onChange={(value) => handleFilterChange('month', value)}
                            style={{ width: '100%' }}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <Option key={i + 1} value={i + 1}>
                                    Tháng {i + 1}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={2}>
                        <Select
                            placeholder="Năm"
                            allowClear
                            value={filters.year}
                            onChange={(value) => handleFilterChange('year', value)}
                            style={{ width: '100%' }}
                        >
                            {Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                    <Option key={year} value={year}>
                                        {year}
                                    </Option>
                                );
                            })}
                        </Select>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Space>
                            <Button
                                type="primary"
                                icon={<CreditCardOutlined />}
                                onClick={() => setCreatePaymentModalVisible(true)}
                                style={{ backgroundColor: '#52c41a' }}
                            >
                                Tạo phí cho người bán
                            </Button>
                            <Button
                                type="primary"
                                icon={<ShopOutlined />}
                                onClick={() => setCreateMarketPaymentModalVisible(true)}
                                style={{ backgroundColor: '#1890ff' }}
                            >
                                Tạo phí cho chợ
                            </Button>
                        </Space>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleResetFilters}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<ExportOutlined />}
                                onClick={handleExportData}
                            >
                                Xuất Excel
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={stores}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} cửa hàng`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Update Payment Status Modal */}
            <Modal
                title="Cập nhật trạng thái thanh toán"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitUpdate}
                >
                    <Form.Item
                        name="paymentStatus"
                        label="Trạng thái thanh toán"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Option value="Pending">Chờ thanh toán</Option>
                            <Option value="Completed">Đã thanh toán</Option>
                            <Option value="Failed">Thanh toán thất bại</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="paymentDate"
                        label="Ngày thanh toán"
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày thanh toán"
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Cập nhật
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Details Drawer */}
            <Drawer
                title="Chi tiết thanh toán"
                placement="right"
                size="large"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                {selectedStore && (
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
                                <CreditCardOutlined style={{ fontSize: '32px' }} />
                            </div>
                            <h3>Chi tiết thanh toán - {selectedStore.storeName}</h3>
                        </div>

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Tên cửa hàng">
                                <Text strong>{selectedStore.storeName}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên người bán">
                                {selectedStore.sellerName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedStore.sellerPhone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chợ">
                                {selectedStore.marketName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại phí">
                                {selectedStore.feeTypeName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phí thuê tháng">
                                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                    {storeService.formatCurrency(selectedStore.monthlyRentalFee)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Hạn thanh toán">
                                {moment(selectedStore.dueDate).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {getPaymentStatusTag(selectedStore.paymentStatus, selectedStore.isOverdue, selectedStore.daysOverdue)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày thanh toán">
                                {selectedStore.paymentDate ? moment(selectedStore.paymentDate).format('DD/MM/YYYY HH:mm') : 'Chưa thanh toán'}
                            </Descriptions.Item>
                            {selectedStore.isOverdue && (
                                <Descriptions.Item label="Số ngày quá hạn">
                                    <Badge count={selectedStore.daysOverdue} style={{ backgroundColor: '#ff4d4f' }} />
                                    <span style={{ marginLeft: 8 }}>ngày</span>
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setDrawerVisible(false);
                                    handleUpdatePaymentStatus(selectedStore);
                                }}
                            >
                                Cập nhật trạng thái
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Create Payment for Seller Modal */}
            <Modal
                title="Tạo phí thanh toán cho Seller"
                open={createPaymentModalVisible}
                onCancel={() => {
                    setCreatePaymentModalVisible(false);
                    createPaymentForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={createPaymentForm}
                    layout="vertical"
                    onFinish={handleCreatePaymentForSeller}
                >
                    <Form.Item
                        name="userId"
                        label="Chọn người dùng"
                        rules={[{ required: true, message: 'Vui lòng chọn người dùng' }]}
                    >
                        <Select
                            placeholder="Chọn người dùng"
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {users.map(user => (
                                <Option key={user.id} value={user.id}>
                                    {user.fullName} ({user.username}) - {user.phoneNumber}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="feeId"
                        label="Loại phí"
                        rules={[{ required: true, message: 'Vui lòng chọn loại phí' }]}
                    >
                        <Select placeholder="Chọn loại phí">
                            {feeTypes.map(feeType => (
                                <Option key={feeType.id} value={feeType.id}>
                                    {feeType.feeType}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => {
                                setCreatePaymentModalVisible(false);
                                createPaymentForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<CreditCardOutlined />}>
                                Tạo phí thanh toán
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Create Payment for Market Modal */}
            <Modal
                title="Tạo phí thanh toán cho Chợ"
                open={createMarketPaymentModalVisible}
                onCancel={() => {
                    setCreateMarketPaymentModalVisible(false);
                    createMarketPaymentForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={createMarketPaymentForm}
                    layout="vertical"
                    onFinish={handleCreatePaymentForMarket}
                >
                    <Form.Item
                        name="marketId"
                        label="Chọn chợ"
                        rules={[{ required: true, message: 'Vui lòng chọn chợ' }]}
                    >
                        <Select placeholder="Chọn chợ">
                            {markets.map(market => (
                                <Option key={market.id} value={market.id}>
                                    {market.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="feeId"
                        label="Loại phí"
                        rules={[{ required: true, message: 'Vui lòng chọn loại phí' }]}
                    >
                        <Select placeholder="Chọn loại phí">
                            {feeTypes.map(feeType => (
                                <Option key={feeType.id} value={feeType.id}>
                                    {feeType.feeType}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => {
                                setCreateMarketPaymentModalVisible(false);
                                createMarketPaymentForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<ShopOutlined />}>
                                Tạo phí thanh toán
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StorePaymentManagement;
