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
    FaSeedling,
    FaBreadSlice,
    FaCoffee,
    FaTshirt,
    FaHome,
    FaSpa,
} from "react-icons/fa";

// Icon mapping for categories
const categoryIcons = {
    "Tất cả": <FaShoppingBasket />,
    "Rau củ quả": <FaLeaf />,
    "Trái cây": <FaAppleAlt />,
    "Thịt tươi sống": <FaDrumstickBite />,
    "Thịt tươi": <FaDrumstickBite />,
    "Cá & Hải sản": <FaFish />,
    "Trứng": <FaEgg />,
    "Củ quả": <FaCarrot />,
    "Sữa & Phô mai": <FaCheese />,
    "Gạo và ngũ cốc": <FaSeedling />,
    "Gia vị": <FaLeaf />,
    "Đồ khô": <FaBreadSlice />,
    "Thực phẩm chế biến": <FaBreadSlice />,
    "Thực phẩm chay": <FaLeaf />,
    "Bánh tươi": <FaBreadSlice />,
    "Đồ uống": <FaCoffee />,
    "Quần áo": <FaTshirt />,
    "Giày dép": <FaTshirt />,
    "Đồ gia dụng": <FaHome />,
    "Hàng nhựa": <FaHome />,
    "Hoa tươi": <FaSpa />,
    "Đồ thờ cúng": <FaSpa />,
    "Thuốc nam": <FaLeaf />,
    "Đồ chơi trẻ em": <FaHome />,
    "Văn phòng phẩm": <FaHome />
};

// Fallback categories if API fails
const fallbackCategories = [
    { name: "Tất cả", icon: <FaShoppingBasket /> },
    { name: "Rau củ", icon: <FaLeaf /> },
    { name: "Trái cây", icon: <FaAppleAlt /> },
    { name: "Thịt", icon: <FaDrumstickBite /> },
    { name: "Cá & Hải sản", icon: <FaFish /> },
    { name: "Trứng", icon: <FaEgg /> },
    { name: "Củ quả", icon: <FaCarrot /> },
    { name: "Sữa & Phô mai", icon: <FaCheese /> },
];

const CategorySidebar = ({ onSelectCategory, selectedCategory, categories = [] }) => {
    // Create categories array with icons
    const categoriesToShow = () => {
        if (!categories || categories.length === 0) {
            return fallbackCategories;
        }

        const categoryList = [{ name: "Tất cả", icon: <FaShoppingBasket /> }];

        categories.forEach(cat => {
            const categoryName = cat.name || cat.categoryName || cat;
            const icon = categoryIcons[categoryName] || <FaShoppingBasket />;
            categoryList.push({ name: categoryName, icon, id: cat.id });
        });

        return categoryList;
    };

    const displayCategories = categoriesToShow();
    return (
        <div className="w-full">
            <h4 className="text-md font-semibold text-gray-700 mb-4 text-center">� Danh mục sản phẩm</h4>
            <div className="flex flex-wrap justify-center gap-2">
                {displayCategories.map((cat, idx) => (
                    <button
                        key={cat.id || idx}
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
