import React, { useState } from 'react';
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
    LockOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logoGreen from "../../assets/image/logo-non.png";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Function to get menu items based on user role
    const getMenuItemsByRole = () => {
        const userRole = user?.role;
        console.log('AdminLayout - Current user role:', userRole);

        // Define all menu items
        const allMenuItems = {
            dashboard: {
                key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard',
            },
            users: {
                key: 'users', icon: <UserOutlined />, label: 'Quản lý người dùng', children: [
                    { key: '/admin/users', label: 'Danh sách người dùng' },
                    { key: '/admin/seller-register', label: 'Danh sách đăng ký bán hàng' },
                    { key: '/admin/proxy-register', label: 'Danh sách đăng ký người mua hộ' },
                ]
            },
            markets: {
                key: 'markets', icon: <BankOutlined />, label: 'Quản lý chợ', children: [
                    { key: '/admin/markets', label: 'Danh sách chợ' },
                    { key: '/admin/market-fees', label: 'Phí chợ' },
                    { key: '/admin/market-fee-types', label: 'Loại phí' },
                    { key: '/admin/market-rules', label: 'Quy định chợ' },
                ]
            },
            stores: {
                key: 'stores', icon: <ShopOutlined />, label: 'Quản lý cửa hàng', children: [
                    { key: '/admin/stores', label: 'Danh sách cửa hàng' },
                    { key: '/admin/stores/payment', label: 'Phí Thuê' },
                ]
            },
            products: {
                key: 'products', icon: <BoxPlotOutlined />, label: 'Quản lý sản phẩm', children: [
                    { key: '/admin/products', label: 'Danh sách sản phẩm' },
                    { key: '/admin/products/fast-bargain', label: 'Sản phẩm thương lượng' },
                ]
            },
            productUnits: {
                key: 'product-units', icon: <TagsOutlined />, label: 'Quản lý đơn vị sản phẩm', children: [
                    { key: '/admin/product-units', label: 'Danh sách đơn vị' }
                ]
            },
            categories: {
                key: 'categories', icon: <AppstoreOutlined />, label: 'Quản lý danh mục', children: [
                    { key: '/admin/categories', label: 'Danh mục' },
                    { key: '/admin/category-registrations', label: 'Đăng ký danh mục' },
                ]
            },
            orders: {
                key: 'orders', icon: <ShoppingCartOutlined />, label: 'Quản lý đơn hàng', children: [
                    { key: '/admin/orders', label: 'Tất cả đơn hàng' },
                    { key: '/admin/proxy-shopping', label: 'Đơn hàng mua hộ' },
                ]
            },
            content: {
                key: 'content', icon: <FileTextOutlined />, label: 'Quản lý nội dung', children: [
                    { key: '/admin/faqs', label: 'FAQ' },
                    { key: '/admin/platform-policies', label: 'Chính sách nền tảng' },
                ]
            },
            support: {
                key: 'support', icon: <CustomerServiceOutlined />, label: 'Hỗ trợ khách hàng', children: [
                    { key: '/admin/support-requests', label: 'Yêu cầu hỗ trợ' },
                    { key: '/admin/reports', label: 'Báo cáo vi phạm' },
                ]
            },
            analytics: {
                key: 'analytics', icon: <BarChartOutlined />, label: 'Báo cáo & Thống kê', children: [
                    { key: '/admin/analytics/users', label: 'Thống kê người dùng' },
                    { key: '/admin/analytics/market', label: 'Thống kê chợ' },
                    { key: '/admin/analytics/store', label: 'Thống kê cửa hàng' },
                    { key: '/admin/analytics/report', label: 'Thống kê báo cáo' },
                    { key: '/admin/analytics/product', label: 'Thống kê sản phẩm' },
                    { key: '/admin/analytics/order', label: 'Thống kê đơn hàng' },
                    { key: '/admin/analytics/revenue', label: 'Doanh thu' },
                ]
            }
        };

        // Role-based menu filtering
        switch (userRole) {
            case 'MMBH':
                // MMBH: quản lý chợ + danh mục + báo cáo thống kê
                return [
                    allMenuItems.dashboard,
                    allMenuItems.markets,
                    allMenuItems.categories,
                    allMenuItems.analytics
                ];

            case 'LGR':
                // LGR: quản lý nội dung + báo cáo thống kê
                return [
                    allMenuItems.dashboard,
                    allMenuItems.content,
                    allMenuItems.analytics
                ];

            case 'MS':
            default:
                // MS + Admin: tất cả menu (còn lại)
                return [
                    allMenuItems.dashboard,
                    allMenuItems.users,
                    allMenuItems.markets,
                    allMenuItems.stores,
                    allMenuItems.products,
                    allMenuItems.categories,
                    allMenuItems.productUnits,
                    allMenuItems.orders,
                    allMenuItems.content,
                    allMenuItems.support,
                    allMenuItems.analytics
                ];
        }
    };

    const menuItems = getMenuItemsByRole();

    const handleMenuClick = ({ key }) => navigate(key);

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ cá nhân',
            onClick: () => navigate('/admin/profile')
        },
        {
            key: 'change-password',
            icon: <LockOutlined />,
            label: 'Đổi mật khẩu',
            onClick: () => navigate('/admin/change-password')
        },
        // { 
        //     key: 'settings', 
        //     icon: <SettingOutlined />, 
        //     label: 'Cài đặt',
        //     onClick: () => navigate('/admin/system-settings')
        // },
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: logout
        },
    ];

    const getBreadcrumbItems = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const items = [{ title: 'Trang chủ', href: '/admin' }];

        // Mapping để chuyển đổi path thành tiếng Việt
        const breadcrumbMap = {
            'users': 'Quản lý người dùng',
            'products': 'Quản lý sản phẩm',
            'product-units': 'Quản lý đơn vị sản phẩm',
            'categories': 'Quản lý danh mục',
            'markets': 'Quản lý chợ',
            'stores': 'Quản lý cửa hàng',
            'orders': 'Quản lý đơn hàng',
            'content': 'Quản lý nội dung',
            'support': 'Hỗ trợ khách hàng',
            'analytics': 'Báo cáo & Thống kê',
            'proxy-shopping': 'Proxy Shopping',
            'fast-bargain': 'Khuyến mãi',
            'profile': 'Hồ sơ cá nhân',
            'edit': 'Chỉnh sửa',
            'change-password': 'Đổi mật khẩu',
            'system-settings': 'Cài đặt hệ thống'
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

    // Debug: Log current user role and menu items
    React.useEffect(() => {
        console.log('AdminLayout - User role:', user?.role);
        console.log('AdminLayout - Available menu items:', menuItems.map(item => item.key));
    }, [user?.role, menuItems]);

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
                        alt="LocalMart Admin"
                        style={{ height: 48, objectFit: 'contain', padding: collapsed ? 4 : 8 }}
                    />
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ background: '#607d8b' }}
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
                                        {user?.fullName || user?.username}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#888' }}>
                                        {user?.role === 'MMBH' ? 'Quản lý Chợ & Danh mục' :
                                            user?.role === 'LGR' ? 'Quản lý Nội dung' :
                                                user?.role === 'MS' ? 'Quản lý Hệ thống' : 'Quản trị viên'}
                                    </div>
                                </div>
                            </Space>
                        </Dropdown>

                    </Space>
                </Header>
                <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
                    <Breadcrumb items={getBreadcrumbItems()} style={{ marginBottom: 16 }} />
                    <div style={{ padding: 24, minHeight: 'calc(100vh - 112px)', background: '#fff', borderRadius: '8px' }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
