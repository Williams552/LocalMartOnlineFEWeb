import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/image/logo.jpg";

const ProductCard = ({ id, name = "Sản phẩm mẫu" }) => {
    const product = {
        name: name,
        seller: "Nguyễn Văn B",
        market: "Chợ An Hòa",
        price: 12000,
    };

    return (
        <Link to={`/product/${id}`}>
            <div className="product-card border rounded-xl shadow hover:shadow-lg transition bg-white overflow-hidden">
                <img src={logo} alt={product.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-supply-primary mb-1">{product.name}</h2>
                    <p className="text-gray-700 text-sm mb-1">
                        Người bán: <Link to={`/seller/1`} className="text-blue-600 hover:underline">{product.seller}</Link>
                    </p>
                    <p className="text-sm text-gray-700">Vị trí: {product.market}</p>
                    <p className="text-base font-bold text-green-600 mt-2">
                        {product.price.toLocaleString()}đ / kg
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
