import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaShoppingCart, FaStore, FaMapMarkerAlt, FaPhone, FaUser, FaShieldAlt, FaLeaf, FaClock, FaUsers, FaBox, FaEye, FaCalendarAlt, FaEdit, FaComments, FaHandshake } from "react-icons/fa";
import { FiMinus, FiPlus, FiTruck, FiShield, FiClock, FiInfo } from "react-icons/fi";
import ProductCard from "../../components/ProductCard/ProductCard";
import AddToCartButton from "../../components/Common/AddToCartButton";
import FavoriteButton from "../../components/Common/FavoriteButton";
import { ReviewList, ReviewForm, ReviewSummary } from "../../components/Review";
import StartBargainModal from "../../components/FastBargain/StartBargainModal";
import logo from "../../assets/image/logo.jpg";
import productService from "../../services/productService";
import storeService from "../../services/storeService";
import userService from "../../services/userService";
import reviewService from "../../services/reviewService";
import authService from "../../services/authService";

const ProductDetail = () => {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [store, setStore] = useState(null);
    const [seller, setSeller] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [quantity, setQuantity] = useState(0.5); // Changed to use 0.5 as minimum
    const [isFavorited, setIsFavorited] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    // Fast Bargain states
    const [showBargainModal, setShowBargainModal] = useState(false);

    // Review states
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [reviewStats, setReviewStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: null
    });

    // Utility function to get time ago
    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Chưa xác định';

        const now = new Date();
        const date = new Date(dateString);
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays <= 7) return `${diffDays} ngày trước`;
        if (diffDays <= 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        if (diffDays <= 365) return `${Math.floor(diffDays / 30)} tháng trước`;
        return `${Math.floor(diffDays / 365)} năm trước`;
    };

    // Fetch product data from API
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get product details
                const productResponse = await productService.getProductById(id);
                if (!productResponse.success || !productResponse.data) {
                    setError('Không tìm thấy sản phẩm');
                    return;
                }

                const productData = productResponse.data;
                console.log('Product data loaded:', productData);
                setProduct(productData);

                // Set initial quantity to product's minimum quantity
                if (productData.minimumQuantity) {
                    setQuantity(productData.minimumQuantity);
                }

                // Fetch additional data in parallel
                const promises = [];

                // Get store info if storeId exists
                if (productData.storeId) {
                    promises.push(storeService.getStoreById(productData.storeId));
                } else {
                    promises.push(Promise.resolve({ success: false }));
                }

                // Get seller info if sellerId exists  
                if (productData.sellerId) {
                    promises.push(userService.getSellerById(productData.sellerId));
                } else {
                    promises.push(Promise.resolve({ success: false }));
                }

                // Get related products by category
                if (productData.categoryId) {
                    promises.push(productService.getProductsByCategory(productData.categoryId, { pageSize: 8 }));
                } else {
                    promises.push(productService.getFormattedProducts({ pageSize: 8 }));
                }

                // Get reviews for the product
                console.log('Fetching reviews for product:', productData.id);
                promises.push(reviewService.getReviewsForTarget('Product', productData.id, { pageSize: 5 }));

                const [storeResult, sellerResult, relatedResult, reviewResult] = await Promise.all(promises);

                console.log('All promises resolved:', {
                    storeResult: storeResult?.success,
                    sellerResult: sellerResult?.success,
                    relatedResult: relatedResult?.items?.length,
                    reviewResult: reviewResult?.success
                });

                if (storeResult.success && storeResult.data) {
                    console.log('Store data loaded:', storeResult.data);
                    setStore(storeResult.data);
                }

                if (sellerResult.success && sellerResult.data) {
                    console.log('Seller data loaded:', sellerResult.data);
                    setSeller(userService.formatSellerForProfile(sellerResult.data));
                }

                if (relatedResult.items && relatedResult.items.length > 0) {
                    // Filter out current product from related products
                    const filtered = relatedResult.items.filter(p => p.id !== productData.id);
                    setRelatedProducts(filtered.slice(0, 4));
                }

                // Set review stats
                console.log('Review result:', reviewResult);
                if (reviewResult.success) {
                    console.log('Setting review stats:', {
                        averageRating: reviewResult.averageRating,
                        totalReviews: reviewResult.totalCount,
                        ratingBreakdown: reviewService.calculateRatingBreakdown(reviewResult.reviews || [])
                    });
                    setReviewStats({
                        averageRating: reviewResult.averageRating || 0,
                        totalReviews: reviewResult.totalCount || 0,
                        ratingBreakdown: reviewService.calculateRatingBreakdown(reviewResult.reviews || [])
                    });
                } else {
                    console.error('Failed to fetch reviews:', reviewResult.message);
                    // Set default review stats when failed to fetch
                    setReviewStats({
                        averageRating: 0,
                        totalReviews: 0,
                        ratingBreakdown: reviewService.calculateRatingBreakdown([])
                    });
                }

            } catch (err) {
                console.error('Error fetching product data:', err);
                setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductData();
        }
    }, [id]);

    // Check for current user and their review
    useEffect(() => {
        const checkCurrentUser = async () => {
            try {
                // Get current user from localStorage or auth service
                const userData = localStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setCurrentUser(user);

                    // Check if user has already reviewed this product
                    if (product) {
                        const userReviews = await reviewService.getUserReviews(user.id);
                        if (userReviews.success) {
                            const existingReview = userReviews.reviews.find(
                                review => review.targetType === 'Product' && review.targetId === product.id
                            );
                            setUserReview(existingReview || null);
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking current user:', error);
            }
        };

        checkCurrentUser();
    }, [product]);

    const handleBargainSuccess = (bargainData) => {
        setShowBargainModal(false);
        // Hiển thị thông báo thành công hoặc navigate tới bargain detail
        console.log('Bargain started successfully:', bargainData);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className="text-yellow-500" />
            ) : (
                <FaRegStar key={i} className="text-gray-300" />
            )
        );
    };

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toLocaleString('vi-VN');
        }
        return parseFloat(price || 0).toLocaleString('vi-VN');
    };

    const getDisplayImage = (imageUrl) => {
        if (imageUrl && imageUrl.trim() !== '') {
            return imageUrl;
        }
        return logo; // fallback to default logo
    };

    // Mock data for fields not available from API
    const getExtendedProductData = () => {
        if (!product) return null;

        return {
            ...product,
            images: product.images && product.images.length > 0 ? product.images : [product.image || logo],
            origin: store?.address || "Việt Nam",
            harvest: "Hôm nay",
            storage: "Bảo quản trong tủ lạnh 2-3 ngày",
            nutritions: ["Vitamin A", "Vitamin C", "Sắt", "Canxi", "Chất xơ"],
            stock: 50 // Mock stock
        };
    };

    const handleReviewUpdate = () => {
        // Refresh review data when a review is updated
        if (product) {
            reviewService.getReviewsForTarget('Product', product.id, { pageSize: 5 })
                .then(result => {
                    console.log('Refreshing review stats:', result);
                    if (result.success) {
                        setReviewStats({
                            averageRating: result.averageRating || 0,
                            totalReviews: result.totalCount || 0,
                            ratingBreakdown: reviewService.calculateRatingBreakdown(result.reviews || [])
                        });
                    } else {
                        console.error('Failed to refresh reviews:', result.message);
                        // Keep existing stats or set defaults
                        setReviewStats(prev => prev || {
                            averageRating: 0,
                            totalReviews: 0,
                            ratingBreakdown: reviewService.calculateRatingBreakdown([])
                        });
                    }
                })
                .catch(error => {
                    console.error('Error refreshing reviews:', error);
                    // Keep existing stats on error
                    setReviewStats(prev => prev || {
                        averageRating: 0,
                        totalReviews: 0,
                        ratingBreakdown: reviewService.calculateRatingBreakdown([])
                    });
                });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-supply-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
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
                    <Link
                        to="/"
                        className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-supply-primary-dark transition-colors"
                    >
                        Trở về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
                    <p className="text-gray-600 mb-6">Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
                    <Link
                        to="/"
                        className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-supply-primary-dark transition-colors"
                    >
                        Trở về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    const productDetails = getExtendedProductData();

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-gray-600">
                <Link to="/" className="hover:text-supply-primary">Trang chủ</Link>
                <span className="mx-2">/</span>
                <Link to="/" className="hover:text-supply-primary">Sản phẩm</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-800">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                {/* Product Images */}
                <div>
                    <img
                        src={getDisplayImage(productDetails.images[selectedImage])}
                        alt={product.name}
                        className="w-full h-96 object-cover rounded-xl shadow-lg mb-4"
                    />
                    <div className="flex space-x-2">
                        {productDetails.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-supply-primary' : 'border-gray-200'
                                    }`}
                            >
                                <img
                                    src={getDisplayImage(img)}
                                    alt={`${product.name} ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">                            <div className="flex items-center space-x-1">
                                {renderStars(reviewStats.averageRating)}
                                <span className="ml-1">({reviewStats.totalReviews} đánh giá)</span>
                            </div>
                                <span>•</span>
                                <span>Đã bán {product.soldCount || 0}</span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                    <FaCalendarAlt className="text-supply-primary" />
                                    <span className="text-supply-primary font-medium">
                                        {getTimeAgo(product.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <FavoriteButton
                            productId={product.id}
                            size="lg"
                            className="rounded-full bg-white shadow-sm"
                        />
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${product.status === 'Available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {product.statusDisplay || product.status}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-red-600">{formatPrice(product.price)}đ</span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">/kg</span>
                        </div>
                        <p className="text-red-600 text-sm mt-1">🔥 Giá tốt hôm nay</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Xuất xứ:</span>
                                <span className="ml-2 font-medium">{productDetails.origin}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Thu hoạch:</span>
                                <span className="ml-2 font-medium text-green-600">{productDetails.harvest}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Bảo quản:</span>
                                <span className="ml-2 font-medium">{productDetails.storage}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Phân loại:</span>
                                <span className="ml-2 font-medium">{product.category || 'Thực phẩm'}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Ngày đăng:</span>
                                <span className="ml-2 font-medium text-blue-600">
                                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') + ' ' +
                                        new Date(product.createdAt).toLocaleTimeString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        }) : 'Chưa xác định'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Đăng:</span>
                                <span className="ml-2 font-medium text-green-600">
                                    {getTimeAgo(product.createdAt)}
                                </span>
                            </div>
                        </div>

                        {product.description && (
                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-800 mb-2">Mô tả:</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Add to Cart Section */}
                    <div className="border rounded-lg p-4 mb-6">
                        <h3 className="font-medium mb-3">Thêm vào giỏ hàng</h3>
                        <AddToCartButton
                            product={product}
                            quantity={quantity}
                            onQuantityChange={setQuantity}
                            showQuantityControls={true}
                            size="default"
                        />
                    </div>

                    {/* Fast Bargain Section */}
                    {authService.isAuthenticated() && (
                        <div className="border rounded-lg p-4 mb-6">
                            <h3 className="font-medium mb-3">Thương lượng giá</h3>
                            <button
                                onClick={() => setShowBargainModal(true)}
                                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaHandshake className="w-4 h-4" />
                                Thương lượng ngay
                            </button>
                            <p className="text-sm text-gray-500 mt-2 text-center">
                                Đề xuất giá tốt hơn với người bán
                            </p>
                        </div>
                    )}

                    {/* Chat with Seller */}
                    {seller && (
                        <div className="border rounded-lg p-4 mb-6">
                            <h3 className="font-medium mb-3">Liên hệ người bán</h3>
                            <Link
                                to={`/buyer/chat/${seller.id}`}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaComments className="w-4 h-4" />
                                Chat với {seller.fullName || 'người bán'}
                            </Link>
                        </div>
                    )}

                    {/* Guarantees */}
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div className="flex flex-col items-center">
                            <FiTruck className="w-6 h-6 text-blue-500" />
                            <span>Giao hàng nhanh</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FiShield className="w-6 h-6 text-green-500" />
                            <span>Hàng tươi sạch</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FiClock className="w-6 h-6 text-orange-500" />
                            <span>Hỗ trợ 24/7</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seller/Store Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaStore className="mr-2 text-supply-primary" />
                    Thông tin gian hàng
                </h2>

                {seller || store ? (
                    <div className="space-y-6">
                        {/* Store Header */}
                        <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-supply-primary/10 to-green-50 rounded-lg border border-supply-primary/20">
                            <div className="w-20 h-20 bg-gradient-to-r from-supply-primary to-green-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {store?.name?.charAt(0) || product?.seller?.charAt(0) || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                                {store ? (
                                    <Link
                                        to={`/store/${store.id}`}
                                        className="text-2xl font-bold text-supply-primary hover:text-supply-primary-dark transition-colors flex items-center group"
                                    >
                                        {store.name}
                                        <FaStore className="ml-2 text-lg group-hover:scale-110 transition-transform" />
                                    </Link>
                                ) : (
                                    <div className="text-2xl font-bold text-gray-800 flex items-center">
                                        {product?.seller || 'Người bán'}
                                        <FaStore className="ml-2 text-lg text-gray-500" />
                                    </div>
                                )}
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                                    <FaMapMarkerAlt className="text-supply-primary" />
                                    <span className="font-medium">{store?.address || product?.market || 'Chợ địa phương'}</span>
                                </div>
                                {store?.phone && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                        <FaPhone className="text-supply-primary" />
                                        <span className="font-medium">{store.phone}</span>
                                    </div>
                                )}
                                {store?.description && (
                                    <div className="text-sm text-gray-600 mt-2">
                                        <p className="line-clamp-2">{store.description}</p>
                                    </div>
                                )}
                                <div className="flex items-center space-x-4 mt-3">
                                    {store?.rating && (
                                        <div className="flex items-center space-x-1">
                                            {renderStars(store.rating)}
                                            <span className="text-sm text-gray-600 ml-1 font-medium">
                                                ({store.rating.toFixed(1)}/5)
                                            </span>
                                        </div>
                                    )}
                                    <div className="text-sm text-green-600 font-medium">
                                        ✅ {store ? 'Gian hàng đã xác thực' : 'Người bán uy tín'}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="space-y-1 text-sm">
                                    {store?.productCount && (
                                        <div className="flex items-center text-gray-600">
                                            <FaBox className="mr-1 text-supply-primary" />
                                            <span className="font-bold text-supply-primary">{store.productCount}</span>
                                            <span className="ml-1">sản phẩm</span>
                                        </div>
                                    )}
                                    {store?.followerCount && (
                                        <div className="flex items-center text-gray-600">
                                            <FaUsers className="mr-1 text-supply-primary" />
                                            <span className="font-bold text-supply-primary">{store.followerCount}</span>
                                            <span className="ml-1">người theo dõi</span>
                                        </div>
                                    )}
                                    {store?.viewCount && (
                                        <div className="flex items-center text-gray-600">
                                            <FaEye className="mr-1 text-supply-primary" />
                                            <span className="font-bold text-supply-primary">{store.viewCount}</span>
                                            <span className="ml-1">lượt xem</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Seller Info */}
                        {seller && (
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                    {seller.displayName?.charAt(0) || 'S'}
                                </div>
                                <div className="flex-1">
                                    <Link
                                        to={`/seller/${seller.id}`}
                                        className="text-lg font-bold text-gray-800 hover:text-supply-primary transition-colors"
                                    >
                                        {seller.displayName || seller.name || 'Người bán'}
                                    </Link>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                            Người bán
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-gray-600">
                                    {seller?.joinDate && (
                                        <div>Tham gia từ {new Date(seller.joinDate).getFullYear()}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            {store ? (
                                <Link
                                    to={`/store/${store.id}`}
                                    className="flex items-center justify-center space-x-2 bg-supply-primary text-white py-3 px-4 rounded-lg hover:bg-supply-primary-dark transition-all transform hover:scale-105 font-medium shadow-lg"
                                >
                                    <FaStore />
                                    <span>Vào gian hàng</span>
                                </Link>
                            ) : (
                                <div className="flex items-center justify-center space-x-2 bg-gray-300 text-gray-600 py-3 px-4 rounded-lg font-medium">
                                    <FaStore />
                                    <span>Vào gian hàng</span>
                                </div>
                            )}
                            {seller ? (
                                <Link
                                    to={`/seller/${seller.id}`}
                                    className="flex items-center justify-center space-x-2 border-2 border-supply-primary text-supply-primary py-3 px-4 rounded-lg hover:bg-supply-primary hover:text-white transition-all font-medium"
                                >
                                    <FaUsers />
                                    <span>Xem người bán</span>
                                </Link>
                            ) : (
                                <div className="flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-600 py-3 px-4 rounded-lg font-medium">
                                    <FaUsers />
                                    <span>Xem người bán</span>
                                </div>
                            )}
                        </div>

                        {/* Store Features */}
                        {store && (
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <FaLeaf className="text-green-600" />
                                    </div>
                                    <span className="text-xs text-gray-600">Sản phẩm tươi</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <FaShieldAlt className="text-blue-600" />
                                    </div>
                                    <span className="text-xs text-gray-600">Đảm bảo chất lượng</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <FaClock className="text-orange-600" />
                                    </div>
                                    <span className="text-xs text-gray-600">Giao hàng nhanh</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Fallback for when store/seller data is not available */}
                        <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border border-gray-200">
                            <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                {product.seller ? product.seller.charAt(0) : 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-2xl font-bold text-gray-800 flex items-center">
                                    {product.seller || 'Người bán'}
                                    <FaStore className="ml-2 text-lg text-gray-500" />
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                                    <FaMapMarkerAlt className="text-gray-500" />
                                    <span>{product.market || 'Chợ địa phương'}</span>
                                </div>
                                <div className="flex items-center space-x-1 mt-3">
                                    {renderStars(4.0)}
                                    <span className="text-sm text-gray-600 ml-1">(4.0/5)</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <FaBox className="mr-1" />
                                        <span className="font-bold">-</span>
                                        <span className="ml-1">sản phẩm</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaUsers className="mr-1" />
                                        <span className="font-bold">-</span>
                                        <span className="ml-1">người theo dõi</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Disabled Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-center space-x-2 bg-gray-300 text-gray-600 py-3 px-4 rounded-lg font-medium">
                                <FaStore />
                                <span>Vào gian hàng</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-600 py-3 px-4 rounded-lg font-medium">
                                <FaUsers />
                                <span>Xem người bán</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Mô tả sản phẩm</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    {product.description || 'Sản phẩm tươi ngon, chất lượng cao từ người bán uy tín.'}
                </p>

                <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Giá trị dinh dưỡng:</h3>
                    <div className="flex flex-wrap gap-2">
                        {productDetails.nutritions.map((nutrition, idx) => (
                            <span key={idx} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                                {nutrition}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
                {/* Review Summary */}
                <ReviewSummary
                    averageRating={reviewStats.averageRating}
                    totalReviews={reviewStats.totalReviews}
                    ratingBreakdown={reviewStats.ratingBreakdown}
                    showDetailed={true}
                />

                {/* Write Review Section */}
                {currentUser && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {userReview ? 'Đánh giá của bạn' : 'Đánh giá sản phẩm'}
                            </h3>
                            {userReview && (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="flex items-center space-x-2 text-supply-primary hover:text-supply-primary-dark transition-colors"
                                >
                                    <FaEdit />
                                    <span>Chỉnh sửa</span>
                                </button>
                            )}
                        </div>

                        {userReview ? (
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center space-x-2 mb-2">
                                    {renderStars(userReview.rating)}
                                    <span className="text-sm text-gray-600">
                                        {new Date(userReview.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                {userReview.comment && (
                                    <p className="text-gray-700">{userReview.comment}</p>
                                )}
                            </div>
                        ) : !showReviewForm ? (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 text-center hover:border-supply-primary hover:bg-supply-primary/5 transition-colors"
                            >
                                <div className="text-gray-400 text-2xl mb-2">⭐</div>
                                <p className="text-gray-600 font-medium">Viết đánh giá cho sản phẩm này</p>
                                <p className="text-gray-500 text-sm">Chia sẻ trải nghiệm của bạn với cộng đồng</p>
                            </button>
                        ) : null}

                        {showReviewForm && (
                            <ReviewForm
                                targetType="Product"
                                targetId={product.id}
                                userId={currentUser.id}
                                existingReview={userReview}
                                onReviewSubmitted={(newReview) => {
                                    setUserReview(newReview);
                                    setShowReviewForm(false);
                                    // Refresh review stats
                                    window.location.reload();
                                }}
                                onCancel={() => setShowReviewForm(false)}
                            />
                        )}
                    </div>
                )}

                {/* Reviews List */}
                <ReviewList
                    targetType="Product"
                    targetId={product.id}
                    showFilters={true}
                    maxHeight="800px"
                />
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Sản phẩm tương tự</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard
                                key={relatedProduct.id}
                                id={relatedProduct.id}
                                name={relatedProduct.name}
                                seller={relatedProduct.seller}
                                sellerId={relatedProduct.sellerId}
                                market={relatedProduct.market}
                                storeId={relatedProduct.storeId}
                                storeName={relatedProduct.storeName}
                                price={relatedProduct.price}
                                image={relatedProduct.image}
                                description={relatedProduct.description}
                                rating={relatedProduct.rating}
                                status={relatedProduct.statusDisplay}
                                minimumQuantity={relatedProduct.minimumQuantity || 0.5}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Start Bargain Modal */}
            <StartBargainModal
                isOpen={showBargainModal}
                onClose={() => setShowBargainModal(false)}
                product={product}
                onSuccess={handleBargainSuccess}
            />
        </main>
    );
};

export default ProductDetail;
