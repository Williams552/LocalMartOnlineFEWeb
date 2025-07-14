import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import FollowStoreButton from "../../components/FollowStoreButton";
import {
    FaStar, FaMapMarkerAlt, FaUsers, FaShoppingBag, FaCertificate,
    FaPhone, FaComments, FaStore, FaAward, FaClock, FaLeaf,
    FaHeart, FaRegHeart, FaBox, FaCalendarAlt, FaEye, FaThList,
    FaShieldAlt, FaFilter, FaSort
} from "react-icons/fa";
import ChatBox from "../../components/Chat/ChatBox";
import storeService from "../../services/storeService";
import productService from "../../services/productService";
import userService from "../../services/userService";

const SellerProfile = () => {
    const { sellerId } = useParams();
    const sellerIdentifier = decodeURIComponent(sellerId);

    const [seller, setSeller] = useState(null);
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [following, setFollowing] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('products');
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStores: 0,
        totalReviews: 0,
        avgRating: 0
    });

    // Fetch seller data from API
    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                setLoading(true);
                setError(null);

                let sellerData = null;

                // Try to get seller by ID first
                if (sellerIdentifier.length > 10) {
                    try {
                        const response = await userService.getSellerById(sellerIdentifier);
                        if (response.success && response.data) {
                            sellerData = response.data;
                        }
                    } catch (err) {
                        console.log('Not found by ID, trying by identifier...');
                    }
                }

                // If not found by ID, try by username/email
                if (!sellerData) {
                    const response = await userService.getSellerByIdentifier(sellerIdentifier);
                    if (response.success && response.data) {
                        sellerData = response.data;
                    }
                }

                if (!sellerData) {
                    setError('Không tìm thấy thông tin người bán');
                    return;
                }

                setSeller(userService.formatSellerForProfile(sellerData));

                // Fetch additional data in parallel
                let storesResult, productsResult;

                try {
                    [storesResult, productsResult] = await Promise.all([
                        storeService.getStoresBySeller(sellerData.id),
                        // Use getAllProducts API to get all products from seller's stores
                        productService.getAllProducts({ sellerId: sellerData.id, pageSize: 50 })
                    ]);
                } catch (err) {
                    console.error('Error fetching seller stores/products:', err);
                    storesResult = [];
                    productsResult = { items: [] };
                }

                const storesData = Array.isArray(storesResult) ? storesResult : [];
                const productsData = productsResult.items || [];

                setStores(storesData);
                setProducts(productsData);

                // Calculate stats from real data
                setStats({
                    totalProducts: productsData.length,
                    totalStores: storesData.length,
                    totalReviews: 0, // No review system in current backend
                    avgRating: 0 // No rating system in current backend
                });

            } catch (err) {
                console.error('Error fetching seller data:', err);
                setError('Không thể tải thông tin người bán. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        if (sellerIdentifier) {
            fetchSellerData();
        }
    }, [sellerIdentifier]);

    const handleFollow = () => setFollowing(!following);
    const handleChatToggle = () => setChatOpen(!chatOpen);

    const formatJoinDate = (dateString) => {
        if (!dateString) return 'Chưa xác định';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long'
        });
    };

    const renderStoreCard = (store) => (
        <div key={store.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{store.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                        <FaMapMarkerAlt className="mr-2 text-supply-primary" />
                        <span className="text-sm">{store.address}</span>
                    </div>
                    {store.description && (
                        <p className="text-sm text-gray-600 mb-2">{store.description}</p>
                    )}
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500">
                            Ngày tạo: {store.createdAt ? new Date(store.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                    </div>
                </div>
                <Link
                    to={`/store/${store.id}`}
                    className="bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-supply-primary-dark transition-colors text-sm font-medium"
                >
                    Xem gian hàng
                </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                <div>
                    <p className="text-lg font-semibold text-supply-primary">{store.productCount || 0}</p>
                    <p className="text-xs text-gray-500">Sản phẩm</p>
                </div>
                <div>
                    <p className="text-lg font-semibold text-green-600">{store.orderCount || 0}</p>
                    <p className="text-xs text-gray-500">Đơn hàng</p>
                </div>
                <div>
                    <p className="text-lg font-semibold text-blue-600">{store.followerCount || 0}</p>
                    <p className="text-xs text-gray-500">Theo dõi</p>
                </div>
            </div>
        </div>
    );

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-supply-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin người bán...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
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

    if (!seller) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="text-gray-400 text-6xl mb-4">👤</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy người bán</h2>
                    <p className="text-gray-600">Thông tin người bán không tồn tại hoặc đã bị xóa.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section - Profile Header */}
            <div className="bg-gradient-to-r from-supply-primary to-green-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Avatar and Basic Info */}
                        <div className="relative flex-shrink-0">
                            <img
                                src={seller.avatar || '/api/placeholder/150/150'}
                                alt={seller.displayName}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                                onError={(e) => {
                                    e.target.src = '/api/placeholder/150/150';
                                }}
                            />
                            <div className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full">
                                <FaStore size={16} />
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{seller.displayName}</h1>
                                <div className="flex items-center bg-green-500 px-2 py-1 rounded-full text-xs">
                                    <FaShieldAlt className="mr-1" />
                                    Đã xác thực
                                </div>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                                <FaMapMarkerAlt className="text-green-200" />
                                <span className="text-green-100">
                                    {seller.address || stores[0]?.address || 'Chưa cập nhật địa chỉ'}
                                </span>
                            </div>

                            <p className="text-green-100 mb-4 max-w-md">
                                {seller.bio || 'Chuyên cung cấp thực phẩm tươi ngon chất lượng cao từ chợ địa phương.'}
                            </p>

                            {/* Stats Row */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm mb-4">
                                <div className="flex items-center gap-1">
                                    <FaStore className="text-green-200" />
                                    <span>{stats.totalStores} cửa hàng</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaBox className="text-green-200" />
                                    <span>{stats.totalProducts} sản phẩm</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaShoppingBag className="text-green-200" />
                                    <span>{stats.totalProducts} sản phẩm</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaCalendarAlt className="text-green-200" />
                                    <span>Tham gia {formatJoinDate(seller.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleFollow}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${following
                                    ? 'bg-white text-supply-primary border border-white hover:bg-gray-100'
                                    : 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-supply-primary'
                                    }`}
                            >
                                {following ? <FaHeart /> : <FaRegHeart />}
                                {following ? 'Đã theo dõi' : 'Theo dõi'}
                            </button>
                            <button
                                onClick={handleChatToggle}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-supply-primary rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                <FaComments />
                                Nhắn tin
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="text-2xl font-bold text-supply-primary mb-1">{stats.totalProducts}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                            <FaBox />
                            Sản phẩm
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalStores}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                            <FaStore />
                            Gian hàng
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">{stats.totalReviews}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                            <FaUsers />
                            Lượt đánh giá
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'products'
                                ? 'border-supply-primary text-supply-primary'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <FaShoppingBag />
                            Sản phẩm ({products.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('stores')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'stores'
                                ? 'border-supply-primary text-supply-primary'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <FaStore />
                            Gian hàng ({stores.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'about'
                                ? 'border-supply-primary text-supply-primary'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <FaUsers />
                            Thông tin
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'products' && (
                    <div>
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        name={product.name}
                                        seller={product.seller}
                                        sellerId={product.sellerId}
                                        market={product.market}
                                        storeId={product.storeId}
                                        storeName={product.storeName}
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
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có sản phẩm</h3>
                                <p className="text-gray-500">Người bán này chưa có sản phẩm nào.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'stores' && (
                    <div>
                        {stores.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {stores.map(renderStoreCard)}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-lg">
                                <div className="text-gray-400 text-6xl mb-4">🏪</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có gian hàng</h3>
                                <p className="text-gray-500">Người bán này chưa có gian hàng nào.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-xl font-semibold mb-4">Thông tin người bán</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Thông tin cơ bản</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <FaUsers className="text-gray-400 mr-3 w-5" />
                                        <span className="text-gray-600">{seller.displayName}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaMapMarkerAlt className="text-gray-400 mr-3 w-5" />
                                        <span className="text-gray-600">{seller.address || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaCalendarAlt className="text-gray-400 mr-3 w-5" />
                                        <span className="text-gray-600">Tham gia từ {formatJoinDate(seller.createdAt)}</span>
                                    </div>
                                    {seller.phone && (
                                        <div className="flex items-center">
                                            <FaPhone className="text-gray-400 mr-3 w-5" />
                                            <span className="text-gray-600">{seller.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Thống kê</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tổng sản phẩm:</span>
                                        <span className="font-medium">{stats.totalProducts}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số gian hàng:</span>
                                        <span className="font-medium">{stats.totalStores}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày tham gia:</span>
                                        <span className="font-medium">{formatJoinDate(seller?.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {seller.bio && (
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-medium text-gray-700 mb-3">Giới thiệu</h4>
                                <p className="text-gray-600 leading-relaxed">{seller.bio}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Chat Box */}
            {chatOpen && seller && (
                <ChatBox
                    isOpen={chatOpen}
                    onClose={handleChatToggle}
                    recipientId={seller.id}
                    recipientName={seller.displayName}
                />
            )}
        </div>
    );
};

export default SellerProfile;
