import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Input,
    Space,
    Tag,
    Image,
    message,
    Modal,
    Descriptions,
    Typography,
    Row,
    Col,
    Switch,
    Tooltip,
    Select,
    Divider,
    Pagination,
    Empty
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    ShopOutlined,
    TagOutlined,
    CalendarOutlined,
    DollarOutlined,
    StockOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import productService from '../../../services/productService';
import storeService from '../../../services/storeService';
import categoryService from '../../../services/categoryService';
import './ProductManagement.css';

const { Search } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);
    const [toggleLoading, setToggleLoading] = useState({});

    // Load initial data
    useEffect(() => {
        loadProducts();
        loadCategories();
        loadStores();
    }, []);

    const loadProducts = async (page = 1, pageSize = 20) => {
        try {
            setLoading(true);
            console.log('Loading products with params:', {
                page,
                pageSize,
                search: searchKeyword,
                categoryId: selectedCategory,
                storeId: selectedStore
            });

            const response = await productService.getAllProducts({
                page,
                pageSize,
                search: searchKeyword,
                categoryId: selectedCategory,
                storeId: selectedStore
            });

            console.log('Products response:', response);

            if (response && response.items) {
                console.log('Sample product data:', response.items[0]);
                setProducts(Array.isArray(response.items) ? response.items : []);
                setPagination({
                    current: page,
                    pageSize,
                    total: response.totalCount || 0,
                });
            } else {
                // Fallback - try direct API call if service response is not as expected
                const directResponse = await fetch(`http://localhost:5183/api/Product?page=${page}&pageSize=${pageSize}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                const result = await directResponse.json();
                console.log('Direct API response:', result);

                if (result.success && result.data) {
                    const productList = result.data.items || result.data.products || [];
                    console.log('Sample product from direct API:', productList[0]);
                    setProducts(Array.isArray(productList) ? productList : []);
                    setPagination({
                        current: page,
                        pageSize,
                        total: result.data.totalCount || 0,
                    });
                }
            }
        } catch (error) {
            console.error('Error loading products:', error);
            message.error('Không thể tải danh sách sản phẩm: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            console.log('Loading categories...');
            const response = await categoryService.getAllCategories();
            console.log('Categories response:', response);

            if (response && response.success) {
                setCategories(Array.isArray(response.data) ? response.data : []);
            } else if (response && Array.isArray(response)) {
                setCategories(response);
            } else {
                // Fallback - direct API call
                const directResponse = await fetch(`http://localhost:5183/api/Category`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });
                const result = await directResponse.json();
                if (result.success) {
                    setCategories(Array.isArray(result.data) ? result.data : []);
                }
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadStores = async () => {
        try {
            console.log('Loading stores...');
            const response = await storeService.getAllStores();
            console.log('Stores response:', response);

            if (response && response.success) {
                const storeList = response.data.stores || response.data || [];
                setStores(Array.isArray(storeList) ? storeList : []);
            } else if (response && Array.isArray(response)) {
                setStores(response);
            } else {
                // Fallback - direct API call
                const directResponse = await fetch(`http://localhost:5183/api/Store/admin`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });
                const result = await directResponse.json();
                if (result.success) {
                    const storeList = result.data.stores || result.data || [];
                    setStores(Array.isArray(storeList) ? storeList : []);
                }
            }
        } catch (error) {
            console.error('Error loading stores:', error);
        }
    };

    const handleSearch = (value) => {
        setSearchKeyword(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        loadProducts(1, pagination.pageSize);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        loadProducts(1, pagination.pageSize);
    };

    const handleStoreChange = (value) => {
        setSelectedStore(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        loadProducts(1, pagination.pageSize);
    };

    const handleTableChange = (paginationConfig) => {
        loadProducts(paginationConfig.current, paginationConfig.pageSize);
    };

    const handleToggleStatus = async (productId, currentStatus) => {
        const enable = currentStatus !== 'Active';
        const action = enable ? 'kích hoạt' : 'vô hiệu hóa';

        Modal.confirm({
            title: `Xác nhận ${action} sản phẩm`,
            content: `Bạn có chắc chắn muốn ${action} sản phẩm này?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    // Set loading for this specific product
                    setToggleLoading(prev => ({ ...prev, [productId]: true }));

                    console.log('Toggling product status:', { productId, currentStatus, enable });

                    const response = await fetch(`http://localhost:5183/api/Product/${productId}/toggle?enable=${enable}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    const result = await response.json();
                    console.log('Toggle response:', result);

                    if (result.success) {
                        message.success(result.message);
                        // Reload products to get updated data
                        loadProducts(pagination.current, pagination.pageSize);
                    } else {
                        message.error(result.message || 'Không thể thay đổi trạng thái sản phẩm');
                    }
                } catch (error) {
                    console.error('Error toggling product status:', error);
                    message.error('Không thể thay đổi trạng thái sản phẩm');
                } finally {
                    // Remove loading for this specific product
                    setToggleLoading(prev => {
                        const newState = { ...prev };
                        delete newState[productId];
                        return newState;
                    });
                }
            }
        });
    };

    const handleViewDetails = async (productId) => {
        try {
            setDetailLoading(true);
            setDetailModalVisible(true);

            console.log('Loading product details for:', productId);

            // Try service first
            try {
                const response = await productService.getProductDetails(productId);
                console.log('Service response:', response);
                if (response && response.success) {
                    setSelectedProduct(response.data);
                    return;
                } else if (response && !response.success) {
                    throw new Error(response.message || 'Service returned error');
                }
            } catch (serviceError) {
                console.log('Service failed, trying direct API call:', serviceError);

                // Fallback to direct API call
                const directResponse = await fetch(`http://localhost:5183/api/Product/${productId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                const result = await directResponse.json();
                console.log('Direct API response:', result);

                if (result.success) {
                    setSelectedProduct(result.data);
                } else {
                    throw new Error(result.message || 'Cannot load product details');
                }
            }
        } catch (error) {
            console.error('Error loading product details:', error);
            message.error('Không thể tải thông tin chi tiết sản phẩm: ' + error.message);
            setDetailModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleRefresh = () => {
        setSearchKeyword('');
        setSelectedCategory(null);
        setSelectedStore(null);
        setPagination(prev => ({ ...prev, current: 1 }));
        loadProducts(1, pagination.pageSize);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'green';
            case 'OutOfStock':
                return 'orange';
            case 'Inactive':
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Active':
                return 'Hoạt động';
            case 'OutOfStock':
                return 'Hết hàng';
            case 'Inactive':
                return 'Vô hiệu hóa';
            default:
                return 'Không xác định';
        }
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrls',
            key: 'image',
            width: 80,
            render: (images) => (
                <Image
                    width={60}
                    height={60}
                    src={images && images.length > 0 ? images[0] : '/placeholder-product.png'}
                    fallback="/placeholder-product.png"
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                />
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        ID: {record.id}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Cửa hàng',
            dataIndex: 'seller',
            key: 'store',
            width: 150,
            render: (seller, record) => {
                console.log('Seller data:', seller, 'Full record:', record);
                return (
                    <div>
                        <div style={{ fontWeight: 'bold' }}>
                            {seller?.storeName || seller?.name || record.storeName || 'N/A'}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price, record) => (
                <div>
                    <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        }).format(price)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        /{record.unit}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Lượt mua',
            dataIndex: 'purchaseCount',
            key: 'purchaseCount',
            width: 100,
            render: (count) => (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>{count || 0}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>lượt</Text>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status, record) => (
                <div style={{ textAlign: 'center' }}>
                    <Tag color={getStatusColor(status)} style={{ marginBottom: 4 }}>
                        {getStatusText(status)}
                    </Tag>
                    <div>
                        <Switch
                            size="small"
                            checked={status === 'Active'}
                            onChange={() => handleToggleStatus(record.id, status)}
                            checkedChildren="Bật"
                            unCheckedChildren="Tắt"
                            loading={toggleLoading[record.id] || false}
                            disabled={toggleLoading[record.id] || false}
                        />
                    </div>
                </div>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => (
                <div>
                    <div>{new Date(date).toLocaleDateString('vi-VN')}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(date).toLocaleTimeString('vi-VN')}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDetails(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="product-management">
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={3}>
                        <TagOutlined /> Quản lý sản phẩm
                    </Title>
                    <Text type="secondary">
                        Quản lý tất cả sản phẩm trong hệ thống
                    </Text>
                </div>

                {/* Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Search
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onSearch={handleSearch}
                            enterButton={<SearchOutlined />}
                            allowClear
                        />
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Chọn danh mục"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {Array.isArray(categories) && categories.map(category => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Chọn cửa hàng"
                            value={selectedStore}
                            onChange={handleStoreChange}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {Array.isArray(stores) && stores.map(store => (
                                <Option key={store.id} value={store.id}>
                                    {store.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            style={{ width: '100%' }}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>

                {/* Statistics */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                                {pagination.total}
                            </div>
                            <div>Tổng sản phẩm</div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                                {Array.isArray(products) ? products.filter(p => p.status === 'Active').length : 0}
                            </div>
                            <div>Đang hoạt động</div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>
                                {Array.isArray(products) ? products.filter(p => p.status === 'OutOfStock').length : 0}
                            </div>
                            <div>Hết hàng</div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }}>
                                {Array.isArray(products) ? products.filter(p => p.status === 'Inactive').length : 0}
                            </div>
                            <div>Đã vô hiệu hóa</div>
                        </Card>
                    </Col>
                </Row>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 1200 }}
                    locale={{
                        emptyText: (
                            <Empty
                                description="Không có sản phẩm nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ),
                    }}
                />

                {/* Pagination */}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Pagination
                        current={pagination.current}
                        total={pagination.total}
                        pageSize={pagination.pageSize}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} của ${total} sản phẩm`
                        }
                        onChange={(page, pageSize) => {
                            const newPagination = { ...pagination, current: page, pageSize };
                            setPagination(newPagination);
                            loadProducts(page, pageSize);
                        }}
                    />
                </div>
            </Card>

            {/* Product Detail Modal */}
            <Modal
                title={
                    <div>
                        <EyeOutlined /> Chi tiết sản phẩm
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedProduct(null);
                }}
                footer={null}
                width={800}
                loading={detailLoading}
            >
                {selectedProduct && (
                    <div>
                        <Row gutter={16}>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <Image
                                        width="100%"
                                        height={200}
                                        src={selectedProduct.imageUrls?.[0] || '/placeholder-product.png'}
                                        fallback="/placeholder-product.png"
                                        style={{ objectFit: 'cover', borderRadius: 8 }}
                                    />
                                    {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 1 && (
                                        <div style={{ marginTop: 8 }}>
                                            <Text type="secondary">
                                                +{selectedProduct.imageUrls.length - 1} ảnh khác
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col span={16}>
                                <Descriptions column={1}>
                                    <Descriptions.Item label="Tên sản phẩm">
                                        <Text strong>{selectedProduct.name}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag color={getStatusColor(selectedProduct.status)}>
                                            {getStatusText(selectedProduct.status)}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giá">
                                        <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(selectedProduct.price)}
                                        </Text>
                                        <Text type="secondary"> /{selectedProduct.unit}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số lượng tối thiểu">
                                        {selectedProduct.minimumQuantity} {selectedProduct.unit}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Lượt mua">
                                        {selectedProduct.purchaseCount || 0} lượt
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>

                        <Divider />

                        <Descriptions title="Thông tin chi tiết" column={2}>
                            <Descriptions.Item label="ID sản phẩm">
                                {selectedProduct.id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cửa hàng">
                                <div>
                                    <ShopOutlined /> {selectedProduct.storeName || 'N/A'}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                <CalendarOutlined /> {new Date(selectedProduct.createdAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lần cuối">
                                <CalendarOutlined /> {new Date(selectedProduct.updatedAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedProduct.description && (
                            <>
                                <Divider />
                                <div>
                                    <Title level={5}>Mô tả sản phẩm</Title>
                                    <Text>{selectedProduct.description}</Text>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProductManagement;
