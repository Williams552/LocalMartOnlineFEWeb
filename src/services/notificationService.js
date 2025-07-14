// Notification Service
import apiService from './apiService';

const notificationService = {
    // Get all notifications for seller
    getNotifications: async (page = 1, limit = 20) => {
        try {
            const response = await apiService.get(`/api/seller/notifications?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.warn('🔔 Notifications: Using mock data due to API error:', error.message);
            return getMockNotifications(page, limit);
        }
    },

    // Get unread notification count
    getUnreadCount: async () => {
        try {
            const response = await apiService.get('/api/seller/notifications/unread-count');
            return response;
        } catch (error) {
            console.warn('🔔 Notifications: Using mock unread count due to API error:', error.message);
            return { count: Math.floor(Math.random() * 10) + 1 };
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            const response = await apiService.patch(`/api/seller/notifications/${notificationId}/read`, {});
            return response;
        } catch (error) {
            console.warn('🔔 Notifications: Mock marking as read due to API error:', error.message);
            return { success: true, id: notificationId };
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const response = await apiService.patch('/api/seller/notifications/mark-all-read', {});
            return response;
        } catch (error) {
            console.warn('🔔 Notifications: Mock marking all as read due to API error:', error.message);
            return { success: true, count: 0 };
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            const response = await apiService.delete(`/api/seller/notifications/${notificationId}`);
            return response;
        } catch (error) {
            console.warn('🔔 Notifications: Mock delete due to API error:', error.message);
            return { success: true, id: notificationId };
        }
    },

    // Get notification settings
    getSettings: async () => {
        try {
            const response = await apiService.get('/api/seller/notification-settings');
            return response;
        } catch (error) {
            console.warn('🔔 Notifications: Using mock settings due to API error:', error.message);
            return getMockNotificationSettings();
        }
    },

    // Update notification settings
    updateSettings: async (settings) => {
        try {
            const response = await apiService.put('/api/seller/notification-settings', settings);
            return response;
        } catch (error) {
            console.warn('🔔 Notifications: Mock update settings due to API error:', error.message);
            return { success: true, settings };
        }
    },

    // Real-time notification listener (WebSocket simulation)
    startRealTimeListener: (callback) => {
        // Simulate real-time notifications
        const interval = setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every 30 seconds
                const mockNotification = generateMockNotification();
                callback(mockNotification);
            }
        }, 30000);

        return () => clearInterval(interval);
    }
};

// Mock data generators
const getMockNotifications = (page, limit) => {
    const notificationTypes = [
        {
            type: 'new_order',
            title: 'Đơn hàng mới',
            icon: '🛒',
            color: 'bg-green-100 text-green-800',
            priority: 'high'
        },
        {
            type: 'payment_update',
            title: 'Cập nhật thanh toán',
            icon: '💳',
            color: 'bg-blue-100 text-blue-800',
            priority: 'medium'
        },
        {
            type: 'system_message',
            title: 'Thông báo hệ thống',
            icon: '⚙️',
            color: 'bg-gray-100 text-gray-800',
            priority: 'low'
        },
        {
            type: 'customer_message',
            title: 'Tin nhắn khách hàng',
            icon: '💬',
            color: 'bg-purple-100 text-purple-800',
            priority: 'high'
        },
        {
            type: 'product_review',
            title: 'Đánh giá sản phẩm',
            icon: '⭐',
            color: 'bg-yellow-100 text-yellow-800',
            priority: 'medium'
        },
        {
            type: 'inventory_alert',
            title: 'Cảnh báo tồn kho',
            icon: '📦',
            color: 'bg-red-100 text-red-800',
            priority: 'high'
        }
    ];

    const notifications = [];
    const totalNotifications = 45;
    const startIndex = (page - 1) * limit;

    for (let i = 0; i < limit && (startIndex + i) < totalNotifications; i++) {
        const typeIndex = Math.floor(Math.random() * notificationTypes.length);
        const type = notificationTypes[typeIndex];
        const isRead = Math.random() > 0.4; // 60% chance of being read

        const notification = {
            id: startIndex + i + 1,
            type: type.type,
            title: type.title,
            message: generateNotificationMessage(type.type),
            icon: type.icon,
            color: type.color,
            priority: type.priority,
            isRead,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            data: generateNotificationData(type.type)
        };

        notifications.push(notification);
    }

    return {
        data: notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        pagination: {
            page,
            limit,
            total: totalNotifications,
            totalPages: Math.ceil(totalNotifications / limit),
            hasNext: page < Math.ceil(totalNotifications / limit),
            hasPrev: page > 1
        }
    };
};

const generateNotificationMessage = (type) => {
    const messages = {
        new_order: [
            'Bạn có đơn hàng mới từ khách hàng Nguyễn Văn A',
            'Đơn hàng #LM12345 đã được đặt thành công',
            'Khách hàng Trần Thị B vừa đặt 3 sản phẩm',
            'Đơn hàng trị giá 850,000 VNĐ cần được xác nhận'
        ],
        payment_update: [
            'Thanh toán đơn hàng #LM12345 đã được xác nhận',
            'Bạn đã nhận được 1,200,000 VNĐ từ đơn hàng #LM12346',
            'Thanh toán bị từ chối cho đơn hàng #LM12347',
            'Hoàn tiền 150,000 VNĐ đã được xử lý'
        ],
        system_message: [
            'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng mai',
            'Cập nhật chính sách mới về phí giao dịch',
            'Tính năng mới: Báo cáo analytics đã được thêm',
            'Thay đổi quy định về đánh giá sản phẩm'
        ],
        customer_message: [
            'Khách hàng Lê Văn C đã gửi tin nhắn cho bạn',
            'Câu hỏi mới về sản phẩm "Rau cải xanh hữu cơ"',
            'Khách hàng yêu cầu hỗ trợ về đơn hàng #LM12348',
            'Phản hồi từ khách hàng về chất lượng dịch vụ'
        ],
        product_review: [
            'Sản phẩm "Nước cam tươi" nhận được đánh giá 5 sao',
            'Đánh giá mới cho "Bánh quy bơ" - 4 sao',
            'Khách hàng để lại bình luận tích cực',
            'Cần phản hồi đánh giá 2 sao cho sản phẩm của bạn'
        ],
        inventory_alert: [
            'Sản phẩm "Mì gói Hảo Hảo" sắp hết hàng (còn 5 sản phẩm)',
            'Cảnh báo: 3 sản phẩm đã hết hàng trong kho',
            'Sản phẩm "Nước mắm Phú Quốc" cần nhập thêm hàng',
            'Kiểm tra lại số lượng tồn kho cho danh mục "Đồ uống"'
        ]
    };

    const typeMessages = messages[type] || ['Thông báo chung'];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
};

const generateNotificationData = (type) => {
    const baseData = {
        new_order: {
            orderId: `LM${Math.floor(Math.random() * 100000)}`,
            customerName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'][Math.floor(Math.random() * 4)],
            amount: Math.floor(Math.random() * 2000000) + 100000,
            itemCount: Math.floor(Math.random() * 5) + 1
        },
        payment_update: {
            orderId: `LM${Math.floor(Math.random() * 100000)}`,
            amount: Math.floor(Math.random() * 2000000) + 100000,
            status: ['completed', 'failed', 'refunded'][Math.floor(Math.random() * 3)]
        },
        system_message: {
            category: ['maintenance', 'policy', 'feature', 'announcement'][Math.floor(Math.random() * 4)],
            url: '/seller/system-updates'
        },
        customer_message: {
            customerId: Math.floor(Math.random() * 1000) + 1,
            customerName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'][Math.floor(Math.random() * 4)],
            subject: ['Hỏi về sản phẩm', 'Hỗ trợ đơn hàng', 'Phản hồi dịch vụ'][Math.floor(Math.random() * 3)]
        },
        product_review: {
            productId: Math.floor(Math.random() * 100) + 1,
            productName: ['Rau cải xanh', 'Nước cam tươi', 'Bánh quy bơ'][Math.floor(Math.random() * 3)],
            rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
            reviewId: Math.floor(Math.random() * 1000) + 1
        },
        inventory_alert: {
            productId: Math.floor(Math.random() * 100) + 1,
            productName: ['Mì gói Hảo Hảo', 'Nước mắm Phú Quốc', 'Cà phê G7'][Math.floor(Math.random() * 3)],
            currentStock: Math.floor(Math.random() * 10),
            threshold: 10
        }
    };

    return baseData[type] || {};
};

const generateMockNotification = () => {
    const types = ['new_order', 'payment_update', 'customer_message'];
    const type = types[Math.floor(Math.random() * types.length)];
    const typeConfig = {
        new_order: { icon: '🛒', color: 'bg-green-100 text-green-800', priority: 'high' },
        payment_update: { icon: '💳', color: 'bg-blue-100 text-blue-800', priority: 'medium' },
        customer_message: { icon: '💬', color: 'bg-purple-100 text-purple-800', priority: 'high' }
    };

    return {
        id: Date.now(),
        type,
        title: type === 'new_order' ? 'Đơn hàng mới' :
            type === 'payment_update' ? 'Cập nhật thanh toán' : 'Tin nhắn mới',
        message: generateNotificationMessage(type),
        icon: typeConfig[type].icon,
        color: typeConfig[type].color,
        priority: typeConfig[type].priority,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: generateNotificationData(type)
    };
};

const getMockNotificationSettings = () => {
    return {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        preferences: {
            newOrders: true,
            paymentUpdates: true,
            systemMessages: true,
            customerMessages: true,
            productReviews: true,
            inventoryAlerts: true
        },
        quietHours: {
            enabled: true,
            startTime: '22:00',
            endTime: '08:00'
        },
        frequency: 'immediate' // immediate, hourly, daily
    };
};

export default notificationService;
