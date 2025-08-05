import React, { useState } from 'react';
import { FiX, FiUser, FiMapPin, FiDollarSign, FiClock, FiImage, FiPackage } from 'react-icons/fi';
import { BsCart3 } from 'react-icons/bs';
import adminProxyShoppingService from '../../services/adminProxyShoppingService';
import ImageModal from '../../components/ModalComponent/ImageModal';

const ProxyRequestDetailModal = ({ request, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusBadge = (status, type = 'request') => {
        const color = adminProxyShoppingService.getStatusColor(status, type);
        const label = type === 'request' 
            ? adminProxyShoppingService.getRequestStatusLabel(status)
            : adminProxyShoppingService.getOrderStatusLabel(status);

        const colorClasses = {
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
            orange: 'bg-orange-100 text-orange-800',
            red: 'bg-red-100 text-red-800',
            gray: 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${colorClasses[color] || colorClasses.gray}`}>
                {label}
            </span>
        );
    };

    const renderRequestItems = () => {
        if (!request.items || request.items.length === 0) {
            return (
                <div className="text-center py-4 text-gray-500">
                    Không có sản phẩm nào
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên sản phẩm</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Số lượng</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Đơn vị</th>
                        </tr>
                    </thead>
                    <tbody>
                        {request.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className="font-semibold text-blue-600">{item.quantity}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {item.unit}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderOrderItems = () => {
        if (!request.proxyOrderId || !request.orderItems || request.orderItems.length === 0) {
            return (
                <div className="text-center py-4 text-gray-500">
                    Chưa có đơn hàng
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {request.orderItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start space-x-4">
                            {/* Product Image */}
                            {item.imageUrls && item.imageUrls.length > 0 && (
                                <div className="flex-shrink-0">
                                    <img 
                                        src={item.imageUrls[0]} 
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded-lg border"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            
                            {/* Product Details */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-lg text-gray-800">{item.name}</h5>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        Đã mua
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Số lượng:</span>
                                            <span className="font-semibold">{item.minimumQuantity} {item.unitName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Đơn giá:</span>
                                            <span className="font-semibold text-green-600">
                                                {formatCurrency(item.price)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Thành tiền:</span>
                                            <span className="font-bold text-green-700 text-lg">
                                                {formatCurrency(item.price * item.minimumQuantity)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {item.storeName && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Cửa hàng:</span>
                                                <span className="font-semibold">{item.storeName}</span>
                                            </div>
                                        )}
                                        {item.marketName && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Chợ:</span>
                                                <span className="font-semibold">{item.marketName}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Đơn vị:</span>
                                            <span className="text-blue-600 font-semibold">{item.unitName}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Description */}
                                {item.description && (
                                    <div className="mt-3">
                                        <span className="text-sm text-gray-600 block mb-1">Mô tả:</span>
                                        <p className="text-sm text-gray-700 bg-white rounded p-2 border">
                                            {item.description}
                                        </p>
                                    </div>
                                )}
                                
                                {/* Additional Images */}
                                {item.imageUrls && item.imageUrls.length > 1 && (
                                    <div className="mt-3">
                                        <span className="text-sm text-gray-600 mb-2 block">Hình ảnh khác:</span>
                                        <div className="flex space-x-2 overflow-x-auto">
                                            {item.imageUrls.slice(1, 4).map((url, imgIdx) => (
                                                <img 
                                                    key={imgIdx}
                                                    src={url} 
                                                    alt={`${item.name} ${imgIdx + 2}`}
                                                    className="w-12 h-12 object-cover rounded border flex-shrink-0 cursor-pointer hover:opacity-80"
                                                    onClick={() => setSelectedImage(url)}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ))}
                                            {item.imageUrls.length > 4 && (
                                                <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-600 flex-shrink-0">
                                                    +{item.imageUrls.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderProofImages = () => {
        if (!request.proofImages) {
            return (
                <div className="text-center py-4 text-gray-500">
                    Chưa có hình ảnh chứng minh
                </div>
            );
        }

        const images = Array.isArray(request.proofImages) 
            ? request.proofImages 
            : request.proofImages.split(',').filter(img => img.trim());

        if (images.length === 0) {
            return (
                <div className="text-center py-4 text-gray-500">
                    Chưa có hình ảnh chứng minh
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                        <img 
                            src={imageUrl.trim()} 
                            alt={`Proof ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImage(imageUrl.trim())}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                            <FiImage className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Chi tiết yêu cầu #{request.id?.substring(0, 8)}
                        </h2>
                        <p className="text-gray-600 mt-1">Giai đoạn hiện tại: {request.currentPhase}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status and Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Trạng thái yêu cầu:</span>
                                        {getStatusBadge(request.requestStatus || request.status, 'request')}
                                    </div>
                                    {request.proxyOrderId && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Trạng thái đơn hàng:</span>
                                            {getStatusBadge(request.orderStatus, 'order')}
                                        </div>
                                    )}
                                    {request.proxyOrderId && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Proxy Order ID:</span>
                                            <span className="text-sm font-mono text-gray-700">
                                                {request.proxyOrderId.substring(0, 12)}...
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Ngày tạo:</span>
                                        <span className="text-gray-900">{formatDate(request.createdAt)}</span>
                                    </div>
                                    {request.updatedAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Cập nhật lần cuối:</span>
                                            <span className="text-gray-900">{formatDate(request.updatedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin tài chính</h3>
                                <div className="space-y-2">
                                    {request.totalProductAmount && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Tổng tiền sản phẩm:</span>
                                            <span className="text-gray-900">
                                                {formatCurrency(request.totalProductAmount)}
                                            </span>
                                        </div>
                                    )}
                                    {request.proxyFee && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Phí dịch vụ:</span>
                                            <span className="text-gray-900">{formatCurrency(request.proxyFee)}</span>
                                        </div>
                                    )}
                                    {request.totalAmount && (
                                        <div className="flex items-center justify-between border-t pt-2 mt-2">
                                            <span className="text-gray-900 font-semibold">Tổng thanh toán:</span>
                                            <span className="text-lg font-bold text-green-600">
                                                {formatCurrency(request.totalAmount)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buyer Information */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <FiUser className="w-5 h-5 mr-2" />
                            Thông tin người mua
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">Tên:</span>
                                <div className="font-medium text-gray-900">{request.buyerName}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Email:</span>
                                <div className="font-medium text-gray-900">{request.buyerEmail}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Số điện thoại:</span>
                                <div className="font-medium text-gray-900">{request.buyerPhone || 'Không có'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Proxy Shopper Information */}
                    {request.proxyShopperId && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <FiUser className="w-5 h-5 mr-2" />
                                Thông tin Proxy Shopper
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-sm text-gray-600">Tên:</span>
                                    <div className="font-medium text-gray-900">{request.proxyShopperName}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Email:</span>
                                    <div className="font-medium text-gray-900">{request.proxyShopperEmail}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Số điện thoại:</span>
                                    <div className="font-medium text-gray-900">{request.proxyShopperPhone || 'Không có'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delivery Address */}
                    {request.deliveryAddress && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <FiMapPin className="w-5 h-5 mr-2" />
                                Địa chỉ giao hàng
                            </h3>
                            <p className="text-gray-900">{request.deliveryAddress}</p>
                        </div>
                    )}

                    {/* Notes */}
                    {request.notes && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Ghi chú</h3>
                            <p className="text-gray-900 whitespace-pre-wrap">{request.notes}</p>
                        </div>
                    )}

                    {/* Request Items */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <BsCart3 className="w-5 h-5 mr-2" />
                            Sản phẩm yêu cầu ({request.items?.length || 0})
                        </h3>
                        {renderRequestItems()}
                    </div>

                    {/* Order Items */}
                    {request.proxyOrderId && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <FiPackage className="w-5 h-5 mr-2" />
                                Đơn hàng ({request.orderItems?.length || 0})
                            </h3>
                            {request.orderCreatedAt && (
                                <div className="mb-3 text-sm text-gray-600">
                                    Tạo lúc: {formatDate(request.orderCreatedAt)}
                                    {request.orderUpdatedAt && request.orderUpdatedAt !== request.orderCreatedAt && (
                                        <span> • Cập nhật: {formatDate(request.orderUpdatedAt)}</span>
                                    )}
                                </div>
                            )}
                            {renderOrderItems()}
                        </div>
                    )}

                    {/* Proof Images */}
                    {request.proxyOrderId && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <FiImage className="w-5 h-5 mr-2" />
                                Hình ảnh chứng minh
                            </h3>
                            {renderProofImages()}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Đóng
                    </button>
                </div>

                {/* Image Modal */}
                {selectedImage && (
                    <ImageModal
                        src={selectedImage}
                        alt="Proof Image"
                        onClose={() => setSelectedImage(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default ProxyRequestDetailModal;
