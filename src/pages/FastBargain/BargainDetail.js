import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaComment, FaSpinner } from 'react-icons/fa';
import fastBargainService from '../../services/fastBargainService';
import '../../styles/fast-bargain.css';

const BargainDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bargain, setBargain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [proposedPrice, setProposedPrice] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBargainDetails();
        const interval = setInterval(fetchBargainDetails, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchBargainDetails = async () => {
        try {
            const data = await fastBargainService.getBargainById(id);
            setBargain(data);
            setError(null);
        } catch (error) {
            setError('Không thể tải thông tin thương lượng');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionType, price = null) => {
        setActionLoading(true);
        try {
            await fastBargainService.takeAction(id, actionType, price);
            await fetchBargainDetails();
            if (actionType === 'propose') {
                setProposedPrice('');
                setMessage('');
            }
        } catch (error) {
            setError('Có lỗi xảy ra khi thực hiện hành động');
        } finally {
            setActionLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted':
                return <FaCheckCircle className="text-green-500" />;
            case 'rejected':
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaComment className="text-blue-500" />;
        }
    };

    if (loading) {
        return (
            <div className="bargain-loading">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
                <p>Đang tải thông tin thương lượng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bargain-error">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!bargain) {
        return (
            <div className="bargain-not-found">
                <p>Không tìm thấy thông tin thương lượng</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="bargain-detail-container">
            <div className="bargain-header">
                <button
                    onClick={() => navigate(-1)}
                    className="back-button"
                >
                    <FaArrowLeft className="mr-2" />
                    Quay lại
                </button>
                <h1 className="bargain-title">Chi tiết thương lượng</h1>
            </div>

            <div className="bargain-info">
                <h2>Thông tin sản phẩm</h2>
                <div className="product-info">
                    <img
                        src={bargain.productImage || '/placeholder-image.jpg'}
                        alt={bargain.productName}
                        className="product-image"
                    />
                    <div>
                        <h3>{bargain.productName}</h3>
                        <p className="text-gray-600">Giá gốc: {formatPrice(bargain.originalPrice)}</p>
                        <p className="text-blue-600">Giá đề xuất hiện tại: {formatPrice(bargain.currentPrice)}</p>
                        <p className={`status-badge ${bargain.status}`}>
                            Trạng thái: {bargain.status === 'pending' ? 'Đang chờ' :
                                bargain.status === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bargain-history">
                <h2>Lịch sử thương lượng</h2>
                <div className="timeline">
                    {bargain.negotiations?.map((item, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-icon">
                                {getStatusIcon(item.status)}
                            </div>
                            <div className="timeline-content">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">
                                            {item.action === 'start' ? 'Bắt đầu thương lượng' :
                                                item.action === 'propose' ? 'Đề xuất giá mới' :
                                                    item.action === 'accept' ? 'Chấp nhận giá' :
                                                        'Từ chối giá'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(item.timestamp).toLocaleString('vi-VN')}
                                        </p>
                                        {item.price && (
                                            <p className="font-bold text-blue-600">
                                                Giá: {formatPrice(item.price)}
                                            </p>
                                        )}
                                        {item.message && (
                                            <p className="text-gray-700 mt-1">{item.message}</p>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {item.userType === 'buyer' ? 'Bạn' : 'Người bán'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {bargain.status === 'pending' && bargain.canTakeAction && (
                <div className="bargain-actions">
                    <h2>Hành động</h2>

                    <div className="action-section">
                        <h3>Đề xuất giá mới</h3>
                        <div className="propose-form">
                            <div className="form-group">
                                <label>Giá đề xuất (VND):</label>
                                <input
                                    type="number"
                                    value={proposedPrice}
                                    onChange={(e) => setProposedPrice(e.target.value)}
                                    placeholder="Nhập giá đề xuất"
                                    className="price-input"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tin nhắn (tùy chọn):</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Thêm tin nhắn cho đề xuất của bạn"
                                    className="message-input"
                                    rows="3"
                                />
                            </div>
                            <button
                                onClick={() => handleAction('propose', parseFloat(proposedPrice))}
                                disabled={!proposedPrice || actionLoading}
                                className="propose-button"
                            >
                                {actionLoading ? <FaSpinner className="animate-spin" /> : 'Đề xuất giá'}
                            </button>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <button
                            onClick={() => handleAction('accept')}
                            disabled={actionLoading}
                            className="accept-button"
                        >
                            {actionLoading ? <FaSpinner className="animate-spin" /> : 'Chấp nhận giá hiện tại'}
                        </button>
                        <button
                            onClick={() => handleAction('reject')}
                            disabled={actionLoading}
                            className="reject-button"
                        >
                            {actionLoading ? <FaSpinner className="animate-spin" /> : 'Từ chối'}
                        </button>
                    </div>
                </div>
            )}

            {bargain.status === 'accepted' && (
                <div className="bargain-success">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <FaCheckCircle className="text-green-500 text-2xl mr-3" />
                            <div>
                                <h3 className="text-green-800 font-bold">Thương lượng thành công!</h3>
                                <p className="text-green-700">
                                    Giá cuối cùng: {formatPrice(bargain.finalPrice)}
                                </p>
                                <p className="text-sm text-green-600 mt-2">
                                    Bạn có thể tiến hành đặt hàng với giá này.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/product/${bargain.productId}`)}
                            className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Xem sản phẩm
                        </button>
                    </div>
                </div>
            )}

            {bargain.status === 'rejected' && (
                <div className="bargain-rejected">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <FaTimesCircle className="text-red-500 text-2xl mr-3" />
                            <div>
                                <h3 className="text-red-800 font-bold">Thương lượng không thành công</h3>
                                <p className="text-red-700">
                                    Người bán đã từ chối đề xuất cuối cùng.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/fast-bargain')}
                            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Thử thương lượng khác
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BargainDetail;
