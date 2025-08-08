// src/components/Policy/PolicyCard.js
import React from "react";
import { Card, Tag, Button } from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import "./PolicyCard.scss";

const PolicyCard = ({ policy, className = "" }) => {
    const navigate = useNavigate();

    const getPolicyTypeColor = (type) => {
        const colors = {
            privacy: 'red',
            terms: 'blue',
            delivery: 'green',
            payment: 'orange',
            return: 'purple',
            quality: 'cyan',
            seller: 'geekblue',
            buyer: 'magenta'
        };
        return colors[type?.toLowerCase()] || 'default';
    };

    const getPolicyTypeLabel = (type) => {
        const types = {
            privacy: '🔒 Bảo mật',
            terms: '📜 Điều khoản',
            delivery: '🚚 Giao hàng',
            payment: '💳 Thanh toán',
            return: '↩️ Đổi trả',
            quality: '✅ Chất lượng',
            seller: '👨‍🌾 Người bán',
            buyer: '👤 Người mua'
        };
        return types[type?.toLowerCase()] || type;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const truncateContent = (content, maxLength = 200) => {
        if (!content || content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    const handleViewDetail = () => {
        navigate(`/policy/${policy.Id || policy.id}`);
    };

    return (
        <Card
            className={`policy-card hover:shadow-lg transition-all duration-300 ${className}`}
            actions={[
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={handleViewDetail}
                    className="w-full"
                >
                    Xem chi tiết
                </Button>
            ]}
        >
            {/* Header */}
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <Tag
                        color={getPolicyTypeColor(policy.policyType)}
                        className="mb-2"
                    >
                        {getPolicyTypeLabel(policy.policyType)}
                    </Tag>
                    {policy.isActive && (
                        <Tag color="green">Đang áp dụng</Tag>
                    )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {policy.title}
                </h3>
            </div>

            {/* Content */}
            <div className="mb-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                    {truncateContent(policy.content)}
                </p>
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-400 flex items-center">
                <CalendarOutlined className="mr-1" />
                <span>Cập nhật: {formatDate(policy.updatedAt || policy.createdAt)}</span>
            </div>
        </Card>
    );
};

export default PolicyCard;
