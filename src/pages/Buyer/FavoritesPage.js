import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaHeart, FaSearch, FaFilter, FaEye, FaShoppingCart,
    FaStore, FaStar, FaSpinner, FaTrash
} from 'react-icons/fa';
import favoriteService from '../../services/favoriteService';
import FavoriteButton from '../../components/Common/FavoriteButton';
import toastService from '../../services/toastService';
import logo from '../../assets/image/logo.jpg';

const FavoritesPage = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, price-low, price-high, name
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(12);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            toastService.error('Vui lòng đăng nhập để xem danh sách yêu thích');
            navigate('/login');
            return;
        }

        loadFavorites();
    }, [currentPage, navigate]);

    const loadFavorites = async () => {
        try {
            console.log('🔄 FavoritesPage: Starting to load favorites...');
            setLoading(true);

            const result = await favoriteService.getFavoriteProducts(currentPage, pageSize);
            console.log('📋 FavoritesPage: Received result:', result);

            if (result.success) {
                console.log('✅ FavoritesPage: Success! Setting favorites:', result.data);
                console.log('📊 FavoritesPage: Total count:', result.totalCount);
                console.log('📄 FavoritesPage: Total pages:', result.totalPages);

                setFavorites(result.data || []);
                setTotalPages(result.totalPages || 1);
            } else {
                console.log('❌ FavoritesPage: Failed to load favorites:', result.message);
                toastService.error(result.message || 'Không thể tải danh sách yêu thích');
                setFavorites([]);
            }
        } catch (error) {
            console.error('💥 FavoritesPage: Exception in loadFavorites:', error);
            toastService.error('Có lỗi khi tải danh sách yêu thích');
            setFavorites([]);
        } finally {
            setLoading(false);
            console.log('🏁 FavoritesPage: Load favorites completed');
        }
    };

    const handleFavoriteChange = (productId, newState) => {
        if (!newState) {
            // Product was removed from favorites, remove from list
            setFavorites(prev => prev.filter(fav => fav.productId !== productId));
            toastService.success('Đã xóa khỏi danh sách yêu thích');
        }
    };

    const handleRemoveFromFavorites = async (productId) => {
        try {
            const result = await favoriteService.removeFromFavorites(productId);
            if (result.success) {
                setFavorites(prev => prev.filter(fav => fav.productId !== productId));
                toastService.success('Đã xóa khỏi danh sách yêu thích');
            } else {
                toastService.error(result.message || 'Không thể xóa khỏi yêu thích');
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
            toastService.error('Có lỗi khi xóa khỏi yêu thích');
        }
    };

    // Filter and sort favorites based on backend data structure
    const filteredAndSortedFavorites = favorites
        .filter(favorite =>
            favorite.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            favorite.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.addedToFavoriteAt) - new Date(b.addedToFavoriteAt);
                case 'price-low':
                    return (a.price || 0) - (b.price || 0);
                case 'price-high':
                    return (b.price || 0) - (a.price || 0);
                case 'name':
                    return (a.productName || '').localeCompare(b.productName || '');
                case 'newest':
                default:
                    return new Date(b.addedToFavoriteAt) - new Date(a.addedToFavoriteAt);
            }
        });

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toLocaleString('vi-VN');
        }
        return parseFloat(price || 0).toLocaleString('vi-VN');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className="text-yellow-500" />
            ) : (
                <FaStar key={i} className="text-gray-300" />
            )
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                <FaHeart className="mr-3 text-red-500" />
                                Sản phẩm yêu thích
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {loading ? 'Đang tải...' : `${filteredAndSortedFavorites.length} sản phẩm trong danh sách yêu thích`}
                            </p>
                        </div>
                        <Link
                            to="/"
                            className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search and Filter Controls */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm yêu thích..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                            />
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent appearance-none"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="price-low">Giá thấp đến cao</option>
                                <option value="price-high">Giá cao đến thấp</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Favorites Grid */}
                {loading ? (
                    <div className="text-center py-16">
                        <FaSpinner className="animate-spin text-4xl text-supply-primary mx-auto mb-4" />
                        <p className="text-gray-500">Đang tải danh sách yêu thích...</p>
                    </div>
                ) : filteredAndSortedFavorites.length === 0 ? (
                    <div className="text-center py-16">
                        <FaHeart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-500 mb-2">
                            {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm yêu thích'}
                        </h2>
                        <p className="text-gray-400 mb-6">
                            {searchTerm
                                ? 'Thử tìm kiếm với từ khóa khác'
                                : 'Hãy thêm các sản phẩm bạn yêu thích vào danh sách này!'
                            }
                        </p>
                        <Link
                            to="/"
                            className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                        >
                            Khám phá sản phẩm
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAndSortedFavorites.map((favorite) => (
                                <div key={favorite.favoriteId} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="relative">
                                        <Link to={`/product/${favorite.productId}`}>
                                            <img
                                                src={favorite.imageUrl || logo}
                                                alt={favorite.productName}
                                                className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => { e.target.src = logo; }}
                                            />
                                        </Link>

                                        {/* Favorite Button */}
                                        <div className="absolute top-3 right-3">
                                            <FavoriteButton
                                                productId={favorite.productId}
                                                size="md"
                                                className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm"
                                                onFavoriteChange={handleFavoriteChange}
                                            />
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/product/${favorite.productId}`}
                                                    className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition"
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye className="text-gray-600" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Stock Status Badge */}
                                        {favorite.status && (
                                            <div className="absolute bottom-3 left-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${favorite.status === 'Available'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {favorite.status === 'Available' ? 'Còn hàng' : 'Hết hàng'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <Link to={`/product/${favorite.productId}`}>
                                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-supply-primary transition">
                                                {favorite.productName}
                                            </h3>
                                        </Link>

                                        {/* Price */}
                                        <div className="mb-3">
                                            <span className="text-2xl font-bold text-red-600">
                                                {formatPrice(favorite.price)}đ
                                            </span>
                                            {favorite.stockQuantity && (
                                                <span className="text-sm text-gray-500 ml-2">
                                                    (Còn {favorite.stockQuantity})
                                                </span>
                                            )}
                                        </div>

                                        {/* Seller */}
                                        <div className="flex items-center text-sm text-gray-600 mb-2">
                                            <FaStore className="mr-1" />
                                            <span>{favorite.storeName}</span>
                                        </div>

                                        {/* Category */}
                                        {favorite.categoryName && (
                                            <div className="text-sm text-gray-500 mb-2">
                                                Danh mục: {favorite.categoryName}
                                            </div>
                                        )}

                                        {/* Added Date */}
                                        <div className="text-xs text-gray-500 mb-3">
                                            Thêm vào: {formatDate(favorite.addedToFavoriteAt)}
                                        </div>

                                        {/* Description */}
                                        {favorite.description && (
                                            <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {favorite.description}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/product/${favorite.productId}`}
                                                className="flex-1 bg-supply-primary text-white py-2 px-4 rounded-lg hover:bg-green-600 transition text-center text-sm flex items-center justify-center"
                                            >
                                                <FaShoppingCart className="mr-2" />
                                                Mua ngay
                                            </Link>
                                            <button
                                                onClick={() => handleRemoveFromFavorites(favorite.productId)}
                                                className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition"
                                                title="Xóa khỏi yêu thích"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex space-x-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-4 py-2 rounded-lg transition ${currentPage === page
                                                ? 'bg-supply-primary text-white'
                                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
