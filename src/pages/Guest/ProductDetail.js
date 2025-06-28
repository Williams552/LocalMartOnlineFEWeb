import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { FiMinus, FiPlus, FiTruck, FiShield, FiClock } from "react-icons/fi";
import logo from "../../assets/image/logo.jpg";
import products from "../../data/products";

const ProductDetail = () => {
    const { id } = useParams();
    const product = products.find((p) => p.id === parseInt(id));

    const [quantity, setQuantity] = useState(1);
    const [isFavorited, setIsFavorited] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    if (!product) {
        return (
            <div className="text-center mt-20 mb-20">
                <h2 className="text-2xl font-bold text-gray-600 mb-4">Sản phẩm không tồn tại</h2>
                <Link to="/" className="bg-supply-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">
                    Trở về trang chủ
                </Link>
            </div>
        );
    }

    const productDetails = {
        ...product,
        images: [logo, logo, logo],
        description: "Rau muống tươi ngon, được trồng theo phương pháp hữu cơ...",
        origin: "Cần Thơ",
        harvest: "Hôm nay",
        storage: "Bảo quản trong tủ lạnh 2-3 ngày",
        nutritions: ["Vitamin A", "Vitamin C", "Sắt", "Canxi", "Chất xơ"],
        rating: 4.8,
        reviews: 24,
        sold: 156
    };

    const comments = [
        { user: "Chị Lan Anh", content: "Rau rất tươi, giao nhanh, giá tốt!", rating: 5 },
        { user: "Anh Minh", content: "Chất lượng tốt, đóng gói cẩn thận.", rating: 5 },
        { user: "Chị Hoa", content: "Rau sạch, tươi ngon. Cảm ơn shop!", rating: 4 }
    ];

    const handleAddToCart = () => {
        alert(`Đã thêm ${quantity}kg ${product.name} vào giỏ hàng!`);
    };

    const updateQuantity = (newQuantity) => {
        if (newQuantity >= 0.5) setQuantity(newQuantity);
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

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-gray-600">
                <Link to="/" className="hover:text-supply-primary">Trang chủ</Link>
                <span className="mx-2">/</span>
                <Link to="/products" className="hover:text-supply-primary">Sản phẩm</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-800">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                {/* Product Images */}
                <div>
                    <img src={productDetails.images[selectedImage]} alt={product.name} className="w-full h-96 object-cover rounded-xl shadow-lg mb-4" />
                    <div className="flex space-x-2">
                        {productDetails.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-supply-primary' : 'border-gray-200'}`}
                            >
                                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                    {renderStars(productDetails.rating)}
                                    <span className="ml-1">({productDetails.reviews} đánh giá)</span>
                                </div>
                                <span>•</span>
                                <span>Đã bán {productDetails.sold}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsFavorited(!isFavorited)} className="text-red-500 hover:text-red-600 transition">
                            {isFavorited ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
                        </button>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-red-600">{product.price.toLocaleString()}đ</span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">/kg</span>
                        </div>
                        <p className="text-red-600 text-sm mt-1">🔥 Giá tốt hôm nay</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-600">Xuất xứ:</span><span className="ml-2 font-medium">{productDetails.origin}</span></div>
                            <div><span className="text-gray-600">Thu hoạch:</span><span className="ml-2 font-medium text-green-600">{productDetails.harvest}</span></div>
                            <div><span className="text-gray-600">Bảo quản:</span><span className="ml-2 font-medium">{productDetails.storage}</span></div>
                            <div><span className="text-gray-600">Phân loại:</span><span className="ml-2 font-medium">{product.category}</span></div>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="border rounded-lg p-4 mb-6">
                        <h3 className="font-medium mb-3">Chọn số lượng</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center border rounded-lg">
                                <button onClick={() => updateQuantity(quantity - 0.5)} className="p-2 hover:bg-gray-50" disabled={quantity <= 0.5}><FiMinus /></button>
                                <span className="px-4 py-2 border-x">{quantity} kg</span>
                                <button onClick={() => updateQuantity(quantity + 0.5)} className="p-2 hover:bg-gray-50"><FiPlus /></button>
                            </div>
                            <span className="text-gray-600">Còn lại: 50kg</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 mb-6">
                        <button onClick={handleAddToCart} className="flex-1 bg-supply-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center space-x-2">
                            <FaShoppingCart />
                            <span>Thêm vào giỏ</span>
                        </button>
                        <button className="bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600">Mua ngay</button>
                    </div>

                    {/* Guarantees */}
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div className="flex flex-col items-center"><FiTruck className="w-6 h-6 text-blue-500" /><span>Giao hàng nhanh</span></div>
                        <div className="flex flex-col items-center"><FiShield className="w-6 h-6 text-green-500" /><span>Hàng tươi sạch</span></div>
                        <div className="flex flex-col items-center"><FiClock className="w-6 h-6 text-orange-500" /><span>Hỗ trợ 24/7</span></div>
                    </div>
                </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin người bán</h2>
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {product.seller.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <Link
                            to={`/seller/${encodeURIComponent(product.seller)}`}
                            className="text-xl font-bold text-supply-primary hover:text-green-600 transition-colors"
                        >
                            {product.seller}
                        </Link>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <span>📍</span>
                            <span>{product.market}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                            {renderStars(4.8)}
                            <span className="text-sm text-gray-600 ml-1">(4.8/5)</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">
                            <div>25 sản phẩm</div>
                            <div>340 người theo dõi</div>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <Link
                        to={`/seller/${encodeURIComponent(product.seller)}`}
                        className="flex-1 bg-supply-primary text-white py-2 px-4 rounded-lg hover:bg-green-600 transition text-center font-medium"
                    >
                        Xem gian hàng
                    </Link>
                    <button className="flex-1 border border-supply-primary text-supply-primary py-2 px-4 rounded-lg hover:bg-green-50 transition font-medium">
                        Liên hệ người bán
                    </button>
                </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Mô tả sản phẩm</h2>
                <p className="text-gray-600 leading-relaxed mb-4">{productDetails.description}</p>

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
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Đánh giá sản phẩm</h2>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                            {renderStars(productDetails.rating)}
                        </div>
                        <span className="text-gray-600">({productDetails.reviews} đánh giá)</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {comments.map((comment, idx) => (
                        <div key={idx} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                                    {comment.user.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-gray-800">{comment.user}</span>
                                        <div className="flex items-center space-x-1">
                                            {renderStars(comment.rating)}
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium text-gray-800 mb-3">Viết đánh giá của bạn</h3>
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm text-gray-600">Đánh giá:</span>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} className="text-gray-300 hover:text-yellow-500 transition">
                                    <FaStar />
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary resize-none"
                    />
                    <button className="mt-3 bg-supply-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition">
                        Gửi đánh giá
                    </button>
                </div>
            </div>

            {/* Related Products */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Sản phẩm tương tự</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.slice(0, 4).map((relatedProduct) => (
                        <Link
                            key={relatedProduct.id}
                            to={`/product/${relatedProduct.id}`}
                            className="group"
                        >
                            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                                <img
                                    src={logo}
                                    alt={relatedProduct.name}
                                    className="w-full h-32 object-cover"
                                />
                                <div className="p-3">
                                    <h3 className="font-medium text-sm text-gray-800 group-hover:text-supply-primary transition">
                                        {relatedProduct.name}
                                    </h3>
                                    <p className="text-supply-primary font-bold text-sm mt-1">
                                        {relatedProduct.price.toLocaleString()}đ/kg
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Comments - Simplified */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Ý kiến khách hàng</h2>
                <div className="space-y-4">
                    {comments.map((comment, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold">
                                {comment.user.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-800">{comment.user}</span>
                                    <div className="flex items-center space-x-1">
                                        {renderStars(comment.rating)}
                                    </div>
                                </div>
                                <p className="text-gray-600">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium text-gray-800 mb-3">Để lại ý kiến của bạn</h3>
                    <textarea
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-supply-primary resize-none"
                    />
                    <button className="mt-3 bg-supply-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition">
                        Gửi ý kiến
                    </button>
                </div>
            </div>
        </main>
    );
};

export default ProductDetail;