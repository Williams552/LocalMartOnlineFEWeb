import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/image/logo.jpg";

const ProductCard = ({
    id,
    name = "Sản phẩm mẫu",
    seller = "Người bán",
    market = "Không rõ",
    price = 0
}) => {
    return (
        <Link to={`/product/${id}`}>
            <div className="product-card border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 bg-white overflow-hidden group">
                <div className="relative">
                    <img src={logo} alt={name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Fresh
                    </div>
                </div>
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-supply-primary transition-colors">
                        {name}
                    </h2>
                    <div className="space-y-1 mb-3">
                        <p className="text-gray-600 text-sm flex items-center">
                            <span className="mr-2">👤</span>
                            <Link
                                to={`/seller/${encodeURIComponent(seller)}`}
                                className="text-supply-primary hover:underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {seller}
                            </Link>
                        </p>
                        <p className="text-gray-600 text-sm flex items-center">
                            <span className="mr-2">📍</span>
                            {market}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-supply-primary">
                            {price.toLocaleString()}đ
                        </p>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            /kg
                        </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm text-gray-600">4.8 (25)</span>
                        </div>
                        <button
                            className="text-supply-primary hover:bg-supply-primary hover:text-white transition-colors px-3 py-1 rounded-lg border border-supply-primary text-sm font-medium"
                            onClick={(e) => e.preventDefault()}
                        >
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
