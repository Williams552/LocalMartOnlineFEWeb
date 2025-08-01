// src/pages/Admin/Market/MarketFeeManagement.js
import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
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
    Statistic,
    InputNumber,
    DatePicker,
    Typography,
    Alert
} from 'antd';
import {
    DollarOutlined,
    TagOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    CalendarOutlined,
    BankOutlined
} from '@ant-design/icons';
import { marketService } from '../../../services/marketService';
import { marketFeeService } from '../../../services/marketFeeService';
import { marketFeeTypeService } from '../../../services/marketFeeTypeService';
import MarketNavigation from './MarketNavigation';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const MarketFeeManagement = () => {
    const navigate = useNavigate();
    const [fees, setFees] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        marketId: ''
    });
    const [selectedFee, setSelectedFee] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadMarkets();
        loadFeeTypes();
        loadFees();
    }, [filters]); // Chỉ reload khi filters thay đổi, không cần pagination

    const loadMarkets = async () => {
        try {
            const response = await marketService.getAllMarkets();
            if (response?.data) {
                setMarkets(response.data);
            } else if (response && Array.isArray(response)) {
                // Trường hợp response trực tiếp là array
                setMarkets(response);
            } else {
                setMarkets([]);
            }
        } catch (error) {
            console.error('Error loading markets:', error);
            message.error(error.message || 'Lỗi khi tải danh sách chợ');
            setMarkets([]);
        }
    };

    const loadFeeTypes = async () => {
        try {
            const response = await marketFeeTypeService.getAllMarketFeeTypes();
            if (response?.success && response.data) {
                setFeeTypes(response.data);
            } else {
                setFeeTypes([]);
            }
        } catch (error) {
            console.error('Error loading fee types:', error);
            message.error('Lỗi khi tải danh sách loại phí');
            setFeeTypes([]);
        }
    };

    const loadFees = async () => {
        setLoading(true);
        try {
            // Backend API sử dụng GetMarketFeeRequestDto với tên parameters mới
            const params = {};
            
            // Tìm kiếm theo tên phí - backend nhận SearchKeyword
            if (filters.search && filters.search.trim()) {
                params.searchKeyword = filters.search.trim();
            }
            
            // Lọc theo marketId - backend nhận MarketId (không phải MarketFeeId)
            // Chỉ thêm marketId nếu nó có giá trị hợp lệ
            if (filters.marketId && filters.marketId !== '') {
                params.marketId = filters.marketId.toString();
            }

            console.log('=== LOAD FEES DEBUG ===');
            console.log('Current filters state:', filters);
            console.log('Params being sent to API:', params);
            console.log('========================');
            
            // Gọi API thông qua marketFeeService
            const response = await marketFeeService.getAllMarketFees(params);
            
            console.log('API response:', response);
            
            // Xử lý response từ API theo format mới
            if (response?.success && response.data) {
                console.log('Fees loaded successfully:', response.data);
                setFees(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.totalCount || response.data.length
                }));
            } else if (Array.isArray(response)) {
                // Fallback cho trường hợp response trực tiếp là array
                console.log('Fees loaded directly as array:', response);
                setFees(response);
                setPagination(prev => ({
                    ...prev,
                    total: response.length
                }));
            } else {
                console.log('No fees data found in response');
                setFees([]);
                setPagination(prev => ({
                    ...prev,
                    total: 0
                }));
            }
        } catch (error) {
            console.error('Error loading fees:', error);
            // Nếu có lỗi với filter, thử load lại mà không có filter marketId
            if (filters.marketId) {
                console.log('Retrying without marketId filter due to error');
                try {
                    const fallbackParams = {};
                    if (filters.search && filters.search.trim()) {
                        fallbackParams.searchKeyword = filters.search.trim();
                    }
                    
                    const fallbackResponse = await marketFeeService.getAllMarketFees(fallbackParams);
                    if (fallbackResponse?.success && fallbackResponse.data) {
                        setFees(fallbackResponse.data);
                        setPagination(prev => ({
                            ...prev,
                            total: fallbackResponse.totalCount || fallbackResponse.data.length
                        }));
                        message.warning('Không thể lọc theo chợ được chọn, hiển thị tất cả phí');
                        return;
                    }
                } catch (fallbackError) {
                    console.error('Fallback request also failed:', fallbackError);
                }
            }
            
            message.error(error.message || 'Lỗi khi tải danh sách phí');
            setFees([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (paginationData) => {
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

    // Thêm hàm tìm kiếm riêng biệt
    const handleAdvancedSearch = async (keyword) => {
        console.log('handleAdvancedSearch called with keyword:', keyword);
        if (!keyword.trim()) {
            // Nếu không có keyword, load lại toàn bộ với filter hiện tại
            console.log('Keyword is empty, clearing search filter');
            setFilters(prev => ({ ...prev, search: '' }));
            return;
        }

        // Cập nhật search filter và tự động reload
        console.log('Setting search filter to:', keyword.trim());
        setFilters(prev => ({ ...prev, search: keyword.trim() }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleFilterChange = (key, value) => {
        console.log(`handleFilterChange called: ${key} = ${value}`);
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleCreateFee = () => {
        setSelectedFee(null);
        setEditMode(false);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditFee = (fee) => {
        setSelectedFee(fee);
        setEditMode(true);
        form.setFieldsValue({
            marketId: fee.marketId,
            marketFeeTypeId: fee.marketFeeTypeId,
            name: fee.name,
            amount: fee.amount,
            description: fee.description,
            paymentDay: fee.paymentDay
        });
        setModalVisible(true);
    };

    const handleViewFee = async (fee) => {
        try {
            // Lấy thông tin chi tiết của phí từ API
            const detailedFee = await marketFeeService.getMarketFeeById(fee.id);
            setSelectedFee(detailedFee.data || fee);
            setDrawerVisible(true);
        } catch (error) {
            console.error('Error loading fee details:', error);
            // Nếu không tải được chi tiết, vẫn hiển thị thông tin cơ bản
            setSelectedFee(fee);
            setDrawerVisible(true);
        }
    };

    const handleDeleteFee = async (feeId) => {
        try {
            await marketFeeService.deleteMarketFee(feeId);
            message.success('Xóa phí thành công');
            loadFees();
        } catch (error) {
            console.error('Error deleting fee:', error);
            message.error(error.message || 'Lỗi khi xóa phí');
        }
    };

    const handleSubmit = async (values) => {
        try {
            console.log('Form values:', values);
            
            // Sử dụng DTO format cho tạo mới và cập nhật - Backend expect string cho MarketId và MarketFeeTypeId
            const feeData = {
                marketId: values.marketId.toString(), // Backend expect string
                marketFeeTypeId: values.marketFeeTypeId.toString(), // Backend expect string
                name: values.name.trim(),
                amount: parseFloat(values.amount),
                description: values.description?.trim() || '',
                paymentDay: parseInt(values.paymentDay)
            };

            console.log('Sending fee data:', feeData);

            let response;
            if (editMode && selectedFee) {
                response = await marketFeeService.updateMarketFee(selectedFee.id, feeData);
                console.log('Update result:', response);
                if (response.success) {
                    message.success('Cập nhật phí thành công');
                } else {
                    message.error(response.message || 'Cập nhật phí thất bại');
                }
            } else {
                response = await marketFeeService.createMarketFee(feeData);
                console.log('Create result:', response);
                if (response.success) {
                    message.success('Tạo phí thành công');
                } else {
                    message.error(response.message || 'Tạo phí thất bại');
                }
            }

            if (response.success) {
                setModalVisible(false);
                form.resetFields();
                loadFees();
            }
        } catch (error) {
            console.error('Error saving fee:', error);
            message.error(error.response?.data?.message || error.message || (editMode ? 'Lỗi khi cập nhật phí' : 'Lỗi khi tạo phí'));
        }
    };

    const columns = [
        {
            title: 'Mã phí',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: 'Chợ',
            dataIndex: 'marketName',
            key: 'marketName',
            width: 150,
            render: (text, record) => {
                // Nếu có thông tin market object
                return record.market?.name || text || 'Chưa xác định';
            }
        },
        {
            title: 'Loại phí',
            dataIndex: 'marketFeeTypeName',
            key: 'marketFeeTypeName',
            width: 150,
            render: (text, record) => {
                // Hiển thị tên loại phí từ response
                return text || record.marketFeeType?.name || 'Chưa xác định';
            }
        },
        {
            title: 'Tên phí',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (text) => (
                <Text strong>{text || 'Chưa đặt tên'}</Text>
            ),
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount) => (
                <Text strong style={{ color: '#52c41a' }}>
                    {amount?.toLocaleString('vi-VN')} VNĐ
                </Text>
            ),
        },
        {
            title: 'Hạn thanh toán',
            dataIndex: 'paymentDay',
            key: 'paymentDay',
            width: 120,
            render: (paymentDay) => {
                if (typeof paymentDay === 'number' && paymentDay > 0) {
                    return `Ngày ${paymentDay} hàng tháng`;
                }
                return 'Chưa thiết lập';
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : '',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewFee(record)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditFee(record)}
                        title="Chỉnh sửa"
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa phí này?"
                        onConfirm={() => handleDeleteFee(record.id)}
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
            <MarketNavigation />
            <div style={{ padding: '0 24px 24px' }}>
                <Card>
                <div style={{ marginBottom: '16px' }}>
                    <Title level={3}>
                        <DollarOutlined /> Quản lý Phí Chợ
                    </Title>
                    <Alert
                        message="Thông tin"
                        description="Quản lý các khoản phí của chợ bao gồm phí thuê, phí dịch vụ, phí bảo trì và các khoản phí khác."
                        type="info"
                        showIcon
                        style={{ marginTop: '8px' }}
                    />
                </div>

                {/* Filters */}
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col xs={24} sm={8} lg={6}>
                        <Search
                            placeholder="Tìm kiếm phí..."
                            allowClear
                            onSearch={handleAdvancedSearch}
                            onChange={(e) => {
                                console.log('Search input changed:', e.target.value);
                                // Cho phép người dùng gõ tự do, chỉ clear filter khi input trống
                                if (!e.target.value.trim()) {
                                    console.log('Search input is empty, clearing search filter');
                                    setFilters(prev => ({ ...prev, search: '' }));
                                }
                            }}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={8} lg={4}>
                        <Select
                            placeholder="Chọn chợ"
                            allowClear
                            loading={loading}
                            value={filters.marketId}
                            onChange={(value) => handleFilterChange('marketId', value)}
                            style={{ width: '100%' }}
                        >
                            {markets.map(market => (
                                <Option key={market.id} value={market.id}>
                                    {market.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Button 
                            onClick={() => {
                                console.log('Reset button clicked');
                                setFilters({ search: '', marketId: '' });
                                setPagination(prev => ({ ...prev, current: 1 }));
                            }}
                            loading={loading}
                            >
                            Làm mới
                        </Button>
                    </Col>
                    <Col xs={24} sm={8} lg={6}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateFee}
                            style={{ width: '100%' }}
                        >
                            Tạo phí mới
                        </Button>
                    </Col>
                    <Col xs={24} sm={8} lg={6}>
                        <Button
                            type="default"
                            icon={<TagOutlined />}
                            onClick={() => navigate('/admin/market-fee-types')}
                            style={{ width: '100%' }}
                        >
                            Quản lý loại phí
                        </Button>
                    </Col>
                </Row>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={fees}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} phí`,
                    }}
                    loading={loading}
                    onChange={handleTableChange}
                    rowKey="id"
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editMode ? 'Chỉnh sửa phí' : 'Tạo phí mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
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
                                name="marketId"
                                label="Chọn chợ"
                                rules={[{ required: true, message: 'Vui lòng chọn chợ!' }]}
                            >
                                <Select placeholder="Chọn chợ">
                                    {markets.map(market => (
                                        <Option key={market.id} value={market.id}>
                                            {market.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="marketFeeTypeId"
                                label="Loại phí"
                                rules={[{ required: true, message: 'Vui lòng chọn loại phí!' }]}
                            >
                                <Select placeholder="Chọn loại phí">
                                    {feeTypes.map(feeType => (
                                        <Option key={feeType.id} value={feeType.id}>
                                            {feeType.feeType}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên phí"
                                rules={[{ required: true, message: 'Vui lòng nhập tên phí!' }]}
                            >
                                <Input placeholder="Nhập tên phí..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="paymentDay"
                                label="Ngày thanh toán hàng tháng"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày thanh toán hàng tháng!' }]}
                            >
                                <Select placeholder="Chọn ngày">
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                        <Option key={day} value={day}>
                                            {day}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="amount"
                                label="Số tiền (VNĐ)"
                                rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Nhập số tiền"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả cho phí này..."
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
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

            {/* View Fee Drawer */}
            <Drawer
                title="Chi tiết phí"
                placement="right"
                size="large"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                {selectedFee && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                backgroundColor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <DollarOutlined style={{ fontSize: '32px' }} />
                            </div>
                            <h3>Chi tiết phí #{selectedFee.id}</h3>
                        </div>

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Chợ">
                                {selectedFee.market?.name || selectedFee.marketName || 'Chưa xác định'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên phí">
                                <Text strong>{selectedFee.name || 'Chưa đặt tên'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tiền">
                                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                    {selectedFee.amount?.toLocaleString('vi-VN')} VNĐ
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {selectedFee.description}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày thanh toán">
                                {typeof selectedFee.paymentDay === 'number' && selectedFee.paymentDay > 0
                                    ? `Ngày ${selectedFee.paymentDay} hàng tháng`
                                    : 'Chưa thiết lập'
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {selectedFee.createdAt ? moment(selectedFee.createdAt).format('DD/MM/YYYY HH:mm') : 'Chưa cập nhật'}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setDrawerVisible(false);
                                        handleEditFee(selectedFee);
                                    }}
                                >
                                    Chỉnh sửa
                                </Button>
                                <Button
                                    icon={<BankOutlined />}
                                    onClick={() => {
                                        // Handle payment tracking
                                    }}
                                >
                                    Theo dõi thanh toán
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
        </div>
    );
};

export default MarketFeeManagement;
