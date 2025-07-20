import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Upload,
    message,
    Space,
    Typography,
    Row,
    Col,
    Alert,
    Divider
} from 'antd';
import {
    PlusOutlined,
    UploadOutlined,
    DeleteOutlined,
    FileImageOutlined
} from '@ant-design/icons';
import categoryRegistrationService from '../../../services/categoryRegistrationService';
import { useAuth } from '../../../hooks/useAuth';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CategoryRegistrationForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageList, setImageList] = useState([]);
    const { user } = useAuth();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const formData = {
                sellerId: user?.id,
                categoryName: values.categoryName,
                description: values.description,
                imageUrls: imageList.map(img => img.url || img.thumbUrl)
            };

            await categoryRegistrationService.createRegistration(formData);
            message.success('Đăng ký danh mục thành công! Chờ admin phê duyệt.');
            form.resetFields();
            setImageList([]);
        } catch (error) {
            message.error('Lỗi khi đăng ký danh mục: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadChange = ({ fileList }) => {
        setImageList(fileList);
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Chỉ hỗ trợ file JPG/PNG!');
            return false;
        }
        
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
            return false;
        }
        
        return false; // Prevent automatic upload
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Tải lên</div>
        </div>
    );

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
            <Card>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2}>
                        <FileImageOutlined style={{ marginRight: 8 }} />
                        Đăng ký danh mục mới
                    </Title>
                    <Text type="secondary">
                        Gửi yêu cầu đăng ký danh mục sản phẩm để được admin phê duyệt
                    </Text>
                </div>

                <Alert
                    message="Lưu ý quan trọng"
                    description="Sau khi gửi đăng ký, bạn cần chờ admin phê duyệt. Quá trình này có thể mất 1-3 ngày làm việc."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    size="large"
                >
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item
                                name="categoryName"
                                label="Tên danh mục"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên danh mục' },
                                    { min: 3, message: 'Tên danh mục phải có ít nhất 3 ký tự' },
                                    { max: 100, message: 'Tên danh mục không được vượt quá 100 ký tự' }
                                ]}
                            >
                                <Input 
                                    placeholder="Nhập tên danh mục (ví dụ: Thực phẩm tươi sống, Điện tử, Thời trang...)"
                                    maxLength={100}
                                    showCount
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label="Mô tả chi tiết"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mô tả danh mục' },
                                    { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
                                    { max: 500, message: 'Mô tả không được vượt quá 500 ký tự' }
                                ]}
                            >
                                <TextArea 
                                    rows={4}
                                    placeholder="Mô tả chi tiết về danh mục này, bao gồm các loại sản phẩm sẽ có trong danh mục..."
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label="Hình ảnh minh họa"
                                extra="Tải lên tối đa 5 ảnh minh họa cho danh mục (JPG/PNG, tối đa 2MB mỗi ảnh)"
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={imageList}
                                    onChange={handleUploadChange}
                                    beforeUpload={beforeUpload}
                                    multiple
                                    maxCount={5}
                                    accept="image/*"
                                >
                                    {imageList.length >= 5 ? null : uploadButton}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Row justify="center">
                        <Col>
                            <Space size="large">
                                <Button 
                                    size="large"
                                    onClick={() => {
                                        form.resetFields();
                                        setImageList([]);
                                    }}
                                >
                                    Làm mới
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    size="large"
                                    style={{ minWidth: 120 }}
                                >
                                    Gửi đăng ký
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default CategoryRegistrationForm;
