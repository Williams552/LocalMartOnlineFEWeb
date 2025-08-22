import React, { useState, useEffect } from 'react';
import {
    FaHandshake,
    FaEye,
    FaCheck,
    FaTimes,
    FaClock,
    FaUser,
    FaPhone,
    FaBox,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaSpinner,
    FaFilter,
    FaSearch,
    FaSyncAlt,
    FaComment,
    FaShoppingCart
} from 'react-icons/fa';
import SellerLayout from '../../layouts/SellerLayout';
import authService from '../../services/authService';
import sellerFastBargainService from '../../services/sellerFastBargainService';
import { toast } from 'react-toastify';

const SellerFastBargainPage = () => {
    const [bargains, setBargains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedBargain, setSelectedBargain] = useState(null);
    const [showBargainDetail, setShowBargainDetail] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyBargainId, setReplyBargainId] = useState(null);
    const [replyBargainInfo, setReplyBargainInfo] = useState(null);
    const [counterOffer, setCounterOffer] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        page: 1,
        limit: 20
    });

    useEffect(() => {
        fetchBargains();
    }, [filters]);

    const fetchBargains = async () => {
        try {
            setLoading(true);
            setError("");

            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                setError("Không tìm thấy thông tin người dùng");
                return;
            }

            console.log('🤝 Fetching bargains for seller:', currentUser.id);

            // Gọi API thật để lấy danh sách thương lượng
            const result = await sellerFastBargainService.getBargainsBySeller(currentUser.id);

            if (result.success) {
                setBargains(result.data);
                console.log('✅ Bargains loaded:', result.data.length, 'items');

                // Hiển thị thông báo nếu đang dùng mock data
                if (result.message && result.message.includes('mẫu')) {
                    toast.info(result.message, { autoClose: 3000 });
                }
            } else {
                setError(result.message);
                setBargains([]);
            }

        } catch (error) {
            console.error('❌ Error fetching bargains:', error);
            setError('Không thể tải danh sách thương lượng');
            setBargains([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewBargain = (bargain) => {
        setSelectedBargain(bargain);
        setShowBargainDetail(true);
    };

    const handleAcceptBargain = async (bargainId, acceptedPrice = null) => {
        try {
            setUpdatingStatus(prev => ({ ...prev, [bargainId]: true }));

            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                toast.error('Không tìm thấy thông tin người dùng');
                return;
            }

            console.log('✅ Accepting bargain:', bargainId, 'with price:', acceptedPrice);

            // Gọi API để chấp nhận thương lượng
            const result = await sellerFastBargainService.takeAction({
                bargainId: bargainId,
                userId: currentUser.id,
                action: 'Accept'
            });

            if (result.success) {
                toast.success(result.message);

                // Update local state
                setBargains(prev => prev.map(bargain =>
                    bargain.id === bargainId || bargain.bargainId === bargainId
                        ? {
                            ...bargain,
                            status: 'Accepted',
                            finalPrice: acceptedPrice,
                            updatedAt: new Date().toISOString()
                        }
                        : bargain
                ));

                // Close modal if viewing this bargain
                if (selectedBargain?.id === bargainId || selectedBargain?.bargainId === bargainId) {
                    setShowBargainDetail(false);
                    setSelectedBargain(null);
                }
            } else {
                toast.error(result.message);
            }

        } catch (error) {
            console.error('Error accepting bargain:', error);
            toast.error('Có lỗi xảy ra khi chấp nhận thương lượng');
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [bargainId]: false }));
        }
    };

    const handleRejectBargain = async (bargainId, reason) => {
        try {
            setUpdatingStatus(prev => ({ ...prev, [bargainId]: true }));

            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                toast.error('Không tìm thấy thông tin người dùng');
                return;
            }

            console.log('❌ Rejecting bargain:', bargainId, 'with reason:', reason);

            // Gọi API để từ chối thương lượng
            const result = await sellerFastBargainService.takeAction({
                bargainId: bargainId,
                userId: currentUser.id,
                action: 'Reject'
            });

            if (result.success) {
                toast.success(result.message);

                // Update local state
                setBargains(prev => prev.map(bargain =>
                    bargain.id === bargainId || bargain.bargainId === bargainId
                        ? {
                            ...bargain,
                            status: 'Rejected',
                            sellerMessage: reason,
                            updatedAt: new Date().toISOString()
                        }
                        : bargain
                ));

                // Close modal if viewing this bargain
                if (selectedBargain?.id === bargainId || selectedBargain?.bargainId === bargainId) {
                    setShowBargainDetail(false);
                    setSelectedBargain(null);
                }
            } else {
                toast.error(result.message);
            }

        } catch (error) {
            console.error('Error rejecting bargain:', error);
            toast.error('Có lỗi xảy ra khi từ chối thương lượng');
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [bargainId]: false }));
        }
    };

    const handleCounterOffer = (bargainId) => {
        // Tìm thông tin bargain hiện tại
        const currentBargain = bargains.find(b => (b.id || b.bargainId) === bargainId);

        setReplyBargainId(bargainId);
        setReplyBargainInfo(currentBargain);
        setCounterOffer('');
        setReplyMessage('');
        setShowReplyModal(true);
    };

    const submitCounterOffer = async () => {
        if (!counterOffer) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const price = parseFloat(counterOffer);
        if (isNaN(price) || price <= 0) {
            toast.error('Giá phản hồi không hợp lệ');
            return;
        }

        try {
            setUpdatingStatus(prev => ({ ...prev, [replyBargainId]: true }));

            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                toast.error('Không tìm thấy thông tin người dùng');
                return;
            }

            console.log('💰 Sending counter offer:', replyBargainId, 'price:', price);

            // Gọi API để gửi phản hồi giá
            const actionData = {
                bargainId: replyBargainId,
                userId: currentUser.id,
                action: 'Counter',
                counterPrice: price
            };

            // Chỉ thêm note nếu có nội dung
            if (replyMessage && replyMessage.trim() !== '') {
                actionData.note = replyMessage.trim();
            }

            console.log('Sending counter offer with data:', actionData);

            const result = await sellerFastBargainService.takeAction(actionData);

            if (result.success) {
                toast.success(result.message);

                // Update local state
                setBargains(prev => prev.map(bargain =>
                    bargain.id === replyBargainId || bargain.bargainId === replyBargainId
                        ? {
                            ...bargain,
                            status: 'Accepted',
                            counterOffer: price,
                            sellerMessage: replyMessage,
                            updatedAt: new Date().toISOString()
                        }
                        : bargain
                ));

                // Close modals
                setShowReplyModal(false);
                setReplyBargainId(null);
                setReplyBargainInfo(null);
                setCounterOffer('');
                setReplyMessage('');

                if (selectedBargain?.id === replyBargainId || selectedBargain?.bargainId === replyBargainId) {
                    setShowBargainDetail(false);
                    setSelectedBargain(null);
                }
            } else {
                toast.error(result.message);
            }

        } catch (error) {
            console.error('Error sending counter offer:', error);
            toast.error('Có lỗi xảy ra khi gửi phản hồi');
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [replyBargainId]: false }));
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1
        }));
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ phản hồi' },
            'Accepted': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã chấp nhận' },
            'Rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã từ chối' },
            'Expired': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã hết hạn' }
        };

        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Không xác định' };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getActionButtons = (bargain) => {
        const { status } = bargain;
        const bargainId = bargain.id || bargain.bargainId;
        const isUpdating = updatingStatus[bargainId];
        const canRespond = canSellerRespond(bargain);

        return (
            <div className="flex gap-1">
                <button
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    onClick={() => handleViewBargain(bargain)}
                    title="Xem chi tiết"
                >
                    <FaEye className="w-4 h-4" />
                </button>

                {canRespond && (
                    <>
                        <button
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:opacity-50"
                            onClick={() => handleAcceptBargain(bargainId, getLatestPrice(bargain))}
                            disabled={isUpdating}
                            title="Chấp nhận giá hiện tại"
                        >
                            {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaCheck className="w-4 h-4" />}
                        </button>
                        <button
                            className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded disabled:opacity-50"
                            onClick={() => handleCounterOffer(bargainId)}
                            disabled={isUpdating}
                            title="Phản hồi giá khác"
                        >
                            <FaHandshake className="w-4 h-4" />
                        </button>
                        <button
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                            onClick={() => handleRejectBargain(bargainId, 'Không thể chấp nhận giá này')}
                            disabled={isUpdating}
                            title="Từ chối"
                        >
                            {isUpdating ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaTimes className="w-4 h-4" />}
                        </button>
                    </>
                )}

                {status === 'Pending' && !canRespond && (
                    <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                        Chờ phản hồi từ buyer
                    </div>
                )}
            </div>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    }

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    };

    // Helper function để kiểm tra seller có thể phản hồi hay không
    const canSellerRespond = (bargain) => {
        if (bargain.status !== 'Pending') return false;

        // Nếu không có proposals, nghĩa là đây là yêu cầu ban đầu từ buyer
        if (!bargain.proposals || bargain.proposals.length === 0) {
            return true;
        }

        // Lấy proposal cuối cùng
        const lastProposal = bargain.proposals[bargain.proposals.length - 1];

        // Seller chỉ có thể phản hồi nếu proposal cuối cùng là từ buyer
        return lastProposal.userId === bargain.buyerId;
    };

    // Helper function để lấy giá mới nhất từ proposals
    const getLatestPrice = (bargain) => {
        console.log('🔍 Debug getLatestPrice for bargain:', bargain.id || bargain.bargainId);
        console.log('📋 Proposals:', bargain.proposals);
        console.log('💰 RequestedPrice:', bargain.requestedPrice);

        // Nếu có proposals, lấy giá từ proposal cuối cùng (mới nhất)
        if (bargain.proposals && bargain.proposals.length > 0) {
            // Sắp xếp proposals theo thời gian để đảm bảo thứ tự đúng
            const sortedProposals = [...bargain.proposals].sort((a, b) =>
                new Date(a.proposedAt) - new Date(b.proposedAt)
            );
            const latestProposal = sortedProposals[sortedProposals.length - 1];
            console.log('🔄 Sorted proposals:', sortedProposals);
            console.log('🎯 Latest proposal:', latestProposal);
            console.log('💵 Latest proposed price:', latestProposal.proposedPrice);
            return latestProposal.proposedPrice;
        }

        // Nếu không có proposals, lấy giá yêu cầu ban đầu
        console.log('📌 Using requestedPrice:', bargain.requestedPrice);
        return bargain.requestedPrice || 0;
    };

    const filteredBargains = bargains.filter(bargain => {
        const bargainId = bargain.id || bargain.bargainId || '';
        const buyerName = bargain.buyerName || '';
        const productName = bargain.productName || '';

        const matchesSearch = bargainId.toLowerCase().includes(filters.search.toLowerCase()) ||
            buyerName.toLowerCase().includes(filters.search.toLowerCase()) ||
            productName.toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus = filters.status === 'all' || bargain.status === filters.status;
        return matchesSearch && matchesStatus;
    });

    return (
        <SellerLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <div className="bg-orange-500 p-2 rounded-lg mr-3">
                                    <FaHandshake className="text-white" size={24} />
                                </div>
                                Quản lý thương lượng nhanh
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Xem và phản hồi các yêu cầu thương lượng từ khách hàng
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                                <div className="text-yellow-800 text-sm font-medium">Chờ phản hồi</div>
                                <div className="text-yellow-900 text-lg font-bold">
                                    {bargains.filter(b => b.status === 'Pending').length}
                                </div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                                <div className="text-green-800 text-sm font-medium">Đã chấp nhận</div>
                                <div className="text-green-900 text-lg font-bold">
                                    {bargains.filter(b => b.status === 'Accepted').length}
                                </div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                <div className="text-red-800 text-sm font-medium">Đã từ chối</div>
                                <div className="text-red-900 text-lg font-bold">
                                    {bargains.filter(b => b.status === 'Rejected').length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FaFilter className="mr-2 text-orange-500" />
                            Bộ lọc & Tìm kiếm
                        </h3>
                        <button
                            onClick={fetchBargains}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Tải lại
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo mã thương lượng, tên khách hàng, sản phẩm..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                            >
                                <option value="all">🔍 Tất cả ({bargains.length})</option>
                                <option value="Pending">⏳ Chờ phản hồi ({bargains.filter(b => b.status === 'Pending').length})</option>
                                <option value="Accepted">✅ Đã chấp nhận ({bargains.filter(b => b.status === 'Accepted').length})</option>
                                <option value="Rejected">❌ Đã từ chối ({bargains.filter(b => b.status === 'Rejected').length})</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <div className="bg-gray-50 rounded-lg p-3 w-full">
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Kết quả</div>
                                <div className="text-lg font-bold text-gray-900">{filteredBargains.length} thương lượng</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bargains Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <FaSpinner className="animate-spin text-5xl text-orange-500 mx-auto mb-4" />
                                <div className="text-gray-600 text-lg font-medium">Đang tải danh sách thương lượng...</div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-8">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                <FaTimes className="mx-auto text-3xl text-red-500 mb-2" />
                                <div className="text-red-700 font-medium">{error}</div>
                                <button
                                    onClick={fetchBargains}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Thử lại
                                </button>
                            </div>
                        </div>
                    ) : filteredBargains.length === 0 ? (
                        <div className="text-center py-16">
                            <FaHandshake className="mx-auto text-6xl text-gray-300 mb-4" />
                            <h3 className="text-xl font-medium text-gray-500 mb-2">Chưa có thương lượng nào</h3>
                            <p className="text-gray-400">
                                {filters.status !== 'all' || filters.search ?
                                    'Không tìm thấy thương lượng phù hợp với bộ lọc' :
                                    'Các yêu cầu thương lượng sẽ xuất hiện ở đây'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mã thương lượng
                                        </th> */}
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sản phẩm
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số lượng
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Giá hiện tại
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thời gian
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBargains.map((bargain, index) => {
                                        const bargainId = bargain.id || bargain.bargainId;
                                        const currentPrice = getLatestPrice(bargain);
                                        const productImage = bargain.productImage || (bargain.productImages && bargain.productImages.length > 0 ? bargain.productImages[0] : null);

                                        return (
                                            <tr key={bargainId || index} className="hover:bg-gray-50 transition group">
                                                {/* <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="bg-orange-50 p-2 rounded-lg mr-3 group-hover:bg-orange-100 transition">
                                                            <FaHandshake className="text-orange-600" size={16} />
                                                        </div>
                                                        <span className="font-medium text-gray-900">#{bargainId}</span>
                                                    </div>
                                                </td> */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                                                            <FaUser className="text-gray-600" size={14} />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{bargain.buyerName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center max-w-xs">
                                                        {productImage && (
                                                            <img
                                                                src={productImage}
                                                                alt={bargain.productName}
                                                                className="w-10 h-10 rounded object-cover mr-3"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{bargain.productName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {bargain.quantity}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-lg font-bold text-orange-600">
                                                        {formatCurrency(currentPrice * bargain.quantity)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Giảm {formatCurrency(bargain.originalPrice * bargain.quantity - currentPrice * bargain.quantity)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(bargain.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <FaClock className="mr-1" size={12} />
                                                        <span title={formatDate(bargain.createdAt)}>
                                                            {getTimeAgo(bargain.createdAt)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getActionButtons(bargain)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Bargain Detail Modal */}
                {showBargainDetail && selectedBargain && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-white/20 p-3 rounded-lg mr-4">
                                            <FaHandshake className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Chi tiết thương lượng</h3>
                                            <p className="text-orange-100">#{selectedBargain.id || selectedBargain.bargainId}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowBargainDetail(false)}
                                        className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                                    >
                                        <FaTimes className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Buyer Info */}
                                    <div className="bg-blue-50 rounded-xl p-6">
                                        <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                                            <FaUser className="mr-2" />
                                            Thông tin khách hàng
                                        </h4>
                                        <div className="space-y-3">
                                            <p><strong>Tên:</strong> {selectedBargain.buyerName}</p>
                                            {/* <p><strong>SĐT:</strong> {selectedBargain.buyerPhone}</p>
                                            <p><strong>Thời gian gửi:</strong> {formatDate(selectedBargain.createdAt)}</p> */}
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="bg-green-50 rounded-xl p-6">
                                        <h4 className="font-bold text-green-900 mb-4 flex items-center">
                                            <FaBox className="mr-2" />
                                            Thông tin sản phẩm
                                        </h4>
                                        <div className="space-y-3">
                                            <p><strong>Sản phẩm:</strong> {selectedBargain.productName}</p>
                                            <p><strong>Số lượng:</strong> {selectedBargain.quantity} {selectedBargain.unit}</p>
                                            <p><strong>Giá gốc:</strong> {formatCurrency(selectedBargain.originalPrice)}/{selectedBargain.productUnitName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bargain Details */}
                                <div className="bg-orange-50 rounded-xl p-6">
                                    <h4 className="font-bold text-orange-900 mb-4 flex items-center">
                                        <FaMoneyBillWave className="mr-2" />
                                        Chi tiết thương lượng
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <p><strong>Giá hiện tại:</strong>
                                                <span className="text-xl font-bold text-orange-600 ml-2">
                                                    {formatCurrency(getLatestPrice(selectedBargain))} / {selectedBargain.productUnitName}
                                                </span>
                                            </p>
                                            <p><strong>Tổng tiền:</strong>
                                                <span className="text-lg font-bold text-green-600 ml-2">
                                                    {formatCurrency(getLatestPrice(selectedBargain) * selectedBargain.quantity)}
                                                </span>
                                            </p>
                                            <p><strong>Tiết kiệm:</strong>
                                                <span className="text-lg font-bold text-red-600 ml-2">
                                                    -{formatCurrency((selectedBargain.originalPrice - getLatestPrice(selectedBargain)) * selectedBargain.quantity)}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p><strong>Trạng thái:</strong></p>
                                            <div className="mt-1">{getStatusBadge(selectedBargain.status)}</div>
                                        </div>
                                    </div>
                                </div>                                {/* Messages */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                        <FaComment className="mr-2" />
                                        Lịch sử thương lượng
                                    </h4>
                                    <div className="space-y-4 max-h-60 overflow-y-auto">
                                        {selectedBargain.proposals && selectedBargain.proposals.length > 0 ? (
                                            selectedBargain.proposals.map((proposal, index) => {
                                                const isBuyer = proposal.userId === selectedBargain.buyerId;
                                                const isSeller = proposal.userId === selectedBargain.sellerId;

                                                return (
                                                    <div key={index} className={`rounded-lg p-4 ${isBuyer ? 'bg-blue-100' : isSeller ? 'bg-green-100' : 'bg-gray-100'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center">
                                                                <FaUser className={`mr-2 ${isBuyer ? 'text-blue-600' : isSeller ? 'text-green-600' : 'text-gray-600'
                                                                    }`} />
                                                                <strong className={
                                                                    isBuyer ? 'text-blue-900' : isSeller ? 'text-green-900' : 'text-gray-900'
                                                                }>
                                                                    {isBuyer ? selectedBargain.buyerName :
                                                                        isSeller ? selectedBargain.sellerName : 'Không xác định'}
                                                                </strong>
                                                                <span className={`text-sm ml-2 ${isBuyer ? 'text-blue-600' : isSeller ? 'text-green-600' : 'text-gray-600'
                                                                    }`}>
                                                                    {getTimeAgo(proposal.proposedAt)}
                                                                </span>
                                                            </div>
                                                            <span className={`font-bold text-lg ${isBuyer ? 'text-blue-800' : isSeller ? 'text-green-800' : 'text-gray-800'
                                                                }`}>
                                                                {formatCurrency(proposal.proposedPrice)}
                                                            </span>
                                                        </div>
                                                        {proposal.note && proposal.note.trim() !== '' && (
                                                            <div className="mt-2 p-2 bg-gray-100 rounded-md">
                                                                <p className="text-xs text-gray-600">
                                                                    <span className="font-medium">Ghi chú:</span> {proposal.note}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-blue-100 rounded-lg p-4">
                                                <div className="flex items-center mb-2">
                                                    <FaUser className="text-blue-600 mr-2" />
                                                    <strong className="text-blue-900">{selectedBargain.buyerName}</strong>
                                                    <span className="text-sm text-blue-600 ml-2">{getTimeAgo(selectedBargain.createdAt)}</span>
                                                </div>
                                                <p className="text-blue-800">{selectedBargain.message}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                {canSellerRespond(selectedBargain) && (
                                    <div className="flex gap-4 pt-4 border-t">
                                        <button
                                            onClick={() => handleAcceptBargain(selectedBargain.id || selectedBargain.bargainId, getLatestPrice(selectedBargain))}
                                            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                                        >
                                            <FaCheck className="mr-2" />
                                            Chấp nhận giá hiện tại
                                        </button>
                                        <button
                                            onClick={() => handleCounterOffer(selectedBargain.id || selectedBargain.bargainId)}
                                            className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition flex items-center justify-center"
                                        >
                                            <FaHandshake className="mr-2" />
                                            Phản hồi giá khác
                                        </button>
                                        <button
                                            onClick={() => handleRejectBargain(selectedBargain.id || selectedBargain.bargainId, 'Không thể chấp nhận giá này')}
                                            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition flex items-center justify-center"
                                        >
                                            <FaTimes className="mr-2" />
                                            Từ chối
                                        </button>
                                    </div>
                                )}

                                {selectedBargain.status === 'Pending' && !canSellerRespond(selectedBargain) && (
                                    <div className="pt-4 border-t">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                            <div className="text-blue-800 font-medium">
                                                Đang chờ phản hồi từ khách hàng
                                            </div>
                                            <div className="text-blue-600 text-sm mt-1">
                                                Bạn đã gửi phản hồi giá. Vui lòng chờ khách hàng phản hồi lại.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Counter Offer Modal */}
                {showReplyModal && replyBargainInfo && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <FaHandshake className="mr-2 text-orange-500" />
                                    Phản hồi thương lượng
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">#{replyBargainId}</p>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Thông tin đơn hàng */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                                        <FaShoppingCart className="mr-2" />
                                        Thông tin đơn hàng
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Sản phẩm:</strong> {replyBargainInfo.productName}</p>
                                        <p><strong>Số lượng yêu cầu:</strong>
                                            <span className="text-lg font-bold text-blue-600 ml-2">
                                                {replyBargainInfo.quantity} {replyBargainInfo.unit || replyBargainInfo.productUnitName}
                                            </span>
                                        </p>
                                        <p><strong>Giá gốc:</strong> {formatCurrency(replyBargainInfo.originalPrice)}/{replyBargainInfo.unit || replyBargainInfo.productUnitName}</p>
                                        <p><strong>Giá hiện tại:</strong>
                                            <span className="text-orange-600 font-semibold ml-1">
                                                {formatCurrency(getLatestPrice(replyBargainInfo))}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giá phản hồi (VNĐ/{replyBargainInfo.unit || replyBargainInfo.productUnitName}) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={counterOffer}
                                        onChange={(e) => setCounterOffer(e.target.value)}
                                        placeholder="Nhập giá bạn muốn bán..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    {counterOffer && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Tổng tiền: <span className="font-bold text-green-600">
                                                {formatCurrency(parseFloat(counterOffer || 0) * replyBargainInfo.quantity)}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú cho đề xuất này <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Nhập ghi chú cho đề xuất của bạn..."
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 px-6 py-4 border-t">
                                <button
                                    onClick={() => {
                                        setShowReplyModal(false);
                                        setReplyBargainId(null);
                                        setReplyBargainInfo(null);
                                        setCounterOffer('');
                                        setReplyMessage('');
                                    }}
                                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={submitCounterOffer}
                                    disabled={updatingStatus[replyBargainId] || !counterOffer}
                                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center"
                                >
                                    {updatingStatus[replyBargainId] ? (
                                        <FaSpinner className="animate-spin mr-2" />
                                    ) : (
                                        <FaHandshake className="mr-2" />
                                    )}
                                    Gửi phản hồi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
};

export default SellerFastBargainPage;
