// Priority Actions Page - Dedicated page for managing urgent actions
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SellerLayout from '../../layouts/SellerLayout';
import {
    FaExclamationTriangle, FaClipboardList, FaBoxOpen, FaCreditCard,
    FaCertificate, FaCheck, FaTimes, FaEye, FaMoneyBill, FaPlus,
    FaClock, FaFilter, FaSearch, FaDownload, FaSyncAlt
} from 'react-icons/fa';
import priorityActionService from '../../services/priorityActionService';

const PriorityActionsPage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [priorityData, setPriorityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetails, setShowDetails] = useState({});

    useEffect(() => {
        fetchPriorityActions();
    }, []);

    const fetchPriorityActions = async () => {
        try {
            setLoading(true);
            const response = await priorityActionService.getPriorityActions();
            setPriorityData(response.data);
        } catch (error) {
            console.error('Error fetching priority actions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = async (actionType, itemId) => {
        setProcessing(prev => ({ ...prev, [itemId]: true }));

        try {
            let result;
            switch (actionType) {
                case 'processOrder':
                    result = await priorityActionService.processOrder(itemId);
                    break;
                case 'restockProduct':
                    result = await priorityActionService.restockProduct(itemId, 10);
                    break;
                case 'payFee':
                    result = await priorityActionService.payFee(itemId);
                    break;
                case 'renewLicense':
                    result = await priorityActionService.renewLicense(itemId);
                    break;
            }

            if (result.success) {
                await fetchPriorityActions();
            }
        } catch (error) {
            console.error('Error performing action:', error);
        } finally {
            setProcessing(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const toggleDetails = (itemId) => {
        setShowDetails(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Vừa xong';
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        return `${Math.floor(diffInHours / 24)} ngày trước`;
    };

    const formatDaysLeft = (daysLeft) => {
        if (daysLeft <= 0) return 'Đã hết hạn';
        if (daysLeft === 1) return '1 ngày';
        if (daysLeft <= 7) return `${daysLeft} ngày`;
        return `${Math.floor(daysLeft / 7)} tuần`;
    };

    const tabs = [
        { id: 'all', label: 'Tất cả', icon: FaExclamationTriangle },
        { id: 'orders', label: 'Đơn hàng', icon: FaClipboardList },
        { id: 'stock', label: 'Tồn kho', icon: FaBoxOpen },
        { id: 'payments', label: 'Thanh toán', icon: FaCreditCard },
        { id: 'licenses', label: 'Giấy phép', icon: FaCertificate }
    ];

    const renderPendingOrders = () => {
        if (!priorityData?.pendingOrders?.items) return null;

        return priorityData.pendingOrders.items
            .filter(item => !searchTerm || item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((order) => (
                <div key={order.id} className={`bg-white rounded-lg shadow-sm border-l-4 ${order.isUrgent ? 'border-red-500' : 'border-blue-500'} p-6 mb-4`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <FaClipboardList className="text-blue-600" />
                                <h3 className="font-bold text-gray-800">Đơn hàng #{order.id}</h3>
                                {order.isUrgent && (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Cấp bách
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Khách hàng:</span>
                                    <p className="text-gray-800">{order.customerName}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Giá trị:</span>
                                    <p className="text-gray-800 font-medium">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Thời gian:</span>
                                    <p className="text-gray-800">{formatTimeAgo(order.createdAt)}</p>
                                </div>
                            </div>

                            {showDetails[order.id] && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Chi tiết đơn hàng:</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Số lượng sản phẩm:</span>
                                            <span>{order.itemCount} món</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Trạng thái:</span>
                                            <span className="text-orange-600 capitalize">{order.status}</span>
                                        </div>
                                        {order.products && (
                                            <div>
                                                <span className="text-sm font-medium">Sản phẩm:</span>
                                                <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
                                                    {order.products.map((product, idx) => (
                                                        <li key={idx}>{product}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                            <button
                                onClick={() => toggleDetails(order.id)}
                                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition text-sm"
                            >
                                <FaEye className="mr-2" />
                                {showDetails[order.id] ? 'Ẩn' : 'Xem'}
                            </button>

                            <button
                                onClick={() => handleQuickAction('processOrder', order.id)}
                                disabled={processing[order.id]}
                                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50"
                            >
                                {processing[order.id] ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck className="mr-2" />
                                        Xử lý
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ));
    };

    const renderOutOfStock = () => {
        if (!priorityData?.outOfStock?.items) return null;

        return priorityData.outOfStock.items
            .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((product) => (
                <div key={product.id} className={`bg-white rounded-lg shadow-sm border-l-4 ${product.isCritical ? 'border-red-500' : 'border-orange-500'} p-6 mb-4`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <FaBoxOpen className="text-red-600" />
                                <h3 className="font-bold text-gray-800">{product.name}</h3>
                                {product.isCritical && (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Hết hàng
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">SKU:</span>
                                    <p className="text-gray-800">{product.sku}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Tồn kho:</span>
                                    <p className={`font-medium ${product.currentStock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                        {product.currentStock} / {product.reorderLevel}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Giá bán:</span>
                                    <p className="text-gray-800">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Bán gần nhất:</span>
                                    <p className="text-gray-800">{formatTimeAgo(product.lastSold)}</p>
                                </div>
                            </div>

                            {showDetails[product.id] && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Thông tin chi tiết:</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Danh mục:</span>
                                            <span>{product.category}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Mức tồn kho an toàn:</span>
                                            <span>{product.reorderLevel} sản phẩm</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Trạng thái:</span>
                                            <span className={product.currentStock === 0 ? 'text-red-600' : 'text-orange-600'}>
                                                {product.currentStock === 0 ? 'Hết hàng' : 'Sắp hết'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                            <button
                                onClick={() => toggleDetails(product.id)}
                                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition text-sm"
                            >
                                <FaEye className="mr-2" />
                                {showDetails[product.id] ? 'Ẩn' : 'Xem'}
                            </button>

                            <button
                                onClick={() => handleQuickAction('restockProduct', product.id)}
                                disabled={processing[product.id]}
                                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50"
                            >
                                {processing[product.id] ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang nhập...
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="mr-2" />
                                        Nhập hàng
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ));
    };

    const renderPendingPayments = () => {
        if (!priorityData?.pendingPayments?.items) return null;

        return priorityData.pendingPayments.items
            .filter(item => !searchTerm || item.description.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((payment) => (
                <div key={payment.id} className={`bg-white rounded-lg shadow-sm border-l-4 ${payment.isOverdue ? 'border-red-500' : 'border-orange-500'} p-6 mb-4`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <FaCreditCard className="text-orange-600" />
                                <h3 className="font-bold text-gray-800">{payment.description}</h3>
                                {payment.isOverdue && (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Quá hạn
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Số tiền:</span>
                                    <p className="text-gray-800 font-medium text-lg">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Hạn thanh toán:</span>
                                    <p className={`${payment.isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                                        {new Date(payment.dueDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Loại phí:</span>
                                    <p className="text-gray-800 capitalize">
                                        {payment.type === 'market_fee' ? 'Phí thuê sạp' : 'Phí hoa hồng'}
                                    </p>
                                </div>
                            </div>

                            {showDetails[payment.id] && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Chi tiết thanh toán:</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Mã phí:</span>
                                            <span>{payment.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Trạng thái:</span>
                                            <span className={payment.isOverdue ? 'text-red-600' : 'text-orange-600'}>
                                                {payment.isOverdue ? 'Quá hạn' : 'Chờ thanh toán'}
                                            </span>
                                        </div>
                                        {payment.penaltyFee > 0 && (
                                            <div className="flex justify-between">
                                                <span>Phí phạt:</span>
                                                <span className="text-red-600">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.penaltyFee)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                            <button
                                onClick={() => toggleDetails(payment.id)}
                                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition text-sm"
                            >
                                <FaEye className="mr-2" />
                                {showDetails[payment.id] ? 'Ẩn' : 'Xem'}
                            </button>

                            <button
                                onClick={() => handleQuickAction('payFee', payment.id)}
                                disabled={processing[payment.id]}
                                className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm disabled:opacity-50"
                            >
                                {processing[payment.id] ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang thanh toán...
                                    </>
                                ) : (
                                    <>
                                        <FaMoneyBill className="mr-2" />
                                        Thanh toán
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ));
    };

    const renderLicenseExpiration = () => {
        if (!priorityData?.licenseExpiration?.items) return null;

        return priorityData.licenseExpiration.items
            .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((license) => (
                <div key={license.id} className="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-6 mb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <FaCertificate className="text-purple-600" />
                                <h3 className="font-bold text-gray-800">{license.name}</h3>
                                {license.isExpiringSoon && (
                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Sắp hết hạn
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Số giấy phép:</span>
                                    <p className="text-gray-800">{license.licenseNumber}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Ngày hết hạn:</span>
                                    <p className="text-red-600 font-medium">
                                        {new Date(license.expiryDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Còn lại:</span>
                                    <p className="text-purple-600 font-medium">
                                        {formatDaysLeft(license.daysLeft)}
                                    </p>
                                </div>
                            </div>

                            {showDetails[license.id] && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Chi tiết giấy phép:</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Ngày cấp:</span>
                                            <span>{new Date(license.issueDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Loại giấy phép:</span>
                                            <span className="capitalize">{license.type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Phí gia hạn:</span>
                                            <span>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(license.renewalFee)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                            <button
                                onClick={() => toggleDetails(license.id)}
                                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition text-sm"
                            >
                                <FaEye className="mr-2" />
                                {showDetails[license.id] ? 'Ẩn' : 'Xem'}
                            </button>

                            <button
                                onClick={() => handleQuickAction('renewLicense', license.id)}
                                disabled={processing[license.id]}
                                className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm disabled:opacity-50"
                            >
                                {processing[license.id] ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang gia hạn...
                                    </>
                                ) : (
                                    <>
                                        <FaCertificate className="mr-2" />
                                        Gia hạn
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ));
    };

    const renderContent = () => {
        if (!priorityData) return null;

        const allItems = [
            ...(priorityData.pendingOrders?.items || []),
            ...(priorityData.outOfStock?.items || []),
            ...(priorityData.pendingPayments?.items || []),
            ...(priorityData.licenseExpiration?.items || [])
        ];

        switch (activeTab) {
            case 'all':
                return (
                    <div className="space-y-6">
                        {priorityData.pendingOrders?.items?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <FaClipboardList className="mr-2 text-blue-600" />
                                    Đơn hàng chờ xử lý ({priorityData.pendingOrders.urgent} cấp bách)
                                </h3>
                                {renderPendingOrders()}
                            </div>
                        )}

                        {priorityData.outOfStock?.items?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <FaBoxOpen className="mr-2 text-red-600" />
                                    Sản phẩm hết hàng ({priorityData.outOfStock.critical} tồn kho = 0)
                                </h3>
                                {renderOutOfStock()}
                            </div>
                        )}

                        {priorityData.pendingPayments?.items?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <FaCreditCard className="mr-2 text-orange-600" />
                                    Phí chợ cần thanh toán ({priorityData.pendingPayments.overdue} quá hạn)
                                </h3>
                                {renderPendingPayments()}
                            </div>
                        )}

                        {priorityData.licenseExpiration?.items?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <FaCertificate className="mr-2 text-purple-600" />
                                    Giấy phép sắp hết hạn ({priorityData.licenseExpiration.expiringSoon} cần gia hạn)
                                </h3>
                                {renderLicenseExpiration()}
                            </div>
                        )}
                    </div>
                );
            case 'orders':
                return renderPendingOrders();
            case 'stock':
                return renderOutOfStock();
            case 'payments':
                return renderPendingPayments();
            case 'licenses':
                return renderLicenseExpiration();
            default:
                return null;
        }
    };

    return (
        <SellerLayout>
            <Helmet>
                <title>Hành động ưu tiên | LocalMart Seller</title>
                <meta name="description" content="Quản lý các hành động cần xử lý ưu tiên trong cửa hàng LocalMart" />
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <FaExclamationTriangle className="mr-3 text-red-500" />
                                Hành động ưu tiên
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Xử lý các vấn đề cần chú ý ngay lập tức
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={fetchPriorityActions}
                                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                                disabled={loading}
                            >
                                <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới
                            </button>

                            <button
                                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                            >
                                <FaDownload className="mr-2" />
                                Xuất báo cáo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                {priorityData && (
                    <div className="px-6 mb-6">
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 mb-2">Tổng quan hành động ưu tiên</h2>
                                    <p className="text-gray-600">
                                        {priorityData.pendingOrders.urgent +
                                            priorityData.outOfStock.critical +
                                            priorityData.pendingPayments.overdue +
                                            priorityData.licenseExpiration.expiringSoon} vấn đề cần xử lý ngay
                                    </p>
                                </div>
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{priorityData.pendingOrders.urgent}</div>
                                        <div className="text-sm text-gray-600">Đơn hàng cấp bách</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">{priorityData.outOfStock.critical}</div>
                                        <div className="text-sm text-gray-600">Hết hàng</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">{priorityData.pendingPayments.overdue}</div>
                                        <div className="text-sm text-gray-600">Thanh toán quá hạn</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{priorityData.licenseExpiration.expiringSoon}</div>
                                        <div className="text-sm text-gray-600">Giấy phép hết hạn</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="px-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            {/* Tabs */}
                            <div className="flex flex-wrap gap-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center px-4 py-2 rounded-lg transition text-sm font-medium ${activeTab === tab.id
                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                            }`}
                                    >
                                        <tab.icon className="mr-2" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                                    <div className="h-8 bg-gray-200 rounded mb-2 w-1/2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        renderContent()
                    )}

                    {!loading && priorityData && (
                        <>
                            {(activeTab === 'all' &&
                                (!priorityData.pendingOrders?.items?.length &&
                                    !priorityData.outOfStock?.items?.length &&
                                    !priorityData.pendingPayments?.items?.length &&
                                    !priorityData.licenseExpiration?.items?.length)) ||
                                (activeTab === 'orders' && !priorityData.pendingOrders?.items?.length) ||
                                (activeTab === 'stock' && !priorityData.outOfStock?.items?.length) ||
                                (activeTab === 'payments' && !priorityData.pendingPayments?.items?.length) ||
                                (activeTab === 'licenses' && !priorityData.licenseExpiration?.items?.length) ? (
                                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                    <FaCheck className="text-4xl text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                        Tuyệt vời! Không có vấn đề nào cần xử lý
                                    </h3>
                                    <p className="text-gray-500">
                                        Tất cả các hành động ưu tiên đã được xử lý hoàn tất
                                    </p>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </SellerLayout>
    );
};

export default PriorityActionsPage;
