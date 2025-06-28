import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { FaStar, FaRegStar, FaMapMarkerAlt, FaUsers, FaShoppingBag, FaCertificate, FaPhone, FaComments, FaStore, FaAward, FaClock, FaLeaf, FaHeart, FaRegHeart } from "react-icons/fa";
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🏪</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy gian hàng</h2>
                    <p className="text-gray-600 mb-6">Gian hàng này có thể đã ngừng hoạt động hoặc không tồn tại.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const handleFollow = () => setFollowing(!following);

    // Lọc sản phẩm của người bán
    const sellerProducts = products.filter((p) => p.seller === seller.id);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className="text-yellow-500" />
            ) : (
                <FaRegStar key={i} className="text-gray-300" />
            )
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-supply-primary to-green-600 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar và thông tin chính */}
                        <div className="relative">
                            <img
                                src={seller.avatar}
                                alt={seller.id}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <div className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full">
                                <FaStore size={16} />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold mb-2">{seller.id}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                <FaMapMarkerAlt className="text-green-200" />
                                <span className="text-green-100">{seller.address}</span>
                            </div>
                            <p className="text-green-100 mb-4 max-w-md">{seller.bio}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                                <div className="flex items-center gap-1">
                                    {renderStars(seller.rating)}
                                    <span className="ml-1">({seller.rating.toFixed(1)}/5)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaUsers className="text-green-200" />
                                    <span>{seller.followers.toLocaleString()} theo dõi</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaShoppingBag className="text-green-200" />
                                    <span>{sellerProducts.length} sản phẩm</span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleFollow}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${following
                                        ? "bg-white/20 text-white hover:bg-white/30"
                                        : "bg-white text-supply-primary hover:bg-gray-100"
                                    }`}
                            >
                                {following ? <FaHeart /> : <FaRegHeart />}
                                {following ? "Đã theo dõi" : "Theo dõi"}
                            </button>

                            <button
                                onClick={() => setChatOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-medium"
                            >
                                <FaComments />
                                Nhắn tin
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Thông tin chi tiết */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {/* Thống kê */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Thống kê gian hàng</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <FaShoppingBag className="text-blue-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{sellerProducts.length}</p>
                                        <p className="text-sm text-gray-600">Sản phẩm</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <FaUsers className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{seller.followers.toLocaleString()}</p>
                                        <p className="text-sm text-gray-600">Người theo dõi</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-yellow-100 p-3 rounded-lg">
                                        <FaStar className="text-yellow-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{seller.rating.toFixed(1)}/5</p>
                                        <p className="text-sm text-gray-600">Đánh giá</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cam kết */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Cam kết chất lượng</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <FaLeaf className="text-green-500" />
                                    <span className="text-sm text-gray-700">Sản phẩm tươi sạch</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaCertificate className="text-blue-500" />
                                    <span className="text-sm text-gray-700">Chứng nhận chất lượng</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaClock className="text-orange-500" />
                                    <span className="text-sm text-gray-700">Giao hàng đúng hẹn</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaAward className="text-purple-500" />
                                    <span className="text-sm text-gray-700">Người bán uy tín</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Giới thiệu */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Giới thiệu về gian hàng</h3>
                            <div className="prose max-w-none">
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    {seller.bio}
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    Chúng tôi cam kết mang đến những sản phẩm nông sản tươi ngon nhất từ trang trại đến bàn ăn của bạn.
                                    Với nhiều năm kinh nghiệm trong lĩnh vực nông nghiệp, chúng tôi hiểu rõ nhu cầu của khách hàng và
                                    luôn đặt chất lượng lên hàng đầu.
                                </p>
                            </div>

                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-gray-800 mb-2">📞 Liên hệ trực tiếp</h4>
                                <p className="text-sm text-gray-600">
                                    Để được tư vấn và đặt hàng nhanh chóng, vui lòng liên hệ trực tiếp với chúng tôi qua các kênh hỗ trợ.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                            <FaStore className="text-supply-primary" />
                            Sản phẩm từ {seller.id}
                        </h3>
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {sellerProducts.length} sản phẩm
                        </span>
                    </div>

                    {sellerProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📦</div>
                            <h4 className="text-xl font-semibold text-gray-700 mb-2">Chưa có sản phẩm</h4>
                            <p className="text-gray-500">Gian hàng này hiện chưa có sản phẩm nào để bán.</p>
                        </div>
                    )}
                </section>
            </main>

            {chatOpen && <ChatBox sellerName={seller.id} onClose={() => setChatOpen(false)} />}
        </div>
    );
};

export default SellerProfile;
