import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Avatar,
    message,
    Popconfirm,
    Input,
    Select,
    Modal,
    Form,
    Row,
    Col,
    Tooltip,
    Drawer,
    Descriptions,
    Statistic,
    Badge
} from 'antd';
import {
    UserOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined,
    LockOutlined,
    UnlockOutlined
} from '@ant-design/icons';
import userService from '../../../services/userService';

const { Search } = Input;
const { Option } = Select;

const getRoleColor = (role) => {
    switch (role) {
        case 'Admin': return 'geekblue';
        case 'Seller': return 'volcano';
        case 'Buyer': return 'green';
        case 'ProxyShopper': return 'orange';
        default: return 'gray';
    }
};

const getStatusColor = (status) => {
    return status === 'Active' || status === true ? 'green' : 'red';
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
    const [form] = Form.useForm();
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalBuyers: 0,
        totalSellers: 0,
        activeUsers: 0,
        blockedUsers: 0
    });
    const [paginationConfig, setPaginationConfig] = useState({
        current: 1,
        pageSize: 10
    });


    // Load thống kê tổng từ tất cả users  
    const loadTotalStatistics = async () => {
        try {
            console.log('📊 Đang tải thống kê tổng...');
            const allUsersResponse = await userService.getAllUsers({ loadAll: true });

            if (allUsersResponse?.success && Array.isArray(allUsersResponse.data)) {
                const allUsers = allUsersResponse.data;
                console.log(`📊 Tính thống kê từ ${allUsers.length} users`);

                const totalStats = {
                    totalUsers: allUsersResponse.pagination?.total || allUsers.length,
                    totalAdmins: allUsers.filter(u => u.role === 'Admin').length,
                    totalBuyers: allUsers.filter(u => u.role === 'Buyer').length,
                    totalSellers: allUsers.filter(u => u.role === 'Seller').length,
                    activeUsers: allUsers.filter(u => u.status === 'Active' || u.isActive === true).length,
                    blockedUsers: allUsers.filter(u => u.status === 'Blocked' || u.isActive === false).length
                };

                setStatistics(totalStats);
                console.log('✅ Thống kê tổng:', totalStats);
            } else {
                console.warn('⚠️ Không thể tính thống kê vì dữ liệu không hợp lệ:', allUsersResponse);
            }
        } catch (error) {
            console.error('❌ Lỗi khi tải thống kê tổng:', error);
        }
    };

    useEffect(() => {
        loadUsers({ pageNumber: paginationConfig.current, pageSize: paginationConfig.pageSize });
        loadTotalStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const response = await userService.getUserStatistics();
            if (response.success) {
                setStatistics(response.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải thống kê:', error);
        }
    };

    const loadUsers = async ({ pageNumber = 1, pageSize = 10 } = {}) => {
        setLoading(true);
        try {
            console.log('📥 Gọi API với:', { pageNumber, pageSize });

            const response = await userService.getAllUsers({ pageNumber, pageSize });

            if (response?.success && Array.isArray(response.data)) {
                setUsers(response.data);

                setPaginationConfig({
                    current: response.pagination.pageNumber,
                    pageSize: response.pagination.pageSize
                });

                setStatistics(prev => ({
                    ...prev,
                    totalUsers: response.pagination.total
                }));
            }
        } catch (error) {
            message.error('Lỗi khi tải người dùng: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await userService.deleteUser(id);
            message.success('Xóa người dùng thành công');
            loadUsers();
            loadStatistics();
        } catch (error) {
            message.error('Không thể xóa người dùng');
        }
    };

    const handleToggleUser = async (id) => {
        try {
            await userService.toggleUserAccount(id);
            message.success('Cập nhật trạng thái thành công');
            loadUsers();
            loadStatistics();
        } catch (error) {
            message.error('Không thể cập nhật trạng thái');
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        form.setFieldsValue({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            role: user.role
        });
        setEditModalVisible(true);
    };

    const handleCreateUser = () => {
        form.resetFields();
        setCreateModalVisible(true);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setViewDrawerVisible(true);
    };

    const handleUpdateUser = async (values) => {
        try {
            await userService.updateUser(selectedUser.id, values);
            message.success('Cập nhật người dùng thành công');
            setEditModalVisible(false);
            loadUsers();
            loadStatistics();
        } catch (error) {
            message.error('Cập nhật người dùng thất bại');
        }
    };

    const handleCreateNewUser = async (values) => {
        try {
            await userService.createUser(values);
            message.success('Tạo người dùng thành công');
            setCreateModalVisible(false);
            loadUsers();
            loadStatistics();
        } catch (error) {
            message.error('Tạo người dùng thất bại');
        }
    };

    // Filter users based on search and filters
    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchText ||
            user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchText.toLowerCase());

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && (user.status === 'Active' || user.isActive === true)) ||
            (filterStatus === 'blocked' && (user.status !== 'Active' && user.isActive !== true));

        return matchesSearch && matchesRole && matchesStatus;
    });

    const columns = [
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            width: 80,
            render: (avatar, record) => (
                <Avatar
                    size={40}
                    src={avatar}
                    icon={!avatar && <UserOutlined />}
                />
            )
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => (a.username || '').localeCompare(b.username || '')
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || '')
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber'
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={getRoleColor(role)}>
                    {role}
                </Tag>
            ),
            filters: [
                { text: 'Admin', value: 'Admin' },
                { text: 'Seller', value: 'Seller' },
                { text: 'Buyer', value: 'Buyer' },
                { text: 'ProxyShopper', value: 'ProxyShopper' }
            ],
            onFilter: (value, record) => record.role === value
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                const isActive = status === 'Active' || record.isActive === true;
                return (
                    <Tag color={getStatusColor(isActive)}>
                        {isActive ? 'Hoạt động' : 'Bị khóa'}
                    </Tag>
                );
            },
            filters: [
                { text: 'Hoạt động', value: 'active' },
                { text: 'Bị khóa', value: 'blocked' }
            ]
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewUser(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditUser(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.status === 'Active' || record.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                        <Popconfirm
                            title={`Bạn có chắc muốn ${record.status === 'Active' || record.isActive ? 'khóa' : 'mở khóa'} tài khoản này?`}
                            onConfirm={() => handleToggleUser(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="text"
                                icon={record.status === 'Active' || record.isActive ? <LockOutlined /> : <UnlockOutlined />}
                                style={{ color: record.status === 'Active' || record.isActive ? '#faad14' : '#52c41a' }}
                            />
                        </Popconfirm>
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa người dùng này?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button danger type="text" icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng người dùng"
                            value={statistics.totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Người bán"
                            value={statistics.totalSellers}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Người mua"
                            value={statistics.totalBuyers}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Badge count={statistics.blockedUsers} color="red">
                            <Statistic
                                title="Đang hoạt động"
                                value={statistics.activeUsers}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Badge>
                    </Card>
                </Col>
            </Row>

            <Card title="Quản lý người dùng">
                {/* Filter and Search Bar */}
                <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                        <Search
                            placeholder="Tìm kiếm theo tên, email..."
                            allowClear
                            style={{ width: 250 }}
                            onSearch={setSearchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Select
                            value={filterRole}
                            onChange={setFilterRole}
                            style={{ width: 150 }}
                        >
                            <Option value="all">Tất cả vai trò</Option>
                            <Option value="Admin">Admin</Option>
                            <Option value="Seller">Người bán</Option>
                            <Option value="Buyer">Người mua</Option>
                            <Option value="ProxyShopper">Mua hộ</Option>
                        </Select>
                        <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: 150 }}
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value="active">Hoạt động</Option>
                            <Option value="blocked">Bị khóa</Option>
                        </Select>
                    </Space>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => { loadUsers(); loadStatistics(); }}
                        >
                            Làm mới
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateUser}
                        >
                            Thêm người dùng
                        </Button>
                    </Space>
                </Space>

                <Table
                    dataSource={filteredUsers}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: paginationConfig.current,
                        pageSize: paginationConfig.pageSize,
                        total: statistics.totalUsers,
                        showQuickJumper: true,
                        showSizeChanger: true,
                        onChange: (page, pageSize) => {
                            console.log('📌 Chuyển trang:', page, 'pageSize:', pageSize);
                            setPaginationConfig({ current: page, pageSize });
                            loadUsers({ pageNumber: page, pageSize }); // ⬅️ GỌI ĐÚNG API THEO TRANG
                        }
                    }}
                />
            </Card>

            {/* Create User Modal */}
            <Modal
                title="Thêm người dùng mới"
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                onOk={() => form.submit()}
                okText="Tạo"
                cancelText="Hủy"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateNewUser}
                    initialValues={{ role: 'Buyer' }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="Tên đăng nhập"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                                    { min: 3, message: 'Tên đăng nhập ít nhất 3 ký tự' }
                                ]}
                            >
                                <Input placeholder="Nhập tên đăng nhập" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                                    { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' }
                                ]}
                            >
                                <Input.Password placeholder="Nhập mật khẩu" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                            >
                                <Input placeholder="Nhập họ và tên" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                            >
                                <Select placeholder="Chọn vai trò">
                                    <Option value="Admin">Admin</Option>
                                    <Option value="Seller">Người bán</Option>
                                    <Option value="Buyer">Người mua</Option>
                                    <Option value="ProxyShopper">Mua hộ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                    >
                        <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                title="Chỉnh sửa người dùng"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={() => form.submit()}
                okText="Cập nhật"
                cancelText="Hủy"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateUser}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="Tên đăng nhập"
                                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                            >
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                            >
                                <Select>
                                    <Option value="Admin">Admin</Option>
                                    <Option value="Seller">Người bán</Option>
                                    <Option value="Buyer">Người mua</Option>
                                    <Option value="ProxyShopper">Mua hộ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                            >
                                <Input.TextArea rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* User Detail Drawer */}
            <Drawer
                title="Chi tiết người dùng"
                placement="right"
                width={500}
                onClose={() => setViewDrawerVisible(false)}
                open={viewDrawerVisible}
            >
                {selectedUser && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Avatar
                                size={80}
                                src={selectedUser.avatar}
                                icon={!selectedUser.avatar && <UserOutlined />}
                            />
                            <h3 style={{ marginTop: 16, marginBottom: 8 }}>
                                {selectedUser.fullName || selectedUser.username}
                            </h3>
                            <Tag color={getRoleColor(selectedUser.role)}>
                                {selectedUser.role}
                            </Tag>
                            <Tag color={getStatusColor(selectedUser.status === 'Active' || selectedUser.isActive)}>
                                {selectedUser.status === 'Active' || selectedUser.isActive ? 'Hoạt động' : 'Bị khóa'}
                            </Tag>
                        </div>

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Tên đăng nhập">
                                {selectedUser.username}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedUser.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedUser.phoneNumber || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                {selectedUser.address || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lần cập nhật cuối">
                                {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString('vi-VN') : 'Không rõ'}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default UserManagement;
