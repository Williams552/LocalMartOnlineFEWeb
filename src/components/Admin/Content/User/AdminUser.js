import React, { useState, useRef } from "react";
import { Form, Input, Select, Button, Space, Upload } from "antd";
import { FaUser } from "react-icons/fa";
import { AiOutlineEdit } from "react-icons/ai";
import { BiImageAdd } from "react-icons/bi";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import TableUser from "./TableUser";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import ModalComponent from "../../../ModalComponent/ModalComponent";
import Loading from "../../../LoadingComponent/Loading";

const mockUsers = [
    {
        _id: "1",
        full_name: "Nguyễn Văn A",
        email: "a@example.com",
        phone: "0901234567",
        role: "Admin",
        avatar: "https://via.placeholder.com/100",
        address: "Hà Nội",
        birth_day: "1995-01-01",
        createdAt: "2023-01-01",
        updatedAt: "2024-01-01",
    },
    {
        _id: "2",
        full_name: "Trần Thị B",
        email: "b@example.com",
        phone: "0909876543",
        role: "User",
        avatar: "https://via.placeholder.com/100",
        address: "TP.HCM",
        birth_day: "1998-06-10",
        createdAt: "2023-03-10",
        updatedAt: "2024-03-20",
    },
];

// Tạo hàm getBase64 tại chỗ
const getBase64Local = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

const UserComponent = () => {
    const [rowSelected, setRowSelected] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formUpdate] = Form.useForm();
    const navigate = useNavigate();
    const searchInput = useRef(null);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [isLoadDetails, setIsLoadDetails] = useState(false);
    const [stateDetailsUser, setStateDetailsUser] = useState({});

    const handleDetailsProduct = () => {
        const selected = mockUsers.find((u) => u._id === rowSelected);
        setStateDetailsUser(selected);
        formUpdate.setFieldsValue(selected);
        setIsDrawerOpen(true);
    };

    const handleOnChangeDetails = (value, name) => {
        setStateDetailsUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChangeAvatarDetails = async (info) => {
        const file = info?.fileList[0];
        if (!file?.url && !file?.preview) {
            file.preview = await getBase64Local(file?.originFileObj);
        }
        setStateDetailsUser((prev) => ({
            ...prev,
            avatar: file.preview,
        }));
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
                    placeholder={`Search ${dataIndex}`}
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
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button type="link" size="small" onClick={() => close()}>
                        Close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
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
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
        },
        {
            title: "SĐT",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Chức năng",
            dataIndex: "action",
            render: () => (
                <div
                    className="flex items-center justify-center gap-2 text-blue-500 cursor-pointer"
                    onClick={handleDetailsProduct}
                >
                    <AiOutlineEdit />
                    <span>Chi tiết</span>
                </div>
            ),
        },
    ];

    return (
        <div className="Wrapper-Admin-User">
            <div className="Main-Content">
                <button
                    onClick={() => navigate(-1)}
                    className="flex mb-2 items-center bg-blue-500 text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:bg-blue-600 transition duration-300"
                >
                    Quay lại
                </button>

                <div className="flex items-center text-xl font-semibold text-gray-800 mb-4">
                    <FaUser className="text-2xl text-blue-500 mr-2" />
                    <h5>Danh sách người mua</h5>
                </div>

                <TableUser
                    columns={columns}
                    data={mockUsers}
                    setRowSelected={(id) => setRowSelected(id)}
                    onRow={(record) => ({
                        onClick: () => setRowSelected(record._id),
                    })}
                />
            </div>

            <DrawerComponent
                title="Chi Tiết Tài Khoản"
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width="40%"
            >
                <Loading isPending={isLoadDetails}>
                    <Form form={formUpdate} layout="vertical">
                        <Form.Item label="Tên khách hàng" name="full_name">
                            <Input
                                value={stateDetailsUser.full_name}
                                onChange={(e) =>
                                    handleOnChangeDetails(e.target.value, "full_name")
                                }
                            />
                        </Form.Item>

                        <Form.Item label="Vai trò" name="role">
                            <Select
                                value={stateDetailsUser.role}
                                onChange={(value) =>
                                    handleOnChangeDetails(value, "role")
                                }
                            >
                                <Select.Option value="Admin">Admin</Select.Option>
                                <Select.Option value="User">User</Select.Option>
                                <Select.Option value="Supplier">Supplier</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Avatar">
                            <Upload.Dragger
                                listType="picture"
                                beforeUpload={() => false}
                                onChange={handleChangeAvatarDetails}
                                maxCount={1}
                            >
                                <p className="ant-upload-drag-icon">
                                    <BiImageAdd />
                                </p>
                                <p>Chọn ảnh đại diện</p>
                            </Upload.Dragger>
                        </Form.Item>

                        <Form.Item label="Avatar Preview">
                            <img
                                src={stateDetailsUser?.avatar}
                                alt="avatar"
                                style={{ width: 100, height: 100, borderRadius: "50%" }}
                            />
                        </Form.Item>

                        <Form.Item label="Ngày tạo">
                            <div>{stateDetailsUser?.createdAt ? new Date(stateDetailsUser.createdAt).toLocaleDateString("vi-VN") : "Không rõ"}</div>
                        </Form.Item>

                        <Form.Item label="Cập nhật gần nhất">
                            <div>{stateDetailsUser?.updatedAt ? new Date(stateDetailsUser.updatedAt).toLocaleDateString("vi-VN") : "Không rõ"}</div>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>

            <ModalComponent
                title="Xóa Tài Khoản"
                open={isOpenDelete}
                onCancel={() => setIsOpenDelete(false)}
                onOk={() => {
                    toast.success("Xóa thành công (giả lập)");
                    setIsOpenDelete(false);
                }}
            >
                <div>Bạn có chắc chắn muốn xóa người dùng này không?</div>
            </ModalComponent>
        </div>
    );
};

export default UserComponent;
