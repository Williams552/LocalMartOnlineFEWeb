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
import fastBargainService from '../../../services/fastBargainService';

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
        console.log('FastBargainProducts mounted, loading data...');
        loadFastBargains();
    }, [statusFilter]);

    const loadFastBargains = async () => {
        try {
            setLoading(true);
            console.log('Loading fast bargains...');
            const result = await fastBargainService.getAllBargainsForAdmin();
            
            console.log('Bargains result:', result);
            
            if (result.success && result.data) {
                let data = result.data;
                
                // Filter by status if selected
                if (statusFilter) {
                    data = data.filter(bargain => 
                        bargain.status?.toLowerCase() === statusFilter.toLowerCase()
                    );
                }
                
                console.log('Setting bargains:', data);
                setBargains(data);
            } else {
                console.error('Failed to load bargains:', result.message);
                message.error(result.message || 'Không thể tải danh sách thương lượng nhanh');
                setBargains([]);
            }
        } catch (error) {
            console.error('Error loading fast bargains:', error);
            message.error('Không thể tải danh sách thương lượng nhanh');
            setBargains([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'orange';
            case 'accepted':
                return 'green';
            case 'rejected':
                return 'red';
            case 'expired':
                return 'gray';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'Đang chờ';
            case 'accepted':
                return 'Đã chấp nhận';
            case 'rejected':
                return 'Đã từ chối';
            case 'expired':
                return 'Đã hết hạn';
            default:
                return status || 'Không xác định';
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
                        src={record.productImages && record.productImages.length > 0 ? record.productImages[0] : '/placeholder-product.png'}
                        alt={text}
                        style={{
                            width: 40,
                            height: 40,
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid #f0f0f0'
                        }}
                        onError={(e) => {
                            e.target.src = '/placeholder-product.png';
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            ID: {record.bargainId}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            width: 120,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{record.quantity || 0}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.productUnitName || ''}
                    </Text>
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
                    <div style={{ fontWeight: 'bold' }}>{text || 'Chưa có thông tin'}</div>
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
                    <div style={{ fontWeight: 'bold' }}>{text || 'Chưa có thông tin'}</div>
                </div>
            ),
        },
        {
            title: 'Cửa hàng',
            dataIndex: 'storeName',
            key: 'storeName',
            width: 150,
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{text || 'Chưa có thông tin'}</div>
                </div>
            ),
        },
        {
            title: 'Giá gốc / Tổng giá đề xuất',
            key: 'prices',
            width: 200,
            render: (_, record) => {
                const latestProposal = record.proposals?.[record.proposals.length - 1];
                const discount = latestProposal ? calculateDiscount(record.originalPrice, latestProposal.proposedPrice) : 0;
                const totalPrice = latestProposal && record.quantity ? latestProposal.proposedPrice * record.quantity : 0;

                return (
                    <div>
                        <div style={{ textDecoration: 'line-through', color: '#999', fontSize: 12 }}>
                            Giá gốc: {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(record.originalPrice)}
                        </div>
                        {latestProposal && (
                            <>
                                <div style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: 12 }}>
                                    Giá đề xuất: {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(latestProposal.proposedPrice)}
                                </div>
                                {totalPrice > 0 && (
                                    <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                        Tổng: {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(totalPrice)}
                                    </div>
                                )}
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
            render: (date, record) => {
                // Use proposedAt from the first proposal if createdAt is not available
                const displayDate = date || (record.proposals && record.proposals.length > 0 ? record.proposals[0].proposedAt : null);
                
                if (!displayDate) {
                    return <Text type="secondary">Chưa có</Text>;
                }
                
                return (
                    <div>
                        <div>{new Date(displayDate).toLocaleDateString('vi-VN')}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(displayDate).toLocaleTimeString('vi-VN')}
                        </Text>
                    </div>
                );
            },
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
                            {bargain.createdAt 
                                ? new Date(bargain.createdAt).toLocaleString('vi-VN')
                                : new Date(bargain.proposals[0].proposedAt).toLocaleString('vi-VN')
                            }
                        </Text>
                    </div>
                </Timeline.Item>

                {bargain.proposals.map((proposal, index) => (
                    <Timeline.Item
                        key={proposal.bargainId + '_' + index}
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
                                Bởi: User {proposal.userId} - {new Date(proposal.proposedAt).toLocaleString('vi-VN')}
                            </Text>
                        </div>
                    </Timeline.Item>
                ))}

                {bargain.status?.toLowerCase() !== 'pending' && (
                    <Timeline.Item
                        dot={bargain.status?.toLowerCase() === 'accepted' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        color={bargain.status?.toLowerCase() === 'accepted' ? 'green' : 'red'}
                    >
                        <div>
                            <Text strong>
                                {bargain.status?.toLowerCase() === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối/hết hạn'}
                            </Text>
                            <br />
                            <Text type="secondary">
                                {bargain.updatedAt 
                                    ? new Date(bargain.updatedAt).toLocaleString('vi-VN')
                                    : 'Chưa có thông tin'
                                }
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
                                value={bargains.filter(b => b.status?.toLowerCase() === 'pending').length}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic
                                title="Đã chấp nhận"
                                value={bargains.filter(b => b.status?.toLowerCase() === 'accepted').length}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic
                                title="Đã từ chối"
                                value={bargains.filter(b => b.status?.toLowerCase() === 'rejected').length}
                                prefix={<CloseCircleOutlined />}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Search
                            placeholder="Tìm kiếm theo tên sản phẩm, người mua, người bán..."
                            allowClear
                        />
                    </Col>
                    <Col span={4}>
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
                    <Col span={4}>
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
                    <Col span={4}>
                        <Button
                            onClick={() => {
                                console.log('Current bargains:', bargains);
                                console.log('Status filter:', statusFilter);
                                console.log('Loading state:', loading);
                            }}
                            style={{ width: '100%' }}
                        >
                            Debug
                        </Button>
                    </Col>
                    <Col span={2}>
                        <Button
                            type="dashed"
                            onClick={() => {
                                message.info(`Tổng: ${bargains.length} thương lượng`);
                            }}
                            style={{ width: '100%' }}
                        >
                            ({bargains.length})
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={bargains}
                    rowKey="bargainId"
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
                                        {selectedBargain.bargainId}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Sản phẩm">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <img
                                                src={selectedBargain.productImages && selectedBargain.productImages.length > 0 ? selectedBargain.productImages[0] : '/placeholder-product.png'}
                                                alt={selectedBargain.productName}
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    objectFit: 'cover',
                                                    borderRadius: 4,
                                                    border: '1px solid #f0f0f0'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-product.png';
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{selectedBargain.productName}</div>
                                                <Text type="secondary">ID: {selectedBargain.bargainId}</Text>
                                            </div>
                                        </div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số lượng">
                                        <Text strong>{selectedBargain.quantity || 0} {selectedBargain.productUnitName || ''}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Người mua">
                                        <UserOutlined /> {selectedBargain.buyerName || 'Chưa có thông tin'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Người bán">
                                        <UserOutlined /> {selectedBargain.sellerName || 'Chưa có thông tin'}
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
                                    {selectedBargain.proposals && selectedBargain.proposals.length > 0 && (
                                        <Descriptions.Item label="Tổng giá đề xuất">
                                            <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(
                                                    selectedBargain.proposals[selectedBargain.proposals.length - 1].proposedPrice * 
                                                    (selectedBargain.quantity || 1)
                                                )}
                                            </Text>
                                        </Descriptions.Item>
                                    )}
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
