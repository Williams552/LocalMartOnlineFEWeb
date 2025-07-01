import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Avatar,
    message,
    Popconfirm
} from 'antd';
import {
    UserOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import userService from '../../../services/userService';

const getRoleColor = (role) => {
    switch (role) {
        case 'Admin': return 'geekblue';
        case 'Seller': return 'volcano';
        case 'Buyer': return 'green';
        default: return 'gray';
    }
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getAllUsers();
            let userData = [];

            if (
                response?.success &&
                response.data &&
                Array.isArray(response.data.data)
            ) {
                userData = response.data.data;
                setUsers(userData);
            } else {
                throw new Error('API trả về định dạng không hợp lệ');
            }
        } catch (error) {
            console.error('❌ Lỗi khi lấy người dùng:', error);
            setUsers([]); // Đảm bảo làm sạch danh sách nếu lỗi
            message.error('Không thể tải danh sách người dùng: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await userService.deleteUser(id);
            message.success('Xóa người dùng thành công');
            loadUsers();
        } catch (error) {
            message.error('Không thể xóa người dùng');
        }
    };

    const columns = [
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={getRoleColor(role)}>
                    {role}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Popconfirm
                    title="Xác nhận xóa người dùng này?"
                    onConfirm={() => handleDeleteUser(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
            )
        }
    ];

    return (
        <Card title="Quản lý người dùng">
            <Table
                dataSource={users}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={false}
            />
        </Card>
    );
};

export default UserManagement;
