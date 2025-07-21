import React, { useState, useEffect } from 'react';
import {
    FaTrophy,
    FaEye,
    FaShoppingCart,
    FaArrowUp,
    FaArrowDown,
    FaBox,
    FaDollarSign,
    FaSpinner,
    FaChartLine
} from 'react-icons/fa';
import productService from '../../services/productService';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const TopProducts = ({ limit = 5 }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTopProducts();
    }, [limit]);

    const fetchTopProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                setError("Không tìm thấy thông tin người dùng");
                return;
            }

            console.log('🏆 Fetching top products for seller:', currentUser.id);

            // For now, we'll use mock data since the API might not be ready
            // In production, this would call: await productService.getTopProductsBySeller(currentUser.id, limit);
            const result = await getTopProductsMock(limit);

            if (result.success) {
                setProducts(result.data);
                console.log('✅ Top products loaded:', result.data.length, 'products');
            } else {
                setProducts(result.data || []);
                if (result.message.includes('mẫu')) {
                    toast.info(result.message);
                } else {
                    setError(result.message);
                }
            }

        } catch (error) {
            console.error('❌ Error fetching top products:', error);
            setError('Không thể tải danh sách sản phẩm bán chạy');
        } finally {
            setLoading(false);
        }
    };

    // Mock data function - replace with real API call later
    const getTopProductsMock = async (limit) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: false,
                    data: [
                        {
                            id: "PROD001",
                            name: "Rau muống hữu cơ",
                            image: "https://via.placeholder.com/80x80?text=Rau+Muống",
                            price: 15000,
                            soldQuantity: 245,
                            views: 1250,
                            rank: 1,
                            rankChange: 0, // 0: same, 1: up, -1: down
                            category: "Rau củ",
                            status: "active",
                            revenue: 3675000
                        },
                        {
                            id: "PROD002",
                            name: "Cà chua cherry",
                            image: "https://via.placeholder.com/80x80?text=Cà+Chua",
                            price: 25000,
                            soldQuantity: 180,
                            views: 890,
                            rank: 2,
                            rankChange: 1,
                            category: "Rau củ",
                            status: "active",
                            revenue: 4500000
                        },
                        {
                            id: "PROD003",
                            name: "Thịt heo ba chỉ",
                            image: "https://via.placeholder.com/80x80?text=Thịt+Heo",
                            price: 120000,
                            soldQuantity: 85,
                            views: 650,
                            rank: 3,
                            rankChange: -1,
                            category: "Thịt",
                            status: "active",
                            revenue: 10200000
                        },
                        {
                            id: "PROD004",
                            name: "Gạo ST25",
                            image: "https://via.placeholder.com/80x80?text=Gạo+ST25",
                            price: 35000,
                            soldQuantity: 120,
                            views: 780,
                            rank: 4,
                            rankChange: 0,
                            category: "Thực phẩm khô",
                            status: "active",
                            revenue: 4200000
                        },
                        {
                            id: "PROD005",
                            name: "Xoài cát Hòa Lộc",
                            image: "https://via.placeholder.com/80x80?text=Xoài",
                            price: 60000,
                            soldQuantity: 95,
                            views: 520,
                            rank: 5,
                            rankChange: 1,
                            category: "Trái cây",
                            status: "active",
                            revenue: 5700000
                        }
                    ].slice(0, limit),
                    message: 'Sử dụng dữ liệu mẫu - API chưa sẵn sàng'
                });
            }, 500);
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatNumber = (number) => {
        if (!number) return '0';
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    const getRankBadge = (rank) => {
        const badgeConfig = {
            1: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🥇' },
            2: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '🥈' },
            3: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🥉' }
        };

        const config = badgeConfig[rank] || { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🏆' };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <span className="mr-1">{config.icon}</span>
                #{rank}
            </span>
        );
    };

    const getRankChangeIcon = (change) => {
        if (change === 1) {
            return <FaArrowUp className="w-3 h-3 text-green-500" title="Tăng hạng" />;
        } else if (change === -1) {
            return <FaArrowDown className="w-3 h-3 text-red-500" title="Giảm hạng" />;
        }
        return <div className="w-3 h-3" />; // Empty space for unchanged
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                <div className="flex items-center p-4 border-b border-gray-200">
                    <FaTrophy className="mr-2 text-gray-600" />
                    <span className="font-medium text-gray-800">Sản phẩm bán chạy</span>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-supply-primary mx-auto mb-4" />
                        <div className="text-gray-600">Đang tải sản phẩm bán chạy...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                <div className="flex items-center p-4 border-b border-gray-200">
                    <FaTrophy className="mr-2 text-gray-600" />
                    <span className="font-medium text-gray-800">Sản phẩm bán chạy</span>
                </div>
                <div className="p-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="flex items-center">
                    <FaTrophy className="mr-2 text-yellow-600" />
                    <span className="font-medium text-gray-800">Sản phẩm bán chạy</span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Top {products.length}
                    </span>
                </div>
                <button
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    onClick={() => window.location.href = '/seller/products'}
                >
                    Xem tất cả
                </button>
            </div>

            <div className="p-0">
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <FaTrophy className="text-gray-400 mb-4 mx-auto" size={48} />
                        <p className="text-gray-500">Chưa có dữ liệu sản phẩm bán chạy</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {products.map((product, index) => (
                            <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    {/* Rank */}
                                    <div className="flex items-center space-x-1">
                                        {getRankBadge(product.rank)}
                                        {getRankChangeIcon(product.rankChange)}
                                    </div>

                                    {/* Product Image */}
                                    <div className="flex-shrink-0">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                            onError={(e) => {
                                                if (!e.target.dataset.fallback) {
                                                    e.target.src = '/assets/image/no-image.png';
                                                    e.target.dataset.fallback = 'true';
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {product.category}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <div className="flex items-center text-green-600">
                                                        <FaDollarSign className="w-3 h-3 mr-1" />
                                                        <span className="text-sm font-medium">
                                                            {formatCurrency(product.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex flex-col items-end space-y-1 ml-4">
                                                <div className="flex items-center text-blue-600">
                                                    <FaShoppingCart className="w-3 h-3 mr-1" />
                                                    <span className="text-sm font-medium">
                                                        {formatNumber(product.soldQuantity)} đã bán
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <FaEye className="w-3 h-3 mr-1" />
                                                    <span className="text-xs">
                                                        {formatNumber(product.views)} lượt xem
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-green-600">
                                                    <FaChartLine className="w-3 h-3 mr-1" />
                                                    <span className="text-xs">
                                                        {formatCurrency(product.revenue)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary footer */}
            {products.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-gray-600">
                            <FaBox className="w-4 h-4 mr-2" />
                            <span>
                                Tổng đã bán: {formatNumber(products.reduce((sum, p) => sum + p.soldQuantity, 0))} sản phẩm
                            </span>
                        </div>
                        <div className="flex items-center text-green-600">
                            <FaDollarSign className="w-4 h-4 mr-2" />
                            <span className="font-medium">
                                Doanh thu: {formatCurrency(products.reduce((sum, p) => sum + p.revenue, 0))}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopProducts;
