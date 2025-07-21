import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaStore, FaEdit, FaSave, FaTimes, FaMapMarkerAlt, FaPhone, FaUser, FaClock, FaPlus } from 'react-icons/fa';
import storeService from '../../services/storeService';
import authService from '../../services/authService';
import sellerRegistrationService from '../../services/sellerRegistrationService';
import { toast } from 'react-toastify';

const StoreProfile = () => {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasSellerRegistration, setHasSellerRegistration] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contactNumber: '',
        storeImageUrl: '',
        coverImageUrl: ''
    });

    useEffect(() => {
        fetchStoreData();
    }, []);

    const fetchStoreData = async () => {
        try {
            setLoading(true);
            setError("");

            // Check if user is authenticated
            if (!authService.isAuthenticated()) {
                setError("Vui lòng đăng nhập để xem thông tin gian hàng");
                return;
            }

            // Gọi API /api/Store/my-store
            const response = await storeService.getMyStore();
            if (response.success && response.data) {
                setStore(response.data);
                setFormData({
                    name: response.data.name || '',
                    address: response.data.address || '',
                    contactNumber: response.data.contactNumber || '',
                    storeImageUrl: response.data.storeImageUrl || '',
                    coverImageUrl: response.data.coverImageUrl || ''
                });
            } else {
                setError(response.message || "Không tìm thấy thông tin gian hàng");
            }
        } catch (error) {
            console.error('Error in fetchStoreData:', error);
            setError(error.message || "Có lỗi xảy ra khi tải thông tin gian hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            if (!store?.id) {
                toast.error("Không tìm thấy ID gian hàng");
                return;
            }

            // Call API to update store
            const response = await storeService.updateStore(store.id, formData);

            if (response.success) {
                toast.success("Cập nhật thông tin gian hàng thành công!");
                setIsEditing(false);
                // Refresh store data
                await fetchStoreData();
            } else {
                toast.error(response.message || "Cập nhật thất bại");
            }

        } catch (error) {
            console.error('Error updating store:', error);
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data to original store data
        if (store) {
            setFormData({
                name: store.name || '',
                address: store.address || '',
                contactNumber: store.contactNumber || '',
                storeImageUrl: store.storeImageUrl || '',
                coverImageUrl: store.coverImageUrl || ''
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Open': { color: 'success', text: 'Đang hoạt động' },
            'Closed': { color: 'danger', text: 'Đã đóng' },
            'Pending': { color: 'warning', text: 'Chờ duyệt' },
            'Suspended': { color: 'secondary', text: 'Tạm ngưng' }
        };

        const config = statusConfig[status] || { color: 'secondary', text: status || 'Không xác định' };

        return (
            <Badge bg={config.color} className="ms-2">
                {config.text}
            </Badge>
        );
    };

    // Debug info component

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <div>Đang tải thông tin gian hàng...</div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger" className="text-center">
                    <FaStore className="me-2" />
                    {error}
                </Alert>

                {!hasSellerRegistration && (
                    <div className="text-center mt-3">
                        <Button
                            variant="primary"
                            onClick={() => window.location.href = '/register-seller'}
                        >
                            <FaPlus className="me-2" />
                            Đăng ký làm Seller
                        </Button>
                    </div>
                )}
            </Container>
        );
    }

    if (!store) {
        return (
            <Container className="mt-4">
                <Alert variant="info" className="text-center">
                    <FaStore className="me-2" />
                    Không tìm thấy thông tin gian hàng
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <Row>
                <Col lg={8} className="mx-auto">
                    <Card className="shadow-lg border-0">
                        {/* Header */}
                        <Card.Header className="bg-primary text-white py-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <FaStore className="me-3" size={24} />
                                    <h3 className="mb-0">Thông tin gian hàng</h3>
                                </div>
                                {!isEditing ? (
                                    <Button
                                        variant="light"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="d-flex align-items-center"
                                    >
                                        <FaEdit className="me-2" />
                                        Chỉnh sửa
                                    </Button>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="d-flex align-items-center"
                                        >
                                            {saving ? (
                                                <Spinner animation="border" size="sm" className="me-2" />
                                            ) : (
                                                <FaSave className="me-2" />
                                            )}
                                            Lưu
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            size="sm"
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="d-flex align-items-center"
                                        >
                                            <FaTimes className="me-2" />
                                            Hủy
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card.Header>

                        <Card.Body className="p-4">
                            {/* Store Image */}
                            {(store.storeImageUrl || store.coverImageUrl) && (
                                <div className="text-center mb-4">
                                    <img
                                        src={store.storeImageUrl || store.coverImageUrl}
                                        alt="Store"
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '300px', maxWidth: '100%' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            <Row>
                                {/* Basic Information */}
                                <Col md={12}>
                                    <h5 className="border-bottom pb-2 mb-3">
                                        <FaUser className="me-2 text-primary" />
                                        Thông tin cơ bản
                                    </h5>
                                </Col>

                                {/* Store Name */}
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-bold">
                                            <FaStore className="me-2 text-primary" />
                                            Tên gian hàng
                                        </Form.Label>
                                        {isEditing ? (
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Nhập tên gian hàng"
                                            />
                                        ) : (
                                            <div className="form-control-plaintext">
                                                {store.name || 'Chưa cập nhật'}
                                                {getStatusBadge(store.status)}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>

                                {/* Contact Number */}
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-bold">
                                            <FaPhone className="me-2 text-primary" />
                                            Số điện thoại
                                        </Form.Label>
                                        {isEditing ? (
                                            <Form.Control
                                                type="tel"
                                                name="contactNumber"
                                                value={formData.contactNumber}
                                                onChange={handleInputChange}
                                                placeholder="Nhập số điện thoại"
                                            />
                                        ) : (
                                            <div className="form-control-plaintext">
                                                {store.contactNumber || 'Chưa cập nhật'}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>

                                {/* Address */}
                                <Col md={12} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-bold">
                                            <FaMapMarkerAlt className="me-2 text-primary" />
                                            Địa chỉ
                                        </Form.Label>
                                        {isEditing ? (
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="Nhập địa chỉ gian hàng"
                                            />
                                        ) : (
                                            <div className="form-control-plaintext">
                                                {store.address || 'Chưa cập nhật'}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>


                                {/* Store Images */}
                                {isEditing && (
                                    <>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-bold">
                                                    URL ảnh gian hàng
                                                </Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="storeImageUrl"
                                                    value={formData.storeImageUrl}
                                                    onChange={handleInputChange}
                                                    placeholder="Nhập URL ảnh gian hàng"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-bold">
                                                    URL ảnh bìa
                                                </Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="coverImageUrl"
                                                    value={formData.coverImageUrl}
                                                    onChange={handleInputChange}
                                                    placeholder="Nhập URL ảnh bìa"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </>
                                )}

                                {/* System Information */}
                                <Col md={12} className="mt-4">
                                    <h5 className="border-bottom pb-2 mb-3">
                                        <FaClock className="me-2 text-primary" />
                                        Thông tin hệ thống
                                    </h5>
                                </Col>

                                <Col md={6} className="mb-2">
                                    <strong>ID gian hàng:</strong> {store.id}
                                </Col>

                                <Col md={6} className="mb-2">
                                    <strong>ID người bán:</strong> {store.sellerId}
                                </Col>

                                <Col md={6} className="mb-2">
                                    <strong>Trạng thái:</strong>
                                    {getStatusBadge(store.status)}
                                </Col>

                                <Col md={6} className="mb-2">
                                    <strong>Đánh giá:</strong>
                                    <span className="ms-2">
                                        {typeof store.rating === 'number' ? `${store.rating}/5 ⭐` : 'Chưa có đánh giá'}
                                    </span>
                                </Col>

                                <Col md={6} className="mb-2">
                                    <strong>Ngày tạo:</strong> {formatDate(store.createdAt)}
                                </Col>

                                <Col md={6} className="mb-2">
                                    <strong>Cập nhật lần cuối:</strong> {formatDate(store.updatedAt)}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                </Col>
            </Row>
        </Container>
    );
};

export default StoreProfile;