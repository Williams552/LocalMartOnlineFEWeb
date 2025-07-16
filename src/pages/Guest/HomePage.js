import React, { useState, useEffect } from "react";
import Carousel from "../../components/Carousel/Carousel";
import ProductCard from "../../components/ProductCard/ProductCard";
import CategorySidebar from "../../components/Sidebar/CategorySidebar";
import ChatboxBot from "../../components/Chat/ChatBoxBot";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import marketService from "../../services/marketService";

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [selectedMarket, setSelectedMarket] = useState("Tất cả");
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Debounce search to avoid too many API calls
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch data from API on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch products, categories and markets in parallel - use getProductsWithDetails for full info
                const [productsResult, categoriesResult, marketsResult] = await Promise.all([
                    productService.getProductsWithDetails({
                        pageSize: 100,
                        status: 'Active' // Only get active products
                    }),
                    categoryService.getActiveCategories(),
                    marketService.getActiveMarkets()
                ]);

                console.log('Products from API:', productsResult);
                console.log('Categories from API:', categoriesResult);
                console.log('Markets from API:', marketsResult);

                // Use API products data (already enhanced with store/seller info)
                const apiProducts = productsResult.items || [];

                // Products should already be formatted with seller and store info from getProductsWithDetails
                setProducts(apiProducts);

                // Set categories 
                setCategories(categoriesResult || []);

                // Set markets
                setMarkets(marketsResult || []);

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.');
                setProducts([]);
                setCategories([]);
                setMarkets([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Search products when search term, category or market changes
    useEffect(() => {
        const searchProducts = async () => {
            try {
                setSearchLoading(true);

                // Build search parameters
                const searchParams = {
                    pageSize: 100,
                };

                // Add search keyword if provided
                if (debouncedSearchTerm) {
                    searchParams.keyword = debouncedSearchTerm;
                }

                // Add category filter if not "Tất cả"
                if (selectedCategory !== "Tất cả") {
                    const category = categories.find(cat => cat.name === selectedCategory);
                    if (category) {
                        searchParams.categoryId = category.id;
                    }
                }

                // Add market filter if not "Tất cả"
                if (selectedMarket !== "Tất cả") {
                    const market = markets.find(m => m.name === selectedMarket);
                    if (market) {
                        searchParams.marketId = market.id;
                    }
                }

                console.log('🔍 Searching with params:', searchParams);

                let searchResult;

                // If we have search criteria, use search/filter APIs
                if (debouncedSearchTerm || selectedCategory !== "Tất cả" || selectedMarket !== "Tất cả") {
                    try {
                        // Try filter API first (more comprehensive)
                        searchResult = await productService.getProductsWithFilter(searchParams);
                        console.log('✅ Filter API success:', searchResult);
                    } catch (filterError) {
                        console.warn('❌ Filter API failed, trying search API:', filterError);
                        try {
                            // Fallback to search API
                            searchResult = await productService.searchProductsAPI(searchParams);
                            console.log('✅ Search API success:', searchResult);
                        } catch (searchError) {
                            console.warn('❌ Search API failed, using basic API:', searchError);
                            // Final fallback to basic API
                            searchResult = await productService.getProductsWithDetails(searchParams);
                            console.log('✅ Basic API success:', searchResult);
                        }
                    }
                } else {
                    // No search criteria, load all products
                    searchResult = await productService.getProductsWithDetails({
                        pageSize: 100,
                        status: 'Active'
                    });
                }

                const searchResults = searchResult.items || [];
                console.log(`📦 Found ${searchResults.length} products`);
                setProducts(searchResults);

            } catch (err) {
                console.error('❌ Error searching products:', err);
                setError('Không thể tìm kiếm sản phẩm. Vui lòng thử lại.');
                setProducts([]);
            } finally {
                setSearchLoading(false);
            }
        };

        // Always search when categories and markets are loaded
        if (categories.length > 0 && markets.length > 0) {
            searchProducts();
        }
    }, [debouncedSearchTerm, selectedCategory, selectedMarket, categories, markets]);

    // Show filtered products count
    const displayProducts = products;
    const showingSearchResults = debouncedSearchTerm || selectedCategory !== "Tất cả" || selectedMarket !== "Tất cả";

    // Show loading state
    if (loading) {
        return (
            <div className="homepage bg-gray-50 min-h-screen pb-12">
                <Carousel />
                <main className="mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-supply-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải dữ liệu sản phẩm...</p>
                    </div>
                </main>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="homepage bg-gray-50 min-h-screen pb-12">
                <Carousel />
                <main className="mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">⚠️</div>
                        <p className="text-red-600 text-lg mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-supply-primary-dark transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="homepage bg-gray-50 min-h-screen pb-12">
            {/* Carousel Banner */}
            <Carousel />

            <main className="mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Title & Subtitle */}
                <section className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-supply-primary mb-4">
                        🥕 Chào mừng đến với LocalMart! 🌾
                    </h1>
                    <p className="text-gray-700 text-xl leading-relaxed max-w-3xl mx-auto">
                        Nơi kết nối người mua và người bán nông sản tươi sạch từ các chợ địa phương.<br />
                        Tìm kiếm và mua bán dễ dàng, nhanh chóng, an toàn.
                    </p>
                    <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>Tươi sạch từ chợ</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>Giao hàng tận nơi</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            <span>Giá cả hợp lý</span>
                        </div>
                    </div>
                </section>



                {/* About Section */}
                <section className="mb-12 bg-white rounded-xl shadow-sm border p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-supply-primary mb-4">Tại sao chọn LocalMart?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Chúng tôi kết nối bạn trực tiếp với các tiểu thương địa phương, mang đến những sản phẩm nông sản tươi ngon nhất.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🥬</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Tươi sạch từ chợ</h3>
                            <p className="text-gray-600 text-sm">Sản phẩm được thu hoạch và bán trong ngày, đảm bảo độ tươi ngon tối đa.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🚚</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Giao hàng nhanh</h3>
                            <p className="text-gray-600 text-sm">Giao hàng trong vòng 2-4 giờ, đảm bảo sản phẩm luôn tươi khi đến tay bạn.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💰</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Giá cả hợp lý</h3>
                            <p className="text-gray-600 text-sm">Loại bỏ trung gian, mang đến giá cả tốt nhất cho cả người mua và người bán.</p>
                        </div>
                    </div>
                </section>
                {/* Filter & Category Section */}
                <section className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">🔍 Tìm kiếm sản phẩm</h3>

                        {/* Category Bar */}
                        <div className="mb-6">
                            <CategorySidebar
                                onSelectCategory={setSelectedCategory}
                                selectedCategory={selectedCategory}
                                categories={categories}
                            />
                        </div>

                        {/* Search Input and Market Filter */}
                        <div className="flex flex-col lg:flex-row gap-4 justify-center">
                            {/* Search Input */}
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm rau củ, trái cây, thịt cá..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent text-sm"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Market Filter */}
                            <div className="flex-shrink-0 max-w-xs">
                                <div className="relative">
                                    <select
                                        value={selectedMarket}
                                        onChange={(e) => setSelectedMarket(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent text-sm bg-white"
                                    >
                                        <option value="Tất cả">🏪 Tất cả chợ</option>
                                        {markets.map((market) => (
                                            <option key={market.id} value={market.name}>
                                                🏪 {market.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product Listing Section */}
                <section>
                    {/* Product Listing */}
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-supply-primary">
                                🌟 Sản phẩm nổi bật
                            </h3>
                            <div className="text-sm text-gray-600">
                                {showingSearchResults
                                    ? `Tìm thấy ${displayProducts.length} sản phẩm${debouncedSearchTerm ? ` cho "${debouncedSearchTerm}"` : ''}${selectedCategory !== "Tất cả" ? ` trong "${selectedCategory}"` : ''}${selectedMarket !== "Tất cả" ? ` tại "${selectedMarket}"` : ''}`
                                    : `Hiển thị ${displayProducts.length} sản phẩm`
                                }
                                {searchLoading && <span className="ml-2 text-supply-primary">Đang tìm kiếm...</span>}
                            </div>
                        </div>
                        {displayProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {displayProducts.map((p) => (
                                    <ProductCard
                                        key={p.id}
                                        id={p.id}
                                        name={p.name}
                                        seller={p.seller}
                                        sellerId={p.sellerId}
                                        market={p.market}
                                        storeId={p.storeId}
                                        storeName={p.storeName}
                                        price={p.price}
                                        image={p.image}
                                        description={p.description}
                                        status={p.statusDisplay}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="text-gray-500 text-lg">
                                    {showingSearchResults
                                        ? 'Không tìm thấy sản phẩm phù hợp.'
                                        : 'Chưa có sản phẩm nào.'
                                    }
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {showingSearchResults
                                        ? 'Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.'
                                        : 'Hệ thống đang cập nhật sản phẩm.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Chatbox Bot */}
            <ChatboxBot />
        </div>
    );
};

export default HomePage;
