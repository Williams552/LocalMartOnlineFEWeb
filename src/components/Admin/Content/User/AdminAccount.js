import React, { useState, useRef } from "react";
import { Button, Form, Input, Modal, Select, Space, Table } from "antd";
import { BiUserPlus, BiBlock, BiCheckShield } from "react-icons/bi";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const mockUsersInit = [
    {
        _id: "1",
        full_name: "Nguyễn Văn A",
        email: "a@example.com",
        phone: "0901234567",
        role: "Admin",
        is_blocked: true,
    },
    {
        _id: "2",
        full_name: "Trần Thị B",
        email: "b@example.com",
        phone: "0909876543",
        role: "User",
        is_blocked: false,
    },
    {
        _id: "3",
        full_name: "Lê Văn C",
        email: "c@example.com",
        phone: "0987654321",
        role: "Supplier",
        is_blocked: true,
    },
];

const AccountManagementComponent = () => {
    const [users, setUsers] = useState(mockUsersInit);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formCreate] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);

    const handleBlockToggle = (userId, isCurrentlyBlocked) => {
        Modal.confirm({
            title: isCurrentlyBlocked ? "Xác nhận gỡ chặn" : "Xác nhận chặn",
            content: isCurrentlyBlocked
                ? "Bạn có chắc muốn gỡ chặn người dùng này không?"
                : "Bạn có chắc muốn chặn người dùng này không?",
            onOk: () => {
                setUsers((prev) =>
                    prev.map((u) =>
                        u._id === userId ? { ...u, is_blocked: !isCurrentlyBlocked } : u
                    )
                );
            },
        });
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm theo ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Xóa
                    </Button>
                    <Button type="link" size="small" onClick={() => close()}>
                        Đóng
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: "Tên khách hàng",
            dataIndex: "full_name",
            key: "full_name",
            ...getColumnSearchProps("full_name"),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ...getColumnSearchProps("email"),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
        },
        {
            title: "Trạng thái",
            dataIndex: "is_blocked",
            key: "status",
            render: (isBlocked) => (
                <span
                    style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontWeight: "bold",
                        backgroundColor: isBlocked ? "#ff4d4f" : "#d9f7be",
                        color: isBlocked ? "white" : "#389e0d",
                    }}
                >
                    {isBlocked ? "Bị chặn" : "Hoạt động"}
                </span>
            ),
        },
        {
            title: "Chức năng",
            key: "action",
            render: (_, record) => (
                <Button
                    type={record.is_blocked ? "default" : "primary"}
                    danger={record.is_blocked}
                    icon={record.is_blocked ? <BiCheckShield /> : <BiBlock />}
                    onClick={() => handleBlockToggle(record._id, record.is_blocked)}
                >
                    {record.is_blocked ? "Gỡ chặn" : "Chặn"}
                </Button>
            ),
        },
    ];

    const handleCreateUser = (values) => {
        const newUser = {
            _id: `${Date.now()}`,
            ...values,
            is_blocked: false,
        };
        setUsers((prev) => [...prev, newUser]);
        setIsCreateModalOpen(false);
        formCreate.resetFields();
    };

    return (
        <div style={{ padding: "20px" }}>
            <div className="flex justify-between items-center mb-4">
                <h2 style={{ color: "#1890ff" }}>Quản lý tài khoản</h2>
                <Button
                    type="primary"
                    icon={<BiUserPlus />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Tạo tài khoản
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
            />

            <Modal
                title="Tạo tài khoản mới"
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
            >
                <Form layout="vertical" form={formCreate} onFinish={handleCreateUser}>
                    <Form.Item
                        label="Họ tên"
                        name="full_name"
                        rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Vui lòng nhập email" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Vai trò"
                        name="role"
                        rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                    >
                        <Select>
                            <Select.Option value="Admin">Admin</Select.Option>
                            <Select.Option value="User">User</Select.Option>
                            <Select.Option value="Supplier">Supplier</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Tạo tài khoản
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AccountManagementComponent;
