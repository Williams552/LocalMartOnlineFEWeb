import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter,
    FaSortAmountDown, FaToggleOn, FaToggleOff, FaImage,
    FaChartLine, FaCopy, FaHeart
} from "react-icons/fa";
import products from "../../data/products";
import SellerLayout from "../../layouts/SellerLayout";

const SellerProducts = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [viewMode, setViewMode] = useState("grid"); // grid or list

    // Mock data - sản phẩm của seller hiện tại
    const sellerProducts = products.map(product => ({
        ...product,
        status: Math.random() > 0.2 ? "active" : "inactive",
        stock: Math.floor(Math.random() * 100) + 5,
        sold: Math.floor(Math.random() * 50) + 1,
        views: Math.floor(Math.random() * 200) + 20,
        likes: Math.floor(Math.random() * 30) + 5,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    }));

    const categories = ["all", "Rau củ", "Trái cây", "Thịt cá", "Gia vị"];

    const filteredProducts = sellerProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "newest": return new Date(b.createdAt) - new Date(a.createdAt);
            case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
            case "price-high": return b.price - a.price;
            case "price-low": return a.price - b.price;
            case "best-selling": return b.sold - a.sold;
            case "most-viewed": return b.views - a.views;
            default: return 0;
        }
    });

    const handleToggleStatus = (productId) => {
        // Toggle product status logic
        console.log("Toggle status for product:", productId);
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            console.log("Delete product:", productId);
        }
    };

    const handleDuplicateProduct = (productId) => {
        console.log("Duplicate product:", productId);
    };

    const getStatusBadge = (status) => {
        return status === "active"
            ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Đang bán</span>
            : <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Tạm ngưng</span>;
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return <span className="text-red-600 font-medium">Hết hàng</span>;
        if (stock < 10) return <span className="text-orange-600 font-medium">Sắp hết ({stock}kg)</span>;
        return <span className="text-green-600 font-medium">{stock}kg</span>;
    };

    return (
        <SellerLayout>
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                            <p className="text-gray-600">Quản lý và cập nhật thông tin sản phẩm của bạn</p>
                        </div>
                        <Link
                            to="/seller/products/add"
                            className="flex items-center space-x-2 bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                        >
                            <FaPlus />
                            <span>Thêm sản phẩm</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Filters & Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-supply-primary"
                            />
                        </div>

                        <div className="flex flex-wrap items-center space-x-4">
                            {/* Category Filter */}
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-supply-primary"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === "all" ? "Tất cả danh mục" : category}
                                    </option>
                                ))}
                            </select>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-supply-primary"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="price-high">Giá cao nhất</option>
                                <option value="price-low">Giá thấp nhất</option>
                                <option value="best-selling">Bán chạy nhất</option>
                                <option value="most-viewed">Xem nhiều nhất</option>
                            </select>

                            {/* View Mode */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`px-3 py-1 rounded text-sm ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                                >
                                    Lưới
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`px-3 py-1 rounded text-sm ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                                >
                                    Danh sách
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-800">{sortedProducts.length}</span> sản phẩm
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-green-600">
                                {sortedProducts.filter(p => p.status === "active").length}
                            </span> đang bán
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-500">
                                {sortedProducts.filter(p => p.status === "inactive").length}
                            </span> tạm ngưng
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-red-600">
                                {sortedProducts.filter(p => p.stock === 0).length}
                            </span> hết hàng
                        </div>
                    </div>
                </div>

                {/* Products Grid/List */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                                <div className="relative">
                                    <div className="aspect-w-1 aspect-h-1 w-full h-48 bg-gray-200 flex items-center justify-center">
                                        <FaImage className="text-gray-400 text-3xl" />
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        {getStatusBadge(product.status)}
                                    </div>
                                    <div className="absolute top-2 right-2 flex space-x-1">
                                        <button
                                            onClick={() => handleToggleStatus(product.id)}
                                            className="bg-white/90 p-1 rounded"
                                        >
                                            {product.status === "active" ?
                                                <FaToggleOn className="text-green-600" /> :
                                                <FaToggleOff className="text-gray-400" />
                                            }
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Giá:</span>
                                            <span className="font-bold text-supply-primary">
                                                {product.price.toLocaleString()}đ/kg
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Tồn kho:</span>
                                            {getStockStatus(product.stock)}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Đã bán:</span>
                                            <span className="font-medium">{product.sold}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <FaEye />
                                                <span>{product.views}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <FaHeart />
                                                <span>{product.likes}</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1">
                                            <Link
                                                to={`/seller/products/edit/${product.id}`}
                                                className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                            >
                                                <FaEdit size={14} />
                                            </Link>
                                            <button
                                                onClick={() => handleDuplicateProduct(product.id)}
                                                className="text-green-600 hover:bg-green-50 p-1 rounded"
                                            >
                                                <FaCopy size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-600 hover:bg-red-50 p-1 rounded"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Sản phẩm</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Danh mục</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Giá</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Tồn kho</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Đã bán</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Trạng thái</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedProducts.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <FaImage className="text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{product.name}</p>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                            <span>{product.views} lượt xem</span>
                                                            <span>•</span>
                                                            <span>{product.likes} lượt thích</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{product.category}</td>
                                            <td className="py-3 px-4 font-medium text-supply-primary">
                                                {product.price.toLocaleString()}đ/kg
                                            </td>
                                            <td className="py-3 px-4">{getStockStatus(product.stock)}</td>
                                            <td className="py-3 px-4 font-medium">{product.sold}</td>
                                            <td className="py-3 px-4">{getStatusBadge(product.status)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        to={`/seller/products/edit/${product.id}`}
                                                        className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                                    >
                                                        <FaEdit size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDuplicateProduct(product.id)}
                                                        className="text-green-600 hover:bg-green-50 p-1 rounded"
                                                    >
                                                        <FaCopy size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {sortedProducts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                        <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
                        <Link
                            to="/seller/products/add"
                            className="inline-flex items-center space-x-2 bg-supply-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                        >
                            <FaPlus />
                            <span>Thêm sản phẩm đầu tiên</span>
                        </Link>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
};

export default SellerProducts;
