import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    message,
    Modal,
    Input,
    Select,
    Row,
    Col,
    Typography,
    Empty,
    Descriptions,
    Timeline,
    Progress,
    Statistic
} from 'antd';
import {
    EyeOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    UserOutlined,
    CalendarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const FastBargainProducts = () => {
    const [bargains, setBargains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBargain, setSelectedBargain] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState(null);

    useEffect(() => {
        loadFastBargains();
    }, [statusFilter]);

    const loadFastBargains = async () => {
        try {
            setLoading(true);
            // TODO: Implement API call when backend has admin endpoints for fast bargains
            // const response = await fastBargainService.getAllFastBargains({ status: statusFilter });
            // setBargains(response.data);

            // Mock data for demo
            const mockData = [
                {
                    id: '1',
                    productId: 'prod1',
                    productName: 'Táo Fuji nhập khẩu',
                    productImage: '/placeholder-product.png',
                    originalPrice: 150000,
                    buyerId: 'buyer1',
                    buyerName: 'Nguyễn Văn A',
                    sellerId: 'seller1',
                    sellerName: 'Cửa hàng ABC',
                    status: 'Pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    proposals: [
                        {
                            id: 'prop1',
                            userId: 'buyer1',
                            userName: 'Nguyễn Văn A',
                            proposedPrice: 120000,
                            proposedAt: new Date().toISOString()
                        }
                    ]
                },
                {
                    id: '2',
                    productId: 'prod2',
                    productName: 'Thịt bò tươi',
                    productImage: '/placeholder-product.png',
                    originalPrice: 450000,
                    buyerId: 'buyer2',
                    buyerName: 'Trần Thị B',
                    sellerId: 'seller2',
                    sellerName: 'Cửa hàng XYZ',
                    status: 'Accepted',
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    updatedAt: new Date().toISOString(),
                    proposals: [
                        {
                            id: 'prop2',
                            userId: 'buyer2',
                            userName: 'Trần Thị B',
                            proposedPrice: 400000,
                            proposedAt: new Date(Date.now() - 86400000).toISOString()
                        }
                    ]
                }
            ];

            setTimeout(() => {
                setBargains(statusFilter ? mockData.filter(b => b.status === statusFilter) : mockData);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error loading fast bargains:', error);
            message.error('Không thể tải danh sách thương lượng nhanh');
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'orange';
            case 'Accepted':
                return 'green';
            case 'Rejected':
                return 'red';
            case 'Expired':
                return 'gray';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Pending':
                return 'Đang chờ';
            case 'Accepted':
                return 'Đã chấp nhận';
            case 'Rejected':
                return 'Đã từ chối';
            case 'Expired':
                return 'Đã hết hạn';
            default:
                return status;
        }
    };

    const calculateDiscount = (original, proposed) => {
        return Math.round(((original - proposed) / original) * 100);
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            ellipsis: true,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img
                        src={record.productImage}
                        alt={text}
                        style={{
                            width: 40,
                            height: 40,
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid #f0f0f0'
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            ID: {record.productId}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Người mua',
            dataIndex: 'buyerName',
            key: 'buyerName',
            width: 150,
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{text}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        ID: {record.buyerId}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Người bán',
            dataIndex: 'sellerName',
            key: 'sellerName',
            width: 150,
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{text}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        ID: {record.sellerId}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Giá gốc / Đề xuất',
            key: 'prices',
            width: 180,
            render: (_, record) => {
                const latestProposal = record.proposals?.[record.proposals.length - 1];
                const discount = latestProposal ? calculateDiscount(record.originalPrice, latestProposal.proposedPrice) : 0;

                return (
                    <div>
                        <div style={{ textDecoration: 'line-through', color: '#999', fontSize: 12 }}>
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(record.originalPrice)}
                        </div>
                        {latestProposal && (
                            <>
                                <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(latestProposal.proposedPrice)}
                                </div>
                                <Tag color="red" size="small">
                                    -{discount}%
                                </Tag>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => (
                <div>
                    <div>{new Date(date).toLocaleDateString('vi-VN')}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(date).toLocaleTimeString('vi-VN')}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => {
                        setSelectedBargain(record);
                        setDetailModalVisible(true);
                    }}
                >
                    Xem
                </Button>
            ),
        },
    ];

    const renderBargainTimeline = (bargain) => {
        if (!bargain.proposals || bargain.proposals.length === 0) return null;

        return (
            <Timeline>
                <Timeline.Item
                    dot={<CalendarOutlined />}
                    color="blue"
                >
                    <div>
                        <Text strong>Bắt đầu thương lượng</Text>
                        <br />
                        <Text type="secondary">
                            {new Date(bargain.createdAt).toLocaleString('vi-VN')}
                        </Text>
                    </div>
                </Timeline.Item>

                {bargain.proposals.map((proposal, index) => (
                    <Timeline.Item
                        key={proposal.id}
                        dot={<DollarOutlined />}
                        color="orange"
                    >
                        <div>
                            <Text strong>Đề xuất giá: {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(proposal.proposedPrice)}</Text>
                            <br />
                            <Text type="secondary">
                                Bởi: {proposal.userName} - {new Date(proposal.proposedAt).toLocaleString('vi-VN')}
                            </Text>
                        </div>
                    </Timeline.Item>
                ))}

                {bargain.status !== 'Pending' && (
                    <Timeline.Item
                        dot={bargain.status === 'Accepted' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        color={bargain.status === 'Accepted' ? 'green' : 'red'}
                    >
                        <div>
                            <Text strong>
                                {bargain.status === 'Accepted' ? 'Đã chấp nhận' : 'Đã từ chối/hết hạn'}
                            </Text>
                            <br />
                            <Text type="secondary">
                                {new Date(bargain.updatedAt).toLocaleString('vi-VN')}
                            </Text>
                        </div>
                    </Timeline.Item>
                )}
            </Timeline>
        );
    };

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={3}>
                        <ClockCircleOutlined /> Sản phẩm khuyến mãi / Thương lượng nhanh
                    </Title>
                    <Text type="secondary">
                        Quản lý các phiên thương lượng nhanh giữa người mua và người bán
                    </Text>
                </div>

                {/* Statistics */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic
                                title="Tổng số phiên"
                                value={bargains.length}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic
                                title="Đang chờ"
                                value={bargains.filter(b => b.status === 'Pending').length}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic
                                title="Đã chấp nhận"
                                value={bargains.filter(b => b.status === 'Accepted').length}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic
                                title="Đã từ chối"
                                value={bargains.filter(b => b.status === 'Rejected').length}
                                prefix={<CloseCircleOutlined />}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Search
                            placeholder="Tìm kiếm theo tên sản phẩm, người mua, người bán..."
                            allowClear
                        />
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Option value="Pending">Đang chờ</Option>
                            <Option value="Accepted">Đã chấp nhận</Option>
                            <Option value="Rejected">Đã từ chối</Option>
                            <Option value="Expired">Đã hết hạn</Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Sắp xếp theo"
                            defaultValue="newest"
                            style={{ width: '100%' }}
                        >
                            <Option value="newest">Mới nhất</Option>
                            <Option value="oldest">Cũ nhất</Option>
                            <Option value="price_high">Giá cao nhất</Option>
                            <Option value="price_low">Giá thấp nhất</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button
                            type="primary"
                            onClick={loadFastBargains}
                            loading={loading}
                            style={{ width: '100%' }}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={bargains}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        total: bargains.length,
                        pageSize: 20,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} phiên thương lượng`,
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                description="Không có phiên thương lượng nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ),
                    }}
                />
            </Card>

            {/* Bargain Detail Modal */}
            <Modal
                title={
                    <div>
                        <ClockCircleOutlined /> Chi tiết phiên thương lượng
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedBargain(null);
                }}
                footer={null}
                width={900}
            >
                {selectedBargain && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Descriptions title="Thông tin cơ bản" column={1}>
                                    <Descriptions.Item label="ID phiên">
                                        {selectedBargain.id}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Sản phẩm">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <img
                                                src={selectedBargain.productImage}
                                                alt={selectedBargain.productName}
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    objectFit: 'cover',
                                                    borderRadius: 4,
                                                    border: '1px solid #f0f0f0'
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{selectedBargain.productName}</div>
                                                <Text type="secondary">ID: {selectedBargain.productId}</Text>
                                            </div>
                                        </div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Người mua">
                                        <UserOutlined /> {selectedBargain.buyerName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Người bán">
                                        <UserOutlined /> {selectedBargain.sellerName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag color={getStatusColor(selectedBargain.status)}>
                                            {getStatusText(selectedBargain.status)}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giá gốc">
                                        <Text strong style={{ fontSize: 16 }}>
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(selectedBargain.originalPrice)}
                                        </Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col span={12}>
                                <Title level={5}>Lịch sử thương lượng</Title>
                                {renderBargainTimeline(selectedBargain)}
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FastBargainProducts;
