// src/pages/HomePage.js

import React, { useState } from "react";
import Carousel from "../../components/Carousel/Carousel";
import ProductCard from "../../components/ProductCard/ProductCard";
import products from "../../data/products";

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMarket, setSelectedMarket] = useState("");

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
            (selectedMarket === "" || selectedMarket === "Tất cả" || p.market === selectedMarket)
    );

    return (
        <div className="homepage">
            <Carousel />

            <main className="mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <section className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-supply-primary mb-3">
                        Chào mừng đến với LocalMart!
                    </h1>
                    <p className="text-gray-700 text-lg">
                        Mua bán nông sản tươi sạch, nhanh chóng và tiện lợi.
                    </p>
                </section>

                <section className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <select
                        value={selectedMarket}
                        onChange={(e) => setSelectedMarket(e.target.value)}
                        className="w-full sm:w-64 border border-supply-primary rounded-full px-5 py-2 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary"
                    >
                        {markets.map((market, idx) => (
                            <option key={idx} value={market}>
                                {market}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-96 border border-supply-primary rounded-full px-5 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-supply-primary text-sm"
                    />
                </section>

                <section className="mb-12">
                    <h3 className="text-xl font-bold text-supply-primary mb-4 text-center">Sản phẩm nổi bật</h3>
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                        <p className="text-center text-gray-500">Không tìm thấy sản phẩm phù hợp.</p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default HomePage;