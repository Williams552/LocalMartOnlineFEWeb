import React from "react";
import {
    FaAppleAlt,
    FaFish,
    FaCarrot,
    FaDrumstickBite,
    FaEgg,
    FaLeaf,
    FaCheese,
    FaShoppingBasket,
} from "react-icons/fa";

const categories = [
    { name: "Tất cả", icon: <FaShoppingBasket /> },
    { name: "Rau củ", icon: <FaLeaf /> },
    { name: "Trái cây", icon: <FaAppleAlt /> },
    { name: "Thịt", icon: <FaDrumstickBite /> },
    { name: "Cá & Hải sản", icon: <FaFish /> },
    { name: "Trứng", icon: <FaEgg /> },
    { name: "Củ quả", icon: <FaCarrot /> },
    { name: "Sữa & Phô mai", icon: <FaCheese /> },
];

const CategorySidebar = ({ onSelectCategory, selectedCategory }) => {
    return (
        <div className="w-full">
            <h4 className="text-md font-semibold text-gray-700 mb-4 text-center">� Danh mục sản phẩm</h4>
            <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat, idx) => (
                    <button
                        key={idx}
                        className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-full transition-all font-medium text-sm border
                            ${selectedCategory === cat.name
                                ? "bg-supply-primary text-white border-supply-primary shadow-md"
                                : "hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-supply-primary"}`}
                        onClick={() => onSelectCategory(cat.name)}
                    >
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategorySidebar;
