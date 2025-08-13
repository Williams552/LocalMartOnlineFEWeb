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
    Form,
    message,
    Drawer,
    Descriptions,
    Row,
    Col,
    Statistic,
    Avatar,
    Rate,
    Tooltip,
    InputNumber
} from 'antd';
import {
    ShopOutlined,
    SearchOutlined,
    ExportOutlined,
    EyeOutlined,
    EditOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    StopOutlined,
    PlayCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import storeService from '../../../services/storeService';
import marketService from '../../../services/marketService';
import userService from '../../../services/userService';
import reviewService from '../../../services/reviewService';
import { ReviewList } from '../../../components/Review';
import StoreNavigation from './StoreNavigation';

const { Search } = Input;
const { Option } = Select;

const StoreManagement = () => {
    const [stores, setStores] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [sellers, setSellers] = useState({}); // Cache for seller information
    const [storeRatings, setStoreRatings] = useState({}); // Cache for store ratings
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
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [statistics, setStatistics] = useState({
        totalStores: 0,
        openStores: 0,
        closedStores: 0,
        suspendedStores: 0
    });

    const storeStatuses = [
        { value: 'Open', label: 'Đang mở', color: 'green' },
        { value: 'Closed', label: 'Đã đóng', color: 'red' },
        { value: 'Suspended', label: 'Tạm ngưng', color: 'orange' }
    ];

    useEffect(() => {
        loadInitialStores();
        loadMarkets();
        loadStatistics(); // Load statistics separately
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

    // Load store ratings information for stores
    const loadStoreRatings = async (storesData) => {
        try {
            console.log('📊 Loading store ratings for stores:', storesData.length);
            const uniqueStoreIds = [...new Set(storesData.map(store => store.id))];

            const ratingPromises = uniqueStoreIds.map(async (storeId) => {
                if (storeRatings[storeId]) {
                    return { storeId, rating: storeRatings[storeId] };
                }
                try {
                    const response = await reviewService.getReviewsForTarget('Store', storeId);
                    const ratingData = {
                        averageRating: response.averageRating || 0,
                        reviewCount: response.totalCount || 0
                    };
                    console.log(`📊 Store ${storeId} rating:`, ratingData);
                    return { storeId, rating: ratingData };
                } catch (error) {
                    console.error(`Error loading rating for store ${storeId}:`, error);
                    return {
                        storeId,
                        rating: { averageRating: 0, reviewCount: 0 }
                    };
                }
            });

            const ratingResults = await Promise.all(ratingPromises);
            const newStoreRatings = { ...storeRatings };

            ratingResults.forEach(({ storeId, rating }) => {
                if (rating) {
                    newStoreRatings[storeId] = rating;
                }
            });

            console.log('📊 Updated store ratings cache:', newStoreRatings);
            setStoreRatings(newStoreRatings);
        } catch (error) {
            console.error('Error loading store ratings:', error);
        }
    };

    // Load seller information for stores
    const loadSellersInfo = async (storesData) => {
        try {
            const uniqueSellerIds = [...new Set(storesData.map(store => store.sellerId))];
            const sellerPromises = uniqueSellerIds.map(async (sellerId) => {
                if (sellers[sellerId]) {
                    return { sellerId, seller: sellers[sellerId] };
                }
                try {
                    const response = await userService.getUserById(sellerId);
                    return {
                        sellerId,
                        seller: response.success ? response.data : null
                    };
                } catch (error) {
                    console.error(`Error loading seller ${sellerId}:`, error);
                    return { sellerId, seller: null };
                }
            });

            const sellerResults = await Promise.all(sellerPromises);
            const newSellers = { ...sellers };

            sellerResults.forEach(({ sellerId, seller }) => {
                if (seller) {
                    newSellers[sellerId] = seller;
                }
            });

            setSellers(newSellers);
        } catch (error) {
            console.error('Error loading sellers info:', error);
        }
    };

    // Load statistics from all stores
    const loadStatistics = async () => {
        try {
            console.log('📊 StoreManagement - Loading statistics...');

            // Get all stores without pagination for statistics
            const allStoresResponse = await storeService.getAllStores({
                page: 1,
                pageSize: 1000 // Get a large number to get all
            });

            let allStoresData = [];

            if (allStoresResponse && allStoresResponse.items) {
                allStoresData = allStoresResponse.items;
            } else if (allStoresResponse && allStoresResponse.success && allStoresResponse.data) {
                if (Array.isArray(allStoresResponse.data)) {
                    allStoresData = allStoresResponse.data;
                } else if (allStoresResponse.data.items && Array.isArray(allStoresResponse.data.items)) {
                    allStoresData = allStoresResponse.data.items;
                }
            } else if (Array.isArray(allStoresResponse)) {
                allStoresData = allStoresResponse;
            }

            console.log('📊 StoreManagement - All stores for statistics:', allStoresData);

            // Calculate statistics from all stores
            const stats = {
                totalStores: allStoresData.length,
                openStores: allStoresData.filter(s => s.status === 'Open').length,
                closedStores: allStoresData.filter(s => s.status === 'Closed').length,
                suspendedStores: allStoresData.filter(s => s.status === 'Suspended').length
            };

            console.log('📊 StoreManagement - Calculated statistics:', stats);
            setStatistics(stats);
        } catch (error) {
            console.error('❌ StoreManagement - Error loading statistics:', error);
            // Don't show error message for statistics, just log it
        }
    };

    const loadInitialStores = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                pageSize: pagination.pageSize
            };

            console.log('🔍 StoreManagement - Loading initial stores with params:', params);
            const response = await storeService.getAllStores(params);
            console.log('🔍 StoreManagement - API response:', response);

            // Handle response structure from storeService.getAllStores()
            let storesData = [];
            let total = 0;

            if (response && response.items) {
                // Response from storeService returns { items, totalCount, page, pageSize }
                storesData = response.items;
                total = response.totalCount || 0;
            } else if (response && response.success && response.data) {
                // Fallback for different response structure
                if (Array.isArray(response.data)) {
                    storesData = response.data;
                    total = response.total || response.data.length;
                } else if (response.data.items && Array.isArray(response.data.items)) {
                    storesData = response.data.items;
                    total = response.data.totalCount || response.data.total || response.data.items.length;
                }
            } else if (Array.isArray(response)) {
                // Direct array response
                storesData = response;
                total = response.length;
            }

            console.log('🔍 Processed stores data:', { storesData, total });
            setStores(storesData);
            setPagination(prev => ({
                ...prev,
                total
            }));

            // Load seller information for the stores
            if (storesData.length > 0) {
                await loadSellersInfo(storesData);
                await loadStoreRatings(storesData);
            }
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
                pageSize: pagination.pageSize
            };

            console.log('🔄 StoreManagement - Refreshing all stores');
            const response = await storeService.getAllStores(params);

            // Handle response structure from storeService.getAllStores()
            let storesData = [];
            let total = 0;

            if (response && response.items) {
                // Response from storeService returns { items, totalCount, page, pageSize }
                storesData = response.items;
                total = response.totalCount || 0;
            } else if (response && response.success && response.data) {
                // Fallback for different response structure
                if (Array.isArray(response.data)) {
                    storesData = response.data;
                    total = response.total || response.data.length;
                } else if (response.data.items && Array.isArray(response.data.items)) {
                    storesData = response.data.items;
                    total = response.data.totalCount || response.data.total || response.data.items.length;
                }
            } else if (Array.isArray(response)) {
                // Direct array response
                storesData = response;
                total = response.length;
            }

            console.log('🔄 Processed refresh stores data:', { storesData, total });
            setStores(storesData);
            setPagination(prev => ({
                ...prev,
                current: 1,
                total
            }));

            // Load seller information for the stores
            if (storesData.length > 0) {
                await loadSellersInfo(storesData);
                await loadStoreRatings(storesData);
            }
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

            // Handle search response - storeService returns { items, totalCount, page, pageSize }
            let storesData = [];
            let total = 0;

            if (response && response.items) {
                storesData = response.items;
                total = response.totalCount || 0;
            } else if (response && response.success && response.data) {
                // Fallback for different response structure
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

            console.log('🔍 Processed search data:', { storesData, total });
            setStores(storesData);
            setPagination(prev => ({
                ...prev,
                current: 1,
                total
            }));
            setFilters(prev => ({ ...prev, search: value }));

            // Load seller information for the stores
            if (storesData.length > 0) {
                await loadSellersInfo(storesData);
                await loadStoreRatings(storesData);
            }

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

            // Handle filter response - storeService returns { items, totalCount, page, pageSize }
            let storesData = [];
            let total = 0;

            if (response && response.items) {
                storesData = response.items;
                total = response.totalCount || 0;
            } else if (response?.success && response.data) {
                if (Array.isArray(response.data)) {
                    storesData = response.data;
                    total = response.total || response.data.length;
                } else if (Array.isArray(response.data.items)) {
                    storesData = response.data.items;
                    total = response.data.totalCount || response.data.total || response.data.items.length;
                }
            }

            console.log('🔎 Processed filter data:', { storesData, total });
            setStores(storesData);
            setPagination(prev => ({
                ...prev,
                total,
                current: 1
            }));

            // Load seller information for the stores
            if (storesData.length > 0) {
                await loadSellersInfo(storesData);
                await loadStoreRatings(storesData);
            }
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
        let suspendReason = '';

        Modal.confirm({
            title: 'Tạm ngưng cửa hàng',
            content: (
                <div>
                    <p>Bạn có chắc chắn muốn tạm ngưng cửa hàng này?</p>
                    <Input.TextArea
                        placeholder="Nhập lý do tạm ngưng..."
                        rows={3}
                        onChange={(e) => { suspendReason = e.target.value; }}
                    />
                </div>
            ),
            onOk: async () => {
                try {
                    console.log('🚫 Suspending store:', storeId, 'with reason:', suspendReason);
                    await storeService.suspendStore(storeId, suspendReason);
                    message.success('Tạm ngưng cửa hàng thành công');
                    loadStores();
                    loadStatistics(); // Reload statistics after suspend
                } catch (error) {
                    console.error('❌ Error suspending store:', error);
                    message.error(`Lỗi khi tạm ngưng cửa hàng: ${error.message}`);
                }
            },
            okText: 'Tạm ngưng',
            cancelText: 'Hủy',
            okType: 'danger'
        });
    };

    const handleReactivateStore = async (storeId) => {
        Modal.confirm({
            title: 'Kích hoạt lại cửa hàng',
            content: 'Bạn có chắc chắn muốn kích hoạt lại cửa hàng này?',
            onOk: async () => {
                try {
                    console.log('✅ Reactivating store:', storeId);
                    await storeService.reactivateStore(storeId);
                    message.success('Kích hoạt lại cửa hàng thành công');
                    loadStores();
                    loadStatistics(); // Reload statistics after reactivate
                } catch (error) {
                    console.error('❌ Error reactivating store:', error);
                    message.error(`Lỗi khi kích hoạt lại cửa hàng: ${error.message}`);
                }
            },
            okText: 'Kích hoạt',
            cancelText: 'Hủy',
            okType: 'primary'
        });
    };

    const handleEditStore = (store) => {
        setSelectedStore(store);
        setEditMode(true);
        setModalVisible(true);
        form.setFieldsValue({
            marketId: store.marketId
        });
    };

    const handleUpdateStore = async () => {
        try {
            const values = await form.validateFields();
            console.log('📝 Updating store market location:', selectedStore.id, 'to market:', values.marketId);
            console.log('📝 Current marketId:', selectedStore.marketId);
            console.log('📝 New marketId:', values.marketId);

            // Kiểm tra nếu marketId không thay đổi
            if (selectedStore.marketId === values.marketId) {
                message.warning('Vị trí chợ chưa thay đổi');
                return;
            }

            // Kiểm tra dữ liệu bắt buộc
            if (!selectedStore.id) {
                message.error('Không tìm thấy ID cửa hàng');
                return;
            }

            if (!values.marketId) {
                message.error('Vui lòng chọn chợ');
                return;
            }

            // CHỈ GỬI MARKETID - đúng theo yêu cầu API
            const updateData = {
                marketId: values.marketId
            };

            console.log('📝 Sending update data (only marketId):', updateData);

            // Gọi API với chỉ marketId
            const response = await storeService.updateStore(selectedStore.id, updateData);
            console.log('📝 Update response:', response);

            if (response && response.success) {
                message.success(response.message || 'Cập nhật vị trí chợ thành công');
                setModalVisible(false);
                setEditMode(false);
                form.resetFields();

                // Reload data to see changes
                await loadStores();
                await loadStatistics();
            } else {
                const errorMessage = response?.message || 'Cập nhật thất bại - không có thông tin lỗi';
                console.error('❌ Update failed with message:', errorMessage);
                message.error(errorMessage);
            }
        } catch (error) {
            console.error('❌ Error in handleUpdateStore:', error);

            // Handle validation errors vs API errors
            if (error.errorFields) {
                message.error('Vui lòng kiểm tra lại thông tin trong form');
            } else {
                message.error(`Lỗi khi cập nhật: ${error.message || 'Lỗi không xác định'}`);
            }
        }
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        setEditMode(false);
        form.resetFields();
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

            // Handle response - storeService returns { items, totalCount, page, pageSize }
            let storesData = [];
            let total = 0;

            if (response && response.items) {
                storesData = response.items;
                total = response.totalCount || 0;
            } else if (response && response.success && response.data) {
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

            console.log('🌍 Processed nearby stores data:', { storesData, total });
            setStores(storesData);
            setPagination(prev => ({
                ...prev,
                current: 1,
                total
            }));

            // Load seller information for the stores
            if (storesData.length > 0) {
                await loadSellersInfo(storesData);
                await loadStoreRatings(storesData);
            }

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

    const getSellerName = (sellerId) => {
        const seller = sellers[sellerId];
        return seller ? (seller.fullName || seller.username || 'Không xác định') : 'Đang tải...';
    };

    const getStoreRating = (storeId) => {
        const ratingData = storeRatings[storeId];
        return ratingData || { averageRating: 0, reviewCount: 0 };
    };

    const columns = [
        {
            title: 'Cửa hàng',
            dataIndex: 'name',
            key: 'name',
            width: 180,
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
            title: 'Người bán',
            dataIndex: 'sellerId',
            key: 'sellerId',
            width: 150,
            ellipsis: true,
            render: (sellerId) => {
                const sellerName = getSellerName(sellerId);
                return (
                    <Tooltip title={sellerName}>
                        <div>
                            <UserOutlined /> {sellerName}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Chợ',
            dataIndex: 'marketId',
            key: 'marketId',
            width: 130,
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
            width: 180,
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
            width: 110,
            align: 'center',
            render: (rating, record) => {
                const storeRating = getStoreRating(record.id);
                return (
                    <div style={{ textAlign: 'center' }}>
                        <Rate
                            disabled
                            allowHalf
                            value={storeRating.averageRating || 0}
                            style={{ fontSize: '12px' }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                            {(storeRating.averageRating || 0).toFixed(1)} ({storeRating.reviewCount || 0})
                        </div>
                    </div>
                );
            },
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
                    <Tooltip title="Cập nhật vị trí chợ">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditStore(record)}
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
                                value={statistics.totalStores}
                                prefix={<ShopOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đang hoạt động"
                                value={statistics.openStores}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đã đóng"
                                value={statistics.closedStores}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tạm ngưng"
                                value={statistics.suspendedStores}
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
                            <Button onClick={() => {
                                loadStores();
                                loadStatistics(); // Reload statistics when refresh
                            }}>Làm mới</Button>
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
                                <Descriptions.Item label="Người bán">
                                    {getSellerName(selectedStore.sellerId)}
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
                            </div>

                            {/* Store Reviews Section */}
                            <div style={{ marginTop: '24px' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
                                    Đánh giá của khách hàng
                                </h4>
                                <div style={{
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '6px',
                                    padding: '16px',
                                    backgroundColor: '#fafafa'
                                }}>
                                    <ReviewList
                                        targetType="Store"
                                        targetId={selectedStore.id}
                                        showFilters={false}
                                        maxHeight="350px"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </Drawer>

                {/* Edit Store Modal */}
                <Modal
                    title="Cập nhật vị trí chợ"
                    open={modalVisible}
                    onOk={handleUpdateStore}
                    onCancel={handleModalCancel}
                    okText="Cập nhật"
                    cancelText="Hủy"
                    width={400}
                >
                    <Form
                        form={form}
                        layout="vertical"
                    >
                        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Cửa hàng hiện tại:</h4>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedStore?.name}</p>
                        </div>

                        <Form.Item
                            name="marketId"
                            label="Chọn chợ mới"
                            rules={[{ required: true, message: 'Vui lòng chọn chợ' }]}
                        >
                            <Select placeholder="Chọn chợ" size="large">
                                {markets.map(market => (
                                    <Select.Option key={market.id} value={market.id}>
                                        {market.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default StoreManagement;
