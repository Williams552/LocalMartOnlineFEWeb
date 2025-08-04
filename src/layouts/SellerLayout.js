import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Layout,
    Menu,
    Button,
    Avatar,
    Dropdown,
    Space,
    Typography,
    Badge,
    Breadcrumb
} from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    UserOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    FileTextOutlined,
    SettingOutlined,
    LogoutOutlined,
    BellOutlined,
    AppstoreOutlined,
    BankOutlined,
    CustomerServiceOutlined,
    BarChartOutlined,
    DollarOutlined,
    TagsOutlined,
    BoxPlotOutlined,
    CreditCardOutlined,
    TeamOutlined,
    TransactionOutlined,
    SafetyCertificateOutlined,
    LockOutlined,
    UnlockOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useAuth } from "../hooks/useAuth";
import useStoreStatus from "../hooks/useStoreStatus";
import NotificationBell from "../components/Seller/NotificationBell";
import storeService from "../services/storeService";
import marketService from "../services/marketService";
import logoGreen from "../assets/image/logo-non.png";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const SellerLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [storeInfoData, setStoreInfo] = useState(null);
    const [marketInfo, setMarketInfo] = useState(null);
    const [marketLoading, setMarketLoading] = useState(true);

    // Use authentication context like in Header
    const { user, logout } = useAuth();
    
    // Use store status hook to check if store is suspended
    const { storeStatus, storeInfo, isLoading: storeLoading, isStoreSuspended } = useStoreStatus();

    useEffect(() => {
        // Get user info from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserInfo(user);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        // Fetch store status
        fetchStoreStatus();
    }, []);

    // Fetch store status
    const fetchStoreStatus = async () => {
        try {
            const result = await storeService.getMyStore();
            
            if (result.success && result.data) {
                // Check status - backend returns "Open" or "Closed"
                const storeIsOpen = result.data.status === 'Open';
                setIsStoreOpen(storeIsOpen);
                
                // Store the storeInfo for later use in toggle
                setStoreInfo(result.data);

                // Fetch market info if marketId exists
                if (result.data.marketId) {
                    await fetchMarketInfo(result.data.marketId);
                }
            }
        } catch (error) {
            console.error('❌ Error fetching store status:', error);
        } finally {
            setMarketLoading(false);
        }
    };

    // Fetch market information
    const fetchMarketInfo = async (marketId) => {
        try {
            const result = await marketService.getMarketById(marketId);
            
            if (result) {
                console.log('📍 Market Info Data:', result); // Debug để xem cấu trúc dữ liệu
                setMarketInfo(result);
            }
        } catch (error) {
            console.error('❌ Error fetching market info:', error);
        }
    };

    // Handle toggle store status
    const handleToggleStore = async () => {
        
        let storeId;
        
        if (!storeInfoData || !storeInfoData.id) {
            // Try to get storeId from store info
            try {
                const result = await storeService.getMyStore();
                
                if (!result.success || !result.data) {
                    console.error('❌ SellerLayout - No data in API response');
                    toast.error('Không tìm thấy thông tin cửa hàng');
                    return;
                }
                
                // Use storeId (id field in response)
                storeId = result.data.id;
                
                if (!storeId) {
                    console.error('❌ SellerLayout - No storeId found in API response, available fields:', Object.keys(result.data));
                    toast.error('Không tìm thấy Store ID trong thông tin cửa hàng');
                    return;
                }
            } catch (error) {
                console.error('❌ SellerLayout - Error fetching store info:', error);
                toast.error('Không thể lấy thông tin cửa hàng');
                return;
            }
        } else {
            storeId = storeInfoData.id;
        }

        setToggleLoading(true);
        try {
            const result = await storeService.toggleStoreStatus(storeId);
            
            if (result.success) {
                // Toggle local state
                const newStoreStatus = !isStoreOpen;
                setIsStoreOpen(newStoreStatus);
                
                // Update storeInfoData with new status
                if (storeInfoData) {
                    setStoreInfo({
                        ...storeInfoData,
                        status: newStoreStatus ? 'Open' : 'Closed'
                    });
                }
                
                toast.success(result.message || `Cửa hàng đã được ${newStoreStatus ? 'mở' : 'đóng'}`);
            } else {
                console.error('❌ SellerLayout - Toggle failed:', result.message);
                toast.error(result.message || 'Không thể thay đổi trạng thái cửa hàng');
            }
        } catch (error) {
            console.error('❌ SellerLayout - Exception during toggle:', error);
            toast.error('Có lỗi xảy ra khi thay đổi trạng thái cửa hàng');
        } finally {
            setToggleLoading(false);
        }
    };

    // Menu items for sidebar - hiển thị tất cả items mở rộng
    const menuItems = [
        // Sản phẩm
        {
            key: '/seller/products',
            icon: <BoxPlotOutlined />,
            label: 'Danh sách sản phẩm',
        },
        // Đơn hàng
        {
            key: '/seller/orders',
            icon: <ShoppingCartOutlined />,
            label: 'Tất cả đơn hàng',
        },
        {
            key: '/seller/fast-bargains',
            icon: <TransactionOutlined />,
            label: 'Thương lượng nhanh',
        },
        // Khách hàng
        // {
        //     key: '/seller/customers',
        //     icon: <TeamOutlined />,
        //     label: 'Danh sách khách hàng',
        // },
        // {
        //     key: '/seller/personal-shopping',
        //     icon: <TeamOutlined />,
        //     label: 'Mua hộ cá nhân',
        // },
        // Thống kê
        {
            key: '/seller/analytics',
            icon: <BarChartOutlined />,
            label: 'Thống kê bán hàng',
        },
        // Tài chính
        {
            key: '/seller/payments',
            icon: <CreditCardOutlined />,
            label: 'Thanh toán',
        },
        {
            key: '/seller/market-fees',
            icon: <DollarOutlined />,
            label: 'Phí chợ',
        },
        // Nội dung
        {
            key: '/seller/notifications',
            icon: <BellOutlined />,
            label: 'Thông báo',
        },
        {
            key: '/seller/user-reports',
            icon: <FileTextOutlined />,
            label: 'Báo cáo người dùng',
        },
        // Cài đặt
        {
            key: '/seller/profile',
            icon: <ShopOutlined />,
            label: 'Hồ sơ cửa hàng',
        },
        {
            key: '/seller/licenses',
            icon: <SafetyCertificateOutlined />,
            label: 'Giấy phép',
        },
        {
            key: '/seller/market-rules',
            icon: <FileTextOutlined />,
            label: 'Quy định chợ',
        },
    ];

    const handleMenuClick = ({ key }) => {
        // Navigate to the selected page
        navigate(key);
    };

    // User dropdown menu items
    const userMenuItems = [
        { 
            key: 'home', 
            icon: <HomeOutlined />, 
            label: 'Về trang chủ',
            onClick: () => navigate('/') 
        },
        { 
            key: 'support', 
            icon: <CustomerServiceOutlined />, 
            label: 'Hỗ trợ',
            onClick: () => navigate('/support') 
        },
        { type: 'divider' },
        { 
            key: 'logout', 
            icon: <LogoutOutlined />, 
            label: 'Đăng xuất',
            onClick: () => {
                logout();
                navigate('/login');
            }
        },
    ];

    // Breadcrumb items
    const getBreadcrumbItems = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const items = [{ title: 'Dashboard', href: '/seller/products' }];

        // Mapping để chuyển đổi path thành tiếng Việt
        const breadcrumbMap = {
            'products': 'Sản phẩm',
            'orders': 'Đơn hàng',
            'customers': 'Khách hàng',
            'analytics': 'Thống kê',
            'payments': 'Thanh toán',
            'notifications': 'Thông báo',
            'profile': 'Hồ sơ cửa hàng',
            'licenses': 'Giấy phép',
            'market-rules': 'Quy định chợ',
            'market-fees': 'Phí chợ',
            'fast-bargains': 'Thương lượng nhanh',
            'personal-shopping': 'Mua hộ cá nhân',
            'user-reports': 'Báo cáo người dùng',
            'quick-actions': 'Hành động nhanh',
            'add': 'Thêm mới'
        };

        pathSegments.slice(1).forEach((segment, index) => {
            const title = breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
            items.push({
                title,
                href: '/' + pathSegments.slice(0, index + 2).join('/'),
            });
        });
        return items;
    };

    // Show loading state while checking store status
    if (storeLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-4xl text-supply-primary mx-auto mb-4">⟳</div>
                    <p className="text-gray-600">Đang kiểm tra trạng thái cửa hàng...</p>
                </div>
            </div>
        );
    }

    // If store is suspended, don't render anything (redirect happens in hook)
    if (isStoreSuspended) {
        return null;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{
                    background: '#607d8b',
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                    <img
                        src={logoGreen}
                        alt="LocalMart Seller"
                        style={{ height: 48, objectFit: 'contain', padding: collapsed ? 4 : 8 }}
                    />
                </div>

                {/* Store Status Information */}
                {!collapsed && (
                    <div style={{ padding: '16px', borderBottom: '1px solid #455a64', background: '#546e7a' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    borderRadius: '50%', 
                                    backgroundColor: isStoreOpen ? '#4caf50' : '#f44336',
                                    marginRight: '8px'
                                }}></div>
                                <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                                    Cửa hàng {isStoreOpen ? 'đang mở' : 'đã đóng'}
                                </span>
                            </div>
                            
                            {/* Toggle Store Button */}
                            <button
                                onClick={handleToggleStore}
                                disabled={toggleLoading}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    backgroundColor: isStoreOpen ? '#f44336' : '#4caf50',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: toggleLoading ? 'not-allowed' : 'pointer',
                                    opacity: toggleLoading ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                {toggleLoading ? (
                                    <>⟳ Đang xử lý...</>
                                ) : (
                                    <>
                                        {isStoreOpen ? '🔒' : '🔓'}
                                        {isStoreOpen ? 'Đóng cửa hàng' : 'Mở cửa hàng'}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Market Information */}
                        {marketInfo && (
                            <div style={{ fontSize: '12px', color: '#cfd8dc' }}>
                                <div style={{ marginBottom: '4px' }}>
                                    <strong style={{ color: 'white' }}>{marketInfo.name}</strong>
                                </div>
                                <div style={{ marginBottom: '4px' }}>
                                    {marketInfo.address}
                                </div>
                                
                                {/* Market Operating Hours */}
                                {(marketInfo.openTime && marketInfo.closeTime) || 
                                 (marketInfo.openingTime && marketInfo.closingTime) ||
                                 (marketInfo.operatingHours) ? (
                                    <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Giờ hoạt động:</span>
                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                            {marketInfo.operatingHours || 
                                             `${marketInfo.openTime || marketInfo.openingTime} - ${marketInfo.closeTime || marketInfo.closingTime}` ||
                                             '06:00 - 22:00'}
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Giờ hoạt động:</span>
                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                            06:00 - 22:00
                                        </span>
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Trạng thái chợ:</span>
                                    <span style={{
                                        backgroundColor: marketInfo.status === 'Active' ? '#4caf50' : '#f44336',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '10px'
                                    }}>
                                        {marketInfo.status === 'Active' ? 'Hoạt động' : 'Tạm ngưng'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Loading Market Info */}
                        {marketLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', color: '#cfd8dc', fontSize: '12px' }}>
                                <div style={{ marginRight: '8px' }}>⟳</div>
                                <span>Đang tải thông tin chợ...</span>
                            </div>
                        )}
                    </div>
                )}

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ background: '#607d8b' }}
                    // Hiển thị tất cả items mở rộng
                    defaultOpenKeys={['products', 'orders', 'customers', 'analytics', 'finance', 'content', 'settings']}
                    inlineIndent={16}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    <Space size="large">
                        <Badge count={5}>
                            <Button type="text" icon={<BellOutlined />} onClick={() => navigate('/seller/notifications')} />
                        </Badge>
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Space
                                style={{
                                    cursor: 'pointer',
                                    alignItems: 'center',
                                    gap: 8,
                                    minWidth: 160,
                                }}
                            >
                                <Avatar icon={<UserOutlined />} size="large" />
                                <div style={{ lineHeight: 1.2 }}>
                                    <div style={{
                                        fontWeight: 600,
                                        fontSize: 14,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: 120
                                    }}>
                                        {user?.fullName || user?.username || userInfo?.fullName}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#888' }}>
                                        Người bán
                                    </div>
                                </div>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>
                <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
                    <Breadcrumb items={getBreadcrumbItems()} style={{ marginBottom: 16 }} />
                    <div style={{ padding: 24, minHeight: 'calc(100vh - 112px)', background: '#fff', borderRadius: '8px' }}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default SellerLayout;
