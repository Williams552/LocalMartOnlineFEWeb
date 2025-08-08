import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import recommendationService from '../../services/recommendationService';
import { FaStar, FaHeart, FaEye, FaSpinner } from 'react-icons/fa';

const RecommendationSection = ({ className = '' }) => {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setIsLoggedIn(!!(token && user.id));
    }, []);

    // Fetch recommendations when component mounts and user is logged in
    useEffect(() => {
        if (isLoggedIn) {
            fetchRecommendations();
        }
    }, [isLoggedIn]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get recommendations from API
            const recommendationResult = await recommendationService.getRecommendationsForUser(5);

            if (!recommendationResult.success) {
                setError(recommendationResult.message);
                return;
            }

            if (recommendationResult.data && recommendationResult.data.length > 0) {
                // Get detailed product information
                const productsWithDetails = await recommendationService.getRecommendedProductsDetails(recommendationResult.data);
                setRecommendedProducts(productsWithDetails);
                
                console.log(`✅ Loaded ${productsWithDetails.length} recommended products`);
            } else {
                setRecommendedProducts([]);
                console.log('ℹ️ No recommendations available for user');
            }

        } catch (error) {
            console.error('❌ Error in fetchRecommendations:', error);
            setError('Không thể tải đề xuất sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Don't render anything if user is not logged in
    if (!isLoggedIn) {
        return null;
    }

    // Don't render if no recommendations and not loading
    if (!loading && recommendedProducts.length === 0 && !error) {
        return null;
    }

    return (
        <section className={`mb-12 ${className}`}>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-100 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <FaStar className="text-white text-lg" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                🎯 Đề xuất dành cho bạn
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Những sản phẩm được chọn lọc phù hợp với sở thích của bạn
                            </p>
                        </div>
                    </div>
                    
                    {/* Refresh Button */}
                    {!loading && (
                        <button
                            onClick={fetchRecommendations}
                            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                            title="Làm mới đề xuất"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Làm mới
                        </button>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <FaSpinner className="animate-spin text-purple-500 text-3xl mx-auto mb-4" />
                            <p className="text-gray-600">Đang tải đề xuất sản phẩm...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchRecommendations}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : recommendedProducts.length > 0 ? (
                    <div>
                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {recommendedProducts.map((product) => (
                                <div key={product.id} className="relative">
                                    <ProductCard
                                        id={product.id}
                                        name={product.name}
                                        seller={product.seller?.name || product.sellerName}
                                        sellerId={product.sellerId}
                                        market={product.marketName || product.market}
                                        storeId={product.storeId}
                                        storeName={product.storeName}
                                        price={product.price}
                                        image={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : product.image}
                                        description={product.description}
                                        status={product.status}
                                        minimumQuantity={product.minimumQuantity || 1}
                                        unitName={product.unitName || 'kg'}
                                    />
                                    
                                    {/* Recommendation Badge */}
                                    <div className="absolute top-2 left-2 z-10">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                            <FaHeart className="text-xs" />
                                            <span className="font-medium">Đề xuất</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer info */}
                        <div className="mt-4 text-center">
                            <p className="text-gray-500 text-xs">
                                Đề xuất dựa trên lịch sử mua sắm và sở thích của bạn
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-4xl mb-4">🤔</div>
                        <p className="text-gray-500">
                            Chúng tôi chưa có đủ thông tin để đề xuất sản phẩm cho bạn.
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            Hãy mua sắm thêm để nhận được những đề xuất phù hợp nhất!
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default RecommendationSection;
