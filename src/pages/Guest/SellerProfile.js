import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { FaStar, FaRegStar } from "react-icons/fa";
import ChatBox from "../../components/Chat/ChatBox";
import products from "../../data/products";
import sellers from "../../data/sellers";

const SellerProfile = () => {
    const { sellerId } = useParams();
    const sellerName = decodeURIComponent(sellerId); // decode từ URL

    // Tìm seller khớp với tên
    const seller = sellers.find((s) => s.id === sellerName);
    const [following, setFollowing] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    // Nếu không tìm thấy người bán
    if (!seller) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl text-red-600 font-semibold">Người bán không tồn tại.</h2>
                <p className="text-gray-500">Vui lòng kiểm tra lại liên kết hoặc quay về trang chủ.</p>
            </div>
        );
    }

    const handleFollow = () => setFollowing(!following);

    // Lọc sản phẩm của người bán
    const sellerProducts = products.filter((p) => p.seller === seller.id);

    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Thông tin người bán */}
                <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6 mb-10 bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center gap-6">
                        <img
                            src={seller.avatar}
                            alt={seller.id}
                            className="w-24 h-24 rounded-full object-cover shadow"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-supply-primary">{seller.id}</h2>
                            <p className="text-sm text-gray-600">{seller.address}</p>
                            <p className="text-sm text-gray-800 mt-2">{seller.bio}</p>

                            <div className="flex items-center mt-2 gap-4 text-sm text-gray-700">
                                <span className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, index) =>
                                        index < Math.floor(seller.rating) ? (
                                            <FaStar key={index} className="text-yellow-400" />
                                        ) : (
                                            <FaRegStar key={index} className="text-gray-300" />
                                        )
                                    )}
                                    <span className="ml-2">({seller.rating.toFixed(1)}/5)</span>
                                </span>
                                <span>👥 {seller.followers.toLocaleString()} người theo dõi</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleFollow}
                            className={`px-5 py-2 rounded-full text-white text-sm font-medium transition ${following ? "bg-gray-500" : "bg-supply-primary hover:bg-green-600"
                                }`}
                        >
                            {following ? "Đã theo dõi" : "Theo dõi"}
                        </button>

                        <button
                            onClick={() => setChatOpen(true)}
                            className="px-5 py-2 rounded-full bg-white text-supply-primary border border-supply-primary text-sm font-medium hover:bg-green-50"
                        >
                            Liên hệ
                        </button>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <section>
                    <h3 className="text-xl font-semibold text-supply-primary mb-4">
                        Sản phẩm nổi bật từ {seller.id}
                    </h3>
                    {sellerProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {sellerProducts.map((p) => (
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
                        <p className="text-gray-500 text-center">Người bán hiện chưa có sản phẩm nào.</p>
                    )}
                </section>
            </main>

            {chatOpen && <ChatBox sellerName={seller.id} onClose={() => setChatOpen(false)} />}
        </div>
    );
};

export default SellerProfile;
