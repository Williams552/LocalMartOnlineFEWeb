// src/pages/Admin/FAQ/FAQManagement.js
import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    Row,
    Col,
    Statistic,
    Badge,
    Typography,
    Tag
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    QuestionCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import faqService from '../../../services/faqService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const FAQManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState(null);
    const [form] = Form.useForm();
    const [statistics, setStatistics] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    useEffect(() => {
        loadFaqs();
    }, []);

    const loadFaqs = async () => {
        setLoading(true);
        try {
            const response = await faqService.getAllFaqs();
            if (response.success) {
                const formattedFaqs = response.data.map(faq => 
                    faqService.formatFaqDisplay(faq)
                );
                setFaqs(formattedFaqs);
                
                // Calculate statistics
                const stats = {
                    total: formattedFaqs.length,
                    active: formattedFaqs.filter(faq => faq.isActive !== false).length,
                    inactive: formattedFaqs.filter(faq => faq.isActive === false).length
                };
                setStatistics(stats);
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedFaq(null);
        setEditMode(false);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (faq) => {
        setSelectedFaq(faq);
        setEditMode(true);
        form.setFieldsValue({
            question: faq.question,
            answer: faq.answer
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await faqService.deleteFaq(id);
            if (response.success) {
                message.success(response.message);
                loadFaqs();
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('Lỗi khi xóa FAQ');
        }
    };

    const handleSubmit = async (values) => {
        try {
            let response;
            if (editMode) {
                response = await faqService.updateFaq(selectedFaq.id, values);
            } else {
                response = await faqService.createFaq(values);
            }

            if (response.success) {
                message.success(response.message);
                setModalVisible(false);
                form.resetFields();
                loadFaqs();
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error(editMode ? 'Lỗi khi cập nhật FAQ' : 'Lỗi khi tạo FAQ');
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            key: 'question',
            ellipsis: true,
            render: (text) => (
                <div>
                    <QuestionCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    <Text strong>{text}</Text>
                </div>
            ),
        },
        {
            title: 'Câu trả lời',
            dataIndex: 'answer',
            key: 'answer',
            ellipsis: true,
            render: (text) => (
                <div style={{ 
                    maxWidth: 300, 
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive) => (
                <Tag color={isActive !== false ? 'green' : 'red'}>
                    {isActive !== false ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAtDisplay',
            key: 'createdAt',
            width: 120,
        },
        {
            title: 'Hành động',
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
                        title="Xóa FAQ"
                        description="Bạn có chắc muốn xóa FAQ này?"
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
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Quản lý FAQ</Title>
            
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Tổng số FAQ"
                            value={statistics.total}
                            prefix={<QuestionCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={statistics.active}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Không hoạt động"
                            value={statistics.inactive}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Table */}
            <Card 
                title="Danh sách FAQ"
                extra={
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadFaqs}
                            loading={loading}
                        >
                            Làm mới
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                        >
                            Thêm FAQ
                        </Button>
                    </Space>
                }
            >
                <Table
                    dataSource={faqs}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} FAQ`,
                    }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editMode ? 'Chỉnh sửa FAQ' : 'Thêm FAQ mới'}
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
                    <Form.Item
                        name="question"
                        label="Câu hỏi"
                        rules={[
                            { required: true, message: 'Vui lòng nhập câu hỏi!' },
                            { min: 10, message: 'Câu hỏi phải có ít nhất 10 ký tự' }
                        ]}
                    >
                        <Input 
                            placeholder="Nhập câu hỏi..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item
                        name="answer"
                        label="Câu trả lời"
                        rules={[
                            { required: true, message: 'Vui lòng nhập câu trả lời!' },
                            { min: 20, message: 'Câu trả lời phải có ít nhất 20 ký tự' }
                        ]}
                    >
                        <TextArea 
                            rows={6}
                            placeholder="Nhập câu trả lời chi tiết..."
                            maxLength={2000}
                            showCount
                        />
                    </Form.Item>

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

export default FAQManagement;
