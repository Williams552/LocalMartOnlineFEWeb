import React, { useState } from 'react';
import { Card, Button, Input, Space, message } from 'antd';
import categoryService from '../../../services/categoryService';

const CategorySearchTest = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    const testSearch = async () => {
        if (!searchTerm.trim()) {
            message.warning('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }

        setLoading(true);
        try {
            console.log('🔍 Testing search with term:', searchTerm);
            const response = await categoryService.searchCategories(searchTerm);
            console.log('🔍 Search response:', response);
            setResults(response);
            message.success(`Tìm thấy ${response.length} danh mục`);
        } catch (error) {
            console.error('❌ Search error:', error);
            message.error('Lỗi khi tìm kiếm: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const testDirectAPI = async () => {
        if (!searchTerm.trim()) {
            message.warning('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5183/api/category/searchAdmin?name=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('🔍 Direct API response:', data);
            
            if (data.success) {
                setResults(data.data);
                message.success(`API trả về ${data.data.length} danh mục`);
            } else {
                message.error('API trả về lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('❌ Direct API error:', error);
            message.error('Lỗi khi gọi API trực tiếp: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card title="Test Category Search" style={{ marginBottom: '24px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                        placeholder="Nhập từ khóa tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onPressEnter={testSearch}
                    />
                    <Space>
                        <Button type="primary" onClick={testSearch} loading={loading}>
                            Test Search Service
                        </Button>
                        <Button onClick={testDirectAPI} loading={loading}>
                            Test Direct API
                        </Button>
                    </Space>
                </Space>
            </Card>

            {results.length > 0 && (
                <Card title={`Kết quả tìm kiếm (${results.length})`}>
                    {results.map((category, index) => (
                        <div key={index} style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                            <strong>{category.name}</strong>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                ID: {category.id} | Status: {category.status}
                            </div>
                        </div>
                    ))}
                </Card>
            )}
        </div>
    );
};

export default CategorySearchTest;
