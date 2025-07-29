import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Card,
    Button,
    Input,
    Space,
    Tag,
    message,
    Modal,
    Descriptions,
    Typography,
    Row,
    Col,
    Tooltip,
    Select,
    Pagination,
    Empty
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
    BarChartOutlined,
    DownloadOutlined,
    FileTextOutlined,
    UserOutlined,
    ShopOutlined,
    BoxPlotOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import reportService from '../../../services/reportService';
import { ReportDetails } from '../../../components/Report';

const { Search } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedTargetType, setSelectedTargetType] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [adminResponse, setAdminResponse] = useState('');

    const fetchReports = useCallback(async (page = 1, pageSize = 20) => {
        return fetchReportsWithFilters(page, pageSize, {
            search: searchKeyword,
            status: selectedStatus,
            targetType: selectedTargetType
        });
    }, [searchKeyword, selectedStatus, selectedTargetType]);

    const fetchReportsWithFilters = async (page = 1, pageSize = 20, filters = {}) => {
        try {
            setLoading(true);
            console.log('🔍 Fetching reports with filters:', { page, pageSize, ...filters });
            
            const result = await reportService.getReports({
                page,
                pageSize,
                ...filters
            });
            
            console.log('📋 Service result:', result);
            
            if (result.success) {
                // Handle different response formats
                const responseData = result.data;
                console.log('📋 Response data:', responseData);
                
                // Check for direct reports array in response data
                if (responseData && responseData.reports && Array.isArray(responseData.reports)) {
                    console.log('✅ Found reports in responseData.reports:', responseData.reports.length);
                    setReports(responseData.reports);
                    setPagination({
                        current: page,
                        pageSize,
                        total: responseData.totalCount || responseData.reports.length,
                    });
                }
                // Check for nested Reports array
                else if (responseData && responseData.Reports && Array.isArray(responseData.Reports)) {
                    console.log('✅ Found reports in responseData.Reports:', responseData.Reports.length);
                    setReports(responseData.Reports);
                    setPagination({
                        current: page,
                        pageSize,
                        total: responseData.TotalCount || responseData.Reports.length,
                    });
                } 
                // Check if responseData is directly an array
                else if (Array.isArray(responseData)) {
                    console.log('✅ Found reports as direct array:', responseData.length);
                    setReports(responseData);
                    setPagination({
                        current: page,
                        pageSize,
                        total: responseData.length,
                    });
                } 
                // Check if result itself has reports array (direct API response)
                else if (result.reports && Array.isArray(result.reports)) {
                    console.log('✅ Found reports in result.reports:', result.reports.length);
                    setReports(result.reports);
                    setPagination({
                        current: page,
                        pageSize,
                        total: result.totalCount || result.reports.length,
                    });
                } else {
                    console.warn('⚠️ No reports found in response, setting empty array');
                    setReports([]);
                    setPagination({
                        current: page,
                        pageSize,
                        total: 0,
                    });
                    console.warn('Unexpected response format:', result);
                }
            } else {
                setReports([]);
                setPagination({
                    current: page,
                    pageSize,
                    total: 0,
                });
                message.error(result.message || 'Không thể tải danh sách báo cáo');
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            setReports([]);
            setPagination({
                current: page,
                pageSize,
                total: 0,
            });
            message.error('Có lỗi xảy ra khi tải báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = useCallback(async () => {
        try {
            const result = await reportService.getReportStatistics();
            if (result.success) {
                setStatistics(result.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }, []);

    useEffect(() => {
        fetchReports();
        fetchStatistics();
    }, [fetchReports]);

    const handleSearch = (value) => {
        setSearchKeyword(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchReportsWithFilters(1, pagination.pageSize, {
            search: value,
            status: selectedStatus,
            targetType: selectedTargetType
        });
    };

    const handleStatusChange = (value) => {
        setSelectedStatus(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchReportsWithFilters(1, pagination.pageSize, {
            search: searchKeyword,
            status: value,
            targetType: selectedTargetType
        });
    };

    const handleTargetTypeChange = (value) => {
        setSelectedTargetType(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchReportsWithFilters(1, pagination.pageSize, {
            search: searchKeyword,
            status: selectedStatus,
            targetType: value
        });
    };

    const handleTableChange = (paginationConfig) => {
        fetchReports(paginationConfig.current, paginationConfig.pageSize);
    };

    const handleRefresh = () => {
        setSearchKeyword('');
        setSelectedStatus(null);
        setSelectedTargetType(null);
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchReports(1, pagination.pageSize);
    };

    const handleStatusUpdate = async (reportId, status) => {
        try {
            setUpdating(true);
            const result = await reportService.updateReportStatus(reportId, { 
                status,
                adminResponse: adminResponse.trim() || null
            });
            
            if (result.success) {
                message.success(result.message || 'Cập nhật trạng thái thành công');
                fetchReports();
                fetchStatistics();
                setStatusModalVisible(false);
                setSelectedReport(null);
                setAdminResponse(''); // Reset form
            } else {
                message.error(result.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setUpdating(false);
        }
    };

    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setDetailModalVisible(true);
    };

    const getStatusColor = (status) => {
        const statusInfo = reportService.formatReportStatus(status);
        switch (status) {
            case 'Pending': return 'orange';
            case 'Resolved': return 'green';
            case 'Dismissed': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        const statusInfo = reportService.formatReportStatus(status);
        return statusInfo.label;
    };

    const getTargetTypeIcon = (targetType) => {
        switch (targetType) {
            case 'Product': return <BoxPlotOutlined />;
            case 'Store': return <ShopOutlined />;
            case 'Seller': return <UserOutlined />;
            case 'Buyer': return <UserOutlined />;
            default: return <FileTextOutlined />;
        }
    };

    const columns = [
        {
            title: 'ID & Loại',
            key: 'idAndType',
            width: 150,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getTargetTypeIcon(record.TargetType || record.targetType)}
                    <div>
                        <div style={{ fontWeight: 'bold' }}>
                            #{(record.Id || record.id)?.toString().slice(-8) || 'N/A'}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {reportService.getTargetTypeLabel(record.TargetType || record.targetType)}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Nội dung',
            key: 'content',
            render: (_, record) => (
                <div style={{ maxWidth: 300 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        {record.Title || record.title}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Lý do: {record.Reason || record.reason}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Người báo cáo',
            key: 'reporter',
            width: 150,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>
                        {record.ReporterName || record.reporterName || 'N/A'}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.ReporterId || record.reporterId}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status, record) => (
                <Tag color={getStatusColor(status || record.Status)}>
                    {getStatusText(status || record.Status)}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            key: 'createdAt',
            width: 120,
            render: (_, record) => (
                <div>
                    <div>{new Date(record.CreatedAt || record.createdAt).toLocaleDateString('vi-VN')}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(record.CreatedAt || record.createdAt).toLocaleTimeString('vi-VN')}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    {(record.Status || record.status) === 'Pending' && (
                        <Tooltip title="Cập nhật trạng thái">
                            <Button
                                type="default"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => {
                                    setSelectedReport(record);
                                    setStatusModalVisible(true);
                                }}
                                style={{ color: '#52c41a', borderColor: '#52c41a' }}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="report-management">
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={3}>
                        <FileTextOutlined /> Quản lý báo cáo
                    </Title>
                    <Text type="secondary">
                        Xem và xử lý các báo cáo từ người dùng
                    </Text>
                </div>

                {/* Action Buttons */}
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Space>
                        <Button icon={<DownloadOutlined />} type="primary">
                            Xuất báo cáo
                        </Button>
                        <Button icon={<BarChartOutlined />}>
                            Thống kê
                        </Button>
                    </Space>
                </div>

                {/* Statistics Cards */}
                {statistics && (
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={6}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                                    {statistics.totalReports || 0}
                                </div>
                                <div>Tổng báo cáo</div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#faad14' }}>
                                    {statistics.pendingReports || 0}
                                </div>
                                <div>Chờ xử lý</div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#52c41a' }}>
                                    {statistics.resolvedReports || 0}
                                </div>
                                <div>Đã giải quyết</div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ff4d4f' }}>
                                    {statistics.dismissedReports || 0}
                                </div>
                                <div>Đã bác bỏ</div>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Search
                            placeholder="Tìm kiếm báo cáo..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onSearch={handleSearch}
                            enterButton={<SearchOutlined />}
                            allowClear
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Lọc trạng thái"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {reportService.getStatusTypes().map(status => (
                                <Option key={status.value} value={status.value}>
                                    {status.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Loại đối tượng"
                            value={selectedTargetType}
                            onChange={handleTargetTypeChange}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {reportService.getTargetTypes().map(type => (
                                <Option key={type.value} value={type.value}>
                                    {type.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={3}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            style={{ width: '100%' }}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>

                {/* Filter Status */}
                {(searchKeyword || selectedStatus || selectedTargetType) && (
                    <Row style={{ marginBottom: 16 }}>
                        <Col span={24}>
                            <div style={{
                                padding: '8px 12px',
                                backgroundColor: '#f0f2f5',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}>
                                <Text strong>Bộ lọc đang áp dụng: </Text>
                                {searchKeyword && <Tag color="blue">Tìm kiếm: {searchKeyword}</Tag>}
                                {selectedStatus && <Tag color="orange">Trạng thái: {selectedStatus}</Tag>}
                                {selectedTargetType && <Tag color="green">Loại: {selectedTargetType}</Tag>}
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={handleRefresh}
                                    style={{ padding: '0 4px', height: 'auto' }}
                                >
                                    Xóa tất cả
                                </Button>
                            </div>
                        </Col>
                    </Row>
                )}

                {/* Reports Table */}
                <Table
                    columns={columns}
                    dataSource={reports}
                    rowKey={(record) => record.Id || record.id}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 1200 }}
                    locale={{
                        emptyText: (
                            <Empty
                                description="Không có báo cáo nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ),
                    }}
                />

                {/* Pagination */}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Pagination
                        current={pagination.current}
                        total={pagination.total}
                        pageSize={pagination.pageSize}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} của ${total} báo cáo`
                        }
                        onChange={(page, pageSize) => {
                            const newPagination = { ...pagination, current: page, pageSize };
                            setPagination(newPagination);
                            fetchReports(page, pageSize);
                        }}
                    />
                </div>
            </Card>

            {/* Report Detail Modal */}
            <Modal
                title={
                    <div>
                        <EyeOutlined /> Chi tiết báo cáo
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedReport(null);
                }}
                footer={null}
                width={800}
            >
                {selectedReport && (
                    <ReportDetails report={selectedReport} />
                )}
            </Modal>

            {/* Status Update Modal */}
            <Modal
                title={
                    <div>
                        <EditOutlined /> Cập nhật trạng thái báo cáo
                    </div>
                }
                open={statusModalVisible}
                onCancel={() => {
                    setStatusModalVisible(false);
                    setSelectedReport(null);
                    setAdminResponse(''); // Reset form
                }}
                footer={null}
                width={500}
            >
                {selectedReport && (
                    <div style={{ padding: '20px 0' }}>
                        {/* Report Info */}
                        <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                            <Text strong>Báo cáo: </Text>
                            <Text>{selectedReport.Title || selectedReport.title}</Text>
                            <br />
                            <Text strong>Lý do: </Text>
                            <Text>{selectedReport.Reason || selectedReport.reason}</Text>
                        </div>

                        {/* Admin Response Input */}
                        <div style={{ marginBottom: 20 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                Phản hồi của Admin: <Text type="secondary">(Tùy chọn)</Text>
                            </Text>
                            <Input.TextArea
                                placeholder="Nhập phản hồi chi tiết về quyết định xử lý báo cáo này..."
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                                rows={4}
                                maxLength={500}
                                showCount
                                style={{
                                    backgroundColor: '#fff',
                                    color: '#333',
                                    border: '1px solid #d9d9d9'
                                }}
                                disabled={updating}
                            />
                        </div>

                        {/* Action Buttons */}
                        <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                            Chọn trạng thái mới cho báo cáo này:
                        </Text>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                loading={updating}
                                onClick={() => handleStatusUpdate(selectedReport.Id || selectedReport.id, 'Resolved')}
                                style={{ width: '100%', height: 50 }}
                                size="large"
                            >
                                Đã giải quyết
                            </Button>
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                loading={updating}
                                onClick={() => handleStatusUpdate(selectedReport.Id || selectedReport.id, 'Dismissed')}
                                style={{ width: '100%', height: 50 }}
                                size="large"
                            >
                                Bác bỏ
                            </Button>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ReportManagement;
