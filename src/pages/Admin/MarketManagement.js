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
    TimePicker
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
    EnvironmentOutlined
} from '@ant-design/icons';
import { marketService } from '../../services/marketService';
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
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();

    const marketStatuses = [
        { value: 'Active', label: 'Hoạt động', color: 'green' },
        { value: 'Inactive', label: 'Không hoạt động', color: 'red' },
        { value: 'Maintenance', label: 'Bảo trì', color: 'orange' }
    ];

    useEffect(() => {
        loadMarkets();
    }, [pagination.current, pagination.pageSize, filters]);

    const loadMarkets = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                search: filters.search,
                status: filters.status
            };

            const response = await marketService.getAllMarkets(params);
            if (response?.data) {
                setMarkets(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.total || response.data.length
                }));
            }
        } catch (error) {
            console.error('Error loading markets:', error);
            message.error('Lỗi khi tải danh sách chợ');
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

    const handleCreateMarket = () => {
        setSelectedMarket(null);
        setEditMode(false);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditMarket = (market) => {
        setSelectedMarket(market);
        setEditMode(true);
        form.setFieldsValue({
            ...market,
            openTime: market.openTime ? moment(market.openTime, 'HH:mm') : null,
            closeTime: market.closeTime ? moment(market.closeTime, 'HH:mm') : null,
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

    const handleSubmit = async (values) => {
        try {
            const marketData = {
                ...values,
                openTime: values.openTime?.format('HH:mm'),
                closeTime: values.closeTime?.format('HH:mm'),
            };

            if (editMode) {
                await marketService.updateMarket(selectedMarket.id, marketData);
                message.success('Cập nhật chợ thành công');
            } else {
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
            width: 200,
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
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusLabel(status)}
                </Tag>
            ),
        },
        {
            title: 'Giờ hoạt động',
            key: 'operatingHours',
            width: 150,
            render: (_, record) => (
                <div>
                    <ClockCircleOutlined /> {record.openTime || '00:00'} - {record.closeTime || '23:59'}
                </div>
            ),
        },
        {
            title: 'Số lượng cửa hàng',
            dataIndex: 'storeCount',
            key: 'storeCount',
            width: 120,
            render: (count) => count || 0,
        },
        {
            title: 'Phí thuê',
            dataIndex: 'rentFee',
            key: 'rentFee',
            width: 120,
            render: (fee) => fee ? `${fee.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '',
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
                            {marketStatuses.map(status => (
                                <Option key={status.value} value={status.value}>
                                    {status.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button onClick={loadMarkets}>Làm mới</Button>
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
                    scroll={{ x: 1200 }}
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
                            >
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="closeTime"
                                label="Giờ đóng cửa"
                            >
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="rentFee"
                                label="Phí thuê (VNĐ)"
                            >
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                    </Row>

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
                                {selectedMarket.openTime || '00:00'} - {selectedMarket.closeTime || '23:59'}
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
    );
};

export default MarketManagement;
