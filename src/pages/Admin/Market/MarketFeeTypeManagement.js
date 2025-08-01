// src/pages/Admin/Market/MarketFeeTypeManagement.js
import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Input,
    Modal,
    Form,
    message,
    Popconfirm,
    Typography,
    Alert,
    Tag
} from 'antd';
import {
    TagOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
    UndoOutlined
} from '@ant-design/icons';
import { marketFeeTypeService } from '../../../services/marketFeeTypeService';
import MarketNavigation from './MarketNavigation';
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;

const MarketFeeTypeManagement = () => {
    const [feeTypes, setFeeTypes] = useState([]);
    const [filteredFeeTypes, setFilteredFeeTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedFeeType, setSelectedFeeType] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showDeleted, setShowDeleted] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadFeeTypes();
    }, []);

    useEffect(() => {
        filterFeeTypes();
    }, [feeTypes, searchKeyword, showDeleted]);

    const loadFeeTypes = async () => {
        setLoading(true);
        try {
            const response = await marketFeeTypeService.getAllMarketFeeTypes();
            if (response?.success && response.data) {
                setFeeTypes(response.data);
            } else {
                setFeeTypes([]);
                message.warning('Không có dữ liệu loại phí');
            }
        } catch (error) {
            console.error('Error loading fee types:', error);
            message.error('Lỗi khi tải danh sách loại phí');
            setFeeTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const filterFeeTypes = () => {
        let filtered = feeTypes;

        // Lọc theo trạng thái xóa
        if (!showDeleted) {
            filtered = filtered.filter(item => !item.isDeleted);
        }

        // Tìm kiếm theo từ khóa
        if (searchKeyword.trim()) {
            const keyword = searchKeyword.toLowerCase().trim();
            filtered = filtered.filter(item =>
                item.feeType?.toLowerCase().includes(keyword)
            );
        }

        setFilteredFeeTypes(filtered);
    };

    const handleAdd = () => {
        setEditMode(false);
        setSelectedFeeType(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditMode(true);
        setSelectedFeeType(record);
        form.setFieldsValue({
            feeType: record.feeType
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await marketFeeTypeService.deleteMarketFeeType(id);
            if (response?.success) {
                message.success('Xóa loại phí thành công');
                loadFeeTypes();
            } else {
                message.error(response?.message || 'Xóa loại phí thất bại');
            }
        } catch (error) {
            console.error('Error deleting fee type:', error);
            message.error('Lỗi khi xóa loại phí');
        }
    };

    const handleRestore = async (id) => {
        try {
            const response = await marketFeeTypeService.restoreMarketFeeType(id);
            if (response?.success) {
                message.success('Khôi phục loại phí thành công');
                loadFeeTypes();
            } else {
                message.error(response?.message || 'Khôi phục loại phí thất bại');
            }
        } catch (error) {
            console.error('Error restoring fee type:', error);
            message.error('Lỗi khi khôi phục loại phí');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const feeTypeData = {
                feeType: values.feeType.trim()
            };

            let response;
            if (editMode && selectedFeeType) {
                response = await marketFeeTypeService.updateMarketFeeType(selectedFeeType.id, feeTypeData);
            } else {
                response = await marketFeeTypeService.createMarketFeeType(feeTypeData);
            }

            if (response?.success) {
                message.success(editMode ? 'Cập nhật loại phí thành công' : 'Tạo loại phí thành công');
                setModalVisible(false);
                form.resetFields();
                loadFeeTypes();
            } else {
                message.error(response?.message || (editMode ? 'Cập nhật loại phí thất bại' : 'Tạo loại phí thất bại'));
            }
        } catch (error) {
            console.error('Error submitting fee type:', error);
            message.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra');
        }
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        form.resetFields();
        setSelectedFeeType(null);
        setEditMode(false);
    };

    const handleSearch = (value) => {
        setSearchKeyword(value);
    };

    const toggleShowDeleted = () => {
        setShowDeleted(!showDeleted);
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Tên loại phí',
            dataIndex: 'feeType',
            key: 'feeType',
            render: (text, record) => (
                <div>
                    <Text strong={!record.isDeleted} delete={record.isDeleted}>
                        {text}
                    </Text>
                    {record.isDeleted && (
                        <Tag color="red" style={{ marginLeft: 8 }}>
                            Đã xóa
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date) => date ? moment(date).format('DD/MM/YYYY HH:mm') : '',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 100,
            render: (_, record) => (
                <Tag color={record.isDeleted ? 'red' : 'green'}>
                    {record.isDeleted ? 'Đã xóa' : 'Hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {!record.isDeleted ? (
                        <>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record)}
                                title="Chỉnh sửa"
                            />
                            <Popconfirm
                                title="Bạn có chắc chắn muốn xóa loại phí này?"
                                description="Loại phí sẽ được đánh dấu đã xóa và có thể khôi phục sau."
                                onConfirm={() => handleDelete(record.id)}
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
                        </>
                    ) : (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn khôi phục loại phí này?"
                            onConfirm={() => handleRestore(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="text"
                                icon={<UndoOutlined />}
                                title="Khôi phục"
                                style={{ color: '#52c41a' }}
                            />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <MarketNavigation />
            <div style={{ padding: '0 24px 24px' }}>
                <Card>
                    <div style={{ marginBottom: '16px' }}>
                        <Title level={3}>
                            <TagOutlined /> Quản lý Loại Phí
                        </Title>
                        <Alert
                            message="Thông tin"
                            description="Quản lý các loại phí của chợ như phí thuê, phí vệ sinh, phí bảo trì, v.v. Các loại phí này sẽ được sử dụng khi tạo phí cụ thể cho từng chợ."
                            type="info"
                            showIcon
                            style={{ marginTop: '8px' }}
                        />
                    </div>

                    {/* Toolbar */}
                    <div style={{ 
                        marginBottom: 16, 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                            >
                                Thêm loại phí
                            </Button>
                            <Button
                                type={showDeleted ? "primary" : "default"}
                                onClick={toggleShowDeleted}
                                style={{ 
                                    backgroundColor: showDeleted ? '#ff4d4f' : undefined,
                                    borderColor: showDeleted ? '#ff4d4f' : undefined 
                                }}
                            >
                                {showDeleted ? 'Ẩn đã xóa' : 'Hiện đã xóa'}
                            </Button>
                        </div>
                        
                        <Search
                            placeholder="Tìm kiếm theo tên loại phí..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            style={{ width: 300 }}
                            onSearch={handleSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        dataSource={filteredFeeTypes}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} loại phí`,
                        }}
                        scroll={{ x: 800 }}
                    />

                    {/* Modal thêm/sửa */}
                    <Modal
                        title={editMode ? 'Cập nhật loại phí' : 'Thêm loại phí mới'}
                        open={modalVisible}
                        onCancel={handleModalCancel}
                        footer={null}
                        width={500}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            style={{ marginTop: 20 }}
                        >
                            <Form.Item
                                label="Tên loại phí"
                                name="feeType"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên loại phí!' },
                                    { min: 3, message: 'Tên loại phí phải có ít nhất 3 ký tự!' },
                                    { max: 100, message: 'Tên loại phí không được quá 100 ký tự!' },
                                    {
                                        pattern: /^[^<>]*$/,
                                        message: 'Tên loại phí không được chứa ký tự < hoặc >'
                                    }
                                ]}
                            >
                                <Input
                                    placeholder="Ví dụ: Phí thuê tháng, Phí vệ sinh, Phí bảo trì..."
                                    maxLength={100}
                                />
                            </Form.Item>

                            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                                <Space>
                                    <Button onClick={handleModalCancel}>
                                        Hủy
                                    </Button>
                                    <Button type="primary" htmlType="submit">
                                        {editMode ? 'Cập nhật' : 'Thêm mới'}
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Modal>
                </Card>
            </div>
        </div>
    );
};

export default MarketFeeTypeManagement;
