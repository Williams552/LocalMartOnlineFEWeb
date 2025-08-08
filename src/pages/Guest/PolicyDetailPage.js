// src/pages/Guest/PolicyDetailPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message, Breadcrumb, Tag, Divider, BackTop } from 'antd';
import {
    ArrowLeftOutlined,
    FileTextOutlined,
    CalendarOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import policyService from "../../services/policyService";
import "./PolicyDetailPage.scss";

const PolicyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadPolicyDetail();
        }
    }, [id]);

    const loadPolicyDetail = async () => {
        setLoading(true);
        try {
            const response = await policyService.getPolicyById(id);
            if (response.success) {
                setPolicy(response.data);
            } else {
                message.error(response.message);
                navigate('/policy');
            }
        } catch (error) {
            message.error('Lỗi khi tải chi tiết chính sách');
            navigate('/policy');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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

    if (loading) {
        return (
            <div className="policy-detail-loading">
                <Spin size="large" />
                <p className="mt-4 text-gray-500">Đang tải chi tiết chính sách...</p>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="policy-detail-error">
                <div className="text-center">
                    <FileTextOutlined className="text-6xl text-gray-400 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                        Không tìm thấy chính sách
                    </h2>
                    <Button type="primary" onClick={() => navigate('/policy')}>
                        Quay lại danh sách chính sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="policy-detail-page">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <a onClick={() => navigate('/')}>Trang chủ</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a onClick={() => navigate('/policy')}>Chính sách</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>{policy.title}</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="container mx-auto px-4 pb-12">
                {/* Main Content - Full Width */}
                <div className="max-w-4xl mx-auto">
                    <Card className="policy-detail-card">
                        {/* Header */}
                        <div className="policy-header mb-6">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate('/policy')}
                                    className="back-button"
                                >
                                    Quay lại
                                </Button>
                                <Tag color={getPolicyTypeColor(policy.policyType)}>
                                    {getPolicyTypeLabel(policy.policyType)}
                                </Tag>
                                {policy.isActive && (
                                    <Tag color="green">Đang áp dụng</Tag>
                                )}
                            </div>

                            <h1 className="policy-title text-3xl font-bold text-gray-800 mb-4">
                                {policy.title}
                            </h1>
                        </div>

                        {/* Content */}
                        <div className="policy-content">
                            <div
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: policy.content?.replace(/\n/g, '<br />') || ''
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <Divider />
                        <div className="policy-footer text-sm text-gray-500">
                            <p>
                                <strong>Lưu ý:</strong> Chính sách này có hiệu lực từ ngày {formatDate(policy.createdAt)} và có thể được cập nhật bất cứ lúc nào. Vui lòng kiểm tra thường xuyên để có thông tin mới nhất.
                            </p>
                            {policy.isActive && (
                                <p className="mt-2">
                                    <strong>Trạng thái:</strong>
                                    <Tag color="green" className="ml-2">Đang áp dụng</Tag>
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Back to Top */}
            <BackTop />
        </div>
    );
};

export default PolicyDetailPage;
