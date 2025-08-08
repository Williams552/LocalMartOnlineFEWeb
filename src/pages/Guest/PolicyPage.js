// src/pages/Guest/PolicyPage.js
import React, { useState, useEffect } from "react";
import { Card, Input, Empty, Spin, message, Tabs, Tag, Button, Badge, Typography } from 'antd';
import { SearchOutlined, FileTextOutlined, EyeOutlined, CalendarOutlined, BookOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import policyService from "../../services/policyService";
import "./PolicyPage.scss";

const { Search } = Input;
const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

const PolicyPage = () => {
    const [policies, setPolicies] = useState([]);
    const [filteredPolicies, setFilteredPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    // Danh sách các loại chính sách
    const policyTypes = [
        { key: 'all', label: 'Tất cả', icon: <BookOutlined />, count: 0, color: 'blue' },
        { key: 'privacy', label: 'Bảo mật & Riêng tư', icon: <SafetyOutlined />, count: 0, color: 'red' },
        { key: 'terms', label: 'Điều khoản sử dụng', icon: <FileTextOutlined />, count: 0, color: 'purple' },
        { key: 'delivery', label: 'Giao hàng', icon: '🚚', count: 0, color: 'green' },
        { key: 'payment', label: 'Thanh toán', icon: '💳', count: 0, color: 'orange' },
        { key: 'return', label: 'Đổi trả & Hoàn tiền', icon: '↩️', count: 0, color: 'cyan' },
        { key: 'quality', label: 'Chất lượng', icon: '✅', count: 0, color: 'lime' },
        { key: 'seller', label: 'Dành cho người bán', icon: '👨‍🌾', count: 0, color: 'geekblue' },
        { key: 'buyer', label: 'Dành cho người mua', icon: '👤', count: 0, color: 'magenta' }
    ];

    useEffect(() => {
        loadPolicies();
    }, []);

    useEffect(() => {
        filterPolicies();
    }, [searchTerm, activeTab, policies]);

    const loadPolicies = async () => {
        setLoading(true);
        try {
            const response = await policyService.getActivePolicies();
            if (response.success) {
                setPolicies(response.data);
                // Update policy type counts
                const counts = {};
                response.data.forEach(policy => {
                    const type = policy.policyType?.toLowerCase() || 'other';
                    counts[type] = (counts[type] || 0) + 1;
                });

                // Update policyTypes with counts
                policyTypes.forEach(type => {
                    type.count = type.key === 'all' ? response.data.length : (counts[type.key] || 0);
                });
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách chính sách');
        } finally {
            setLoading(false);
        }
    };

    const filterPolicies = () => {
        let filtered = policies;

        // Lọc theo loại
        if (activeTab !== 'all') {
            filtered = filtered.filter(policy =>
                policy.policyType?.toLowerCase() === activeTab
            );
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            filtered = filtered.filter(policy =>
                policy.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                policy.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                policy.policyType?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredPolicies(filtered);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleViewDetail = (policyId) => {
        navigate(`/policy/${policyId}`);
    };

    const getPolicyTypeLabel = (type) => {
        const policyType = policyTypes.find(pt => pt.key === type?.toLowerCase());
        return policyType ? policyType.label : type;
    };

    const getPolicyTypeIcon = (type) => {
        const policyType = policyTypes.find(pt => pt.key === type?.toLowerCase());
        return policyType ? policyType.icon : <FileTextOutlined />;
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

    return (
        <div className="policy-page min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Title & Description */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center items-center mb-4">
                            <div className="bg-supply-primary/10 p-3 rounded-full mr-4">
                                <FileTextOutlined className="text-3xl text-supply-primary" />
                            </div>
                            <div className="text-left">
                                <Title level={1} className="!text-gray-800 !mb-2">
                                    Chính sách & Điều khoản
                                </Title>
                                <Paragraph className="!text-gray-600 !mb-0 text-lg">
                                    Tìm hiểu các quy định và chính sách của LocalMart
                                </Paragraph>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <Search
                            placeholder="Tìm kiếm chính sách theo tiêu đề, nội dung..."
                            allowClear
                            enterButton="Tìm kiếm"
                            size="large"
                            prefix={<SearchOutlined />}
                            onSearch={handleSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="policy-search"
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Loading */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Spin size="large" />
                        <p className="mt-4 text-gray-500 text-lg">Đang tải chính sách...</p>
                    </div>
                ) : filteredPolicies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            imageStyle={{ height: 120 }}
                            description={
                                <div className="text-center">
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                                        {searchTerm || activeTab !== 'all'
                                            ? "Không tìm thấy chính sách phù hợp"
                                            : "Chưa có chính sách nào"}
                                    </h3>
                                    <p className="text-gray-400">
                                        {searchTerm
                                            ? "Hãy thử từ khóa khác hoặc xóa bộ lọc"
                                            : "Các chính sách sẽ được cập nhật sớm nhất"}
                                    </p>
                                </div>
                            }
                        />
                        {(searchTerm || activeTab !== 'all') && (
                            <Button
                                type="primary"
                                className="mt-4"
                                onClick={() => {
                                    setSearchTerm('');
                                    setActiveTab('all');
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                ) : (
                    /* Policy Grid */
                    <div>
                        {/* Results Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {searchTerm ? (
                                    <>Kết quả tìm kiếm cho "<span className="text-supply-primary">{searchTerm}</span>"</>
                                ) : (
                                    <>
                                        {activeTab === 'all' ? 'Tất cả chính sách' : getPolicyTypeLabel(activeTab)}
                                        <span className="text-gray-500 ml-2">({filteredPolicies.length})</span>
                                    </>
                                )}
                            </h2>
                        </div>

                        {/* Policy Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPolicies.map((policy) => (
                                <Card
                                    key={policy.Id || policy.id}
                                    className="policy-card hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
                                    actions={[
                                        <Button
                                            type="primary"
                                            icon={<EyeOutlined />}
                                            onClick={() => handleViewDetail(policy.Id || policy.id)}
                                            className="w-full bg-supply-primary hover:bg-supply-primary/80 border-0"
                                            size="large"
                                        >
                                            Xem chi tiết
                                        </Button>
                                    ]}
                                >
                                    {/* Card Header */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">{getPolicyTypeIcon(policy.policyType)}</span>
                                                <Tag
                                                    color={getPolicyTypeColor(policy.policyType)}
                                                    className="rounded-full px-3 py-1 font-medium"
                                                >
                                                    {getPolicyTypeLabel(policy.policyType)}
                                                </Tag>
                                            </div>
                                            {policy.isActive && (
                                                <Tag color="success" className="rounded-full">
                                                    Đang áp dụng
                                                </Tag>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 leading-6">
                                            {policy.title}
                                        </h3>
                                    </div>

                                    {/* Card Content */}
                                    <div className="mb-4">
                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                            {truncateContent(policy.content, 150)}
                                        </p>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="text-xs text-gray-400 flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-center">
                                            <CalendarOutlined className="mr-1" />
                                            <span>Cập nhật: {formatDate(policy.updatedAt || policy.createdAt)}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyPage;
