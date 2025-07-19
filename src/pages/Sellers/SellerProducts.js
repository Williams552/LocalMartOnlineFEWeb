import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter,
    FaSortAmountDown, FaToggleOn, FaToggleOff, FaImage,
    FaChartLine, FaCopy, FaHeart, FaSpinner, FaChevronLeft,
    FaChevronRight, FaBox, FaTh, FaList
} from "react-icons/fa";
import SellerLayout from "../../layouts/SellerLayout";
import productService from "../../services/productService";
import storeService from "../../services/storeService";
import { getCurrentUser } from "../../services/authService";
import toastService from "../../services/toastService";

const SellerProducts = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [viewMode, setViewMode] = useState("grid"); // grid or list

    // State for API data
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [userStore, setUserStore] = useState(null);
    const [categories, setCategories] = useState(["all"]);

    const currentUser = getCurrentUser();
    const pageSize = 20;

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    // Reload products when filters change
    useEffect(() => {
        if (userStore) {
            loadProducts();
        }
    }, [searchTerm, filterCategory, sortBy, currentPage, userStore]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // First get the seller's store
            const storeResult = await storeService.getStoresBySellerId(currentUser?.id);
            if (!storeResult.success || !storeResult.data?.length) {
                toastService.error('Bạn chưa có gian hàng nào. Vui lòng tạo gian hàng trước.');
                return;
            }

            const store = storeResult.data[0]; // Get first store
            setUserStore(store);

            // Get categories for filter (this would come from category service)
            setCategories(["all", "Rau củ", "Trái cây", "Thịt cá", "Gia vị", "Đồ khô"]);

        } catch (error) {
            console.error('Error loading initial data:', error);
            toastService.error('Có lỗi khi tải dữ liệu ban đầu');
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async (page = currentPage) => {
        if (!userStore) return;

        try {
            setRefreshing(true);

            let result;

            if (searchTerm.trim()) {
                // Search products
                result = await productService.searchSellerProducts(
                    userStore.id,
                    searchTerm.trim(),
                    page,
                    pageSize
                );
            } else {
                // Get all products
                result = await productService.getSellerProducts(
                    userStore.id,
                    page,
                    pageSize
                );
            }

            if (result.success) {
                let products = result.data.items || [];

                // Apply category filter
                if (filterCategory !== "all") {
                    products = products.filter(product => product.category === filterCategory);
                }

                // Apply sorting
                products = applySorting(products, sortBy);

                setProducts(products);
                setTotalItems(result.data.totalItems || 0);
                setTotalPages(result.data.totalPages || 1);
                setCurrentPage(result.data.currentPage || page);
            } else {
                toastService.error(result.message || 'Có lỗi khi tải danh sách sản phẩm');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            toastService.error('Có lỗi khi tải danh sách sản phẩm');
        } finally {
            setRefreshing(false);
        }
    };

    const applySorting = (products, sortBy) => {
        return [...products].sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt || b.dateAdded) - new Date(a.createdAt || a.dateAdded);
                case "oldest":
                    return new Date(a.createdAt || a.dateAdded) - new Date(b.createdAt || b.dateAdded);
                case "price-high":
                    return (b.price || 0) - (a.price || 0);
                case "price-low":
                    return (a.price || 0) - (b.price || 0);
                case "best-selling":
                    return (b.soldQuantity || 0) - (a.soldQuantity || 0);
                case "most-viewed":
                    return (b.viewCount || 0) - (a.viewCount || 0);
                case "stock-high":
                    return (b.stockQuantity || 0) - (a.stockQuantity || 0);
                case "stock-low":
                    return (a.stockQuantity || 0) - (b.stockQuantity || 0);
                default:
                    return 0;
            }
        });
    };

    const handleToggleStatus = async (productId) => {
        try {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const newStatus = !product.isAvailable;
            const result = await productService.toggleProductStatus(productId, newStatus);

            if (result.success) {
                toastService.success(result.message);
                // Update local state
                setProducts(prev => prev.map(p =>
                    p.id === productId ? { ...p, isAvailable: newStatus } : p
                ));
            } else {
                toastService.error(result.message);
            }
        } catch (error) {
            console.error('Error toggling product status:', error);
            toastService.error('Có lỗi khi thay đổi trạng thái sản phẩm');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.")) {
            return;
        }

        try {
            const result = await productService.deleteProduct(productId);

            if (result.success) {
                toastService.success(result.message);
                // Remove from local state
                setProducts(prev => prev.filter(p => p.id !== productId));
                setTotalItems(prev => prev - 1);
            } else {
                toastService.error(result.message);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toastService.error('Có lỗi khi xóa sản phẩm');
        }
    };

    const handleDuplicateProduct = async (productId) => {
        try {
            const result = await productService.duplicateProduct(productId);

            if (result.success) {
                toastService.success(result.message);
                // Reload products to show the new duplicate
                loadProducts(1);
            } else {
                toastService.error(result.message);
            }
        } catch (error) {
            console.error('Error duplicating product:', error);
            toastService.error('Có lỗi khi sao chép sản phẩm');
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };

    const handleRefresh = () => {
        loadProducts(currentPage);
    };

    const getStatusBadge = (product) => {
        const isActive = product.isAvailable;
        return isActive
            ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Đang bán</span>
            : <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Tạm ngưng</span>;
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return <span className="text-red-600 font-medium">Hết hàng</span>;
        if (stock < 10) return <span className="text-orange-600 font-medium">Sắp hết ({stock}{getUnit(stock)})</span>;
        return <span className="text-green-600 font-medium">{stock}{getUnit(stock)}</span>;
    };

    const getUnit = (stock) => {
        // This should come from product data, defaulting to 'kg' for now
        return 'kg';
    };

    const formatPrice = (price) => {
        return price ? price.toLocaleString() : '0';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Show loading state
    if (loading) {
        return (
            <SellerLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-supply-primary mx-auto mb-4" />
                        <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                            <p className="text-gray-600">
                                Quản lý và cập nhật thông tin sản phẩm của bạn
                                {userStore && <span> - Gian hàng: {userStore.name}</span>}
                            </p>
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
                                disabled={refreshing}
                            />
                        </div>

                        <div className="flex flex-wrap items-center space-x-4">
                            {/* Category Filter */}
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-supply-primary"
                                disabled={refreshing}
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
                                disabled={refreshing}
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="price-high">Giá cao nhất</option>
                                <option value="price-low">Giá thấp nhất</option>
                                <option value="best-selling">Bán chạy nhất</option>
                                <option value="most-viewed">Xem nhiều nhất</option>
                                <option value="stock-high">Tồn kho nhiều</option>
                                <option value="stock-low">Tồn kho ít</option>
                            </select>

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-supply-primary disabled:opacity-50"
                                title="Làm mới danh sách"
                            >
                                <FaSearch className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>

                            {/* View Mode */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                                    disabled={refreshing}
                                >
                                    <FaTh size={12} />
                                    <span>Lưới</span>
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                                    disabled={refreshing}
                                >
                                    <FaList size={12} />
                                    <span>Danh sách</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-800">{totalItems}</span> sản phẩm
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-green-600">
                                {products.filter(p => p.isAvailable).length}
                            </span> đang bán
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-500">
                                {products.filter(p => !p.isAvailable).length}
                            </span> tạm ngưng
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-red-600">
                                {products.filter(p => (p.stockQuantity || 0) === 0).length}
                            </span> hết hàng
                        </div>
                        {refreshing && (
                            <div className="text-sm text-blue-600 flex items-center space-x-1">
                                <FaSpinner className="animate-spin w-3 h-3" />
                                <span>Đang tải...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Grid/List */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                                <div className="relative">
                                    <div className="aspect-w-1 aspect-h-1 w-full h-48 bg-gray-200 flex items-center justify-center">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className="w-full h-full flex items-center justify-center" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
                                            <FaImage className="text-gray-400 text-3xl" />
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        {getStatusBadge(product)}
                                    </div>
                                    <div className="absolute top-2 right-2 flex space-x-1">
                                        <button
                                            onClick={() => handleToggleStatus(product.id)}
                                            className="bg-white/90 p-1 rounded"
                                            disabled={refreshing}
                                        >
                                            {product.isAvailable ?
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
                                                {formatPrice(product.price)}đ/{product.unit || 'kg'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Tồn kho:</span>
                                            {getStockStatus(product.stockQuantity || 0)}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Đã bán:</span>
                                            <span className="font-medium">{product.soldQuantity || 0}</span>
                                        </div>
                                        {product.category && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Danh mục:</span>
                                                <span className="font-medium text-blue-600">{product.category}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <FaEye />
                                                <span>{product.viewCount || 0}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <FaHeart />
                                                <span>{product.likeCount || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1">
                                            <Link
                                                to={`/seller/products/edit/${product.id}`}
                                                className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit size={14} />
                                            </Link>
                                            <button
                                                onClick={() => handleDuplicateProduct(product.id)}
                                                className="text-green-600 hover:bg-green-50 p-1 rounded"
                                                disabled={refreshing}
                                                title="Sao chép"
                                            >
                                                <FaCopy size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-600 hover:bg-red-50 p-1 rounded"
                                                disabled={refreshing}
                                                title="Xóa"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {product.createdAt && (
                                        <div className="text-xs text-gray-400 mt-2">
                                            Tạo: {formatDate(product.createdAt)}
                                        </div>
                                    )}
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
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className="w-full h-full flex items-center justify-center" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
                                                            <FaImage className="text-gray-400" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{product.name}</p>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                            <span>{product.viewCount || 0} lượt xem</span>
                                                            <span>•</span>
                                                            <span>{product.likeCount || 0} lượt thích</span>
                                                            {product.createdAt && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{formatDate(product.createdAt)}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{product.category || 'Chưa phân loại'}</td>
                                            <td className="py-3 px-4 font-medium text-supply-primary">
                                                {formatPrice(product.price)}đ/{product.unit || 'kg'}
                                            </td>
                                            <td className="py-3 px-4">{getStockStatus(product.stockQuantity || 0)}</td>
                                            <td className="py-3 px-4 font-medium">{product.soldQuantity || 0}</td>
                                            <td className="py-3 px-4">{getStatusBadge(product)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        to={`/seller/products/edit/${product.id}`}
                                                        className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FaEdit size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDuplicateProduct(product.id)}
                                                        className="text-green-600 hover:bg-green-50 p-1 rounded"
                                                        disabled={refreshing}
                                                        title="Sao chép"
                                                    >
                                                        <FaCopy size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                                                        disabled={refreshing}
                                                        title="Xóa"
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

                {products.length === 0 && (
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                                Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, totalItems)}
                                trong tổng số {totalItems} sản phẩm
                            </span>
                        </div>                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className="px-3 py-1 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaChevronLeft size={14} />
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else {
                                    if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        disabled={loading}
                                        className={`px-3 py-1 rounded-lg border ${currentPage === pageNum
                                            ? 'bg-supply-primary text-white border-supply-primary'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || loading}
                                className="px-3 py-1 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && products.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <FaBox size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                            Chưa có sản phẩm nào
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || filterCategory !== 'all'
                                ? 'Không tìm thấy sản phẩm nào phù hợp với điều kiện lọc'
                                : 'Bạn chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!'
                            }
                        </p>
                        <Link
                            to="/seller/products/new"
                            className="inline-flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-supply-primary-dark"
                        >
                            <FaPlus className="mr-2" size={14} />
                            Thêm sản phẩm mới
                        </Link>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
};

export default SellerProducts;
