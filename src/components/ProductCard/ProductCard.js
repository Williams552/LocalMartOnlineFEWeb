import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/image/logo.jpg";
import AddToCartButton from "../Common/AddToCartButton";
import FavoriteButton from "../Common/FavoriteButton";
import FollowStoreButton from "../FollowStoreButton";
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
    status = "Còn hàng",
    statusDisplay = null, // Add statusDisplay prop
    minimumQuantity = 1,
    unitName = "kg"
}) => {
    const [showBargainModal, setShowBargainModal] = useState(false);
    const currentUser = authService.getCurrentUser();
    const isAuthenticated = !!currentUser;

    // Use statusDisplay if provided, otherwise use status
    const displayStatus = statusDisplay || status;

    // Helper function to convert backend status to display text
    const getStatusDisplayText = (statusValue) => {
        // Handle numeric status values
        if (typeof statusValue === 'number') {
            switch (statusValue) {
                case 0: return 'Còn hàng';
                case 1: return 'Hết hàng';
                default: return 'Không xác định';
            }
        }

        if (typeof statusValue === 'string') {
            // If it's already a display text, return as is
            if (['Còn hàng', 'Hết hàng', 'Đã xóa', 'Sắp hết'].includes(statusValue)) {
                return statusValue;
            }
            // Convert backend status to display text
            switch (statusValue) {
                case 'Active': return 'Còn hàng';
                case 'OutOfStock': return 'Hết hàng';
                case 'Inactive': return 'Đã xóa';
                default: return statusValue || 'Không xác định';
            }
        }
        return 'Không xác định';
    };

    const finalStatus = getStatusDisplayText(displayStatus);
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
        switch (finalStatus) {
            case "Còn hàng":
                return "bg-green-500";
            case "Hết hàng":
                return "bg-red-500";
            case "Sắp hết":
                return "bg-yellow-500";
            case "Đã xóa":
                return "bg-gray-500";
            default:
                return "bg-gray-500"; // For undefined/unknown status
        }
    };

    const handleBargainClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để thương lượng');
            return;
        }

        if (finalStatus === "Hết hàng" || finalStatus === "Đã xóa") {
            alert('Không thể thương lượng cho sản phẩm này');
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
                    {finalStatus}
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
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-sm flex items-center">
                            <span className="mr-2">🏪</span>
                            <Link
                                to={`/store/${storeId}`}
                                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                            >
                                {storeName || market || 'Gian hàng'}
                            </Link>
                        </p>
                        {/* Follow Store Button */}
                        {storeId && (
                            <FollowStoreButton
                                storeId={storeId}
                                variant="icon-only"
                                size="sm"
                                className="ml-2"
                            />
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-supply-primary">
                        {formatPrice(price)}đ
                    </p>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        /{unitName}
                    </span>
                </div>
                <div className="mt-3 space-y-2">
                    <AddToCartButton
                        product={{
                            id,
                            name,
                            price,
                            image: getDisplayImage(),
                            unit: unitName,
                            minimumQuantity: minimumQuantity
                        }}
                        quantity={minimumQuantity}
                        className="text-sm font-medium w-full"
                        size="small"
                        showQuantityControls={false}
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Bargain Button */}
                    {isAuthenticated && finalStatus === "Còn hàng" && (
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
                    unit: unitName,
                    imageUrl: getDisplayImage(),
                    seller: storeName || seller
                }}
                onSuccess={handleBargainSuccess}
            />
        </div>
    );
};

export default ProductCard;
