// Chat Service for messaging functionality
import apiService from './apiService';

const chatService = {
    // Send message
    sendMessage: async (senderId, receiverId, message) => {
        try {
            const response = await apiService.post('/api/chat/send', {
                senderId,
                receiverId,
                message
            });
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Get chat history
    getChatHistory: async (userId) => {
        try {
            const response = await apiService.get(`/api/chat/history/${userId}`);
            return response;
        } catch (error) {
            console.warn('🔄 Chat: Using mock chat history due to API error:', error.message);
            return getMockChatHistory(userId);
        }
    },

    // Get messages between two users
    getChatMessages: async (userId, otherUserId, page = 1, pageSize = 50) => {
        try {
            const response = await apiService.get(
                `/api/chat/messages/${userId}/${otherUserId}?page=${page}&pageSize=${pageSize}`
            );
            return response;
        } catch (error) {
            console.warn('🔄 Chat: Using mock messages due to API error:', error.message);
            return getMockMessages(userId, otherUserId);
        }
    }
};

// Mock data for testing
const getMockChatHistory = (userId) => {
    return {
        success: true,
        data: [
            {
                userId: 'seller1',
                userName: 'Cửa hàng Trái cây tươi',
                userAvatar: '/api/placeholder/40/40',
                lastMessage: 'Xin chào! Bạn cần hỗ trợ gì không?',
                lastMessageTime: new Date(Date.now() - 30 * 60000).toISOString(),
                unreadCount: 2,
                isOnline: true
            },
            {
                userId: 'seller2',
                userName: 'Shop Điện tử ABC',
                userAvatar: '/api/placeholder/40/40',
                lastMessage: 'Sản phẩm đã được giao thành công',
                lastMessageTime: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
                unreadCount: 0,
                isOnline: false
            },
            {
                userId: 'seller3',
                userName: 'Thời trang XYZ',
                userAvatar: '/api/placeholder/40/40',
                lastMessage: 'Cảm ơn bạn đã mua hàng!',
                lastMessageTime: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
                unreadCount: 1,
                isOnline: true
            }
        ]
    };
};

const getMockMessages = (userId, otherUserId) => {
    return {
        success: true,
        data: [
            {
                id: '1',
                senderId: userId,
                receiverId: otherUserId,
                message: 'Xin chào, tôi muốn hỏi về sản phẩm này',
                timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
                isRead: true
            },
            {
                id: '2',
                senderId: otherUserId,
                receiverId: userId,
                message: 'Chào bạn! Bạn muốn hỏi gì về sản phẩm ạ?',
                timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
                isRead: true
            },
            {
                id: '3',
                senderId: userId,
                receiverId: otherUserId,
                message: 'Sản phẩm này còn hàng không ạ?',
                timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
                isRead: true
            },
            {
                id: '4',
                senderId: otherUserId,
                receiverId: userId,
                message: 'Dạ còn hàng ạ. Bạn cần bao nhiều sản phẩm?',
                timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
                isRead: false
            }
        ]
    };
};

export default chatService;
