import React from 'react';
import OverviewStats from '../Seller/OverviewStats';

// Test component for OverviewStats
const TestOverviewStats = () => {
    const mockStats = {
        totalProducts: 25,
        totalOrders: 128,
        totalRevenue: 15600000,
        newFollowers: 12,
        viewsThisWeek: 456,
        pendingOrders: 8,
        averageRating: 4.8,
        totalFollowers: 340,
        activeProducts: 23,
        completedOrders: 120,
        outOfStockProducts: 2,
        revenueThisMonth: 8500000,
        growthRate: 12.5,
        loyalCustomers: 45,
        orderGrowth: 8.2,
        revenueGrowth: 15.7
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Test OverviewStats Component</h1>
                <OverviewStats stats={mockStats} />
            </div>
        </div>
    );
};

export default TestOverviewStats;
