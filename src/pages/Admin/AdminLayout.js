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

    const menuItems = [
        {
            key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard',
        },
        {
            key: 'users', icon: <UserOutlined />, label: 'Quản lý người dùng', children: [
                { key: '/admin/users', label: 'Danh sách người dùng' },
                { key: '/admin/seller-register', label: 'Danh sách đăng ký bán hàng' },
                { key: '/admin/proxy-register', label: 'Danh sách đăng ký người mua hộ' },
            ]
        },
        {
            key: 'markets', icon: <BankOutlined />, label: 'Quản lý chợ', children: [
                { key: '/admin/markets', label: 'Danh sách chợ' },
                { key: '/admin/market-fees', label: 'Phí chợ' },
                { key: '/admin/market-fee-types', label: 'Loại phí' },
                { key: '/admin/market-rules', label: 'Quy định chợ' },
            ]
        },
        {
            key: 'stores', icon: <ShopOutlined />, label: 'Quản lý cửa hàng', children: [
                { key: '/admin/stores', label: 'Danh sách cửa hàng' },
                { key: '/admin/stores/payment', label: 'Phí Thuê' },

            ]
        },
        {
            key: 'products', icon: <BoxPlotOutlined />, label: 'Quản lý sản phẩm', children: [
                { key: '/admin/products', label: 'Danh sách sản phẩm' },
                // { key: '/admin/products/pending', label: 'Sản phẩm chờ duyệt' },
                { key: '/admin/products/fast-bargain', label: 'Sản phẩm thương lượng' },
            ]
        },
        {
            key: 'product-units', icon: <TagsOutlined />, label: 'Quản lý đơn vị sản phẩm', children: [
                { key: '/admin/product-units', label: 'Danh sách đơn vị' }
            ]
        },
        {
            key: 'categories', icon: <AppstoreOutlined />, label: 'Quản lý danh mục', children: [
                { key: '/admin/categories', label: 'Danh mục' },
            ]
        },
        {
            key: 'orders', icon: <ShoppingCartOutlined />, label: 'Quản lý đơn hàng', children: [
                { key: '/admin/orders', label: 'Tất cả đơn hàng' },
                { key: '/admin/proxy-shopping', label: 'Đơn hàng đi chợ giùm' },
            ]
        },
        {
            key: 'content', icon: <FileTextOutlined />, label: 'Quản lý nội dung', children: [
                { key: '/admin/faqs', label: 'FAQ' },
                // { key: '/admin/notifications', label: 'Thông báo' },
            ]
        },
        {
            key: 'support', icon: <CustomerServiceOutlined />, label: 'Hỗ trợ khách hàng', children: [
                { key: '/admin/support-requests', label: 'Yêu cầu hỗ trợ' },
                // { key: '/admin/chat', label: 'Chat hỗ trợ' },
                { key: '/admin/reports', label: 'Báo cáo vi phạm' },
            ]
        },
        {
            key: 'analytics', icon: <BarChartOutlined />, label: 'Báo cáo & Thống kê', children: [
                { key: '/admin/analytics/users', label: 'Thống kê người dùng' },
                { key: '/admin/analytics/revenue', label: 'Doanh thu' }
            ]
        },
        {
            key: 'demo', icon: <BoxPlotOutlined />, label: 'Demo & Test', children: [
                { key: '/admin/demo/proxy-shopping', label: 'Proxy Shopping Demo' },
            ]
        },

    ];

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
            'system-settings': 'Cài đặt hệ thống',
            'demo': 'Demo Selector'
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
                                        Quản trị viên
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
