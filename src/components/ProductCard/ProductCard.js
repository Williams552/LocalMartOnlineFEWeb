// src/components/ProductCard/ProductCard.js

import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/image/logo.jpg";

const ProductCard = ({ id, name = "Sản phẩm mẫu", seller = "Người bán", market = "Không rõ", price = 0 }) => {
    return (
        <Link to={`/product/${id}`}>
            <div className="product-card border rounded-xl shadow hover:shadow-lg transition bg-white overflow-hidden">
                <img src={logo} alt={name} className="w-full h-48 object-cover" />
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-supply-primary mb-1">{name}</h2>
                    <p className="text-gray-700 text-sm mb-1">
                        Người bán: <Link to={`/seller/${seller}`} className="text-blue-600 hover:underline">{seller}</Link>
                    </p>
                    <p className="text-sm text-gray-700">Vị trí: {market}</p>
                    <p className="text-base font-bold text-green-600 mt-2">
                        {price.toLocaleString()}đ / kg
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;