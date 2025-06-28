import React, { useState } from "react";
import Carousel from "../../components/Carousel/Carousel";
import ProductCard from "../../components/ProductCard/ProductCard";
import CategorySidebar from "../../components/Sidebar/CategorySidebar";
import products from "../../data/products";
import ChatboxBot from "../../components/Chat/ChatBoxBot";

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMarket, setSelectedMarket] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");

    const markets = [
        "Tất cả",
        "Chợ Cái Khế",
        "Chợ An Hòa",
        "Chợ Xuân Khánh",
        "Chợ Ninh Kiều",
        "Chợ Hưng Lợi",
        "Chợ Tân An",
    ];

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedMarket === "" || selectedMarket === "Tất cả" || p.market === selectedMarket) &&
            (selectedCategory === "Tất cả" || p.category === selectedCategory)
    );

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
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">🔍 Tìm kiếm & Lọc sản phẩm</h3>

                        {/* Search Filters */}
                        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 mb-6">
                            <div className="w-full lg:w-64">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn chợ</label>
                                <select
                                    value={selectedMarket}
                                    onChange={(e) => setSelectedMarket(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary focus:border-transparent"
                                >
                                    {markets.map((market, idx) => (
                                        <option key={idx} value={market}>
                                            {market}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full lg:w-96">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm sản phẩm</label>
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
                        </div>

                        {/* Category Bar */}
                        <div className="border-t pt-4">
                            <CategorySidebar
                                onSelectCategory={setSelectedCategory}
                                selectedCategory={selectedCategory}
                            />
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
                                Tìm thấy {filteredProducts.length} sản phẩm
                            </div>
                        </div>
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredProducts.map((p) => (
                                    <ProductCard
                                        key={p.id}
                                        id={p.id}
                                        name={p.name}
                                        seller={p.seller}
                                        market={p.market}
                                        price={p.price}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm phù hợp.</p>
                                <p className="text-gray-400 text-sm mt-2">Hãy thử tìm kiếm với từ khóa khác hoặc chọn chợ khác.</p>
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
