import React, { useState } from 'react';
import { Card, Radio, Button, Typography, Space, Alert, Descriptions } from 'antd';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

const AdminRoleTestDemo = () => {
    const { user, updateUser } = useAuth();
    const [testRole, setTestRole] = useState(user?.role || 'Admin');

    const roles = [
        { value: 'Admin', label: 'Admin (Toàn quyền)', description: 'Có quyền truy cập tất cả các tính năng' },
        { value: 'MS', label: 'MS (Quản lý Hệ thống)', description: 'Quản lý người dùng + cửa hàng + sản phẩm + đơn hàng + hỗ trợ' },
        { value: 'MMBH', label: 'MMBH (Quản lý Chợ & Danh mục)', description: 'Quản lý chợ + danh mục + báo cáo thống kê' },
        { value: 'LGR', label: 'LGR (Quản lý Nội dung)', description: 'Quản lý nội dung + báo cáo thống kê' }
    ];

    const handleRoleChange = (newRole) => {
        setTestRole(newRole);
    };

    const applyRole = () => {
        // Update user role in context for testing
        updateUser({ ...user, role: testRole });
        alert(`Đã chuyển sang role: ${testRole}`);
        window.location.reload(); // Reload to apply menu changes
    };

    const getMenuPermissions = (role) => {
        switch (role) {
            case 'MMBH':
                return ['Dashboard', 'Quản lý chợ', 'Quản lý danh mục', 'Báo cáo & Thống kê'];
            case 'LGR':
                return ['Dashboard', 'Quản lý nội dung', 'Báo cáo & Thống kê'];
            case 'MS':
                return ['Dashboard', 'Quản lý người dùng', 'Quản lý cửa hàng', 'Quản lý sản phẩm', 'Quản lý đơn vị sản phẩm', 'Quản lý đơn hàng', 'Hỗ trợ khách hàng', 'Báo cáo & Thống kê'];
            case 'Admin':
            default:
                return ['Tất cả các menu'];
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Demo Role-Based Admin System</Title>
            <Alert
                message="Công cụ Test Role"
                description="Sử dụng công cụ này để test các role khác nhau trong hệ thống admin. Thay đổi role và xem sự thay đổi trong menu."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Card title="Thông tin Role hiện tại" style={{ marginBottom: 24 }}>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Role hiện tại">
                        <Text strong>{user?.role || 'Chưa xác định'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên hiển thị">
                        {user?.role === 'MMBH' ? 'Quản lý Chợ & Danh mục' :
                            user?.role === 'LGR' ? 'Quản lý Nội dung' :
                                user?.role === 'MS' ? 'Quản lý Hệ thống' : 'Quản trị viên'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên người dùng">
                        {user?.fullName || user?.username || 'Chưa có tên'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Chọn Role để Test" style={{ marginBottom: 24 }}>
                <Radio.Group
                    value={testRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {roles.map(role => (
                            <Card key={role.value} size="small" style={{ backgroundColor: testRole === role.value ? '#f6ffed' : '#fafafa' }}>
                                <Radio value={role.value}>
                                    <div>
                                        <Text strong>{role.label}</Text>
                                        <br />
                                        <Text type="secondary">{role.description}</Text>
                                    </div>
                                </Radio>
                            </Card>
                        ))}
                    </Space>
                </Radio.Group>

                <Button
                    type="primary"
                    onClick={applyRole}
                    style={{ marginTop: 16 }}
                    disabled={testRole === user?.role}
                >
                    Áp dụng Role: {testRole}
                </Button>
            </Card>

            <Card title={`Quyền truy cập của Role: ${testRole}`}>
                <Title level={4}>Menu có thể truy cập:</Title>
                <ul>
                    {getMenuPermissions(testRole).map((menu, index) => (
                        <li key={index}>{menu}</li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default AdminRoleTestDemo;
