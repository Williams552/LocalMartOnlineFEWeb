import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";
import logo from "../../assets/image/logo.jpg";
import { FaStar, FaRegStar } from "react-icons/fa";
import ChatBox from "../../components/Chat/ChatBox";

const SellerProfile = () => {
    const { sellerId } = useParams();

    // Dữ liệu người bán
    const seller = {
        id: sellerId,
        name: "Nguyễn Văn B",
        address: "Chợ Bến Thành, Quận 1, TP.HCM",
        avatar: logo,
        bio: "Tôi là người nông dân chuyên cung cấp rau củ sạch từ vườn nhà với hơn 10 năm kinh nghiệm.",
        rating: 4.3,
        followers: 1243,
    };

    const [following, setFollowing] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const handleFollow = () => {
        setFollowing(!following);
    };

    const sellerProducts = [
        { id: 101, name: "Rau muống sạch" },
        { id: 102, name: "Cà rốt Đà Lạt" },
        { id: 103, name: "Xà lách xoăn" },
    ];

    return (
        <div>
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6 mb-10 bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center gap-6">
                        <img
                            src={seller.avatar}
                            alt={seller.name}
                            className="w-24 h-24 rounded-full object-cover shadow"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-supply-primary">{seller.name}</h2>
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

                <section>
                    <h3 className="text-xl font-semibold text-supply-primary mb-4">
                        Sản phẩm nổi bật từ {seller.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {sellerProducts.map((product) => (
                            <ProductCard key={product.id} id={product.id} name={product.name} />
                        ))}
                    </div>
                </section>
            </main>

            <Footer />

            {chatOpen && (
                <ChatBox sellerName={seller.name} onClose={() => setChatOpen(false)} />
            )}
        </div>
    );
};

export default SellerProfile;
