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
    ReloadOutlined,
    BankOutlined,
    UndoOutlined
} from '@ant-design/icons';
import productService from '../../../services/productService';
import storeService from '../../../services/storeService';
import categoryService from '../../../services/categoryService';
import marketService from '../../../services/marketService';
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
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [toggleLoading, setToggleLoading] = useState({});
    const [statistics, setStatistics] = useState({
        total: 0,
        active: 0,
        outOfStock: 0,
        inactive: 0,
        suspended: 0
    });

    // Load initial data
    useEffect(() => {
        loadProducts();
        loadCategories();
        loadStores();
        loadMarkets();
        loadStatistics(); // Load statistics from database
    }, []);

    // Debug categories state
    useEffect(() => {
        console.log('Categories state updated:', categories.length, categories);
    }, [categories]);

    const loadProducts = async (page = 1, pageSize = 20) => {
        return loadProductsWithFilters(page, pageSize, {
            search: searchKeyword,
            categoryId: selectedCategory,
            storeId: selectedStore,
            marketId: selectedMarket,
            status: selectedStatus
        });
    };

    const loadProductsWithFilters = async (page = 1, pageSize = 20, filters = {}) => {
        try {
            setLoading(true);
            console.log('Loading admin products with params:', {
                page,
                pageSize,
                ...filters
            });

            // Use getAdminProducts to get ALL products including Inactive ones
            const response = await productService.getAdminProducts({
                page,
                pageSize,
                search: filters.search,
                categoryId: filters.categoryId,
                storeId: filters.storeId,
                marketId: filters.marketId,
                status: filters.status
            });

            console.log('Admin products response:', response);

            if (response && response.items) {
                console.log('Sample product data:', response.items[0]);
                setProducts(Array.isArray(response.items) ? response.items : []);
                setPagination({
                    current: page,
                    pageSize,
                    total: response.totalCount || 0,
                });
            } else {
                console.log('Service response not as expected, trying direct API call...');
                // Fallback - try direct API call if service response is not as expected
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    pageSize: pageSize.toString()
                });

                if (filters.search) queryParams.append('search', filters.search);
                if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
                if (filters.storeId) queryParams.append('storeId', filters.storeId);
                if (filters.marketId) queryParams.append('marketId', filters.marketId);
                if (filters.status !== null && filters.status !== undefined) queryParams.append('status', filters.status);

                console.log('Direct API call with query params:', queryParams.toString());

                const directResponse = await fetch(`http://localhost:5183/api/Product?${queryParams.toString()}`, {
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
                } else {
                    console.error('Direct API call also failed:', result);
                    setProducts([]);
                    setPagination({
                        current: page,
                        pageSize,
                        total: 0,
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

            if (response && response.items && Array.isArray(response.items)) {
                setCategories(response.items);
                console.log('Categories loaded from items:', response.items.length, 'categories:', response.items);
            } else if (response && response.success && response.data) {
                const categoryList = Array.isArray(response.data) ? response.data : [];
                setCategories(categoryList);
                console.log('Categories loaded from success/data:', categoryList.length, 'categories:', categoryList);
            } else if (response && Array.isArray(response)) {
                setCategories(response);
                console.log('Categories loaded (direct array):', response.length, 'categories:', response);
            } else {
                // Fallback - direct API call
                console.log('Trying direct API call for categories...');
                const directResponse = await fetch(`http://localhost:5183/api/Category`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });
                const result = await directResponse.json();
                console.log('Direct categories API response:', result);

                if (result.success && result.data) {
                    const categoryList = Array.isArray(result.data) ? result.data : [];
                    setCategories(categoryList);
                    console.log('Categories loaded from direct API:', categoryList.length, 'categories:', categoryList);
                } else {
                    console.error('Failed to load categories:', result);
                }
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadMarkets = async () => {
        try {
            console.log('Loading markets...');

            // Try to get all markets (admin endpoint) first
            let response;
            try {
                response = await marketService.getAllMarkets();
                console.log('All markets response:', response);
            } catch (adminError) {
                console.log('Admin markets failed, trying active markets:', adminError);
                // Fallback to active markets if admin call fails
                response = await marketService.getActiveMarkets();
                console.log('Active markets response:', response);
            }

            if (response && Array.isArray(response)) {
                setMarkets(response);
                console.log('Markets loaded:', response.length, 'markets');
            } else if (response && response.items && Array.isArray(response.items)) {
                setMarkets(response.items);
                console.log('Markets loaded:', response.items.length, 'markets');
            } else if (response && response.data && Array.isArray(response.data)) {
                setMarkets(response.data);
                console.log('Markets loaded:', response.data.length, 'markets');
            } else {
                // Fallback - direct API call
                const directResponse = await fetch(`http://localhost:5183/api/Market`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });
                const result = await directResponse.json();
                if (result.success) {
                    setMarkets(Array.isArray(result.data) ? result.data : []);
                }
            }
        } catch (error) {
            console.error('Error loading markets:', error);
        }
    };

    const loadStores = async () => {
        try {
            console.log('Loading stores...');
            const response = await storeService.getAllStores();
            console.log('Stores response:', response);

            if (response && response.items) {
                // Handle the correct response format from storeService.getAllStores()
                setStores(Array.isArray(response.items) ? response.items : []);
                console.log('✅ Stores loaded successfully:', response.items.length, 'stores');
            } else {
                console.warn('⚠️ No stores found in response');
                setStores([]);
            }
        } catch (error) {
            console.error('❌ Error loading stores:', error);
            setStores([]);
        }
    };

    const loadStatistics = async () => {
        try {
            console.log('Loading product statistics...');
            
            // Get statistics for all statuses from database
            const [activeResponse, outOfStockResponse, inactiveResponse, suspendedResponse] = await Promise.all([
                productService.getAdminProducts({ pageSize: 1, status: 'Active' }),
                productService.getAdminProducts({ pageSize: 1, status: 'OutOfStock' }),
                productService.getAdminProducts({ pageSize: 1, status: 'Inactive' }),
                productService.getAdminProducts({ pageSize: 1, status: 'Suspended' })
            ]);

            // Also get total count without status filter
            const totalResponse = await productService.getAdminProducts({ pageSize: 1 });

            setStatistics({
                total: totalResponse?.totalCount || 0,
                active: activeResponse?.totalCount || 0,
                outOfStock: outOfStockResponse?.totalCount || 0,
                inactive: inactiveResponse?.totalCount || 0,
                suspended: suspendedResponse?.totalCount || 0
            });

            console.log('✅ Statistics loaded:', {
                total: totalResponse?.totalCount || 0,
                active: activeResponse?.totalCount || 0,
                outOfStock: outOfStockResponse?.totalCount || 0,
                inactive: inactiveResponse?.totalCount || 0,
                suspended: suspendedResponse?.totalCount || 0
            });
        } catch (error) {
            console.error('❌ Error loading statistics:', error);
        }
    };

    const handleSearch = (value) => {
        setSearchKeyword(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        loadProductsWithFilters(1, pagination.pageSize, {
            search: value,
            categoryId: selectedCategory,
            storeId: selectedStore,
            marketId: selectedMarket,
            status: selectedStatus
        });
    };

    const handleCategoryChange = (value) => {
        console.log('Category changed to:', value);
        setSelectedCategory(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        loadProductsWithFilters(1, pagination.pageSize, {
            search: searchKeyword,
            categoryId: value,
            storeId: selectedStore,
            marketId: selectedMarket,
            status: selectedStatus
        });
    };

    const handleStoreChange = (value) => {
        console.log('Store changed to:', value);
        setSelectedStore(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        loadProductsWithFilters(1, pagination.pageSize, {
            search: searchKeyword,
            categoryId: selectedCategory,
            storeId: value,
            marketId: selectedMarket,
            status: selectedStatus
        });
    };

    const handleMarketChange = (value) => {
        console.log('Market changed to:', value);
        setSelectedMarket(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        // Load products immediately with new market value
        loadProductsWithFilters(1, pagination.pageSize, {
            search: searchKeyword,
            categoryId: selectedCategory,
            storeId: selectedStore,
            marketId: value, // Use the new value directly
            status: selectedStatus
        });
    };

    const handleStatusChange = (value) => {
        console.log('Status changed to:', value);
        setSelectedStatus(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        loadProductsWithFilters(1, pagination.pageSize, {
            search: searchKeyword,
            categoryId: selectedCategory,
            storeId: selectedStore,
            marketId: selectedMarket,
            status: value
        });
    };

    const handleTableChange = (paginationConfig) => {
        loadProducts(paginationConfig.current, paginationConfig.pageSize);
    };

    const handleReactiveProduct = async (productId, productName) => {
        Modal.confirm({
            title: 'Xác nhận kích hoạt lại sản phẩm',
            content: `Bạn có chắc chắn muốn kích hoạt lại sản phẩm "${productName}"? Sản phẩm sẽ được chuyển về trạng thái Hoạt động.`,
            okText: 'Kích hoạt',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    setToggleLoading(prev => ({ ...prev, [productId]: true }));

                    const result = await productService.updateProductStatus(productId, 'Active'); // Set to Active

                    if (result.success) {
                        message.success('Kích hoạt lại sản phẩm thành công');
                        loadProducts(pagination.current, pagination.pageSize);
                        loadStatistics(); // Reload statistics after status change
                    } else {
                        message.error('Không thể kích hoạt lại sản phẩm');
                    }
                } catch (error) {
                    console.error('Error reactivating product:', error);
                    message.error('Không thể kích hoạt lại sản phẩm');
                } finally {
                    setToggleLoading(prev => {
                        const newState = { ...prev };
                        delete newState[productId];
                        return newState;
                    });
                }
            }
        });
    };

    const handleToggleStatus = async (productId, currentStatus) => {
        // For admin: 
        // - Switch is ON when status is NOT Suspended 
        // - Switch is OFF when status is Suspended
        // - Toggle between current status and Suspended
        let newStatus;
        let action;
        
        if (currentStatus === 'Suspended' || currentStatus === 3) {
            // If currently Suspended, reactivate to Active
            newStatus = 'Active'; 
            action = 'kích hoạt lại';
        } else {
            // If not Suspended, suspend the product
            newStatus = 'Suspended'; 
            action = 'đình chỉ';
        }

        Modal.confirm({
            title: `Xác nhận ${action} sản phẩm`,
            content: `Bạn có chắc chắn muốn ${action} sản phẩm này?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    // Set loading for this specific product
                    setToggleLoading(prev => ({ ...prev, [productId]: true }));

                    console.log('Updating product status:', { productId, currentStatus, newStatus });

                    // Use the new updateProductStatus method
                    const result = await productService.updateProductStatus(productId, newStatus);

                    if (result.success) {
                        message.success(result.message || 'Cập nhật trạng thái sản phẩm thành công');
                        // Reload products to get updated data
                        loadProducts(pagination.current, pagination.pageSize);
                        loadStatistics(); // Reload statistics after status change
                    } else {
                        message.error(result.message || 'Không thể thay đổi trạng thái sản phẩm');
                    }
                } catch (error) {
                    console.error('Error updating product status:', error);
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
        setSelectedMarket(null);
        setSelectedStatus(null);
        setPagination(prev => ({ ...prev, current: 1 }));
        loadProducts(1, pagination.pageSize);
    };

    const getStatusColor = (status) => {
        // status: Active, OutOfStock, Inactive, Suspended
        if (status === 'Active' || status === 0) return 'green';
        if (status === 'OutOfStock' || status === 1) return 'orange';
        if (status === 'Inactive' || status === 2) return 'red';
        if (status === 'Suspended' || status === 3) return 'purple';
        return 'default';
    };

    const getStatusText = (status) => {
        if (status === 'Active' || status === 0) return 'Hoạt động';
        if (status === 'OutOfStock' || status === 1) return 'Hết hàng';
        if (status === 'Inactive' || status === 2) return 'Đã xóa';
        if (status === 'Suspended' || status === 3) return 'Đình chỉ';
        return 'Không xác định';
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
                        /{record.unitName || record.unit || 'đơn vị'}
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
                            checked={status !== 'Suspended' && status !== 3}
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
            width: 150,
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
                    {(record.status === 'Inactive' || record.status === 2) && (
                        <Tooltip title="Kích hoạt lại sản phẩm">
                            <Button
                                type="default"
                                icon={<UndoOutlined />}
                                size="small"
                                loading={toggleLoading[record.id] || false}
                                onClick={() => handleReactiveProduct(record.id, record.name)}
                                style={{ color: '#52c41a', borderColor: '#52c41a' }}
                            />
                        </Tooltip>
                    )}
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
                    <Col span={5}>
                        <Search
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onSearch={handleSearch}
                            enterButton={<SearchOutlined />}
                            allowClear
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Chọn danh mục"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            allowClear
                            style={{ width: '100%' }}
                            loading={categories.length === 0}
                            notFoundContent={categories.length === 0 ? "Đang tải..." : "Không có danh mục"}
                        >
                            {Array.isArray(categories) && categories.length > 0 ?
                                categories.map(category => (
                                    <Option key={category.id} value={category.id}>
                                        {category.name}
                                    </Option>
                                )) :
                                <Option disabled value="">
                                    {categories.length === 0 ? "Đang tải danh mục..." : "Không có danh mục"}
                                </Option>
                            }
                        </Select>
                    </Col>
                    <Col span={3}>
                        <Select
                            placeholder="Chọn chợ"
                            value={selectedMarket}
                            onChange={handleMarketChange}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {Array.isArray(markets) && markets.map(market => (
                                <Option key={market.id} value={market.id}>
                                    {market.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={3}>
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
                    <Col span={3}>
                        <Select
                            placeholder="Lọc trạng thái"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Option value="Active">Hoạt động</Option>
                            <Option value="OutOfStock">Hết hàng</Option>
                            <Option value="Inactive">Đã xóa</Option>
                            <Option value="Suspended">Đình chỉ</Option>
                        </Select>
                    </Col>
                    <Col span={3}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            style={{ width: '100%' }}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>

                {/* Filter Status */}
                {(searchKeyword || selectedCategory || selectedStore || selectedMarket || selectedStatus !== null) && (
                    <Row style={{ marginBottom: 16 }}>
                        <Col span={24}>
                            <div style={{
                                padding: '8px 12px',
                                backgroundColor: '#f0f2f5',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}>
                                <Text strong>Bộ lọc đang áp dụng: </Text>
                                {searchKeyword && <Tag color="blue">Tìm kiếm: {searchKeyword}</Tag>}
                                {selectedCategory && <Tag color="green">Danh mục: {categories.find(c => c.id === selectedCategory)?.name}</Tag>}
                                {selectedMarket && <Tag color="orange">Chợ: {markets.find(m => m.id === selectedMarket)?.name}</Tag>}
                                {selectedStore && <Tag color="purple">Cửa hàng: {stores.find(s => s.id === selectedStore)?.name}</Tag>}
                                {selectedStatus !== null && (
                                    <Tag color="cyan">
                                        Trạng thái: {
                                            selectedStatus === 'Active' ? 'Hoạt động' :
                                            selectedStatus === 'OutOfStock' ? 'Hết hàng' :
                                            selectedStatus === 'Inactive' ? 'Đã xóa' :
                                            selectedStatus === 'Suspended' ? 'Đình chỉ' : 'Không xác định'
                                        }
                                    </Tag>
                                )}
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={handleRefresh}
                                    style={{ padding: '0 4px', height: 'auto' }}
                                >
                                    Xóa tất cả
                                </Button>
                            </div>
                        </Col>
                    </Row>
                )}

                {/* Statistics */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                                {statistics.total}
                            </div>
                            <div>Tổng sản phẩm</div>
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#52c41a' }}>
                                {statistics.active}
                            </div>
                            <div>Hoạt động</div>
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#faad14' }}>
                                {statistics.outOfStock}
                            </div>
                            <div>Hết hàng</div>
                        </Card>
                    </Col>
                    <Col span={5}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ff4d4f' }}>
                                {statistics.inactive}
                            </div>
                            <div>Đã xóa</div>
                        </Card>
                    </Col>
                    <Col span={5}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#722ed1' }}>
                                {statistics.suspended}
                            </div>
                            <div>Đình chỉ</div>
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
                                        <Text type="secondary"> /{selectedProduct.unitName || selectedProduct.unit || 'đơn vị'}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số lượng tối thiểu">
                                        {selectedProduct.minimumQuantity} {selectedProduct.unitName || selectedProduct.unit || 'đơn vị'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Lượt mua">
                                        {selectedProduct.purchaseCount || 0} lượt
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>

                        <Divider />

                        <Descriptions title="Thông tin chi tiết" column={2}>
                            <Descriptions.Item label="Cửa hàng">
                                <div>
                                    <ShopOutlined /> {selectedProduct.storeName || 'N/A'}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Chợ">
                                <div>
                                    <BankOutlined /> {selectedProduct.marketName || 'N/A'}
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
