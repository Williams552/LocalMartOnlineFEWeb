// src/pages/Guest/FAQPage.js
import React, { useState, useEffect } from "react";
import { Collapse, Card, Input, Empty, Spin, message } from 'antd';
import { SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import faqService from "../../services/faqService";

const { Panel } = Collapse;
const { Search } = Input;

const FAQPage = () => {
    const [faqs, setFaqs] = useState([]);
    const [filteredFaqs, setFilteredFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFaqs();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = faqs.filter(faq => 
                faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredFaqs(filtered);
        } else {
            setFilteredFaqs(faqs);
        }
    }, [searchTerm, faqs]);

    const loadFaqs = async () => {
        setLoading(true);
        try {
            const response = await faqService.getAllFaqs();
            if (response.success) {
                setFaqs(response.data);
                setFilteredFaqs(response.data);
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4 text-supply-primary">
                    <QuestionCircleOutlined className="mr-2" />
                    Câu hỏi thường gặp
                </h1>
                <p className="text-gray-600 mb-6">
                    Tìm hiểu các câu hỏi thường gặp về dịch vụ của chúng tôi
                </p>
                
                <div className="max-w-md mx-auto">
                    <Search
                        placeholder="Tìm kiếm câu hỏi..."
                        allowClear
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: '100%' }}
                        enterButton={<SearchOutlined />}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <Card>
                    {filteredFaqs.length > 0 ? (
                        <Collapse 
                            ghost
                            expandIconPosition="right"
                            className="faq-collapse"
                        >
                            {filteredFaqs.map((faq, index) => (
                                <Panel 
                                    key={faq.id || index}
                                    header={
                                        <div className="flex items-center">
                                            <span className="text-supply-primary font-medium">
                                                {faq.question}
                                            </span>
                                        </div>
                                    }
                                    className="mb-2"
                                >
                                    <div className="pl-4 pr-4 py-2 text-gray-700 bg-gray-50 rounded-lg">
                                        {faq.answer}
                                    </div>
                                </Panel>
                            ))}
                        </Collapse>
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                searchTerm 
                                    ? "Không tìm thấy câu hỏi phù hợp"
                                    : "Chưa có câu hỏi nào"
                            }
                        />
                    )}
                </Card>
            )}

            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Không tìm thấy câu trả lời? 
                    <a href="/contact" className="text-supply-primary hover:underline ml-1">
                        Liên hệ với chúng tôi
                    </a>
                </p>
            </div>
        </div>
    );
};

export default FAQPage;