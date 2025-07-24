import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    message,
    Popconfirm,
    Modal,
    Form,
    Input,
    Descriptions,
    Image,
    Row,
    Col,
    Statistic,
    Badge,
    Avatar,
    Drawer,
    Typography,
    Upload,
    Pagination
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    ReloadOutlined,
    PlusOutlined,
    UploadOutlined,
    FileImageOutlined
} from '@ant-design/icons';
import categoryRegistrationService from '../../../services/categoryRegistrationService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CategoryRegistrationManagement = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [form] = Form.useForm();
    const [statistics, setStatistics] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        loadRegistrations();
    }, [pagination.current, pagination.pageSize]);

    const loadRegistrations = async () => {
        setLoading(true);
        try {
            const response = await categoryRegistrationService.getAllRegistrations({
                page: pagination.current,
                pageSize: pagination.pageSize
            });

            if (response.success && Array.isArray(response.data)) {
                const formattedData = response.data.map(reg => 
                    categoryRegistrationService.formatRegistrationDisplay(reg)
                );
                setRegistrations(formattedData);
                
                setPagination(prev => ({
                    ...prev,
                    total: response.pagination?.total || formattedData.length
                }));

                // Calculate statistics
                const stats = {
                    total: formattedData.length,
                    pending: formattedData.filter(r => r.status === 'Pending' || r.status === 0).length,
                    approved: formattedData.filter(r => r.status === 'Approved' || r.status === 1).length,
                    rejected: formattedData.filter(r => r.status === 'Rejected' || r.status === 2).length
                };
                setStatistics(stats);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách đăng ký: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (registration) => {
        try {
            await categoryRegistrationService.approveRegistration(registration.id);
            message.success('Đã phê duyệt đăng ký danh mục thành công');
            loadRegistrations();
        } catch (error) {
            message.error('Lỗi khi phê duyệt: ' + error.message);
        }
    };

    const handleReject = async (values) => {
        try {
            await categoryRegistrationService.rejectRegistration(
                selectedRegistration.id, 
                values.rejectionReason
            );
            message.success('Đã từ chối đăng ký danh mục');
            setRejectModalVisible(false);
            form.resetFields();
            loadRegistrations();
        } catch (error) {
            message.error('Lỗi khi từ chối: ' + error.message);
        }
    };

    const showViewModal = (registration) => {
        setSelectedRegistration(registration);
        setViewModalVisible(true);
    };

    const showRejectModal = (registration) => {
        setSelectedRegistration(registration);
        setRejectModalVisible(true);
    };

    const handlePaginationChange = (page, pageSize) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: pageSize
        }));
    };

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (text, record) => (
                <Space>
                    <Avatar shape="square" icon={<FileImageOutlined />} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            ID: {record.id}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (text) => (
                <div style={{ 
                    maxWidth: 200, 
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {text}
                </div>
            )
        },
        {
            title: 'Người đăng ký',
            dataIndex: 'sellerId',
            key: 'sellerId',
            render: (sellerId) => (
                <Text code>{sellerId}</Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Tag color={record.statusColor}>
                    {record.statusDisplay}
                </Tag>
            ),
            filters: [
                { text: 'Chờ duyệt', value: 'Pending' },
                { text: 'Đã duyệt', value: 'Approved' },
                { text: 'Đã từ chối', value: 'Rejected' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAtDisplay',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => showViewModal(record)}
                        title="Xem chi tiết"
                    />
                    
                    {(record.status === 'Pending' || record.status === 0) && (
                        <>
                            <Popconfirm
                                title="Xác nhận phê duyệt"
                                description="Bạn có chắc muốn phê duyệt đăng ký này?"
                                onConfirm={() => handleApprove(record)}
                                okText="Phê duyệt"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    icon={<CheckOutlined />}
                                    style={{ color: '#52c41a' }}
                                    title="Phê duyệt"
                                />
                            </Popconfirm>
                            
                            <Button
                                type="text"
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => showRejectModal(record)}
                                title="Từ chối"
                            />
                        </>
                    )}
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
                            title="Tổng đăng ký"
                            value={statistics.total}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chờ duyệt"
                            value={statistics.pending}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã duyệt"
                            value={statistics.approved}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã từ chối"
                            value={statistics.rejected}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card 
                title="Quản lý đăng ký danh mục"
                extra={
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadRegistrations}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                }
            >
                <Table
                    dataSource={registrations}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 1200 }}
                />
                
                <div style={{ textAlign: 'right', marginTop: 16 }}>
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showQuickJumper
                        showSizeChanger
                        showTotal={(total, range) => 
                            `${range[0]}-${range[1]} của ${total} đăng ký`
                        }
                        onChange={handlePaginationChange}
                        onShowSizeChange={handlePaginationChange}
                    />
                </div>
            </Card>

            {/* View Detail Modal */}
            <Modal
                title="Chi tiết đăng ký danh mục"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedRegistration && (
                    <div>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item label="ID">
                                        {selectedRegistration.id}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag color={selectedRegistration.statusColor}>
                                            {selectedRegistration.statusDisplay}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tên danh mục">
                                        {selectedRegistration.categoryName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Người đăng ký">
                                        {selectedRegistration.sellerId}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày tạo">
                                        {selectedRegistration.createdAtDisplay}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cập nhật cuối">
                                        {selectedRegistration.updatedAtDisplay}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                        
                        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                            <Col span={24}>
                                <Title level={5}>Mô tả</Title>
                                <div style={{ 
                                    padding: 12, 
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 4,
                                    background: '#fafafa'
                                }}>
                                    {selectedRegistration.description || 'Không có mô tả'}
                                </div>
                            </Col>
                        </Row>

                        {selectedRegistration.imageUrls && selectedRegistration.imageUrls.length > 0 && (
                            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <Title level={5}>Hình ảnh đính kèm</Title>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {selectedRegistration.imageUrls.map((url, index) => (
                                            <Image
                                                key={index}
                                                width={100}
                                                height={100}
                                                src={url}
                                                style={{ objectFit: 'cover', borderRadius: 4 }}
                                                placeholder={
                                                    <div style={{ 
                                                        width: 100, 
                                                        height: 100, 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        background: '#f0f0f0' 
                                                    }}>
                                                        <FileImageOutlined />
                                                    </div>
                                                }
                                            />
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                        )}

                        {selectedRegistration.rejectionReason && (
                            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <Title level={5} style={{ color: '#f5222d' }}>Lý do từ chối</Title>
                                    <div style={{ 
                                        padding: 12, 
                                        border: '1px solid #ffccc7',
                                        borderRadius: 4,
                                        background: '#fff2f0'
                                    }}>
                                        {selectedRegistration.rejectionReason}
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Từ chối đăng ký danh mục"
                open={rejectModalVisible}
                onCancel={() => {
                    setRejectModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleReject}
                >
                    <Form.Item
                        name="rejectionReason"
                        label="Lý do từ chối"
                        rules={[
                            { required: true, message: 'Vui lòng nhập lý do từ chối' },
                            { min: 5, message: 'Lý do phải có ít nhất 5 ký tự' }
                        ]}
                    >
                        <TextArea 
                            rows={4} 
                            placeholder="Nhập lý do từ chối đăng ký này..." 
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryRegistrationManagement;
