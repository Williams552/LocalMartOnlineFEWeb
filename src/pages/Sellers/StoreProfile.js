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
        description: '',
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

            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                setError("Không tìm thấy thông tin người dùng");
                return;
            }

            console.log('=== DEBUGGING STORE FETCH ===');
            console.log('Current user:', currentUser);
            console.log('User role:', currentUser.role);
            console.log('Auth token exists:', !!localStorage.getItem('token'));

            // First check if user has seller registration
            try {
                console.log('Checking seller registration...');
                const registrationResult = await sellerRegistrationService.getMyRegistration();
                console.log('Seller registration result:', registrationResult);

                if (registrationResult) {
                    setHasSellerRegistration(true);
                    console.log('User has seller registration');
                } else {
                    setHasSellerRegistration(false);
                    setError('Bạn chưa đăng ký làm seller. Vui lòng đăng ký làm seller trước khi tạo gian hàng.');
                    return;
                }
            } catch (regError) {
                console.error('Error checking seller registration:', regError);
                setHasSellerRegistration(false);
                setError('Bạn chưa đăng ký làm seller. Vui lòng đăng ký làm seller trước khi tạo gian hàng.');
                return;
            }

            // Fetch stores by seller
            try {
                console.log('Fetching stores for seller ID:', currentUser.id);
                const stores = await storeService.getStoresBySeller(currentUser.id);
                console.log('Stores result:', stores);
                console.log('Stores count:', stores.length);

                if (stores && stores.length > 0) {
                    const storeData = stores[0]; // Lấy gian hàng đầu tiên
                    setStore(storeData);
                    setFormData({
                        name: storeData.name || '',
                        address: storeData.address || '',
                        contactNumber: storeData.contactNumber || '',
                        description: storeData.description || '',
                        storeImageUrl: storeData.storeImageUrl || '',
                        coverImageUrl: storeData.coverImageUrl || ''
                    });
                    console.log('Store data set:', storeData);
                } else {
                    console.log('No stores found for this seller');
                    setError("Bạn chưa có gian hàng nào. Vui lòng tạo gian hàng.");
                }

            } catch (apiError) {
                console.error('Error fetching stores:', apiError);
                let errorMessage = 'Không thể tải thông tin gian hàng.';

                if (apiError.response) {
                    const status = apiError.response.status;
                    const data = apiError.response.data;

                    if (status === 401) {
                        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    } else if (status === 403) {
                        errorMessage = 'Bạn không có quyền truy cập thông tin này.';
                    } else if (status === 404) {
                        errorMessage = 'Không tìm thấy gian hàng nào.';
                    } else if (data && data.message) {
                        errorMessage = data.message;
                    } else {
                        errorMessage = `Lỗi server (${status}). Vui lòng thử lại sau.`;
                    }
                } else if (apiError.request) {
                    errorMessage = 'Không thể kết nối đến server. Kiểm tra kết nối mạng.';
                }

                setError(errorMessage);
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
                description: store.description || '',
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
    const DebugInfo = () => {
        const currentUser = authService.getCurrentUser();
        return (
            <Card className="mt-3 border-warning">
                <Card.Header className="bg-warning text-dark">
                    <small>Debug Information</small>
                </Card.Header>
                <Card.Body>
                    <small>
                        <p><strong>User ID:</strong> {currentUser?.id}</p>
                        <p><strong>User Role:</strong> {currentUser?.role}</p>
                        <p><strong>Auth Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
                        <p><strong>API Base URL:</strong> {process.env.REACT_APP_API_URL || "http://localhost:5183"}</p>
                        <p><strong>Has Seller Registration:</strong> {hasSellerRegistration ? 'Yes' : 'No'}</p>
                        <p><strong>Store Found:</strong> {store ? 'Yes' : 'No'}</p>
                        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                        <p><strong>Error:</strong> {error || 'None'}</p>
                    </small>
                </Card.Body>
            </Card>
        );
    };

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

                {/* Debug info in case of error */}
                <DebugInfo />
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
                <DebugInfo />
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

                                {/* Description */}
                                <Col md={12} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-bold">
                                            Mô tả gian hàng
                                        </Form.Label>
                                        {isEditing ? (
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Nhập mô tả về gian hàng của bạn"
                                            />
                                        ) : (
                                            <div className="form-control-plaintext">
                                                {store.description || 'Chưa có mô tả'}
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
                                        {store.rating ? `${store.rating}/5 ⭐` : 'Chưa có đánh giá'}
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

                    {/* Debug info for development */}
                    {process.env.NODE_ENV === 'development' && <DebugInfo />}
                </Col>
            </Row>
        </Container>
    );
};

export default StoreProfile;