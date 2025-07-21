// src/pages/Admin/Orders/ProxyShoppingOrders.js
import React from 'react';
import { Card, Alert } from 'antd';
import OrderManagement from '../OrderManagement';

const ProxyShoppingOrders = () => {
    return (
        <div>
            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ margin: 0, color: '#13c2c2' }}>Đơn hàng mua hộ</h2>
                <p style={{ margin: 0, color: '#666' }}>Danh sách các đơn hàng mua hộ</p>
            </div>

            <Alert
                message="Chức năng đang phát triển"
                description="Tính năng quản lý đơn hàng mua hộ sẽ được hoàn thiện trong phiên bản tiếp theo."
                type="info"
                showIcon
                style={{ marginBottom: '24px' }}
            />

            <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h3>Đơn hàng mua hộ</h3>
                    <p>Tính năng này sẽ được triển khai sau khi hoàn thành API proxy shopping.</p>
                </div>
            </Card>
        </div>
    );
};

export default ProxyShoppingOrders;
