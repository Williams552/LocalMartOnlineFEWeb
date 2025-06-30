// src/pages/Admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Avatar,
    Input,
    Select,
    Modal,
    Form,
    message,
    Popconfirm,
    Drawer,
    Descriptions,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
    ExportOutlined,
    EyeOutlined,
    LockOutlined,
    UnlockOutlined
} from '@ant-design/icons';
import userService from '../../services/userService';
import {
    formatUserData,
    getRoleColor,
    getStatusColor,
    validateUserData,
    showValidationMessages,
    USER_ROLES,
    USER_STATUSES,
    sanitizeUserInput
} from '../../utils/userValidation';

const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        status: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadUsers();
    }, [pagination.current, pagination.pageSize, filters]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const params = {
                pageNumber: pagination.current,
                pageSize: pagination.pageSize,
                search: filters.search,
                role: filters.role,
                status: filters.status
            };

            console.log('Loading users with params:', params);
            const response = await userService.getAllUsers(params);
            console.log('Response from userService.getAllUsers:', response);

            // Detailed response analysis
            console.log('=== RESPONSE ANALYSIS ===');
            console.log('response:', response);
            console.log('response type:', typeof response);
            console.log('response.success:', response?.success);
            console.log('response.data:', response?.data);
            console.log('response.data type:', typeof response?.data);

            let userData = [];
            let total = 0;

            // Multiple fallback strategies for different response formats
            if (response) {
                if (response.success && response.data) {
                    // Format 1: { success: true, data: { Data: [...], Total: X } }
                    if (response.data.Data && Array.isArray(response.data.Data)) {
                        userData = response.data.Data;
                        total = response.data.Total || userData.length;
                        console.log('✅ Using Format 1: Backend nested structure');
                    }
                    // Format 2: { success: true, data: [...] }
                    else if (Array.isArray(response.data)) {
                        userData = response.data;
                        total = userData.length;
                        console.log('✅ Using Format 2: Direct array in data');
                    }
                    // Format 3: { success: true, data: { users: [...] } }
                    else if (response.data.users && Array.isArray(response.data.users)) {
                        userData = response.data.users;
                        total = response.data.total || userData.length;
                        console.log('✅ Using Format 3: Users array property');
                    }
                    else {
                        console.warn('⚠️ Unknown data format:', response.data);
                        throw new Error('Dữ liệu trả về không đúng định dạng');
                    }
                }
                // Format 4: Direct array response
                else if (Array.isArray(response)) {
                    userData = response;
                    total = userData.length;
                    console.log('✅ Using Format 4: Direct array response');
                }
                else {
                    console.warn('⚠️ No success field or unrecognized format');
                    throw new Error('Response không có success field hoặc định dạng không nhận diện được');
                }

                console.log('Final userData:', userData);
                console.log('Final total:', total);
                console.log('Is userData array?', Array.isArray(userData));

                if (Array.isArray(userData) && userData.length >= 0) {
                    setUsers(userData.map(formatUserData));
                    setPagination(prev => ({
                        ...prev,
                        total: total
                    }));
                    console.log('✅ Successfully loaded', userData.length, 'users');
                } else {
                    throw new Error('userData cuối cùng vẫn không phải array');
                }
            } else {
                console.warn('Invalid response structure, using mock data:', response);

                // Fallback to mock data for development
                const mockUsers = [
                    {
                        id: '1',
                        username: 'admin',
                        fullName: 'Quản trị viên',
                        email: 'admin@localmart.com',
                        role: 'Admin',
                        status: 'Active',
                        phoneNumber: '0123456789',
                        address: 'Hà Nội',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        username: 'seller1',
                        fullName: 'Người bán 1',
                        email: 'seller1@localmart.com',
                        role: 'Seller',
                        status: 'Active',
                        phoneNumber: '0987654321',
                        address: 'TP.HCM',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: '3',
                        username: 'buyer1',
                        fullName: 'Người mua 1',
                        email: 'buyer1@localmart.com',
                        role: 'Buyer',
                        status: 'Active',
                        phoneNumber: '0555666777',
                        address: 'Đà Nẵng',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];

                setUsers(mockUsers.map(formatUserData));
                setPagination(prev => ({
                    ...prev,
                    total: mockUsers.length
                }));

                message.warning('Đang sử dụng dữ liệu mẫu (Mock Data) - API chưa kết nối được');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            console.log('🔄 Switching to mock data due to error');

            // Always show mock data when there's an error, so users can see the interface
            const mockUsers = [
                {
                    id: '1',
                    username: 'admin',
                    fullName: 'Quản trị viên',
                    email: 'admin@localmart.com',
                    role: 'Admin',
                    status: 'Active',
                    phoneNumber: '0123456789',
                    address: 'Hà Nội',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    username: 'seller1',
                    fullName: 'Người bán 1',
                    email: 'seller1@localmart.com',
                    role: 'Seller',
                    status: 'Active',
                    phoneNumber: '0987654321',
                    address: 'TP.HCM',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '3',
                    username: 'buyer1',
                    fullName: 'Người mua 1',
                    email: 'buyer1@localmart.com',
                    role: 'Buyer',
                    status: 'Active',
                    phoneNumber: '0555666777',
                    address: 'Đà Nẵng',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '4',
                    username: 'buyer2',
                    fullName: 'Người mua 2',
                    email: 'buyer2@localmart.com',
                    role: 'Buyer',
                    status: 'Disabled',
                    phoneNumber: '0888999000',
                    address: 'Cần Thơ',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            setUsers(mockUsers.map(formatUserData));
            setPagination(prev => ({
                ...prev,
                total: mockUsers.length
            }));

            message.warning('Lỗi khi tải dữ liệu: ' + error.message + ' - Hiển thị dữ liệu mẫu');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (paginationData, filtersData, sorter) => {
        setPagination({
            ...pagination,
            current: paginationData.current,
            pageSize: paginationData.pageSize
        });
    };

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleCreateUser = () => {
        setSelectedUser(null);
        setEditMode(false);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditMode(true);
        form.setFieldsValue({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            role: user.role,
            status: user.status
        });
        setModalVisible(true);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setDrawerVisible(true);
    };

    const handleDeleteUser = async (userId) => {
        try {
            await userService.deleteUser(userId);
            message.success('Xóa người dùng thành công');
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Lỗi khi xóa người dùng');
        }
    };

    const handleToggleUserStatus = async (user) => {
        try {
            const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
            await userService.updateUser(user.id, { status: newStatus });
            message.success(`${newStatus === 'Active' ? 'Kích hoạt' : 'Khóa'} người dùng thành công`);
            loadUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            message.error('Lỗi khi cập nhật trạng thái người dùng');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const sanitizedData = sanitizeUserInput(values);
            const validation = validateUserData(sanitizedData, editMode);

            if (!validation.isValid) {
                showValidationMessages(validation);
                return;
            }

            if (editMode) {
                await userService.updateUser(selectedUser.id, sanitizedData);
                message.success('Cập nhật người dùng thành công');
            } else {
                await userService.createUser(sanitizedData);
                message.success('Tạo người dùng thành công');
            }

            setModalVisible(false);
            form.resetFields();
            loadUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            message.error(editMode ? 'Lỗi khi cập nhật người dùng' : 'Lỗi khi tạo người dùng');
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            dataIndex: 'username',
            key: 'username',
            width: 250,
            render: (text, record) => (
                <Space>
                    <Avatar
                        size="large"
                        icon={<UserOutlined />}
                        style={{ backgroundColor: getRoleColor(record.role) }}
                    />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.fullName || text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>@{text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 120,
            render: (role) => (
                <Tag color={getRoleColor(role)}>
                    {USER_ROLES.find(r => r.value === role)?.label || role}
                </Tag>
            ),
            filters: USER_ROLES.map(role => ({ text: role.label, value: role.value })),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {USER_STATUSES.find(s => s.value === status)?.label || status}
                </Tag>
            ),
            filters: USER_STATUSES.map(status => ({ text: status.label, value: status.value })),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: 130,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'displayCreatedAt',
            key: 'createdAt',
            width: 120,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewUser(record)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditUser(record)}
                        title="Chỉnh sửa"
                    />
                    <Button
                        type="text"
                        icon={record.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />}
                        onClick={() => handleToggleUserStatus(record)}
                        title={record.status === 'Active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa người dùng này?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            title="Xóa"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Quản lý người dùng</h2>
                    <p style={{ margin: 0, color: '#666' }}>Quản lý tất cả người dùng trong hệ thống</p>
                </div>
                <Space>
                    <Button icon={<ExportOutlined />}>Xuất Excel</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateUser}>
                        Thêm người dùng
                    </Button>
                </Space>
            </div>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số người dùng"
                            value={pagination.total}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={users.filter(u => u.status === 'Active').length}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Bị khóa"
                            value={users.filter(u => u.status === 'Disabled').length}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Người bán"
                            value={users.filter(u => u.role === 'Seller').length}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Search
                            placeholder="Tìm kiếm theo tên, email, username..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Vai trò"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => handleFilterChange('role', value)}
                        >
                            {USER_ROLES.map(role => (
                                <Option key={role.value} value={role.value}>
                                    {role.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => handleFilterChange('status', value)}
                        >
                            {USER_STATUSES.map(status => (
                                <Option key={status.value} value={status.value}>
                                    {status.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button onClick={loadUsers}>Làm mới</Button>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} người dùng`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="Tên đăng nhập"
                                rules={[
                                    { required: !editMode, message: 'Vui lòng nhập tên đăng nhập!' },
                                    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                                ]}
                            >
                                <Input disabled={editMode} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                                rules={[
                                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    {!editMode && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                            >
                                <Select>
                                    {USER_ROLES.map(role => (
                                        <Option key={role.value} value={role.value}>
                                            {role.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                            >
                                <Select>
                                    {USER_STATUSES.map(status => (
                                        <Option key={status.value} value={status.value}>
                                            {status.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editMode ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View User Drawer */}
            <Drawer
                title="Chi tiết người dùng"
                placement="right"
                size="large"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                {selectedUser && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <Avatar
                                size={80}
                                icon={<UserOutlined />}
                                style={{ backgroundColor: getRoleColor(selectedUser.role) }}
                            />
                            <div style={{ marginTop: '16px' }}>
                                <h3>{selectedUser.fullName}</h3>
                                <Tag color={getRoleColor(selectedUser.role)}>
                                    {USER_ROLES.find(r => r.value === selectedUser.role)?.label}
                                </Tag>
                                <Tag color={getStatusColor(selectedUser.status)}>
                                    {USER_STATUSES.find(s => s.value === selectedUser.status)?.label}
                                </Tag>
                            </div>
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
                                {selectedUser.displayCreatedAt}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lần cuối">
                                {selectedUser.displayUpdatedAt}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setDrawerVisible(false);
                                        handleEditUser(selectedUser);
                                    }}
                                >
                                    Chỉnh sửa
                                </Button>
                                <Button
                                    icon={selectedUser.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />}
                                    onClick={() => {
                                        handleToggleUserStatus(selectedUser);
                                        setDrawerVisible(false);
                                    }}
                                >
                                    {selectedUser.status === 'Active' ? 'Khóa tài khoản' : 'Kích hoạt'}
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default UserManagement;
