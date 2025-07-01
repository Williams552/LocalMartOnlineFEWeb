// src/pages/Admin/ContentManagement.js
import React, { useState, useEffect } from 'react';
import {
    Card,
    Tabs,
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    Select,
    Switch,
    Row,
    Col
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    QuestionCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const ContentManagement = () => {
    const [activeTab, setActiveTab] = useState('faq');
    const [faqs, setFaqs] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [form] = Form.useForm();

    // Mock data
    const mockFaqs = [
        {
            id: 1,
            question: 'Làm thế nào để đăng ký tài khoản bán hàng?',
            answer: 'Để đăng ký tài khoản bán hàng, bạn cần truy cập trang đăng ký, điền đầy đủ thông tin cá nhân và cung cấp các giấy tờ cần thiết.',
            category: 'seller',
            isActive: true,
            order: 1,
            createdAt: '2024-01-15T10:30:00Z'
        },
        {
            id: 2,
            question: 'Tôi có thể thanh toán bằng những phương thức nào?',
            answer: 'Hệ thống hỗ trợ thanh toán qua VnPay, chuyển khoản ngân hàng và thanh toán khi nhận hàng.',
            category: 'payment',
            isActive: true,
            order: 2,
            createdAt: '2024-01-15T10:30:00Z'
        }
    ];

    const mockPolicies = [
        {
            id: 1,
            title: 'Chính sách bảo mật thông tin',
            content: 'LocalMart cam kết bảo mật thông tin cá nhân của người dùng...',
            type: 'privacy',
            isActive: true,
            order: 1,
            createdAt: '2024-01-15T10:30:00Z'
        },
        {
            id: 2,
            title: 'Chính sách đổi trả hàng',
            content: 'Khách hàng có thể đổi trả hàng trong vòng 7 ngày kể từ ngày nhận hàng...',
            type: 'return',
            isActive: true,
            order: 2,
            createdAt: '2024-01-15T10:30:00Z'
        }
    ];

    const faqCategories = [
        { value: 'general', label: 'Chung' },
        { value: 'seller', label: 'Người bán' },
        { value: 'buyer', label: 'Người mua' },
        { value: 'payment', label: 'Thanh toán' },
        { value: 'delivery', label: 'Giao hàng' }
    ];

    const policyTypes = [
        { value: 'privacy', label: 'Bảo mật' },
        { value: 'terms', label: 'Điều khoản' },
        { value: 'return', label: 'Đổi trả' },
        { value: 'delivery', label: 'Giao hàng' },
        { value: 'payment', label: 'Thanh toán' }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        // Mock API calls
        setTimeout(() => {
            setFaqs(mockFaqs);
            setPolicies(mockPolicies);
            setLoading(false);
        }, 1000);
    };

    const handleCreate = (type) => {
        setSelectedItem(null);
        setEditMode(false);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setEditMode(true);
        form.setFieldsValue(item);
        setModalVisible(true);
    };

    const handleDelete = async (id, type) => {
        try {
            if (type === 'faq') {
                setFaqs(prev => prev.filter(item => item.id !== id));
            } else {
                setPolicies(prev => prev.filter(item => item.id !== id));
            }
            message.success('Xóa thành công');
        } catch (error) {
            message.error('Lỗi khi xóa');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const newItem = {
                ...values,
                id: editMode ? selectedItem.id : Date.now(),
                createdAt: editMode ? selectedItem.createdAt : new Date().toISOString()
            };

            if (activeTab === 'faq') {
                if (editMode) {
                    setFaqs(prev => prev.map(item =>
                        item.id === selectedItem.id ? newItem : item
                    ));
                } else {
                    setFaqs(prev => [...prev, newItem]);
                }
            } else {
                if (editMode) {
                    setPolicies(prev => prev.map(item =>
                        item.id === selectedItem.id ? newItem : item
                    ));
                } else {
                    setPolicies(prev => [...prev, newItem]);
                }
            }

            message.success(editMode ? 'Cập nhật thành công' : 'Tạo mới thành công');
            setModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const faqColumns = [
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            key: 'question',
            width: 300,
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (category) => {
                const cat = faqCategories.find(c => c.value === category);
                return cat?.label || category;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive) => (
                <Switch checked={isActive} size="small" />
            ),
        },
        {
            title: 'Thứ tự',
            dataIndex: 'order',
            key: 'order',
            width: 80,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="Chỉnh sửa"
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.id, 'faq')}
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

    const policyColumns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 300,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type) => {
                const policyType = policyTypes.find(t => t.value === type);
                return policyType?.label || type;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive) => (
                <Switch checked={isActive} size="small" />
            ),
        },
        {
            title: 'Thứ tự',
            dataIndex: 'order',
            key: 'order',
            width: 80,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="Chỉnh sửa"
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.id, 'policy')}
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
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Quản lý nội dung</h2>
                    <p style={{ margin: 0, color: '#666' }}>Quản lý FAQ và chính sách hệ thống</p>
                </div>
            </div>

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    tabBarExtraContent={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleCreate(activeTab)}
                        >
                            Thêm {activeTab === 'faq' ? 'FAQ' : 'chính sách'}
                        </Button>
                    }
                >
                    <TabPane
                        tab={
                            <span>
                                <QuestionCircleOutlined />
                                FAQ
                            </span>
                        }
                        key="faq"
                    >
                        <Table
                            columns={faqColumns}
                            dataSource={faqs}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} của ${total} câu hỏi`,
                            }}
                        />
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <FileTextOutlined />
                                Chính sách
                            </span>
                        }
                        key="policy"
                    >
                        <Table
                            columns={policyColumns}
                            dataSource={policies}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} của ${total} chính sách`,
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={`${editMode ? 'Chỉnh sửa' : 'Thêm'} ${activeTab === 'faq' ? 'FAQ' : 'chính sách'}`}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    {activeTab === 'faq' ? (
                        <>
                            <Form.Item
                                name="question"
                                label="Câu hỏi"
                                rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="answer"
                                label="Câu trả lời"
                                rules={[{ required: true, message: 'Vui lòng nhập câu trả lời!' }]}
                            >
                                <TextArea rows={6} />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="category"
                                        label="Danh mục"
                                        rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                                    >
                                        <Select>
                                            {faqCategories.map(cat => (
                                                <Option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="order"
                                        label="Thứ tự hiển thị"
                                        rules={[{ required: true, message: 'Vui lòng nhập thứ tự!' }]}
                                    >
                                        <Input type="number" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="isActive"
                                        label="Kích hoạt"
                                        valuePropName="checked"
                                        initialValue={true}
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <>
                            <Form.Item
                                name="title"
                                label="Tiêu đề"
                                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="content"
                                label="Nội dung"
                                rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                            >
                                <TextArea rows={10} />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="type"
                                        label="Loại chính sách"
                                        rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
                                    >
                                        <Select>
                                            {policyTypes.map(type => (
                                                <Option key={type.value} value={type.value}>
                                                    {type.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="order"
                                        label="Thứ tự hiển thị"
                                        rules={[{ required: true, message: 'Vui lòng nhập thứ tự!' }]}
                                    >
                                        <Input type="number" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="isActive"
                                        label="Kích hoạt"
                                        valuePropName="checked"
                                        initialValue={true}
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    )}

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
        </div>
    );
};

export default ContentManagement;
