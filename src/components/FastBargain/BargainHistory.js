import React, { useState, useEffect } from 'react';
import { FaHandshake, FaEye, FaHistory, FaSearch, FaFilter } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import fastBargainService from '../../services/fastBargainService';
import authService from '../../services/authService';
import '../../styles/fast-bargain.css';

const BargainHistory = () => {
    const navigate = useNavigate();
    const [bargains, setBargains] = useState([]);
    const [filteredBargains, setFilteredBargains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    const currentUser = authService.getCurrentUser();

    // Debug current user
    useEffect(() => {
        console.log('Current user in BargainHistory:', currentUser);
        if (!currentUser || !currentUser.id) {
            console.warn('No valid user found, using fallback ID');
        }
    }, [currentUser]);

    useEffect(() => {
        loadBargainHistory();
    }, []);

    useEffect(() => {
        filterBargains();
    }, [bargains, statusFilter, searchTerm]);

    const loadBargainHistory = async () => {
        try {
            setLoading(true);
            const userId = currentUser?.id || 'fallback-user-id';
            console.log('Loading bargain history for user:', userId);
            const result = await fastBargainService.getBargainHistory(userId);
            console.log('Bargain history result:', result);

            if (result.success) {
                setBargains(result.data || []);
                console.log('Bargains set:', result.data);
                setError(null);

                // Show message if using sample data
                if (result.message) {
                    console.log('Service message:', result.message);
                }
            } else {
                setError(result.message);
                setBargains([]);
            }
        } catch (error) {
            console.error('LoadBargainHistory error:', error);
            setError('Lỗi khi tải lịch sử thương lượng');
            setBargains([]);
        } finally {
            setLoading(false);
        }
    };

    const filterBargains = () => {
        let filtered = [...bargains];

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(bargain =>
                bargain.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(bargain =>
                bargain.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bargain.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort by created date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFilteredBargains(filtered);
    };

    const handleViewDetail = (bargain) => {
        navigate(`/fast-bargain/${bargain.bargainId}`);
    };

    const handleBargainUpdate = (updatedBargain) => {
        // Refresh the list after update
        loadBargainHistory();
    };

    const getStateCounts = () => {
        const counts = {
            all: bargains.length,
            pending: bargains.filter(b => b.status === 'Pending').length,
            accepted: bargains.filter(b => b.status === 'Accepted').length,
            rejected: bargains.filter(b => b.status === 'Rejected').length,
            expired: bargains.filter(b => b.status === 'Expired').length
        };
        return counts;
    };

    const stateCounts = getStateCounts();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <FaHistory className="text-green-600 text-2xl" />
                        <h1 className="text-2xl font-bold text-gray-800">Lịch sử thương lượng</h1>
                    </div>
                    <p className="text-gray-600">Quản lý và theo dõi các phiên thương lượng mua hộ nhanh</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <p className="text-2xl font-bold text-blue-600">{stateCounts.all}</p>
                        <p className="text-sm text-gray-600">Tổng số</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <p className="text-2xl font-bold text-yellow-600">{stateCounts.pending}</p>
                        <p className="text-sm text-gray-600">Đang chờ</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <p className="text-2xl font-bold text-green-600">{stateCounts.accepted}</p>
                        <p className="text-sm text-gray-600">Đã chấp nhận</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <p className="text-2xl font-bold text-red-600">{stateCounts.rejected}</p>
                        <p className="text-sm text-gray-600">Đã từ chối</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <p className="text-2xl font-bold text-gray-600">{stateCounts.expired}</p>
                        <p className="text-sm text-gray-600">Đã hết hạn</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên sản phẩm, cửa hàng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center space-x-2">
                            <FaFilter className="text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Đang chờ</option>
                                <option value="accepted">Đã chấp nhận</option>
                                <option value="rejected">Đã từ chối</option>
                                <option value="expired">Đã hết hạn</option>
                            </select>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={loadBargainHistory}
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 mr-2"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        <div className="flex items-center justify-center">
                            <FiLoader className="animate-spin text-2xl text-green-600 mr-2" />
                            <span>Đang tải lịch sử thương lượng...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={loadBargainHistory}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                ) : filteredBargains.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        <div className="text-center">
                            <FaHandshake className="mx-auto text-4xl text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có thương lượng nào</h3>
                            <p className="text-gray-500">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Không tìm thấy thương lượng phù hợp với bộ lọc'
                                    : 'Bạn chưa có phiên thương lượng nào. Hãy bắt đầu thương lượng từ trang sản phẩm!'
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sản phẩm
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số lượng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng giá
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBargains.map((bargain) => {
                                        const statusInfo = fastBargainService.formatStatus(bargain.status);
                                        const timeRemaining = fastBargainService.getTimeRemaining(bargain.expiresAt);

                                        return (
                                            <tr key={bargain.bargainId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-4">
                                                        {/* Product Image */}
                                                        <div className="flex-shrink-0 h-16 w-16">
                                                            {bargain.productImages && bargain.productImages.length > 0 ? (
                                                                <img
                                                                    className="h-16 w-16 rounded-lg object-cover border shadow-sm"
                                                                    src={bargain.productImages[0]}
                                                                    alt={bargain.productName || 'Sản phẩm'}
                                                                    crossOrigin="anonymous"
                                                                    onLoad={(e) => {
                                                                        console.log('Image loaded successfully:', e.target.src);
                                                                    }}
                                                                    onError={(e) => {
                                                                        console.log('Image failed to load:', e.target.src);
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div
                                                                className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center"
                                                                style={{ display: (bargain.productImages && bargain.productImages.length > 0) ? 'none' : 'flex' }}
                                                            >
                                                                <FaHandshake className="text-gray-400 text-lg" />
                                                            </div>
                                                        </div>
                                                        {/* Product Info */}
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                                {bargain.productName || `Sản phẩm ${bargain.productId}`}
                                                            </p>
                                                            {bargain.storeName && (
                                                                <p className="text-xs text-gray-500 mb-1">
                                                                    Cửa hàng: {bargain.storeName}
                                                                </p>
                                                            )}
                                                            {bargain.status === 'Pending' && timeRemaining && (
                                                                <p className="text-xs text-orange-600 font-medium">
                                                                    Còn lại: {timeRemaining}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <span className="font-medium text-gray-900">
                                                            {bargain.quantity || 0}
                                                        </span>
                                                        {bargain.productUnitName && (
                                                            <span className="text-gray-500 ml-1">
                                                                {bargain.productUnitName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        <span className="mr-1">{statusInfo.icon}</span>
                                                        {statusInfo.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        {bargain.finalPrice && bargain.quantity ? (
                                                            <span className="font-medium text-green-600">
                                                                {fastBargainService.formatCurrency(bargain.finalPrice * bargain.quantity)}
                                                            </span>
                                                        ) : bargain.proposals && bargain.proposals.length > 0 && bargain.quantity ? (
                                                            <span className="text-orange-600 font-medium">
                                                                {fastBargainService.formatCurrency(
                                                                    bargain.proposals[bargain.proposals.length - 1].proposedPrice * bargain.quantity
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">Chưa có tổng giá</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(bargain.createdAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleViewDetail(bargain)}
                                                        className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                                                    >
                                                        <FaEye />
                                                        <span>Xem chi tiết</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BargainHistory;
