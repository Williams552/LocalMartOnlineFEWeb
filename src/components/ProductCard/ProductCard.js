import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/image/logo.jpg";
import AddToCartButton from "../Common/AddToCartButton";
import FavoriteButton from "../Common/FavoriteButton";
import { FaHandshake } from "react-icons/fa";
import StartBargainModal from "../FastBargain/StartBargainModal";
import authService from "../../services/authService";

const ProductCard = ({
    id,
    name = "Sản phẩm mẫu",
    seller = "Người bán",
    sellerId = null,
    market = "Không rõ",
    storeId = null,
    storeName = null,
    price = 0,
    image = null,
    description = "",
    status = "Còn hàng"
}) => {
    const [showBargainModal, setShowBargainModal] = useState(false);
    const currentUser = authService.getCurrentUser();
    const isAuthenticated = !!currentUser;
    // Function to format price
    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toLocaleString('vi-VN');
        }
        return parseFloat(price || 0).toLocaleString('vi-VN');
    };

    // Function to get display image
    const getDisplayImage = () => {
        if (image && image.trim() !== '') {
            return image;
        }
        return logo; // fallback to default logo
    };

    // Function to get status color
    const getStatusColor = () => {
        if (status === "Còn hàng") return "bg-green-500";
        if (status === "Hết hàng") return "bg-red-500";
        return "bg-orange-500";
    };

    const handleBargainClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để thương lượng');
            return;
        }

        if (status === "Hết hàng") {
            alert('Không thể thương lượng cho sản phẩm đã hết hàng');
            return;
        }

        setShowBargainModal(true);
    };

    const handleBargainSuccess = (bargainData) => {
        alert('Bắt đầu thương lượng thành công! Hãy chờ phản hồi từ người bán.');
        // Could navigate to bargain detail page or refresh data
    };
    return (
        <div className="product-card border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 bg-white overflow-hidden group relative">
            <div className="relative">
                <Link to={`/product/${id}`}>
                    <img src={getDisplayImage()} alt={name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
                <div className={`absolute top-3 right-3 text-white text-xs px-2 py-1 rounded-full font-medium ${getStatusColor()}`}>
                    {status}
                </div>
                {/* Favorite Button */}
                <div className="absolute top-3 left-3">
                    <FavoriteButton
                        productId={id}
                        size="sm"
                        className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm"
                    />
                </div>
            </div>
            <div className="p-4">
                <Link to={`/product/${id}`}>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-supply-primary transition-colors">
                        {name}
                    </h2>
                </Link>
                {description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {description}
                    </p>
                )}
                <div className="mb-3">
                    <p className="text-gray-600 text-sm flex items-center">
                        <span className="mr-2">🏪</span>
                        <span className="text-blue-600 font-medium">{storeName || market || 'Gian hàng'}</span>
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-supply-primary">
                        {formatPrice(price)}đ
                    </p>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        /kg
                    </span>
                </div>
                <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {status}
                        </div>
                        <AddToCartButton
                            product={{ id, name, price, image: getDisplayImage() }}
                            quantity={0.5}
                            className="text-sm font-medium"
                            size="small"
                            showQuantityControls={false}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Bargain Button */}
                    {isAuthenticated && status === "Còn hàng" && (
                        <button
                            onClick={handleBargainClick}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <FaHandshake size={14} />
                            <span>Thương lượng</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bargain Modal */}
            <StartBargainModal
                isOpen={showBargainModal}
                onClose={() => setShowBargainModal(false)}
                product={{
                    id,
                    name,
                    price,
                    unit: 'kg', // Could be dynamic
                    imageUrl: getDisplayImage(),
                    seller: storeName || seller
                }}
                onSuccess={handleBargainSuccess}
            />
        </div>
    );
};

export default ProductCard;
