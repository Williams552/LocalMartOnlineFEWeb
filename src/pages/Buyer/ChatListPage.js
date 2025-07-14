import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaSearch,
    FaEllipsisV,
    FaTrash,
    FaCircle,
    FaComments
} from 'react-icons/fa';
import chatService from '../../services/chatService';
import authService from '../../services/authService';
import BuyerLayout from '../../layouts/BuyerLayout';

const ChatListPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChats, setSelectedChats] = useState([]);

    useEffect(() => {
        // Check authentication
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);

        loadChatHistory();
    }, [navigate]);

    const loadChatHistory = async () => {
        try {
            setLoading(true);
            const currentUser = authService.getCurrentUser();
            if (currentUser?.id) {
                const response = await chatService.getChatHistory(currentUser.id);
                if (response.success) {
                    setChatList(response.data || []);
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes}p`;
        if (diffInMinutes < 1440) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const filteredChats = chatList.filter(chat =>
        chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelectChat = (chatId) => {
        setSelectedChats(prev =>
            prev.includes(chatId)
                ? prev.filter(id => id !== chatId)
                : [...prev, chatId]
        );
    };

    const deleteSelectedChats = () => {
        setChatList(prev => prev.filter(chat => !selectedChats.includes(chat.userId)));
        setSelectedChats([]);
    };

    const markChatAsRead = (chatId) => {
        setChatList(prev =>
            prev.map(chat =>
                chat.userId === chatId
                    ? { ...chat, unreadCount: 0 }
                    : chat
            )
        );
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
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <FaComments className="w-6 h-6 text-blue-500" />
                            <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            {selectedChats.length > 0 && (
                                <button
                                    onClick={deleteSelectedChats}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                                >
                                    <FaTrash className="w-4 h-4" />
                                    <span>Xóa ({selectedChats.length})</span>
                                </button>
                            )}
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FaEllipsisV className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm cuộc trò chuyện..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="max-h-[70vh] overflow-y-auto">
                    {filteredChats.length === 0 ? (
                        <div className="text-center py-12">
                            <FaComments className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                            <div className="text-gray-500">
                                {searchTerm ? (
                                    <p>Không tìm thấy cuộc trò chuyện nào.</p>
                                ) : (
                                    <div>
                                        <p className="mb-2">Chưa có cuộc trò chuyện nào.</p>
                                        <p className="text-sm">Hãy liên hệ với người bán để bắt đầu trò chuyện!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        filteredChats.map((chat) => (
                            <div
                                key={chat.userId}
                                className={`flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedChats.includes(chat.userId) ? 'bg-blue-50' : ''
                                    }`}
                            >
                                {/* Selection Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={selectedChats.includes(chat.userId)}
                                    onChange={() => toggleSelectChat(chat.userId)}
                                    className="mr-3 rounded focus:ring-blue-500"
                                />

                                {/* Avatar */}
                                <div className="relative">
                                    <img
                                        src={chat.userAvatar || '/api/placeholder/48/48'}
                                        alt={chat.userName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    {chat.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>

                                {/* Chat Info */}
                                <Link
                                    to={`/buyer/chat/${chat.userId}`}
                                    className="flex-1 ml-4 min-w-0"
                                    onClick={() => markChatAsRead(chat.userId)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-900 truncate">{chat.userName}</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">
                                                {formatTime(chat.lastMessageTime)}
                                            </span>
                                            {chat.unreadCount > 0 && (
                                                <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                                            }`}>
                                            {chat.lastMessage}
                                        </p>
                                        {chat.unreadCount > 0 && (
                                            <FaCircle className="ml-2 w-2 h-2 text-blue-500 flex-shrink-0" />
                                        )}
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Info */}
                {filteredChats.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 text-sm text-gray-600 border-t border-gray-200">
                        Tổng cộng {filteredChats.length} cuộc trò chuyện
                        {filteredChats.filter(c => c.unreadCount > 0).length > 0 && (
                            <span className="ml-2">
                                • {filteredChats.filter(c => c.unreadCount > 0).length} chưa đọc
                            </span>
                        )}
                    </div>
                )}
            </div>
        </BuyerLayout>
    );
};

export default ChatListPage;
