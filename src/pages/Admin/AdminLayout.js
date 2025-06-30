// src/pages/Admin/AdminLayout.js
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
    TeamOutlined,
    BankOutlined,
    TruckOutlined,
    CustomerServiceOutlined,
    BarChartOutlined,
    SafetyOutlined,
    QuestionCircleOutlined,
    BookOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng',
            children: [
                {
                    key: '/admin/users',
                    label: 'Danh sách người dùng',
                },
                {
                    key: '/admin/users/create',
                    label: 'Thêm người dùng',
                },
                {
                    key: '/admin/seller-registrations',
                    label: 'Đăng ký bán hàng',
                },
                {
                    key: '/admin/proxy-registrations',
                    label: 'Đăng ký người mua hộ',
                }
            ],
        },
        {
            key: 'markets',
            icon: <BankOutlined />,
            label: 'Quản lý chợ',
            children: [
                {
                    key: '/admin/markets',
                    label: 'Danh sách chợ',
                },
                {
                    key: '/admin/markets/create',
                    label: 'Thêm chợ mới',
                },
                {
                    key: '/admin/market-fees',
                    label: 'Phí chợ',
                },
                {
                    key: '/admin/market-rules',
                    label: 'Quy định chợ',
                }
            ],
        },
        {
            key: 'stores',
            icon: <ShopOutlined />,
            label: 'Quản lý cửa hàng',
            children: [
                {
                    key: '/admin/stores',
                    label: 'Danh sách cửa hàng',
                },
                {
                    key: '/admin/stores/pending',
                    label: 'Chờ duyệt',
                }
            ],
        },
        {
            key: 'products',
            icon: <AppstoreOutlined />,
            label: 'Quản lý sản phẩm',
            children: [
                {
                    key: '/admin/products',
                    label: 'Danh sách sản phẩm',
                },
                {
                    key: '/admin/categories',
                    label: 'Danh mục',
                },
                {
                    key: '/admin/category-registrations',
                    label: 'Đăng ký danh mục',
                },
                {
                    key: '/admin/product-units',
                    label: 'Đơn vị sản phẩm',
                }
            ],
        },
        {
            key: 'orders',
            icon: <ShoppingCartOutlined />,
            label: 'Quản lý đơn hàng',
            children: [
                {
                    key: '/admin/orders',
                    label: 'Danh sách đơn hàng',
                },
                {
                    key: '/admin/orders/disputes',
                    label: 'Tranh chấp',
                },
                {
                    key: '/admin/fast-bargains',
                    label: 'Mua nhanh',
                }
            ],
        },
        {
            key: 'payments',
            icon: <DollarOutlined />,
            label: 'Quản lý thanh toán',
            children: [
                {
                    key: '/admin/payments',
                    label: 'Giao dịch',
                },
                {
                    key: '/admin/market-fee-payments',
                    label: 'Thanh toán phí chợ',
                }
            ],
        },
        {
            key: 'content',
            icon: <FileTextOutlined />,
            label: 'Quản lý nội dung',
            children: [
                {
                    key: '/admin/faqs',
                    label: 'FAQ',
                },
                {
                    key: '/admin/policies',
                    label: 'Chính sách',
                },
                {
                    key: '/admin/notifications',
                    label: 'Thông báo',
                }
            ],
        },
        {
            key: 'support',
            icon: <CustomerServiceOutlined />,
            label: 'Hỗ trợ khách hàng',
            children: [
                {
                    key: '/admin/support-requests',
                    label: 'Yêu cầu hỗ trợ',
                },
                {
                    key: '/admin/chat',
                    label: 'Chat hỗ trợ',
                },
                {
                    key: '/admin/reports',
                    label: 'Báo cáo vi phạm',
                }
            ],
        },
        {
            key: 'analytics',
            icon: <BarChartOutlined />,
            label: 'Báo cáo & Thống kê',
            children: [
                {
                    key: '/admin/analytics/users',
                    label: 'Thống kê người dùng',
                },
                {
                    key: '/admin/analytics/revenue',
                    label: 'Doanh thu',
                },
                {
                    key: '/admin/analytics/products',
                    label: 'Sản phẩm',
                },
                {
                    key: '/admin/analytics/orders',
                    label: 'Đơn hàng',
                }
            ],
        },
        {
            key: 'system',
            icon: <SettingOutlined />,
            label: 'Hệ thống',
            children: [
                {
                    key: '/admin/licenses',
                    label: 'Giấy phép',
                },
                {
                    key: '/admin/devices',
                    label: 'Thiết bị',
                },
                {
                    key: '/admin/system-settings',
                    label: 'Cài đặt hệ thống',
                }
            ],
        }
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ cá nhân',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: logout,
        },
    ];

    const getBreadcrumbItems = () => {
        const pathSegments = location.pathname.split('/').filter(segment => segment);
        const breadcrumbItems = [
            {
                title: 'Trang chủ',
                href: '/admin',
            }
        ];

        if (pathSegments.length > 1) {
            pathSegments.slice(1).forEach((segment, index) => {
                const path = '/' + pathSegments.slice(0, index + 2).join('/');
                breadcrumbItems.push({
                    title: segment.charAt(0).toUpperCase() + segment.slice(1),
                    href: path,
                });
            });
        }

        return breadcrumbItems;
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div style={{
                    height: '64px',
                    margin: '16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {!collapsed ? (
                        <Title level={4} style={{ color: 'white', margin: 0 }}>
                            LocalMart Admin
                        </Title>
                    ) : (
                        <Title level={4} style={{ color: 'white', margin: 0 }}>
                            LM
                        </Title>
                    )}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
                <Header style={{
                    padding: '0 24px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />
                    </div>

                    <Space size="large">
                        <Badge count={5}>
                            <Button
                                type="text"
                                icon={<BellOutlined />}
                                size="large"
                                onClick={() => navigate('/admin/notifications')}
                            />
                        </Badge>

                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                        >
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar icon={<UserOutlined />} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{user?.fullName || user?.username}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Quản trị viên</div>
                                </div>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <Breadcrumb items={getBreadcrumbItems()} />
                    </div>
                    <div style={{
                        padding: 24,
                        minHeight: 'calc(100vh - 112px)',
                        background: '#fff',
                        borderRadius: '8px'
                    }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
