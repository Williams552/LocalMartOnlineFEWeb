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
        <aside className="w-full sm:w-64 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-supply-primary">Danh mục sản phẩm</h3>
            <ul className="space-y-3">
                {categories.map((cat, idx) => (
                    <li
                        key={idx}
                        className={`flex items-center space-x-3 cursor-pointer px-3 py-2 rounded-md transition-all 
                            ${selectedCategory === cat.name
                                ? "bg-supply-primary text-white"
                                : "hover:bg-gray-100 text-gray-800"}`}
                        onClick={() => onSelectCategory(cat.name)}
                    >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default CategorySidebar;
