// src/pages/Admin/Market/MarketNavigation.js
import React from 'react';
import { Menu, Badge } from 'antd';
import { 
    ShopOutlined, 
    DashboardOutlined, 
    DollarOutlined, 
    TagOutlined,
    FileTextOutlined,
    BarChartOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const MarketNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
       
        {
            key: '/admin/markets',
            icon: <ShopOutlined />,
            label: 'Quản lý chợ',
            onClick: () => navigate('/admin/markets')
        },
        {
            key: '/admin/market-fees',
            icon: <DollarOutlined />,
            label: 'Phí chợ',
            onClick: () => navigate('/admin/market-fees'),
        },
        {
            key: '/admin/market-fee-types',
            icon: <TagOutlined />,
            label: 'Loại phí',
            onClick: () => navigate('/admin/market-fee-types')
        },
        {
            key: '/admin/market-rules',
            icon: <FileTextOutlined />,
            label: 'Quy tắc chợ',
            onClick: () => navigate('/admin/market-rules')
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
        <div style={{ 
            background: '#fff', 
            padding: '16px 24px', 
            borderBottom: '1px solid #f0f0f0',
            marginBottom: '24px'
        }}>
            <Menu 
                mode="horizontal" 
                selectedKeys={[location.pathname]}
                style={{ border: 'none' }}
            >
                {menuItems.map(item => (
                    <Menu.Item 
                        key={item.key} 
                        icon={item.icon}
                        onClick={item.onClick}
                    >
                        {renderMenuItem(item)}
                    </Menu.Item>
                ))}
            </Menu>
        </div>
    );
};

export default MarketNavigation;
