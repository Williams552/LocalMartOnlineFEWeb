import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import FollowStoreButton from "../../components/FollowStoreButton";
import {
    FaStar, FaRegStar, FaMapMarkerAlt, FaUsers, FaShoppingBag,
    FaCertificate, FaPhone, FaComments, FaStore, FaAward,
    FaClock, FaLeaf, FaHeart, FaRegHeart, FaBox, FaCalendarAlt,
    FaEye, FaThList, FaShieldAlt, FaFilter, FaSort, FaSearch
} from "react-icons/fa";
import ChatBox from "../../components/Chat/ChatBox";
import storeService from "../../services/storeService";
import productService from "../../services/productService";
import userService from "../../services/userService";

const StorePage = () => {
    const { storeId } = useParams();

    const [store, setStore] = useState(null);
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [following, setFollowing] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterCategory, setFilterCategory] = useState('all');
    const [totalProductCount, setTotalProductCount] = useState(0);

    // Fetch store data from API
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get store details
                const storeResponse = await storeService.getStoreById(storeId);
                if (!storeResponse.success || !storeResponse.data) {
                    setError('Không tìm thấy gian hàng');
                    return;
                }

                const storeData = storeResponse.data;
                setStore(storeData);

                // Get store statistics
                const statsResponse = await storeService.getStoreStatistics(storeId);
                if (statsResponse.success && statsResponse.data) {
                    console.log('Store statistics from API:', statsResponse.data);
                    setStatistics(statsResponse.data);
                }

                // Get seller information
                if (storeData.sellerId) {
                    const sellerResponse = await userService.getSellerById(storeData.sellerId);
                    if (sellerResponse.success && sellerResponse.data) {
                        setSeller(userService.formatSellerForProfile(sellerResponse.data));
                    }
                }

                // Get store products
                await fetchProducts();

            } catch (err) {
                console.error('Error fetching store data:', err);
                setError('Không thể tải thông tin gian hàng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchStoreData();
        }
    }, [storeId]);

    const fetchProducts = async (page = 1) => {
        try {
            const params = {
                page: page,
                pageSize: 20,
                sortBy: sortBy,
                ascending: sortBy === 'price' ? true : false
            };

            // Add category filter if selected
            if (filterCategory !== 'all') {
                params.categoryId = filterCategory;
            }

            let result;
            if (searchTerm && searchTerm.trim()) {
                // Use store-specific search API
                result = await productService.getProductsByStore(storeId, params);
                // Filter by search term locally for now
                if (result && result.items) {
                    result.items = result.items.filter(product =>
                        product.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
            } else {
                // Use store-specific get all API
                result = await productService.getProductsByStore(storeId, params);
            }

            if (result && result.items) {
                console.log('Products API result:', {
                    itemsCount: result.items.length,
                    totalCount: result.totalCount,
                    page: result.page,
                    pageSize: result.pageSize
                });
                setProducts(result.items);
                setCurrentPage(result.page || 1);
                setTotalPages(Math.ceil((result.totalCount || 0) / (result.pageSize || 20)));
                // Always update total count from products API as it's more accurate
                setTotalProductCount(result.totalCount || 0);
            } else {
                setProducts([]);
                setCurrentPage(1);
                setTotalPages(1);
                // Also reset total count when no products found
                setTotalProductCount(0);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setProducts([]);
            // Reset total count on error
            setTotalProductCount(0);
        }
    };

    // Re-fetch when search/filter/sort changes
    useEffect(() => {
        if (store) {
            fetchProducts(1);
        }
    }, [searchTerm, sortBy, filterCategory, store]);

    const handleFollow = () => setFollowing(!following);
    const handleChatToggle = () => setChatOpen(!chatOpen);

    const formatJoinDate = (dateString) => {
        if (!dateString) return new Date().getFullYear() - 1;
        const date = new Date(dateString);
        return date.getFullYear();
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            i < Math.floor(rating) ?
                <FaStar key={i} className="text-yellow-400" /> :
                <FaRegStar key={i} className="text-gray-300" />
        ));
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-supply-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin gian hàng...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="text-red-500 text-6xl mb-4">🏪</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-supply-primary-dark transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="text-gray-400 text-6xl mb-4">🏪</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy gian hàng</h2>
                    <p className="text-gray-600">Gian hàng này có thể đã ngừng hoạt động hoặc không tồn tại.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section - Store Header */}
            <div className="bg-gradient-to-r from-supply-primary to-green-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Store Logo */}
                        <div className="relative flex-shrink-0">
                            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <FaStore size={48} className="text-supply-primary" />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full">
                                <FaShieldAlt size={12} />
                            </div>
                        </div>

                        {/* Store Info */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                                <h1 className="text-4xl font-bold">{store.name}</h1>
                                <div className="flex items-center bg-green-500 px-3 py-1 rounded-full text-sm">
                                    <FaShieldAlt className="mr-1" />
                                    Đã xác thực
                                </div>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                                <FaMapMarkerAlt className="text-green-200" />
                                <span className="text-green-100 text-lg">{store.address}</span>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    i < Math.floor(store.rating || 4.5) ?
                                        <FaStar key={i} className="text-yellow-400" /> :
                                        <FaRegStar key={i} className="text-white opacity-50" />
                                ))}
                                <span className="ml-2 text-white">
                                    {(store.rating || 0).toFixed(1)} ({(statistics?.reviewCount || store.reviewCount || 0)} đánh giá)
                                </span>
                            </div>

                            {seller && (
                                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {seller.displayName.charAt(0)}
                                    </div>
                                    <span className="text-green-100">
                                        Chủ gian hàng: {seller.displayName}
                                    </span>
                                </div>
                            )}

                            {/* Seller contact info */}
                            {seller?.phoneNumber && (
                                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                                    <FaPhone className="text-green-200" />
                                    <a
                                        href={`tel:${seller.phoneNumber}`}
                                        className="text-green-100 hover:text-white transition-colors"
                                    >
                                        {seller.phoneNumber}
                                    </a>
                                </div>
                            )}

                            {/* Store Stats */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
                                <div className="flex items-center gap-1">
                                    <FaBox className="text-green-200" />
                                    <span>{totalProductCount || statistics?.productCount || 0} sản phẩm</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaUsers className="text-green-200" />
                                    <span>{statistics?.followerCount || store.followerCount || 0} người theo dõi</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaEye className="text-green-200" />
                                    <span>{statistics?.viewCount || store.viewCount || 0} lượt xem</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaCalendarAlt className="text-green-200" />
                                    <span>Hoạt động từ {formatJoinDate(store.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <FollowStoreButton
                                storeId={storeId}
                                onFollowChange={(isFollowing) => {
                                    setFollowing(isFollowing);
                                    // Update follower count if needed
                                    if (statistics) {
                                        setStatistics(prev => ({
                                            ...prev,
                                            followerCount: prev.followerCount + (isFollowing ? 1 : -1)
                                        }));
                                    }
                                }}
                                variant="white"
                                size="lg"
                            />
                            <button
                                onClick={() => {
                                    if (seller?.phoneNumber) {
                                        // Open Zalo with phone number
                                        window.open(`https://zalo.me/${seller.phoneNumber.replace(/\D/g, '')}`, '_blank');
                                    } else {
                                        handleChatToggle();
                                    }
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
                            >
                                <FaComments />
                                Liên lạc với gian hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="text-2xl font-bold text-supply-primary mb-1">{totalProductCount || statistics?.productCount || 0}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                            <FaBox />
                            Sản phẩm
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600 mb-1">{(store.rating || 0).toFixed(1)}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                            <FaStar />
                            Đánh giá
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">{statistics?.orderCount || store.orderCount || 0}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                            <FaShoppingBag />
                            Đơn hàng
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{statistics?.followerCount || store.followerCount || 0}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                            <FaUsers />
                            Theo dõi
                        </div>
                    </div>
                </div>

                {/* Contact Info Card */}
                {seller?.phoneNumber && (
                    <div className="mt-4">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex items-center gap-2">
                                    <FaPhone className="text-supply-primary" />
                                    <span className="text-sm text-gray-600">Liên hệ:</span>
                                </div>
                                <a
                                    href={`tel:${seller.phoneNumber}`}
                                    className="text-supply-primary hover:text-green-600 font-medium transition-colors"
                                >
                                    {seller.phoneNumber}
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content - Products */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm trong gian hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <FaSort className="text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="price">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                seller={product.seller || seller?.displayName}
                                sellerId={store.sellerId}
                                market={store.address}
                                storeId={store.id}
                                storeName={store.name}
                                price={product.price}
                                image={product.image}
                                description={product.description}
                                status={product.statusDisplay}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm
                                ? 'Thử tìm kiếm với từ khóa khác'
                                : 'Gian hàng này chưa có sản phẩm nào.'
                            }
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex space-x-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => fetchProducts(i + 1)}
                                    className={`px-4 py-2 rounded-lg font-medium ${currentPage === i + 1
                                        ? 'bg-supply-primary text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Box */}
            {chatOpen && seller && (
                <ChatBox
                    recipientId={seller.id}
                    recipientName={seller.displayName}
                    recipientAvatar={seller.avatar}
                    onClose={handleChatToggle}
                />
            )}
        </div>
    );
};

export default StorePage;