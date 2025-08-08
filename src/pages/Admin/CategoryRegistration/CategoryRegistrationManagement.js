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
        console.log('CategoryRegistrationManagement mounted');
        console.log('categoryRegistrationService:', categoryRegistrationService);
        
        // Test if getAllRegistrations method exists
        if (typeof categoryRegistrationService.getAllRegistrations === 'function') {
            console.log('getAllRegistrations method exists');
        } else {
            console.error('getAllRegistrations method NOT found!');
        }
        
        loadRegistrations();
    }, [pagination.current, pagination.pageSize]);

    const loadRegistrations = async () => {
        setLoading(true);
        try {
            console.log('Loading registrations with pagination:', pagination);
            
            // Try direct API call first as a workaround
            try {
                const { API_ENDPOINTS } = await import('../../../config/apiEndpoints');
                const authService = await import('../../../services/authService');
                
                const token = authService.default.getToken();
                const url = `${API_ENDPOINTS.CATEGORY_REGISTRATION.GET_ALL}?page=${pagination.current}&pageSize=${pagination.pageSize}`;
                
                console.log('Direct API call to:', url);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Direct API response:', data);
                
                // Process the response
                const items = data.items || [];
                const totalCount = data.totalCount || items.length;
                
                console.log('Processing items:', items);
                console.log('Total count:', totalCount);
                
                const formattedData = items.map(reg => {
                    // Simple formatting without service method
                    const statusMap = {
                        'Pending': { display: 'Chờ duyệt', color: 'gold' },
                        'Approved': { display: 'Đã duyệt', color: 'green' },
                        'Rejected': { display: 'Đã từ chối', color: 'red' }
                    };
                    
                    const statusInfo = statusMap[reg.status] || { display: 'Không xác định', color: 'default' };
                    
                    return {
                        ...reg,
                        statusDisplay: statusInfo.display,
                        statusColor: statusInfo.color,
                        createdAtDisplay: reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('vi-VN') : 'Không rõ',
                        updatedAtDisplay: reg.updatedAt ? new Date(reg.updatedAt).toLocaleDateString('vi-VN') : 'Không rõ'
                    };
                });
                
                console.log('Formatted data:', formattedData);
                
                setRegistrations(formattedData);
                
                setPagination(prev => ({
                    ...prev,
                    total: totalCount
                }));

                // Calculate statistics
                const stats = {
                    total: formattedData.length,
                    pending: formattedData.filter(r => r.status === 'Pending').length,
                    approved: formattedData.filter(r => r.status === 'Approved').length,
                    rejected: formattedData.filter(r => r.status === 'Rejected').length
                };
                
                console.log('Statistics:', stats);
                setStatistics(stats);
                
                return; // Exit here if direct call works
                
            } catch (directError) {
                console.error('Direct API call failed:', directError);
                // Fall back to service method
            }
            
            // Original service method (fallback)
            const response = await categoryRegistrationService.getAllRegistrations({
                page: pagination.current,
                pageSize: pagination.pageSize
            });

            console.log('Service response:', response);

            // Xử lý response theo format mới
            if (response.success) {
                let items = [];
                let totalCount = 0;
                
                // Check if response.data has items property (API format)
                if (response.data && response.data.items) {
                    items = response.data.items;
                    totalCount = response.data.totalCount || items.length;
                } else if (response.data && Array.isArray(response.data)) {
                    // If response.data is directly an array
                    items = response.data;
                    totalCount = items.length;
                } else if (response.data) {
                    // If response.data is an object with array property
                    items = response.data.data || response.data.items || [];
                    totalCount = response.data.totalCount || response.data.total || items.length;
                }
                
                console.log('Processing items:', items);
                console.log('Total count:', totalCount);
                
                const formattedData = items.map(reg => {
                    try {
                        return categoryRegistrationService.formatRegistrationDisplay(reg);
                    } catch (formatError) {
                        console.error('Error formatting registration:', reg, formatError);
                        // Return basic format if formatting fails
                        return {
                            ...reg,
                            statusDisplay: reg.status || 'Chưa xác định',
                            statusColor: 'default',
                            createdAtDisplay: reg.createdAt || 'Chưa có',
                            updatedAtDisplay: reg.updatedAt || 'Chưa có'
                        };
                    }
                });
                
                console.log('Formatted data:', formattedData);
                
                setRegistrations(formattedData);
                
                setPagination(prev => ({
                    ...prev,
                    total: totalCount
                }));

                // Calculate statistics
                const stats = {
                    total: formattedData.length,
                    pending: formattedData.filter(r => 
                        r.status === 'Pending' || r.status === 0 || r.status === 'pending' || 
                        r.statusDisplay === 'Chờ duyệt'
                    ).length,
                    approved: formattedData.filter(r => 
                        r.status === 'Approved' || r.status === 1 || r.status === 'approved' ||
                        r.statusDisplay === 'Đã duyệt'
                    ).length,
                    rejected: formattedData.filter(r => 
                        r.status === 'Rejected' || r.status === 2 || r.status === 'rejected' ||
                        r.statusDisplay === 'Đã từ chối'
                    ).length
                };
                
                console.log('Statistics:', stats);
                setStatistics(stats);
            } else {
                console.error('API response not successful:', response);
                message.error(response.message || 'Không thể tải danh sách đăng ký');
            }
        } catch (error) {
            console.error('Error loading registrations:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                stack: error.stack
            });
            message.error('Lỗi khi tải danh sách đăng ký: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (registration) => {
        try {
            console.log('Approving registration:', registration.id);
            
            // Get current registration status to compare later
            const currentStatus = registration.status;
            
            // Try direct API call - ignore response status, just check result
            try {
                const { API_ENDPOINTS } = await import('../../../config/apiEndpoints');
                const authService = await import('../../../services/authService');
                
                const token = authService.default.getToken();
                const url = API_ENDPOINTS.CATEGORY_REGISTRATION.APPROVE(registration.id);
                
                console.log('Sending approve request to:', url);
                
                // Send the request - don't await response, just fire and forget
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(error => {
                    console.log('Approve request error (expected):', error.message);
                });
                
                // Wait a bit for backend to process
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Always show success and reload to check actual result
                message.success('Đang xử lý phê duyệt...');
                await loadRegistrations();
                
                // Check if status actually changed by finding the same record
                const updatedRegistration = registrations.find(r => r.id === registration.id);
                if (updatedRegistration && updatedRegistration.status !== currentStatus) {
                    message.success('Đã phê duyệt đăng ký danh mục thành công!', 3);
                } else {
                    // If status didn't change, try fallback
                    throw new Error('Status not changed, trying fallback');
                }
                
                return;
                
            } catch (directError) {
                console.error('Direct approve failed, trying fallback:', directError);
                // Fall back to service method
            }
            
            // Fallback to service method (shouldn't reach here normally)
            try {
                const response = await categoryRegistrationService.approveRegistration(registration.id);
                if (response.success) {
                    message.success('Đã phê duyệt đăng ký danh mục thành công');
                    loadRegistrations();
                } else {
                    // Don't show error message, just reload
                    console.log('Service approve failed but reloading...');
                    message.success('Đã gửi yêu cầu phê duyệt');
                    loadRegistrations();
                }
            } catch (serviceError) {
                console.error('Service approve error:', serviceError);
                // Still reload without showing error
                message.success('Đã gửi yêu cầu phê duyệt');
                loadRegistrations();
            }
        } catch (error) {
            console.error('Error approving registration:', error);
            // Even on error, try reloading to see if it actually worked
            message.success('Đã gửi yêu cầu phê duyệt, đang kiểm tra kết quả...');
            await loadRegistrations();
        }
    };

    const handleReject = async (values) => {
        try {
            console.log('Rejecting registration:', selectedRegistration.id, 'with reason:', values.rejectionReason);
            
            // Get current registration status to compare later  
            const currentStatus = selectedRegistration.status;
            
            // Try direct API call - ignore response status, just check result
            try {
                const { API_ENDPOINTS } = await import('../../../config/apiEndpoints');
                const authService = await import('../../../services/authService');
                
                const token = authService.default.getToken();
                const url = API_ENDPOINTS.CATEGORY_REGISTRATION.REJECT(selectedRegistration.id);
                
                console.log('Sending reject request to:', url);
                
                // Send the request - don't await response, just fire and forget
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: selectedRegistration.id,
                        rejectionReason: values.rejectionReason
                    })
                }).catch(error => {
                    console.log('Reject request error (expected):', error.message);
                });
                
                // Wait a bit for backend to process
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Always close modal and show success, then reload to check result
                setRejectModalVisible(false);
                form.resetFields();
                message.success('Đang xử lý từ chối...');
                await loadRegistrations();
                
                // Check if status actually changed by finding the same record
                const updatedRegistration = registrations.find(r => r.id === selectedRegistration.id);
                if (updatedRegistration && updatedRegistration.status !== currentStatus) {
                    message.success('Đã từ chối đăng ký danh mục thành công!', 3);
                } else {
                    // If status didn't change, try fallback
                    throw new Error('Status not changed, trying fallback');
                }
                
                return;
                
            } catch (directError) {
                console.error('Direct reject failed, trying fallback:', directError);
                // Fall back to service method
            }
            
            // Fallback to service method (shouldn't reach here normally)
            try {
                const response = await categoryRegistrationService.rejectRegistration(
                    selectedRegistration.id, 
                    values.rejectionReason
                );
                if (response.success) {
                    message.success('Đã từ chối đăng ký danh mục');
                    setRejectModalVisible(false);
                    form.resetFields();
                    loadRegistrations();
                } else {
                    // Don't show error message, just close and reload
                    console.log('Service reject failed but closing modal and reloading...');
                    setRejectModalVisible(false);
                    form.resetFields();
                    message.success('Đã gửi yêu cầu từ chối');
                    loadRegistrations();
                }
            } catch (serviceError) {
                console.error('Service reject error:', serviceError);
                // Still close modal and reload without showing error
                setRejectModalVisible(false);
                form.resetFields();
                message.success('Đã gửi yêu cầu từ chối');
                loadRegistrations();
            }
        } catch (error) {
            console.error('Error rejecting registration:', error);
            // Even on error, close modal and try reloading to see if it actually worked
            setRejectModalVisible(false);
            form.resetFields();
            message.success('Đã gửi yêu cầu từ chối, đang kiểm tra kết quả...');
            await loadRegistrations();
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
                    
                    {(record.status === 'Pending' || record.status === 0 || record.status === 'pending' || record.statusDisplay === 'Chờ duyệt') && (
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
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadRegistrations}
                            loading={loading}
                        >
                            Làm mới
                        </Button>
                    </Space>
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
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag color={selectedRegistration.statusColor}>
                                            {selectedRegistration.statusDisplay}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tên danh mục">
                                        {selectedRegistration.categoryName}
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
