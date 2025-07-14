import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaStore, FaHeart, FaMapMarkerAlt, FaStar, FaUsers,
    FaEye, FaBox, FaSearch, FaFilter, FaSpinner
} from 'react-icons/fa';
import BuyerLayout from '../../layouts/BuyerLayout';
import followStoreService from '../../services/followStoreService';
import FollowStoreButton from '../../components/FollowStoreButton';
import toastService from '../../services/toastService';

const FollowingStoresPage = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 12;

    // Fetch following stores
    useEffect(() => {
        fetchFollowingStores();
    }, [currentPage]);

    const fetchFollowingStores = async () => {
        try {
            setLoading(true);
            const result = await followStoreService.getFollowingStores(currentPage, pageSize);

            if (result.success) {
                setStores(result.data || []);
                setTotalPages(Math.ceil((result.totalCount || 0) / pageSize));
            } else {
                toastService.error(result.message || 'Không thể tải danh sách cửa hàng theo dõi');
            }
        } catch (error) {
            console.error('Error fetching following stores:', error);
            toastService.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Handle unfollow
    const handleUnfollow = (storeId) => {
        setStores(prevStores => prevStores.filter(store => store.id !== storeId));
    };

    // Filter and sort stores
    const filteredStores = stores
        .filter(store =>
            store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                default: // newest
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    return (
        <BuyerLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FaHeart className="text-red-500 text-2xl" />
                        <h1 className="text-3xl font-bold text-gray-800">Cửa hàng theo dõi</h1>
                    </div>
                    <p className="text-gray-600">
                        Quản lý danh sách các cửa hàng bạn đang theo dõi để cập nhật sản phẩm mới nhất
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm cửa hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-supply-primary"
                            >
                                <option value="newest">Theo dõi gần nhất</option>
                                <option value="oldest">Theo dõi cũ nhất</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
                        <span>Tổng cộng: <strong>{stores.length}</strong> cửa hàng</span>
                        {searchTerm && (
                            <span>Kết quả tìm kiếm: <strong>{filteredStores.length}</strong> cửa hàng</span>
                        )}
                    </div>
                </div>

                {/* Store Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="text-center">
                            <FaSpinner className="animate-spin text-4xl text-supply-primary mx-auto mb-4" />
                            <p className="text-gray-600">Đang tải danh sách cửa hàng...</p>
                        </div>
                    </div>
                ) : filteredStores.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredStores.map((store) => (
                                <StoreCard
                                    key={store.id}
                                    store={store}
                                    onUnfollow={handleUnfollow}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trước
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg ${currentPage === page
                                                ? 'bg-supply-primary text-white'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {searchTerm ? 'Không tìm thấy cửa hàng nào' : 'Chưa theo dõi cửa hàng nào'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm
                                ? 'Thử tìm kiếm với từ khóa khác'
                                : 'Hãy khám phá và theo dõi các cửa hàng yêu thích của bạn'
                            }
                        </p>
                        {!searchTerm && (
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-supply-primary text-white rounded-lg hover:bg-green-600 transition"
                            >
                                <FaSearch />
                                Khám phá cửa hàng
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </BuyerLayout>
    );
};

// Store Card Component
const StoreCard = ({ store, onUnfollow }) => {
    const handleFollowChange = (isFollowing) => {
        if (!isFollowing && onUnfollow) {
            onUnfollow(store.id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Store Image */}
            <div className="relative h-48 bg-gradient-to-br from-green-400 to-supply-primary">
                {store.imageUrl ? (
                    <img
                        src={store.imageUrl}
                        alt={store.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <FaStore className="text-6xl text-white opacity-80" />
                    </div>
                )}

                {/* Follow Button */}
                <div className="absolute top-3 right-3">
                    <FollowStoreButton
                        storeId={store.id}
                        initialFollowing={true}
                        onFollowChange={handleFollowChange}
                        variant="icon-only"
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 shadow-lg"
                    />
                </div>
            </div>

            {/* Store Info */}
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
                        {store.name || 'Chưa có tên cửa hàng'}
                    </h3>
                    {store.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">{store.description}</p>
                    )}
                </div>

                {/* Location */}
                {store.address && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                        <FaMapMarkerAlt />
                        <span className="line-clamp-1">{store.address}</span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-supply-primary">
                            {store.productCount || 0}
                        </div>
                        <div className="text-gray-500 text-xs">Sản phẩm</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-supply-primary">
                            {store.followerCount || 0}
                        </div>
                        <div className="text-gray-500 text-xs">Theo dõi</div>
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    to={`/store/${store.id}`}
                    className="block w-full text-center bg-supply-primary text-white py-2 rounded-lg hover:bg-green-600 transition font-medium"
                >
                    Xem cửa hàng
                </Link>
            </div>
        </div>
    );
};

export default FollowingStoresPage;
