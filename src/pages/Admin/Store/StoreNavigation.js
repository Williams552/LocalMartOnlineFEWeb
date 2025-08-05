// src/pages/Admin/Store/StoreNavigation.js
import React from 'react';
import { Menu, Badge } from 'antd';
import { 
    ShopOutlined, 
    DashboardOutlined, 
    BarChartOutlined,
    TeamOutlined,
    StarOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const StoreNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/admin/stores',
            icon: <ShopOutlined />,
            label: 'Quản lý cửa hàng',
            onClick: () => navigate('/admin/stores')
        },
      
        {
            key: '/admin/stores/payment',
            icon: <TeamOutlined />,
            label: 'Phí thuê',
            onClick: () => navigate('/admin/stores/payment')
        }
    ];

    const renderMenuItem = (item) => {
        if (item.badge) {
            return (
                <Badge count={item.badge.count} status={item.badge.status} offset={[10, 0]}>
                    <span>{item.label}</span>
                </Badge>
            );
        }
        return item.label;
    };

    return (
        <div style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
            <Menu
                mode="horizontal"
                selectedKeys={[location.pathname]}
                style={{ borderBottom: 'none' }}
            >
                {menuItems.map(item => (
                    <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                        {renderMenuItem(item)}
                    </Menu.Item>
                ))}
            </Menu>
        </div>
    );
};

export default StoreNavigation;
