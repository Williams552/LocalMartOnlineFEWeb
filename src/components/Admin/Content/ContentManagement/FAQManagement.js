import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Popconfirm } from "antd";

const FAQManagement = () => {
    const [faqs, setFaqs] = useState([
        { id: 1, question: "Làm sao để đăng ký tài khoản?", answer: "Bạn có thể đăng ký bằng email hoặc số điện thoại." },
        { id: 2, question: "Chợ có mở cửa ngày lễ không?", answer: "Tuỳ từng chợ, bạn nên liên hệ ban quản lý." }
    ]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [form] = Form.useForm();

    const showModal = (faq = null) => {
        setEditingFaq(faq);
        form.setFieldsValue(faq || { question: "", answer: "" });
        setModalOpen(true);
    };

    const handleSave = () => {
        form.validateFields().then(values => {
            if (editingFaq) {
                setFaqs(faqs.map(f => f.id === editingFaq.id ? { ...f, ...values } : f));
            } else {
                const newId = Math.max(...faqs.map(f => f.id), 0) + 1;
                setFaqs([...faqs, { id: newId, ...values }]);
            }
            setModalOpen(false);
            form.resetFields();
        });
    };

    const handleDelete = (id) => {
        setFaqs(faqs.filter(f => f.id !== id));
    };

    const columns = [
        { title: "Câu hỏi", dataIndex: "question", key: "question" },
        { title: "Trả lời", dataIndex: "answer", key: "answer" },
        {
            title: "Hành động", key: "actions", render: (_, record) => (
                <Space>
                    <Button onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm title="Bạn chắc chắn muốn xoá?" onConfirm={() => handleDelete(record.id)}>
                        <Button danger>Xoá</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="faq-management p-4">
            <h2 className="text-2xl font-bold mb-4">Quản lý Câu hỏi Thường gặp (FAQ)</h2>
            <Button type="primary" className="mb-4" onClick={() => showModal(null)}>Thêm mới</Button>
            <Table dataSource={faqs} rowKey="id" columns={columns} />

            <Modal
                open={modalOpen}
                title={editingFaq ? "Chỉnh sửa FAQ" : "Thêm FAQ mới"}
                onCancel={() => setModalOpen(false)}
                onOk={handleSave}
                okText="Lưu"
                cancelText="Huỷ"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item name="question" label="Câu hỏi" rules={[{ required: true, message: "Vui lòng nhập câu hỏi" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="answer" label="Trả lời" rules={[{ required: true, message: "Vui lòng nhập câu trả lời" }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FAQManagement;
