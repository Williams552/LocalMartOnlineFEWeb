import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    message,
    Modal,
    Input,
    Select,
    Row,
    Col,
    Typography,
    Empty,
    Result
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const PendingProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    useEffect(() => {
        // Tạm thời để trống, chờ backend implement API
        loadPendingProducts();
    }, []);

    const loadPendingProducts = async () => {
        try {
            setLoading(true);
            // TODO: Implement API call when backend is ready
            // const response = await productService.getPendingProducts();
            // setProducts(response.data);

            // Tạm thời mock data để demo UI
            setTimeout(() => {
                setProducts([]);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error loading pending products:', error);
            message.error('Không thể tải danh sách sản phẩm chờ duyệt');
            setLoading(false);
        }
    };

    const handleApprove = async (productId) => {
        Modal.confirm({
            title: 'Xác nhận duyệt sản phẩm',
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn duyệt sản phẩm này?',
            onOk: async () => {
                try {
                    // TODO: Implement API call
                    // await productService.approveProduct(productId);
                    message.success('Đã duyệt sản phẩm thành công');
                    loadPendingProducts();
                } catch (error) {
                    message.error('Không thể duyệt sản phẩm');
                }
            },
        });
    };

    const handleReject = async (productId) => {
        Modal.confirm({
            title: 'Xác nhận từ chối sản phẩm',
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn từ chối sản phẩm này?',
            onOk: async () => {
                try {
                    // TODO: Implement API call
                    // await productService.rejectProduct(productId);
                    message.success('Đã từ chối sản phẩm');
                    loadPendingProducts();
                } catch (error) {
                    message.error('Không thể từ chối sản phẩm');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: 'Cửa hàng',
            dataIndex: 'storeName',
            key: 'storeName',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <Text strong style={{ color: '#ff4d4f' }}>
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                    }).format(price)}
                </Text>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: () => (
                <Tag color="orange">Chờ duyệt</Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => {
                            setSelectedProduct(record);
                            setDetailModalVisible(true);
                        }}
                    >
                        Xem
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        size="small"
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        onClick={() => handleApprove(record.id)}
                    >
                        Duyệt
                    </Button>
                    <Button
                        type="primary"
                        danger
                        icon={<CloseOutlined />}
                        size="small"
                        onClick={() => handleReject(record.id)}
                    >
                        Từ chối
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={3}>Sản phẩm chờ duyệt</Title>
                    <Text type="secondary">
                        Quản lý các sản phẩm đang chờ duyệt từ người bán
                    </Text>
                </div>

                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Search
                            placeholder="Tìm kiếm sản phẩm..."
                            allowClear
                        />
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Chọn cửa hàng"
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Option value="store1">Cửa hàng 1</Option>
                            <Option value="store2">Cửa hàng 2</Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Sắp xếp theo"
                            defaultValue="newest"
                            style={{ width: '100%' }}
                        >
                            <Option value="newest">Mới nhất</Option>
                            <Option value="oldest">Cũ nhất</Option>
                            <Option value="name">Tên A-Z</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button
                            type="primary"
                            onClick={loadPendingProducts}
                            loading={loading}
                            style={{ width: '100%' }}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>

                {/* Temporary message for development */}
                <Result
                    icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                    title="Chức năng đang phát triển"
                    subTitle="API cho sản phẩm chờ duyệt chưa được triển khai ở backend. Vui lòng đợi cập nhật."
                    extra={
                        <Button type="primary" onClick={loadPendingProducts}>
                            Tải lại
                        </Button>
                    }
                />

                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        total: products.length,
                        pageSize: 20,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} sản phẩm`,
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                description="Không có sản phẩm chờ duyệt"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ),
                    }}
                />
            </Card>

            {/* Product Detail Modal */}
            <Modal
                title="Chi tiết sản phẩm chờ duyệt"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedProduct(null);
                }}
                footer={[
                    <Button key="cancel" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    <Button
                        key="reject"
                        type="primary"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => {
                            if (selectedProduct) {
                                handleReject(selectedProduct.id);
                                setDetailModalVisible(false);
                            }
                        }}
                    >
                        Từ chối
                    </Button>,
                    <Button
                        key="approve"
                        type="primary"
                        icon={<CheckOutlined />}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        onClick={() => {
                            if (selectedProduct) {
                                handleApprove(selectedProduct.id);
                                setDetailModalVisible(false);
                            }
                        }}
                    >
                        Duyệt
                    </Button>,
                ]}
                width={800}
            >
                {selectedProduct && (
                    <div>
                        <Text>Chi tiết sản phẩm sẽ được hiển thị khi API được triển khai</Text>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PendingProducts;
