// src/pages/Admin/OrderManagement.js
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
    Steps,
    Timeline,
    Avatar,
    Spin,
    Popconfirm,
    Form,
    DatePicker,
    Tooltip,
    Badge,
    Divider
} from 'antd';
import {
    ShoppingCartOutlined,
    EyeOutlined,
    SearchOutlined,
    ExportOutlined,
    DollarCircleOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    ShopOutlined,
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    PrinterOutlined,
    PhoneOutlined,
    MailOutlined,
    DownloadOutlined,
    FilterOutlined,
    CalendarOutlined,
    SyncOutlined
} from '@ant-design/icons';
import orderService from '../../services/orderService';
import OrderStats from '../../components/OrderStats';

const { Search } = Input;
const { Option } = Select;
const { Step } = Steps;
const { RangePicker } = DatePicker;

const OrderManagement = ({ defaultStatus = null }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statistics, setStatistics] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        todayRevenue: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: defaultStatus || '',
        dateRange: null
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [contactModalVisible, setContactModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [form] = Form.useForm();

    const orderStatuses = [
        { value: 'Pending', label: 'Chờ xác nhận', color: 'orange' },
        { value: 'Preparing', label: 'Đang chuẩn bị', color: 'blue' },
        { value: 'Delivering', label: 'Đang giao hàng', color: 'purple' },
        { value: 'Completed', label: 'Đã hoàn thành', color: 'green' },
        { value: 'Cancelled', label: 'Đã hủy', color: 'red' }
    ];

    useEffect(() => {
        loadOrders();
        loadStatistics();
    }, []); // Chỉ chạy một lần khi component mount

    useEffect(() => {
        // Reload when filters change
        const timer = setTimeout(() => {
            if (filters.search || filters.status || filters.dateRange) {
                handleFilter();
            } else {
                loadOrders();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            // Lấy tất cả đơn hàng không phân trang (page size lớn)
            const response = await orderService.getAllOrders(1, 10000);

            if (response.success) {
                const data = response.data;
                const allOrders = data.items || data || [];
                setOrders(allOrders);
            } else {
                message.error(response.message || 'Lỗi khi tải danh sách đơn hàng');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            message.error('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        setStatsLoading(true);
        try {
            const response = await orderService.getOrderStatistics();
            if (response.success) {
                setStatistics(response.data);
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleFilter = async () => {
        if (!filters.search && !filters.status && !filters.dateRange) {
            loadOrders();
            return;
        }

        setLoading(true);
        try {
            const filterData = {
                page: 1,
                pageSize: 10000, // Lấy tất cả kết quả filter
                status: filters.status || undefined,
                search: filters.search || undefined,
                fromDate: filters.dateRange?.[0]?.format('YYYY-MM-DD') || undefined,
                toDate: filters.dateRange?.[1]?.format('YYYY-MM-DD') || undefined
            };

            const response = await orderService.filterAllOrders(filterData);

            if (response.success) {
                const data = response.data;
                const filteredOrders = data.items || data || [];
                setOrders(filteredOrders);
            } else {
                message.error(response.message || 'Lỗi khi lọc đơn hàng');
            }
        } catch (error) {
            console.error('Error filtering orders:', error);
            message.error('Không thể lọc đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteOrder = async (orderId) => {
        try {
            const response = await orderService.completeOrder(orderId);
            if (response.success) {
                message.success('Đơn hàng đã được hoàn thành');
                loadOrders();
                loadStatistics();
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: 'Completed' });
                }
            } else {
                message.error(response.message || 'Không thể hoàn thành đơn hàng');
            }
        } catch (error) {
            console.error('Error completing order:', error);
            message.error('Có lỗi xảy ra khi hoàn thành đơn hàng');
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            const response = await orderService.cancelOrder(orderId);
            if (response.success) {
                message.success('Đơn hàng đã được hủy');
                loadOrders();
                loadStatistics();
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
                }
            } else {
                message.error(response.message || 'Không thể hủy đơn hàng');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            message.error('Có lỗi xảy ra khi hủy đơn hàng');
        }
    };

    const handleUpdateOrderStatus = async (values) => {
        try {
            const response = await orderService.updateOrderStatus(selectedOrder.id, values.status);
            if (response.success) {
                message.success('Cập nhật trạng thái thành công');
                setStatusModalVisible(false);
                loadOrders();
                loadStatistics();
                setSelectedOrder({ ...selectedOrder, status: values.status });
            } else {
                message.error(response.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            message.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một đơn hàng');
            return;
        }

        try {
            if (action === 'export') {
                handleExportSelected();
                return;
            }
        } catch (error) {
            console.error(`Error bulk ${action}:`, error);
            message.error('Có lỗi xảy ra khi xử lý hàng loạt');
        }
    };

    const handleExportExcel = () => {
        // Export tất cả đơn hàng
        const exportData = orders.map(order => ({
            'Mã đơn hàng': `#${order.id?.slice(-8) || 'N/A'}`,
            'Khách hàng': order.buyerName || 'Không xác định',
            'Số điện thoại': order.buyerPhone || '',
            'Người bán': order.sellerName || 'Không xác định',
            'Tổng tiền': `${(order.totalAmount || 0).toLocaleString('vi-VN')} VNĐ`,
            'Trạng thái': getStatusLabel(order.status, 'order'),
            'Ngày đặt': new Date(order.createdAt).toLocaleDateString('vi-VN'),
            'Địa chỉ giao hàng': order.deliveryAddress || 'Chưa có thông tin'
        }));

        // Tạo CSV content
        const headers = Object.keys(exportData[0] || {});
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        // Download file
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `don_hang_${new Date().getTime()}.csv`;
        link.click();

        message.success('Xuất Excel thành công');
    };

    const handleExportSelected = () => {
        const selectedOrders = orders.filter(order => selectedRowKeys.includes(order.id));
        if (selectedOrders.length === 0) {
            message.warning('Không có đơn hàng nào được chọn');
            return;
        }

        const exportData = selectedOrders.map(order => ({
            'Mã đơn hàng': `#${order.id?.slice(-8) || 'N/A'}`,
            'Khách hàng': order.buyerName || 'Không xác định',
            'Số điện thoại': order.buyerPhone || '',
            'Người bán': order.sellerName || 'Không xác định',
            'Tổng tiền': `${(order.totalAmount || 0).toLocaleString('vi-VN')} VNĐ`,
            'Trạng thái': getStatusLabel(order.status, 'order'),
            'Ngày đặt': new Date(order.createdAt).toLocaleDateString('vi-VN')
        }));

        const headers = Object.keys(exportData[0]);
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `don_hang_da_chon_${new Date().getTime()}.csv`;
        link.click();

        message.success('Xuất Excel thành công');
    };

    const handlePrintOrder = (order) => {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <html>
                <head>
                    <title>Đơn hàng #${order.id?.slice(-8) || 'N/A'}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .info { margin-bottom: 15px; }
                        .items { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        .items th { background-color: #f2f2f2; }
                        .total { text-align: right; margin-top: 20px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>HÓA ĐƠN BÁN HÀNG</h2>
                        <p>Mã đơn hàng: #${order.id?.slice(-8) || 'N/A'}</p>
                    </div>
                    <div class="info">
                        <p><strong>Khách hàng:</strong> ${order.buyerName || 'Không xác định'}</p>
                        <p><strong>Số điện thoại:</strong> ${order.buyerPhone || ''}</p>
                        <p><strong>Địa chỉ:</strong> ${order.deliveryAddress || 'Chưa có thông tin'}</p>
                        <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Trạng thái:</strong> ${getStatusLabel(order.status, 'order')}</p>
                    </div>
                    <table class="items">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Đơn vị</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(order.items || []).map(item => `
                                <tr>
                                    <td>${item.productName || 'N/A'}</td>
                                    <td>${item.productUnitName || 'N/A'}</td>
                                    <td>${item.quantity || 0}</td>
                                    <td>${(item.priceAtPurchase || 0).toLocaleString('vi-VN')} VNĐ</td>
                                    <td>${((item.priceAtPurchase || 0) * (item.quantity || 0)).toLocaleString('vi-VN')} VNĐ</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        <p>Tổng cộng: ${(order.totalAmount || 0).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    const getStatusColor = (status, type = 'order') => {
        const statusObj = orderStatuses.find(s => s.value === status);
        return statusObj?.color || 'default';
    };

    const getStatusLabel = (status, type = 'order') => {
        const statusObj = orderStatuses.find(s => s.value === status);
        return statusObj?.label || status;
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setDrawerVisible(true);
    };

    const getOrderStatusStep = (status) => {
        const statusOrder = ['Pending', 'Preparing', 'Delivering', 'Completed'];
        return statusOrder.indexOf(status);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            width: 150,
            render: (text, record) => (
                <Space direction="vertical" size="small">
                    <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                        #{text?.slice(-8) || 'N/A'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999' }}>
                        {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                </Space>
            ),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} size="small" />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.buyerName || 'Không xác định'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            <PhoneOutlined style={{ marginRight: 4 }} />
                            {record.buyerPhone || 'Chưa có SĐT'}
                        </div>
                    </div>
                </Space>
            ),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Tìm khách hàng..."
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            icon={<SearchOutlined />}
                            size="small"
                        >
                            Tìm
                        </Button>
                        <Button onClick={() => clearFilters()} size="small">
                            Xóa
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) =>
                record.buyerName?.toLowerCase().includes(value.toLowerCase()) ||
                record.buyerPhone?.includes(value),
        },
        {
            title: 'Người bán',
            key: 'seller',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Avatar icon={<ShopOutlined />} size="small" />
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                            {record.storeName ? `Cửa hàng: ${record.storeName}` : ''}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            ID: {record.sellerId?.slice(-8) || 'N/A'}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Sản phẩm',
            key: 'items',
            width: 150,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>
                        {(record.items || []).length} sản phẩm
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {(record.items || []).slice(0, 2).map((item, index) => (
                            <div key={index}>• {item.productName}</div>
                        ))}
                        {(record.items || []).length > 2 && (
                            <div>và {(record.items || []).length - 2} SP khác...</div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 120,
            render: (amount) => (
                <div style={{ fontWeight: 'bold', color: '#f5222d' }}>
                    {amount?.toLocaleString('vi-VN')} VNĐ
                </div>
            ),
            sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 160,
            render: (_, record) => (
                <Tag color={getStatusColor(record.status, 'order')}>
                    {getStatusLabel(record.status, 'order')}
                </Tag>
            ),
            filters: orderStatuses.map(status => ({
                text: status.label,
                value: status.value,
            })),
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewOrder(record)}
                        />
                    </Tooltip>

                    <Tooltip title="In đơn hàng">
                        <Button
                            type="text"
                            icon={<PrinterOutlined />}
                            onClick={() => handlePrintOrder(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Quản lý đơn hàng</h2>
                    <p style={{ margin: 0, color: '#666' }}>
                        Theo dõi và xử lý tất cả đơn hàng
                        {selectedRowKeys.length > 0 && (
                            <Badge count={selectedRowKeys.length} style={{ marginLeft: 8 }}>
                                <span style={{ color: '#1890ff' }}>đã chọn {selectedRowKeys.length} đơn hàng</span>
                            </Badge>
                        )}
                    </p>
                </div>
                <Space>
                    {selectedRowKeys.length > 0 && (
                        <>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() => handleBulkAction('export')}
                            >
                                Xuất đã chọn
                            </Button>
                            <Divider type="vertical" />
                        </>
                    )}

                    <Button
                        icon={<ExportOutlined />}
                        onClick={handleExportExcel}
                    >
                        Xuất Excel
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            loadOrders();
                            loadStatistics();
                        }}
                    >
                        Làm mới
                    </Button>
                </Space>
            </div>

            {/* Statistics */}
            <div style={{ marginBottom: '24px' }}>
                <OrderStats statistics={statistics} loading={statsLoading} />
            </div>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16}>
                    <Col span={5}>
                        <Search
                            placeholder="Tìm kiếm mã đơn hàng, khách hàng..."
                            allowClear
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={3}>
                        <Select
                            placeholder="Trạng thái đơn hàng"
                            allowClear
                            style={{ width: '100%' }}
                            value={filters.status}
                            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        >
                            {orderStatuses.map(status => (
                                <Option key={status.value} value={status.value}>
                                    <Tag color={status.color} style={{ margin: 0 }}>
                                        {status.label}
                                    </Tag>
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <RangePicker
                            style={{ width: '100%' }}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            value={filters.dateRange}
                            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                            format="DD/MM/YYYY"
                        />
                    </Col>
                    <Col span={3}>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => {
                                setFilters({ search: '', status: '', dateRange: null });
                                loadOrders();
                            }}
                            style={{ width: '100%' }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Col>
                    <Col span={3}>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleFilter}
                            style={{ width: '100%' }}
                        >
                            Tìm kiếm
                        </Button>
                    </Col>
                    <Col span={3}>
                        <Button
                            icon={<SyncOutlined />}
                            onClick={() => {
                                loadOrders();
                                loadStatistics();
                                message.success('Đã làm mới dữ liệu');
                            }}
                            style={{ width: '100%' }}
                        >
                            Đồng bộ
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card 
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Danh sách tất cả đơn hàng</span>
                        <span style={{ fontWeight: 'normal', color: '#666' }}>
                            Tổng cộng: {orders.length} đơn hàng
                        </span>
                    </div>
                }
            >
                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    loading={loading}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
                        getCheckboxProps: (record) => ({
                            disabled: false,
                            name: record.id,
                        }),
                    }}
                    pagination={false}  // Tắt phân trang để hiển thị tất cả đơn hàng
                    scroll={{ x: 1400 }}
                    size="small"
                />
            </Card>

            {/* Order Detail Drawer */}
            <Drawer
                title="Chi tiết đơn hàng"
                placement="right"
                size="large"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                {selectedOrder && (
                    <div>
                        {/* Order Header */}
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <h3>#{selectedOrder.id?.slice(-8) || 'N/A'}</h3>
                            <Space>
                                <Tag color={getStatusColor(selectedOrder.status, 'order')}>
                                    {getStatusLabel(selectedOrder.status, 'order')}
                                </Tag>
                            </Space>
                        </div>

                        {/* Order Progress */}
                        <Card title="Tiến trình đơn hàng" style={{ marginBottom: '16px' }}>
                            <Steps
                                current={getOrderStatusStep(selectedOrder.status)}
                                status={selectedOrder.status === 'Cancelled' ? 'error' : 'process'}
                                size="small"
                            >
                                <Step title="Chờ xác nhận" />
                                <Step title="Đang chuẩn bị" />
                                <Step title="Đang giao hàng" />
                                <Step title="Đã hoàn thành" />
                            </Steps>
                        </Card>

                        {/* Order Information */}
                        <Descriptions bordered column={1} style={{ marginBottom: '16px' }}>
                            <Descriptions.Item label="Khách hàng">
                                <Space>
                                    <Avatar icon={<UserOutlined />} />
                                    <div>
                                        <div>{selectedOrder.buyerName || 'Không xác định'}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {selectedOrder.buyerPhone || ''}
                                        </div>
                                    </div>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Người bán">
                                <Space>
                                    <Avatar icon={<ShopOutlined />} />
                                    <div>
                                        <div>{selectedOrder.sellerName || 'Không xác định'}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {selectedOrder.storeName || ''}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            ID: {selectedOrder.sellerId}
                                        </div>
                                    </div>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng">
                                {selectedOrder.deliveryAddress || 'Chưa có thông tin'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú">
                                {selectedOrder.notes || 'Không có ghi chú'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt hàng">
                                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lần cuối">
                                {new Date(selectedOrder.updatedAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Order Items */}
                        <Card title="Sản phẩm đặt hàng" style={{ marginBottom: '16px' }}>
                            <Table
                                dataSource={selectedOrder.items || []}
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Sản phẩm',
                                        key: 'product',
                                        render: (_, record) => (
                                            <Space>
                                                {record.productImageUrl && (
                                                    <img
                                                        src={record.productImageUrl}
                                                        alt={record.productName}
                                                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                                                    />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>
                                                        {record.productName || 'Sản phẩm không xác định'}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        Đơn vị: {record.productUnitName || 'N/A'}
                                                    </div>
                                                </div>
                                            </Space>
                                        ),
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        key: 'quantity',
                                        width: 100,
                                    },
                                    {
                                        title: 'Đơn giá',
                                        dataIndex: 'priceAtPurchase',
                                        key: 'priceAtPurchase',
                                        width: 120,
                                        render: (price) => `${(price || 0).toLocaleString('vi-VN')} VNĐ`,
                                    },
                                    {
                                        title: 'Thành tiền',
                                        key: 'total',
                                        width: 120,
                                        render: (_, record) => {
                                            const total = (record.priceAtPurchase || 0) * (record.quantity || 0);
                                            return `${total.toLocaleString('vi-VN')} VNĐ`;
                                        },
                                    },
                                ]}
                            />
                            <div style={{
                                textAlign: 'right',
                                marginTop: '16px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#f5222d'
                            }}>
                                Tổng cộng: {(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} VNĐ
                            </div>
                        </Card>

                        {/* Actions */}
                        <div style={{ textAlign: 'center' }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setContactModalVisible(true);
                                    }}
                                >
                                    Liên hệ khách hàng
                                </Button>
                                <Button onClick={() => handlePrintOrder(selectedOrder)}>
                                    In đơn hàng
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Status Update Modal */}
            <Modal
                title="Cập nhật trạng thái đơn hàng"
                open={statusModalVisible}
                onCancel={() => setStatusModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateOrderStatus}
                >
                    <Form.Item
                        label="Trạng thái đơn hàng"
                        name="status"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            {orderStatuses.map(status => (
                                <Option key={status.value} value={status.value}>
                                    <Tag color={status.color} style={{ margin: 0 }}>
                                        {status.label}
                                    </Tag>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Cập nhật
                            </Button>
                            <Button onClick={() => setStatusModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Contact Customer Modal */}
            <Modal
                title="Liên hệ khách hàng"
                open={contactModalVisible}
                onCancel={() => setContactModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setContactModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
            >
                {selectedOrder && (
                    <div>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Tên khách hàng">
                                {selectedOrder.buyerName || 'Không xác định'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                <Space>
                                    {selectedOrder.buyerPhone || 'Chưa có SĐT'}
                                    {selectedOrder.buyerPhone && (
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<PhoneOutlined />}
                                            onClick={() => window.open(`tel:${selectedOrder.buyerPhone}`)}
                                        >
                                            Gọi ngay
                                        </Button>
                                    )}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <Space>
                                    {selectedOrder.buyerEmail || 'Chưa có email'}
                                    {selectedOrder.buyerEmail && (
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<MailOutlined />}
                                            onClick={() => window.open(`mailto:${selectedOrder.buyerEmail}`)}
                                        >
                                            Gửi mail
                                        </Button>
                                    )}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng">
                                {selectedOrder.deliveryAddress || 'Chưa có thông tin'}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 16 }}>
                            <h4>Hành động nhanh:</h4>
                            <Space wrap>
                                <Button icon={<PhoneOutlined />} onClick={() => {
                                    if (selectedOrder.buyerPhone) {
                                        window.open(`tel:${selectedOrder.buyerPhone}`);
                                    } else {
                                        message.warning('Khách hàng chưa cung cấp số điện thoại');
                                    }
                                }}>
                                    Gọi điện
                                </Button>
                                <Button icon={<MailOutlined />} onClick={() => {
                                    if (selectedOrder.buyerEmail) {
                                        window.open(`mailto:${selectedOrder.buyerEmail}?subject=Về đơn hàng ${selectedOrder.id?.slice(-8)}`);
                                    } else {
                                        message.warning('Khách hàng chưa cung cấp email');
                                    }
                                }}>
                                    Gửi email
                                </Button>
                                <Button onClick={() => {
                                    navigator.clipboard.writeText(selectedOrder.buyerPhone || '');
                                    message.success('Đã sao chép số điện thoại');
                                }}>
                                    Sao chép SĐT
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderManagement;
