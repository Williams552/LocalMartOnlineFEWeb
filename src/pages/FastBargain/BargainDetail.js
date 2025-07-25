import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaComment, FaSpinner, FaTimes, FaShoppingCart } from 'react-icons/fa';
import fastBargainService from '../../services/fastBargainService';
import authService from '../../services/authService';
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
    const [showCounterModal, setShowCounterModal] = useState(false);

    useEffect(() => {
        fetchBargainDetails();
        const interval = setInterval(fetchBargainDetails, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchBargainDetails = async () => {
        try {
            const result = await fastBargainService.getBargainById(id);

            if (result.success) {
                setBargain(result.data);
                setError(null);
            } else {
                setError(result.message || 'Không thể tải thông tin thương lượng');
                setBargain(null);
            }
        } catch (error) {
            console.error('Fetch bargain details error:', error);
            setError('Không thể tải thông tin thương lượng');
            setBargain(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionType, price = null) => {
        setActionLoading(true);
        try {
            const actionData = {
                bargainId: id,
                userId: authService.getCurrentUser()?.id,
                action: actionType.charAt(0).toUpperCase() + actionType.slice(1)
            };

            if (actionType === 'propose' && price) {
                const proposalData = {
                    bargainId: id,
                    userId: authService.getCurrentUser()?.id,
                    proposedPrice: price
                };
                
                // Chỉ thêm note nếu có nội dung
                if (message && message.trim() !== '') {
                    proposalData.note = message.trim();
                }
                
                console.log('Sending proposal with data:', proposalData);
                
                const result = await fastBargainService.proposePrice(proposalData);

                if (result.success) {
                    await fetchBargainDetails();
                    setProposedPrice('');
                    setMessage('');
                } else {
                    setError(result.message || 'Có lỗi xảy ra khi đề xuất giá');
                }
            } else {
                if (actionType === 'counter' && price) {
                    actionData.counterPrice = price;
                }

                const result = await fastBargainService.takeAction(actionData);

                if (result.success) {
                    await fetchBargainDetails();
                    if (actionType === 'propose') {
                        setProposedPrice('');
                        setMessage('');
                    }
                } else {
                    setError(result.message || 'Có lỗi xảy ra khi thực hiện hành động');
                }
            }
        } catch (error) {
            console.error('Handle action error:', error);
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Quay lại
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Chi tiết thương lượng</h1>
                </div>

                {/* Product Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin sản phẩm</h2>
                    <div className="flex items-start space-x-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                            {bargain.productImages && bargain.productImages.length > 0 ? (
                                <img
                                    src={bargain.productImages[0]}
                                    alt={bargain.productName}
                                    className="w-32 h-32 object-cover rounded-lg border"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-product.png';
                                    }}
                                />
                            ) : (
                                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <FaComment className="text-gray-400 text-2xl" />
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {bargain.productName || 'Tên sản phẩm không có'}
                            </h3>

                            {bargain.storeName && (
                                <p className="text-gray-600 mb-3">
                                    <span className="font-medium">Cửa hàng:</span> {bargain.storeName}
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Giá gốc</p>
                                    <p className="text-lg font-semibold text-gray-700">
                                        {bargain.originalPrice ? formatPrice(bargain.originalPrice) : 'Chưa có'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Giá đề xuất</p>
                                    <p className="text-lg font-semibold text-blue-600">
                                        {bargain.proposals && bargain.proposals.length > 0 
                                            ? formatPrice(bargain.proposals[bargain.proposals.length - 1].proposedPrice) 
                                            : 'Chưa có'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Số lượng</p>
                                    <p className="text-lg font-semibold text-gray-700">
                                        {bargain.quantity || 0} {bargain.productUnitName || ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tổng giá</p>
                                    <p className="text-lg font-semibold text-orange-600">
                                        {bargain.proposals && bargain.proposals.length > 0 && bargain.quantity 
                                            ? formatPrice(bargain.proposals[bargain.proposals.length - 1].proposedPrice * bargain.quantity)
                                            : 'Chưa có'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bargain.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        bargain.status?.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-800' :
                                            bargain.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    Trạng thái: {
                                        bargain.status?.toLowerCase() === 'pending' ? 'Đang chờ' :
                                            bargain.status?.toLowerCase() === 'accepted' ? 'Đã chấp nhận' :
                                                bargain.status?.toLowerCase() === 'rejected' ? 'Đã từ chối' :
                                                    bargain.status || 'Không xác định'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bargain History */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Lịch sử thương lượng</h2>
                    
                    <div className="space-y-4">
                        {bargain.proposals?.length > 0 ? (
                            bargain.proposals.map((proposal, index) => {
                                // Xác định vai trò của người đề xuất
                                const isBuyer = proposal.userId === bargain.buyerId;
                                const isSeller = proposal.userId === bargain.sellerId;
                                const isLastProposal = index === bargain.proposals.length - 1;
                                const isPending = bargain.status?.toLowerCase() === 'pending';

                                return (
                                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            {getStatusIcon('pending')}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        Đề xuất giá
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {new Date(proposal.proposedAt).toLocaleString('vi-VN')}
                                                    </p>
                                                    <p className="font-semibold text-blue-600 mt-1">
                                                        Giá: {formatPrice(proposal.proposedPrice)} / {bargain.productUnitName || 'Chưa có'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Tổng tiền hiện tại: <span className="font-semibold">
                                                                {formatPrice(bargain.proposals[bargain.proposals.length - 1].proposedPrice * bargain.quantity)}
                                                        </span>
                                                    </p>
                                                    {proposal.note && proposal.note.trim() !== '' && (
                                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                                            <p className="text-sm text-gray-700">
                                                                <span className="font-medium">Ghi chú:</span> {proposal.note}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    {isBuyer && (
                                                        <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                            {bargain.buyerName || 'Người mua'}
                                                        </span>
                                                    )}
                                                    {isSeller && (
                                                        <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                                            {bargain.sellerName || 'Người bán'}
                                                        </span>
                                                    )}
                                                    {!isBuyer && !isSeller && (
                                                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                            Không xác định
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Action buttons for seller's latest proposal */}
                                            {isSeller && isLastProposal && isPending && (
                                                <div className="mt-4 pt-3 border-t border-gray-200">
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => handleAction('accept')}
                                                            disabled={actionLoading}
                                                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                                                        >
                                                            {actionLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                                                            Chấp nhận
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => setShowCounterModal(true)}
                                                            disabled={actionLoading}
                                                            className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                                                        >
                                                            Phản hồi
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => handleAction('reject')}
                                                            disabled={actionLoading}
                                                            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8">
                                <FaComment className="mx-auto text-4xl text-gray-400 mb-4" />
                                <p className="text-gray-500">Chưa có lịch sử thương lượng</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Success State */}
                {bargain.status?.toLowerCase() === 'accepted' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center">
                            <FaCheckCircle className="text-green-500 text-2xl mr-3" />
                            <div>
                                <h3 className="text-green-800 font-bold text-lg">Thương lượng thành công!</h3>
                                <p className="text-green-700">
                                    Giá cuối cùng: {formatPrice(bargain.finalPrice * bargain.quantity|| (bargain.proposals && bargain.proposals.length > 0 ? bargain.proposals[bargain.proposals.length - 1].proposedPrice : bargain.originalPrice))}
                                </p>
                                <p className="text-sm text-green-600 mt-2">
                                    Bạn có thể tiến hành đặt hàng với giá này.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/product/${bargain.productId}`)}
                            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            Xem sản phẩm
                        </button>
                    </div>
                )}

                {/* Rejected State */}
                {bargain.status?.toLowerCase() === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center">
                            <FaTimesCircle className="text-red-500 text-2xl mr-3" />
                            <div>
                                <h3 className="text-red-800 font-bold text-lg">Thương lượng không thành công</h3>
                                <p className="text-red-700">
                                    Người bán đã từ chối đề xuất cuối cùng.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/fast-bargain')}
                            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Thử thương lượng khác
                        </button>
                    </div>
                )}
                {/* Counter Offer Modal */}
                {showCounterModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">Phản hồi giá mới</h3>
                                <button
                                    onClick={() => setShowCounterModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Order Information */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                                    <FaShoppingCart className="mr-2" />
                                    Thông tin đơn hàng
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Sản phẩm:</strong> {bargain.productName}</p>
                                    <p><strong>Số lượng yêu cầu:</strong> 
                                        <span className="text-lg font-bold text-blue-600 ml-2">
                                            {bargain.quantity} {bargain.productUnitName}
                                        </span>
                                    </p>
                                    <p><strong>Giá gốc:</strong> {formatPrice(bargain.originalPrice)}/{bargain.productUnitName}</p>
                                </div>
                            </div>

                            {/* Current price info */}
                            {bargain.proposals && bargain.proposals.length > 0 && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-orange-600">Giá hiện tại:</p>
                                    <p className="text-lg font-bold text-orange-800">
                                        {formatPrice(bargain.proposals[bargain.proposals.length - 1].proposedPrice)} / {bargain.productUnitName}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Tổng tiền hiện tại: <span className="font-semibold">
                                            {formatPrice(bargain.proposals[bargain.proposals.length - 1].proposedPrice * bargain.quantity)}
                                        </span>
                                    </p>
                                </div>
                            )}

                            {/* Price input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giá phản hồi (VND/{bargain.productUnitName}):
                                </label>
                                <input
                                    type="number"
                                    value={proposedPrice}
                                    onChange={(e) => setProposedPrice(e.target.value)}
                                    placeholder="Nhập giá bạn muốn đề xuất"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    min="0"
                                />
                                
                                {/* Total price calculation */}
                                {proposedPrice && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Tổng tiền: <span className="font-bold text-green-600">
                                            {formatPrice(parseFloat(proposedPrice || 0) * bargain.quantity)}
                                        </span>
                                    </p>
                                )}
                                
                                {/* Price Suggestions */}
                                {bargain.proposals && bargain.proposals.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setProposedPrice((bargain.proposals[bargain.proposals.length - 1].proposedPrice - 5000).toString())}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                        >
                                            -5K
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProposedPrice((bargain.proposals[bargain.proposals.length - 1].proposedPrice - 10000).toString())}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                        >
                                            -10K
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProposedPrice((bargain.proposals[bargain.proposals.length - 1].proposedPrice + 5000).toString())}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                        >
                                            +5K
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProposedPrice((bargain.proposals[bargain.proposals.length - 1].proposedPrice + 10000).toString())}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                        >
                                            +10K
                                        </button>
                                    </div>
                                )}
                                
                                {/* Price Comparison */}
                                {proposedPrice && bargain.proposals && bargain.proposals.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-600">
                                        {parseFloat(proposedPrice) > bargain.proposals[bargain.proposals.length - 1].proposedPrice ? (
                                            <span className="text-red-600">
                                                Cao hơn giá hiện tại: +{formatPrice(parseFloat(proposedPrice) - bargain.proposals[bargain.proposals.length - 1].proposedPrice)}
                                            </span>
                                        ) : parseFloat(proposedPrice) < bargain.proposals[bargain.proposals.length - 1].proposedPrice ? (
                                            <span className="text-green-600">
                                                Thấp hơn giá hiện tại: {formatPrice(parseFloat(proposedPrice) - bargain.proposals[bargain.proposals.length - 1].proposedPrice)}
                                            </span>
                                        ) : (
                                            <span className="text-blue-600">Bằng giá hiện tại</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Message input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú cho đề xuất này (tùy chọn):
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Thêm ghi chú để giải thích lý do hoặc yêu cầu của bạn..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    rows="3"
                                />
                                {/* Debug info */}
                                {message && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        Debug: Note length = {message.length}, will send: "{message.trim()}"
                                    </div>
                                )}
                            </div>

                            {/* Modal buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowCounterModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => {
                                        handleAction('propose', parseFloat(proposedPrice));
                                        setShowCounterModal(false);
                                    }}
                                    disabled={!proposedPrice || actionLoading}
                                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {actionLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                                    Gửi phản hồi
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BargainDetail;
