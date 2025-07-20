import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Typography,
    Row,
    Col,
    Statistic,
    message,
    Modal,
    Descriptions,
    Image,
    Empty
} from 'antd';
import {
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    FileImageOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import categoryRegistrationService from '../../../services/categoryRegistrationService';
import { useAuth } from '../../../hooks/useAuth';

const { Title, Text } = Typography;

const MyRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const { user } = useAuth();

    const [statistics, setStatistics] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        loadMyRegistrations();
    }, []);

    const loadMyRegistrations = async () => {
        setLoading(true);
        try {
            // Note: This would require a new API endpoint to get registrations by seller ID
            // For now, we'll get all and filter client-side (not ideal for production)
            const response = await categoryRegistrationService.getAllRegistrations();
            
            if (response.success && Array.isArray(response.data)) {
                // Filter registrations by current user
                const myRegistrations = response.data.filter(reg => reg.sellerId === user?.id);
                
                const formattedData = myRegistrations.map(reg => 
                    categoryRegistrationService.formatRegistrationDisplay(reg)
                );
                
                setRegistrations(formattedData);

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

    const showViewModal = (registration) => {
        setSelectedRegistration(registration);
        setViewModalVisible(true);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
            case 0:
                return <ClockCircleOutlined />;
            case 'Approved':
            case 1:
                return <CheckCircleOutlined />;
            case 'Rejected':
            case 2:
                return <CloseCircleOutlined />;
            default:
                return <ClockCircleOutlined />;
        }
    };

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FileImageOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.createdAtDisplay}
                        </Text>
                    </div>
                </div>
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
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Tag icon={getStatusIcon(status)} color={record.statusColor}>
                    {record.statusDisplay}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => showViewModal(record)}
                    title="Xem chi tiết"
                />
            )
        }
    ];

    if (registrations.length === 0 && !loading) {
        return (
            <div style={{ textAlign: 'center', padding: '48px' }}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span>
                            Bạn chưa có đăng ký danh mục nào
                        </span>
                    }
                >
                    <Button type="primary" icon={<PlusOutlined />}>
                        Đăng ký danh mục mới
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng đăng ký"
                            value={statistics.total}
                            prefix={<FileImageOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chờ duyệt"
                            value={statistics.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã duyệt"
                            value={statistics.approved}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã từ chối"
                            value={statistics.rejected}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card 
                title="Danh sách đăng ký của tôi"
                extra={
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadMyRegistrations}
                            loading={loading}
                        >
                            Làm mới
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                        >
                            Đăng ký mới
                        </Button>
                    </Space>
                }
            >
                <Table
                    dataSource={registrations}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showQuickJumper: true,
                        showSizeChanger: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} của ${total} đăng ký`
                    }}
                />
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
                                    <Descriptions.Item label="Tên danh mục" span={2}>
                                        <Text strong>{selectedRegistration.categoryName}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag 
                                            icon={getStatusIcon(selectedRegistration.status)} 
                                            color={selectedRegistration.statusColor}
                                        >
                                            {selectedRegistration.statusDisplay}
                                        </Tag>
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
                                    {selectedRegistration.description}
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
                                            />
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                        )}

                        {selectedRegistration.rejectionReason && (
                            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <Title level={5} style={{ color: '#f5222d' }}>
                                        <CloseCircleOutlined style={{ marginRight: 8 }} />
                                        Lý do từ chối
                                    </Title>
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
        </div>
    );
};

export default MyRegistrations;
