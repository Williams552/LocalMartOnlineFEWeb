import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaPaperPlane,
    FaArrowLeft,
    FaEllipsisV,
    FaPhone,
    FaVideo,
    FaImage,
    FaSmile
} from 'react-icons/fa';
import chatService from '../../services/chatService';
import chatSignalRService from '../../services/chatSignalRService';
import authService from '../../services/authService';
import BuyerLayout from '../../layouts/BuyerLayout';

const ChatPage = () => {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sellerInfo, setSellerInfo] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Mock seller info - in real app, fetch from API
    const getSellerInfo = (sellerId) => {
        const sellers = {
            'seller1': {
                id: 'seller1',
                name: 'Cửa hàng Trái cây tươi',
                avatar: '/api/placeholder/40/40',
                isOnline: true,
                lastSeen: null
            },
            'seller2': {
                id: 'seller2',
                name: 'Shop Điện tử ABC',
                avatar: '/api/placeholder/40/40',
                isOnline: false,
                lastSeen: new Date(Date.now() - 30 * 60000)
            },
            'seller3': {
                id: 'seller3',
                name: 'Thời trang XYZ',
                avatar: '/api/placeholder/40/40',
                isOnline: true,
                lastSeen: null
            }
        };
        return sellers[sellerId] || {
            id: sellerId,
            name: 'Người bán',
            avatar: '/api/placeholder/40/40',
            isOnline: false,
            lastSeen: new Date()
        };
    };

    useEffect(() => {
        // Check authentication
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);

        if (!sellerId) {
            navigate('/buyer/chat');
            return;
        }

        initializeChat();
        setSellerInfo(getSellerInfo(sellerId));

        // Initialize SignalR connection
        initializeSignalR(currentUser.id);

        // Cleanup on unmount
        return () => {
            cleanupSignalR();
        };
    }, [sellerId, navigate]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeChat = async () => {
        try {
            setLoading(true);
            // Load chat messages
            await loadMessages();
        } catch (error) {
            console.error('Error initializing chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (currentUser?.id) {
                const response = await chatService.getChatMessages(currentUser.id, sellerId);
                if (response.success) {
                    setMessages(response.data || []);
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending || !user?.id) return;

        const messageText = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            // Add message optimistically to UI
            const optimisticMessage = {
                id: Date.now().toString(),
                senderId: user.id,
                receiverId: sellerId,
                message: messageText,
                timestamp: new Date().toISOString(),
                isRead: false
            };
            setMessages(prev => [...prev, optimisticMessage]);

            // Send to API
            await chatService.sendMessage(user.id, sellerId, messageText);

            // Also send via SignalR for real-time delivery
            try {
                await chatSignalRService.sendMessage(user.id, sellerId, messageText);
            } catch (signalRError) {
                console.warn('SignalR send failed, message sent via API only:', signalRError);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.slice(0, -1));
            // Restore message on error
            setNewMessage(messageText);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString('vi-VN');
    };

    const renderMessage = (message) => {
        const isOwn = message.senderId === user?.id;

        return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div className={`px-4 py-2 rounded-2xl ${isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                        }`}>
                        <p className="text-sm">{message.message}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                    </p>
                </div>
                {!isOwn && (
                    <div className="order-0 mr-3">
                        <img
                            src={sellerInfo?.avatar || '/api/placeholder/32/32'}
                            alt={sellerInfo?.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    </div>
                )}
            </div>
        );
    };

    const initializeSignalR = async (userId) => {
        try {
            // Initialize SignalR connection
            await chatSignalRService.initialize(userId);

            // Set up message listeners
            chatSignalRService.addEventListener('messageReceived', handleMessageReceived);
            chatSignalRService.addEventListener('messageSent', handleMessageSent);
            chatSignalRService.addEventListener('userOnline', handleUserOnline);
            chatSignalRService.addEventListener('userOffline', handleUserOffline);

        } catch (error) {
            console.error('Error initializing SignalR:', error);
        }
    };

    const cleanupSignalR = () => {
        chatSignalRService.removeEventListener('messageReceived', handleMessageReceived);
        chatSignalRService.removeEventListener('messageSent', handleMessageSent);
        chatSignalRService.removeEventListener('userOnline', handleUserOnline);
        chatSignalRService.removeEventListener('userOffline', handleUserOffline);
    };

    // SignalR event handlers
    const handleMessageReceived = (message) => {
        // Only add message if it's from the current conversation
        if (message.senderId === sellerId || message.receiverId === sellerId) {
            setMessages(prev => {
                // Check if message already exists to avoid duplicates
                if (prev.some(m => m.id === message.id)) {
                    return prev;
                }
                return [...prev, message];
            });
        }
    };

    const handleMessageSent = (message) => {
        // Update the optimistic message with the real one from server
        setMessages(prev => prev.map(m =>
            m.senderId === user?.id && m.timestamp === message.timestamp ? message : m
        ));
    };

    const handleUserOnline = (userId) => {
        if (userId === sellerId) {
            setSellerInfo(prev => ({ ...prev, isOnline: true, lastSeen: null }));
        }
    };

    const handleUserOffline = (userId) => {
        if (userId === sellerId) {
            setSellerInfo(prev => ({ ...prev, isOnline: false, lastSeen: new Date() }));
        }
    };

    if (loading) {
        return (
            <BuyerLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </BuyerLayout>
        );
    }

    return (
        <BuyerLayout>
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden h-[80vh]">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/buyer/chat')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FaArrowLeft className="w-5 h-5" />
                            </button>
                            <img
                                src={sellerInfo?.avatar || '/api/placeholder/48/48'}
                                alt={sellerInfo?.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h2 className="font-semibold text-gray-900">{sellerInfo?.name}</h2>
                                <p className="text-sm text-gray-500">
                                    {sellerInfo?.isOnline ? (
                                        <span className="flex items-center">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                            Đang hoạt động
                                        </span>
                                    ) : (
                                        `Hoạt động ${formatTime(sellerInfo?.lastSeen)}`
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FaPhone className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FaVideo className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FaEllipsisV className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50" style={{ height: 'calc(100% - 140px)' }}>
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                    ) : (
                        messages.map(renderMessage)
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <FaImage className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={sending}
                            />
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <FaSmile className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || sending}
                            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaPaperPlane className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
};

export default ChatPage;
