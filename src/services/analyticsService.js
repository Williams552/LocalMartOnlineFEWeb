// Analytics Service
import apiService from './apiService';

const analyticsService = {
    // Get revenue analytics by period
    getRevenueAnalytics: async (period = '30d') => {
        try {
            const response = await apiService.get(`/api/seller/analytics/revenue?period=${period}`);
            return response;
        } catch (error) {
            console.warn('📊 Analytics: Using mock revenue data due to API error:', error.message);
            return getMockRevenueData(period);
        }
    },

    // Get order analytics by period
    getOrderAnalytics: async (period = '30d') => {
        try {
            const response = await apiService.get(`/api/seller/analytics/orders?period=${period}`);
            return response;
        } catch (error) {
            console.warn('📊 Analytics: Using mock order data due to API error:', error.message);
            return getMockOrderData(period);
        }
    },

    // Get category performance analytics
    getCategoryAnalytics: async (period = '30d') => {
        try {
            const response = await apiService.get(`/api/seller/analytics/categories?period=${period}`);
            return response;
        } catch (error) {
            console.warn('📊 Analytics: Using mock category data due to API error:', error.message);
            return getMockCategoryData(period);
        }
    },

    // Get product performance analytics
    getProductPerformance: async (period = '30d') => {
        try {
            const response = await apiService.get(`/api/seller/analytics/products?period=${period}`);
            return response;
        } catch (error) {
            console.warn('📊 Analytics: Using mock product data due to API error:', error.message);
            return getMockProductData(period);
        }
    },

    // Get comprehensive dashboard analytics
    getDashboardAnalytics: async (period = '30d') => {
        try {
            const [revenue, orders, categories, products] = await Promise.all([
                analyticsService.getRevenueAnalytics(period),
                analyticsService.getOrderAnalytics(period),
                analyticsService.getCategoryAnalytics(period),
                analyticsService.getProductPerformance(period)
            ]);

            return {
                revenue,
                orders,
                categories,
                products,
                period
            };
        } catch (error) {
            console.error('📊 Analytics: Error fetching dashboard analytics:', error);
            throw error;
        }
    }
};

// Mock data generators
const getMockRevenueData = (period) => {
    const periods = {
        '7d': 7,
        '30d': 30,
        '90d': 90
    };

    const days = periods[period] || 30;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Generate realistic revenue data with some variance
        const baseRevenue = 1000000 + Math.random() * 2000000; // 1-3M VND
        const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1;
        const revenue = Math.floor(baseRevenue * weekendMultiplier);

        data.push({
            date: date.toISOString().split('T')[0],
            revenue,
            orders: Math.floor(revenue / 150000), // Average order value 150k
            customers: Math.floor(revenue / 200000) // Some customers place multiple orders
        });
    }

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const averageOrderValue = totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0;

    return {
        data,
        summary: {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            growthRate: 12.5 + Math.random() * 10, // 12.5-22.5%
            period
        }
    };
};

const getMockOrderData = (period) => {
    const periods = {
        '7d': 7,
        '30d': 30,
        '90d': 90
    };

    const days = periods[period] || 30;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const baseOrders = 15 + Math.random() * 25; // 15-40 orders per day
        const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 0.6 : 1;
        const totalOrders = Math.floor(baseOrders * weekendMultiplier);

        data.push({
            date: date.toISOString().split('T')[0],
            totalOrders,
            completedOrders: Math.floor(totalOrders * 0.85),
            cancelledOrders: Math.floor(totalOrders * 0.05),
            pendingOrders: Math.floor(totalOrders * 0.1)
        });
    }

    const totalOrders = data.reduce((sum, item) => sum + item.totalOrders, 0);
    const completedOrders = data.reduce((sum, item) => sum + item.completedOrders, 0);
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders * 100) : 0;

    return {
        data,
        summary: {
            totalOrders,
            completedOrders,
            completionRate,
            averageOrdersPerDay: Math.floor(totalOrders / days),
            period
        }
    };
};

const getMockCategoryData = (period) => {
    const categories = [
        { name: 'Thực phẩm tươi sống', color: '#10B981', icon: '🥬' },
        { name: 'Đồ uống', color: '#3B82F6', icon: '🥤' },
        { name: 'Snack & Bánh kẹo', color: '#F59E0B', icon: '🍪' },
        { name: 'Gia vị & Đồ khô', color: '#EF4444', icon: '🧂' },
        { name: 'Sản phẩm gia đình', color: '#8B5CF6', icon: '🧴' },
        { name: 'Khác', color: '#6B7280', icon: '📦' }
    ];

    return {
        data: categories.map(category => ({
            ...category,
            revenue: Math.floor(500000 + Math.random() * 2000000), // 500k-2.5M VND
            orders: Math.floor(20 + Math.random() * 80), // 20-100 orders
            products: Math.floor(5 + Math.random() * 25), // 5-30 products
            growthRate: -10 + Math.random() * 30 // -10% to +20%
        })).sort((a, b) => b.revenue - a.revenue),
        period
    };
};

const getMockProductData = (period) => {
    const products = [
        'Rau cải xanh hữu cơ',
        'Nước cam tươi',
        'Bánh quy bơ',
        'Mì gói Hảo Hảo',
        'Nước mắm Phú Quốc',
        'Sữa tắm Dove',
        'Cà phê G7',
        'Thịt heo ba chỉ',
        'Cơm gạo ST25',
        'Bia Heineken'
    ];

    return {
        data: products.map((name, index) => ({
            id: index + 1,
            name,
            revenue: Math.floor(200000 + Math.random() * 1000000), // 200k-1.2M VND
            orders: Math.floor(10 + Math.random() * 50), // 10-60 orders
            views: Math.floor(100 + Math.random() * 500), // 100-600 views
            conversionRate: 5 + Math.random() * 15, // 5-20%
            stock: Math.floor(10 + Math.random() * 100), // 10-110 items
            rating: 3.5 + Math.random() * 1.5, // 3.5-5.0 stars
            reviews: Math.floor(5 + Math.random() * 25) // 5-30 reviews
        })).sort((a, b) => b.revenue - a.revenue),
        period
    };
};

export default analyticsService;
