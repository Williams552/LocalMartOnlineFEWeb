import React, { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Carousel from "../components/Carousel/Carousel";
import ProductCard from "../components/ProductCard/ProductCard";

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const products = [
        { id: 1, name: "Rau muống sạch" },
        { id: 2, name: "Cà rốt Đà Lạt" },
        { id: 3, name: "Xoài Cát Chu" },
    ];

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="homepage">
            <Header />
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

                <section className="mb-8 flex justify-center">
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
                                <ProductCard key={p.id} id={p.id} name={p.name} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">Không tìm thấy sản phẩm phù hợp.</p>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
