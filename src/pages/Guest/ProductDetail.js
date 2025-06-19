// src/pages/ProductDetail.js

import React from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import logo from "../../assets/image/logo.jpg";
import { Link } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa";
import HomeCarousel from "../../components/Carousel/Carousel";
import products from "../../data/products";

const ProductDetail = () => {
    const { id } = useParams();
    const product = products.find((p) => p.id === parseInt(id));

    const comments = [
        { user: "Lê Thị A", content: "Rau rất tươi, giao nhanh, giá tốt!" },
        { user: "Ngô Văn C", content: "Chất lượng ổn, sẽ ủng hộ tiếp." },
    ];

    if (!product) {
        return <p className="text-center mt-10">Sản phẩm không tồn tại.</p>;
    }

    return (
        <div>
            <Header />
            <HomeCarousel />

            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <img
                        src={logo}
                        alt={product.name}
                        className="w-full h-72 object-cover rounded-lg shadow"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-supply-primary mb-2">
                            {product.name}
                        </h1>
                        <p className="text-gray-700 text-sm mb-1">
                            Người bán: <Link to={`/seller/1`} className="text-blue-600 hover:underline">{product.seller}</Link>
                        </p>
                        <p className="text-gray-700 text-sm mb-1">
                            Vị trí: <strong>{product.market}</strong>
                        </p>
                        <p className="text-green-600 font-bold text-xl mt-3 mb-4">
                            {product.price.toLocaleString()}đ / kg
                        </p>

                        <p className="text-gray-700 leading-relaxed">{product.description}</p>

                        <div className="flex items-center mt-4 gap-1">
                            {Array.from({ length: 5 }).map((_, index) =>
                                index < Math.floor(product.rating) ? (
                                    <FaStar key={index} className="text-yellow-400" />
                                ) : (
                                    <FaRegStar key={index} className="text-gray-300" />
                                )
                            )}
                            <span className="ml-2 text-sm text-gray-600">({product.rating}/5)</span>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-xl font-semibold text-supply-primary mb-4">Bình luận</h2>
                    <div className="space-y-4">
                        {comments.map((comment, idx) => (
                            <div key={idx} className="bg-gray-100 p-3 rounded shadow-sm">
                                <p className="font-semibold text-sm text-gray-800">{comment.user}</p>
                                <p className="text-gray-700 text-sm">{comment.content}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                        <textarea
                            placeholder="Nhập bình luận của bạn..."
                            rows={3}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary"
                        ></textarea>
                        <button className="mt-2 px-6 py-2 bg-supply-primary text-white rounded-full hover:bg-green-600 transition text-sm">
                            Gửi bình luận
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetail;