import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { platformPolicyService } from '../../../services/platformPolicyService';

const { TextArea } = Input;

const PolicyFormModal = ({ visible, onCancel, onSubmit, editingPolicy }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (editingPolicy) {
                // Edit mode - fill form with existing data
                form.setFieldsValue({
                    title: editingPolicy.title,
                    content: editingPolicy.content,
                });
            } else {
                // Create mode - reset form
                form.resetFields();
            }
        }
    }, [visible, editingPolicy, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            let response;
            if (editingPolicy) {
                // Update existing policy
                response = await platformPolicyService.updatePolicy(editingPolicy.id, values);
            } else {
                // Create new policy
                response = await platformPolicyService.createPolicy(values);
            }
            
            if (response.success) {
                message.success(response.message || `${editingPolicy ? 'Cập nhật' : 'Tạo'} chính sách thành công`);
                form.resetFields();
                onSubmit();
            } else {
                message.error(response.message || `Không thể ${editingPolicy ? 'cập nhật' : 'tạo'} chính sách`);
            }
        } catch (error) {
            if (error.errorFields) {
                // Validation errors
                message.error('Vui lòng kiểm tra lại thông tin đã nhập');
            } else {
                console.error('Error submitting policy:', error);
                message.error(`Có lỗi xảy ra khi ${editingPolicy ? 'cập nhật' : 'tạo'} chính sách`);
            }
        }
    };

    return (
        <Modal
            title={editingPolicy ? 'Chỉnh sửa Chính sách' : 'Thêm Chính sách Mới'}
            visible={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            width={800}
            okText={editingPolicy ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            destroyOnClose
            confirmLoading={false}
        >
            <Form
                form={form}
                layout="vertical"
                requiredMark={false}
            >
                <Form.Item
                    label="Tiêu đề"
                    name="title"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tiêu đề' },
                        { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
                        { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự' },
                    ]}
                >
                    <Input placeholder="Nhập tiêu đề chính sách" />
                </Form.Item>

                <Form.Item
                    label="Nội dung chính sách"
                    name="content"
                    rules={[
                        { required: true, message: 'Vui lòng nhập nội dung chính sách' },
                        { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự' },
                    ]}
                >
                    <TextArea 
                        rows={12} 
                        placeholder="Nhập nội dung chi tiết của chính sách"
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PolicyFormModal;
