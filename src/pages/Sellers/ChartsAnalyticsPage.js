// Charts & Analytics Page
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SellerLayout from '../../layouts/SellerLayout';
import ChartsAnalytics from '../../components/Seller/ChartsAnalytics';
import {
    FaChartLine, FaDownload, FaShare, FaPrint,
    FaInfoCircle, FaCog, FaExpand
} from 'react-icons/fa';

const ChartsAnalyticsPage = () => {
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        console.log('📊 ChartsAnalyticsPage: Component mounted');
    }, []);

    const handleExport = () => {
        // Mock export functionality
        const data = {
            timestamp: new Date().toISOString(),
            type: 'analytics_export',
            period: '30d'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'LocalMart - Báo cáo Analytics',
                    text: 'Xem báo cáo phân tích kinh doanh chi tiết',
                    url: window.location.href
                });
            } catch (error) {
                console.log('Share cancelled or failed:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Đã sao chép link báo cáo vào clipboard!');
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <SellerLayout>
            <Helmet>
                <title>Biểu đồ & Thống kê | LocalMart Seller</title>
                <meta name="description" content="Phân tích dữ liệu kinh doanh với biểu đồ trực quan và thống kê chi tiết" />
            </Helmet>

            <div className={`min-h-screen ${fullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''}`}>
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <FaChartLine className="mr-3 text-supply-primary" />
                                Biểu đồ & Thống kê trực quan
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Phân tích dữ liệu kinh doanh với biểu đồ chi tiết và insights thông minh
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setFullscreen(!fullscreen)}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                                title={fullscreen ? "Thu nhỏ" : "Toàn màn hình"}
                            >
                                <FaExpand />
                            </button>

                            <button
                                onClick={handlePrint}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                                title="In báo cáo"
                            >
                                <FaPrint />
                            </button>

                            <button
                                onClick={handleShare}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                                title="Chia sẻ báo cáo"
                            >
                                <FaShare />
                            </button>

                            <button
                                onClick={handleExport}
                                className="flex items-center px-4 py-2 bg-supply-primary text-white rounded-lg hover:bg-green-700 transition"
                            >
                                <FaDownload className="mr-2" />
                                Xuất báo cáo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    {/* Usage Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <FaInfoCircle className="text-blue-600 text-lg mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">💡 Hướng dẫn sử dụng</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• <strong>Chọn khoảng thời gian:</strong> Sử dụng bộ lọc thời gian (7 ngày, 30 ngày, 3 tháng) để xem dữ liệu</li>
                                    <li>• <strong>Chuyển đổi biểu đồ:</strong> Click vào các tab "Doanh thu" và "Đơn hàng" để xem các loại dữ liệu khác nhau</li>
                                    <li>• <strong>Phân tích danh mục:</strong> Xem hiệu suất của từng danh mục sản phẩm và tỷ lệ tăng trưởng</li>
                                    <li>• <strong>Top sản phẩm:</strong> Theo dõi sản phẩm bán chạy nhất và các metrics quan trọng</li>
                                    <li>• <strong>Xuất báo cáo:</strong> Click "Xuất báo cáo" để tải dữ liệu dưới dạng JSON</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Main Analytics Component */}
                    <ChartsAnalytics />
                </div>

                {/* Quick Stats Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-supply-primary">📊</p>
                            <p className="text-sm text-gray-600">Biểu đồ trực quan</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">📈</p>
                            <p className="text-sm text-gray-600">Phân tích xu hướng</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">🎯</p>
                            <p className="text-sm text-gray-600">Insights thông minh</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-600">⚡</p>
                            <p className="text-sm text-gray-600">Cập nhật real-time</p>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center py-4 text-sm text-gray-500 border-t border-gray-200 bg-white">
                    <p>📊 Dữ liệu được cập nhật theo thời gian thực •
                        Last updated: {new Date().toLocaleString('vi-VN')} •
                        <span className="text-supply-primary font-medium">LocalMart Analytics</span>
                    </p>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    
                    .print-full-width {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    .print-break-inside-avoid {
                        break-inside: avoid;
                    }
                }
            `}</style>
        </SellerLayout>
    );
};

export default ChartsAnalyticsPage;
