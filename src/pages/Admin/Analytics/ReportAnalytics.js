import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography } from 'antd';
import axios from 'axios';
import './ReportAnalytics.css'; // Add a CSS file for custom styling

const { Title } = Typography;

const violationTypeMap = {
    'Quality Issues': 'Vấn đề chất lượng',
    'Other': 'Khác'
};

const statusMap = {
    'Pending': 'Đang chờ xử lý',
    'Resolved': 'Đã giải quyết'
};

const severityLevelMap = {
    'High': 'Cao',
    'Medium': 'Trung bình',
    'Low': 'Thấp'
};

const ReportAnalytics = () => {
    const [violatingStores, setViolatingStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    useEffect(() => {
        const fetchViolatingStores = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5183/api/report/violating-stores');
                if (response.data && response.data.success) {
                    setViolatingStores(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching violating stores:', error);
            }
            setLoading(false);
        };

        fetchViolatingStores();
    }, []);

    const handleRowClick = (record) => {
        const key = record.key;
        setExpandedRowKeys((prevKeys) =>
            prevKeys.includes(key) ? prevKeys.filter((k) => k !== key) : [...prevKeys, key]
        );
    };

    const columns = [
        {
            title: 'Tên cửa hàng',
            dataIndex: 'storeName',
            key: 'storeName',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'storeAddress',
            key: 'storeAddress',
        },
        {
            title: 'Chủ sở hữu',
            dataIndex: 'ownerName',
            key: 'ownerName',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
        },
        {
            title: 'Tổng số báo cáo',
            dataIndex: 'totalReports',
            key: 'totalReports',
        },
        {
            title: 'Mức độ nghiêm trọng',
            dataIndex: 'severityLevel',
            key: 'severityLevel',
            render: (severity) => (
                <Tag color={severity === 'High' ? 'red' : severity === 'Medium' ? 'orange' : 'green'}>
                    {severityLevelMap[severity] || severity}
                </Tag>
            ),
        },
    ];

    const expandedRowRender = (record) => {
        const reportColumns = [
            {
                title: 'Tiêu đề',
                dataIndex: 'title',
                key: 'title',
            },
            {
                title: 'Loại vi phạm',
                dataIndex: 'violationType',
                key: 'violationType',
                render: (type) => violationTypeMap[type] || type
            },
            {
                title: 'Ngày báo cáo',
                dataIndex: 'reportedDate',
                key: 'reportedDate',
                render: (date) => new Date(date).toLocaleDateString('vi-VN'),
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                    <Tag color={status === 'Pending' ? 'orange' : 'green'}>{statusMap[status] || status}</Tag>
                ),
            },
            {
                title: 'Người báo cáo',
                dataIndex: 'reporterName',
                key: 'reporterName',
            },
            {
                title: 'Mức độ nghiêm trọng',
                dataIndex: 'severity',
                key: 'severity',
                render: (severity) => (
                    <Tag color={severity === 'High' ? 'red' : severity === 'Medium' ? 'orange' : 'green'}>
                        {severityLevelMap[severity] || severity}
                    </Tag>
                ),
            },
        ];

        return (
            <Table
                dataSource={record.recentReports.map((report, index) => ({ ...report, key: index }))}
                columns={reportColumns}
                pagination={false}
            />
        );
    };

    return (
        <Card className="report-analytics-card">
            <Title level={3} className="report-analytics-title">Thống kê cửa hàng vi phạm</Title>
            <Table
                dataSource={violatingStores.map((store, index) => ({ ...store, key: index }))}
                columns={columns}
                loading={loading}
                pagination={{ pageSize: 5 }}
                expandable={{ expandedRowRender }}
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    className: 'clickable-row'
                })}
                rowClassName={() => 'report-analytics-row'}
                expandedRowKeys={expandedRowKeys}
            />
        </Card>
    );
};

export default ReportAnalytics;
