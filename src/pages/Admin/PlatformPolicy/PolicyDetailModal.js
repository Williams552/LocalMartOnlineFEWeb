import React from 'react';
import { Modal, Descriptions, Tag, Typography, Divider } from 'antd';

const { Title, Paragraph } = Typography;

const PolicyDetailModal = ({ visible, onCancel, policy }) => {
    if (!policy) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Chi tiết Chính sách</Title>}
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={900}
            style={{ top: 20 }}
        >
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Basic Information */}
                <Descriptions
                    bordered
                    column={2}
                    size="small"
                    style={{ marginBottom: 24 }}
                >
                    <Descriptions.Item label="ID" span={1}>
                        {policy.id || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái" span={1}>
                        <Tag color={policy.isActive ? 'success' : 'error'}>
                            {policy.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiêu đề" span={2}>
                        <Title level={5} style={{ margin: 0 }}>
                            {policy.title || 'Không có tiêu đề'}
                        </Title>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo" span={1}>
                        {formatDate(policy.createdAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật" span={1}>
                        {formatDate(policy.updatedAt)}
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                {/* Content */}
                <Title level={5}>Nội dung chi tiết</Title>
                <div 
                    style={{ 
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        padding: '16px',
                        backgroundColor: '#fafafa',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        fontSize: '14px',
                        minHeight: '200px'
                    }}
                >
                    {policy.content || 'Không có nội dung'}
                </div>
            </div>
        </Modal>
    );
};

export default PolicyDetailModal;
