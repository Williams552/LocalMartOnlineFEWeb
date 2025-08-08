import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal, Input, Select, Card, Row, Col, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, PoweroffOutlined } from '@ant-design/icons';
import { platformPolicyService } from '../../../services/platformPolicyService';
import PolicyFormModal from './PolicyFormModal';
import PolicyDetailModal from './PolicyDetailModal';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const PlatformPolicyManagement = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Fetch policies
    const fetchPolicies = async (page = 1, pageSize = 10, search = '', status = 'all') => {
        setLoading(true);
        try {
            const params = {
                page,
                pageSize,
                search,
                status
            };
            
            const response = await platformPolicyService.getAllPolicies(params);
            
            if (response.success) {
                const data = response.data;
                const items = data.items || data || [];
                
                setPolicies(items);
                setPagination({
                    current: page,
                    pageSize,
                    total: data.totalCount || items.length,
                });
            } else {
                message.error(response.message || 'Không thể tải danh sách chính sách');
                setPolicies([]);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
            message.error('Có lỗi xảy ra khi tải danh sách chính sách');
            setPolicies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    // Handle search
    const handleSearch = () => {
        fetchPolicies(1, pagination.pageSize, searchText, statusFilter);
    };

    // Handle pagination change
    const handleTableChange = (pagination) => {
        fetchPolicies(pagination.current, pagination.pageSize, searchText, statusFilter);
    };

    // Handle view policy detail
    const handleViewDetail = (policy) => {
        setSelectedPolicy(policy);
        setIsDetailModalVisible(true);
    };

    // Handle create/edit policy
    const handleCreateOrEdit = (policy = null) => {
        setEditingPolicy(policy);
        setIsFormModalVisible(true);
    };

    // Handle toggle policy status
    const handleToggleStatus = async (policy) => {
        const action = policy.isActive ? 'vô hiệu hóa' : 'kích hoạt';
        
        confirm({
            title: `Xác nhận ${action} chính sách`,
            content: `Bạn có chắc chắn muốn ${action} chính sách "${policy.title}"?`,
            onOk: async () => {
                try {
                    const response = await platformPolicyService.togglePolicyStatus(policy.id);
                    if (response.success) {
                        message.success(response.message || `${action.charAt(0).toUpperCase() + action.slice(1)} chính sách thành công`);
                        fetchPolicies(pagination.current, pagination.pageSize, searchText, statusFilter);
                    } else {
                        message.error(response.message || `Không thể ${action} chính sách`);
                    }
                } catch (error) {
                    console.error('Error toggling policy status:', error);
                    message.error(`Có lỗi xảy ra khi ${action} chính sách`);
                }
            },
        });
    };

    // Handle form submission
    const handleFormSubmit = () => {
        setIsFormModalVisible(false);
        setEditingPolicy(null);
        fetchPolicies(pagination.current, pagination.pageSize, searchText, statusFilter);
    };

    // Table columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            render: (text) => text ? text.slice(-8) : 'N/A', // Show last 8 characters of ID
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <Button 
                    type="link" 
                    onClick={() => handleViewDetail(record)}
                    style={{ padding: 0, height: 'auto', textAlign: 'left' }}
                >
                    {text}
                </Button>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'error'}>
                    {isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 150,
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            type="primary"
                            onClick={() => handleCreateOrEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                        <Button
                            icon={<PoweroffOutlined />}
                            size="small"
                            type={record.isActive ? 'default' : 'primary'}
                            danger={record.isActive}
                            onClick={() => handleToggleStatus(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            Quản lý Chính sách Nền tảng
                        </Title>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleCreateOrEdit()}
                        >
                            Thêm chính sách mới
                        </Button>
                    </Col>
                </Row>

                {/* Search and Filter */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Input.Search
                            placeholder="Tìm kiếm theo tiêu đề..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onSearch={handleSearch}
                            enterButton
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value)}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value="true">Hoạt động</Option>
                            <Option value="false">Không hoạt động</Option>
                        </Select>
                    </Col>
                    <Col span={2}>
                        <Button onClick={handleSearch}>Lọc</Button>
                    </Col>
                </Row>

                {/* Policies Table */}
                <Table
                    columns={columns}
                    dataSource={policies}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} chính sách`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                />

                {/* Form Modal */}
                <PolicyFormModal
                    visible={isFormModalVisible}
                    onCancel={() => {
                        setIsFormModalVisible(false);
                        setEditingPolicy(null);
                    }}
                    onSubmit={handleFormSubmit}
                    editingPolicy={editingPolicy}
                />

                {/* Detail Modal */}
                <PolicyDetailModal
                    visible={isDetailModalVisible}
                    onCancel={() => {
                        setIsDetailModalVisible(false);
                        setSelectedPolicy(null);
                    }}
                    policy={selectedPolicy}
                />
            </Card>
        </div>
    );
};

export default PlatformPolicyManagement;
