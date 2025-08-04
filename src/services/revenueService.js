// Revenue Service for Admin
import apiService from './apiService';

class RevenueService {
    // Get total revenue from completed orders
    async getProductRevenue(startDate = null, endDate = null) {
        try {
            // Lấy tất cả orders từ API thực tế
            let allOrders = [];
            let page = 1;
            const pageSize = 100; // Lấy nhiều records mỗi lần
            let hasMore = true;

            console.log('🛒 Starting to fetch orders from API...');

            while (hasMore) {
                const response = await apiService.get(`/api/order/admin/orders?page=${page}&pageSize=${pageSize}`);
                
                console.log(`📄 Page ${page} response:`, response);
                
                if (response && response.items && Array.isArray(response.items)) {
                    allOrders = [...allOrders, ...response.items];
                    console.log(`✅ Added ${response.items.length} orders, total: ${allOrders.length}`);
                    
                    // Kiểm tra có còn data không
                    hasMore = response.items.length === pageSize;
                    page++;
                } else {
                    console.log('⚠️ No more data or unexpected response structure');
                    hasMore = false;
                }
            }

            console.log(`📋 Total orders fetched: ${allOrders.length}`);

            // Lọc orders có status = "Completed"
            const completedOrders = allOrders.filter(order => order.status === 'Completed');
            console.log(`✅ Completed orders: ${completedOrders.length}`, completedOrders);

            // Lọc theo ngày nếu có
            let filteredOrders = completedOrders;
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                filteredOrders = completedOrders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= start && orderDate <= end;
                });
                console.log(`📅 Date filtered orders: ${filteredOrders.length} from ${startDate} to ${endDate}`);
            } else {
                console.log('📅 No date filter applied');
            }

            // Tính toán doanh thu
            const totalRevenue = filteredOrders.reduce((sum, order) => {
                const amount = order.totalAmount || 0;
                console.log(`💰 Adding order amount: ${amount} from order ${order.id}`);
                return sum + amount;
            }, 0);
            const totalOrders = filteredOrders.length;
            const averageOrderValue = totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0;

            console.log('💵 Product Revenue Summary:', {
                totalRevenue,
                totalOrders,
                averageOrderValue
            });

            // Tạo dữ liệu theo tháng
            const monthlyData = this.calculateMonthlyData(filteredOrders);
            
            // Tạo dữ liệu theo ngày (30 ngày gần nhất)
            const dailyData = this.calculateDailyData(filteredOrders);

            return {
                success: true,
                data: {
                    totalRevenue,
                    totalOrders,
                    averageOrderValue,
                    monthlyData,
                    dailyData
                }
            };
            
        } catch (error) {
            console.error('❌ Error fetching product revenue:', error);
            // Fallback to mock data if API fails
            return this.getMockProductRevenue();
        }
    }

    // Get market fee revenue
    async getMarketFeeRevenue(startDate = null, endDate = null) {
        try {
            // Lấy tất cả market fee payments từ API thực tế
            const response = await apiService.get('/api/marketfeepayment');
            
            console.log('🏪 Market Fee API Response:', response);
            
            if (response && response.payments && Array.isArray(response.payments)) {
                console.log('📋 Total payments from API:', response.payments.length);
                
                // Lọc payments có paymentStatus = "Completed"
                const completedPayments = response.payments.filter(payment => payment.paymentStatus === 'Completed');
                console.log('✅ Completed payments:', completedPayments.length, completedPayments);

                // Lọc theo ngày nếu có
                let filteredPayments = completedPayments;
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    filteredPayments = completedPayments.filter(payment => {
                        const paymentDate = new Date(payment.paymentDate || payment.createdAt);
                        return paymentDate >= start && paymentDate <= end;
                    });
                    console.log('📅 Date filtered payments:', filteredPayments.length, `from ${startDate} to ${endDate}`);
                } else {
                    console.log('📅 No date filter applied');
                }

                // Tính toán doanh thu từ phí
                const totalFeeRevenue = filteredPayments.reduce((sum, payment) => {
                    const feeAmount = payment.feeAmount || 0;
                    console.log(`💰 Adding fee amount: ${feeAmount} from payment ${payment.paymentId}`);
                    return sum + feeAmount;
                }, 0);
                
                console.log('💵 Total Fee Revenue calculated:', totalFeeRevenue);
                
                // Đếm số cửa hàng unique
                const uniqueStores = [...new Set(filteredPayments.map(payment => payment.storeId))];
                const totalStores = uniqueStores.length;
                
                const averageFeePerStore = totalStores > 0 ? Math.floor(totalFeeRevenue / totalStores) : 0;

                // Tạo dữ liệu theo tháng
                const monthlyData = this.calculateMonthlyFeeData(filteredPayments);
                
                // Tạo breakdown theo loại phí
                const feeTypeBreakdown = this.calculateFeeTypeBreakdown(filteredPayments);

                console.log('📊 Market Fee Revenue Summary:', {
                    totalFeeRevenue,
                    totalStores,
                    averageFeePerStore,
                    monthlyDataLength: monthlyData.length,
                    feeTypeBreakdownLength: feeTypeBreakdown.length
                });

                return {
                    success: true,
                    data: {
                        totalFeeRevenue,
                        totalStores,
                        averageFeePerStore,
                        monthlyData,
                        feeTypeBreakdown
                    }
                };
            } else {
                console.log('⚠️ API response structure unexpected:', response);
            }

            // Fallback to mock data
            console.log('🔄 Falling back to mock data');
            return this.getMockMarketFeeRevenue();
            
        } catch (error) {
            console.error('❌ Error fetching market fee revenue:', error);
            return this.getMockMarketFeeRevenue();
        }
    }

    // Get combined revenue analytics
    async getCombinedRevenue(startDate = null, endDate = null) {
        try {
            const [productRevenue, marketFeeRevenue] = await Promise.all([
                this.getProductRevenue(startDate, endDate),
                this.getMarketFeeRevenue(startDate, endDate)
            ]);

            const totalRevenue = (productRevenue.data.totalRevenue || 0) + (marketFeeRevenue.data.totalFeeRevenue || 0);
            
            return {
                success: true,
                data: {
                    totalRevenue,
                    productRevenue: productRevenue.data,
                    marketFeeRevenue: marketFeeRevenue.data,
                    revenueBreakdown: [
                        {
                            type: 'Doanh thu sản phẩm',
                            amount: productRevenue.data.totalRevenue || 0,
                            percentage: totalRevenue > 0 ? ((productRevenue.data.totalRevenue || 0) / totalRevenue * 100).toFixed(1) : 0,
                            color: '#52c41a'
                        },
                        {
                            type: 'Doanh thu phí chợ',
                            amount: marketFeeRevenue.data.totalFeeRevenue || 0,
                            percentage: totalRevenue > 0 ? ((marketFeeRevenue.data.totalFeeRevenue || 0) / totalRevenue * 100).toFixed(1) : 0,
                            color: '#1890ff'
                        }
                    ]
                }
            };
        } catch (error) {
            console.error('❌ Error fetching combined revenue:', error);
            return {
                success: false,
                message: 'Không thể tải dữ liệu doanh thu',
                data: null
            };
        }
    }

    // Mock data for product revenue
    getMockProductRevenue() {
        const currentDate = new Date();
        const dailyData = [];
        const monthlyData = [];

        // Generate daily data for last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            dailyData.push({
                date: date.toISOString().split('T')[0],
                revenue: Math.floor(Math.random() * 50000000) + 10000000, // 10M-60M VND
                orders: Math.floor(Math.random() * 100) + 20
            });
        }

        // Generate monthly data for last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            monthlyData.push({
                month: date.toISOString().slice(0, 7), // YYYY-MM
                revenue: Math.floor(Math.random() * 1000000000) + 500000000, // 500M-1.5B VND
                orders: Math.floor(Math.random() * 3000) + 1000
            });
        }

        const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
        const totalOrders = dailyData.reduce((sum, day) => sum + day.orders, 0);

        return {
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                averageOrderValue: totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0,
                monthlyData,
                dailyData
            }
        };
    }

    // Mock data for market fee revenue
    getMockMarketFeeRevenue() {
        const currentDate = new Date();
        const monthlyData = [];
        const feeTypeBreakdown = [
            { type: 'Phí thuê gian hàng', amount: 245000000, color: '#1890ff' },
            { type: 'Phí dịch vụ', amount: 82000000, color: '#52c41a' },
            { type: 'Phí quảng cáo', amount: 156000000, color: '#faad14' },
            { type: 'Phí khác', amount: 43000000, color: '#722ed1' }
        ];

        // Generate monthly data for last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            monthlyData.push({
                month: date.toISOString().slice(0, 7), // YYYY-MM
                feeRevenue: Math.floor(Math.random() * 200000000) + 100000000, // 100M-300M VND
                stores: Math.floor(Math.random() * 50) + 150
            });
        }

        const totalFeeRevenue = feeTypeBreakdown.reduce((sum, fee) => sum + fee.amount, 0);
        const totalStores = 245;

        return {
            success: true,
            data: {
                totalFeeRevenue,
                totalStores,
                averageFeePerStore: Math.floor(totalFeeRevenue / totalStores),
                monthlyData,
                feeTypeBreakdown
            }
        };
    }

    // Format currency for display
    formatCurrency(amount) {
        if (!amount || amount === 0) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    // Format number for display
    formatNumber(number) {
        if (!number || number === 0) return '0';
        return new Intl.NumberFormat('vi-VN').format(number);
    }

    // Helper: Calculate monthly data from orders
    calculateMonthlyData(orders) {
        const monthlyMap = {};
        
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
            
            if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = {
                    month: monthKey,
                    revenue: 0,
                    orders: 0
                };
            }
            
            monthlyMap[monthKey].revenue += order.totalAmount || 0;
            monthlyMap[monthKey].orders += 1;
        });

        return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
    }

    // Helper: Calculate daily data from orders (last 30 days)
    calculateDailyData(orders) {
        const dailyMap = {};
        const currentDate = new Date();
        
        // Initialize last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            dailyMap[dateKey] = {
                date: dateKey,
                revenue: 0,
                orders: 0
            };
        }
        
        // Add actual order data
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const dateKey = date.toISOString().split('T')[0];
            
            if (dailyMap[dateKey]) {
                dailyMap[dateKey].revenue += order.totalAmount || 0;
                dailyMap[dateKey].orders += 1;
            }
        });

        return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    }

    // Helper: Calculate monthly fee data from payments
    calculateMonthlyFeeData(payments) {
        const monthlyMap = {};
        
        payments.forEach(payment => {
            const date = new Date(payment.paymentDate || payment.createdAt);
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
            
            if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = {
                    month: monthKey,
                    feeRevenue: 0,
                    stores: new Set()
                };
            }
            
            monthlyMap[monthKey].feeRevenue += payment.feeAmount || 0;
            monthlyMap[monthKey].stores.add(payment.storeId);
        });

        return Object.values(monthlyMap).map(item => ({
            month: item.month,
            feeRevenue: item.feeRevenue,
            stores: item.stores.size
        })).sort((a, b) => a.month.localeCompare(b.month));
    }

    // Helper: Calculate fee type breakdown from payments
    calculateFeeTypeBreakdown(payments) {
        const feeTypeMap = {};
        const colors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#f5222d', '#fa8c16'];
        let colorIndex = 0;
        
        payments.forEach(payment => {
            const feeType = payment.feeTypeName || 'Khác';
            
            if (!feeTypeMap[feeType]) {
                feeTypeMap[feeType] = {
                    type: feeType,
                    amount: 0,
                    color: colors[colorIndex % colors.length]
                };
                colorIndex++;
            }
            
            feeTypeMap[feeType].amount += payment.feeAmount || 0;
        });

        return Object.values(feeTypeMap);
    }
}

const revenueService = new RevenueService();
export default revenueService;
