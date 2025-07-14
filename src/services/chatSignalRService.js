// SignalR service for real-time chat functionality
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class ChatSignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.listeners = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    // Initialize connection
    async initialize(userId) {
        if (this.connection && this.isConnected) {
            console.log('🔗 SignalR: Already connected');
            return;
        }

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5183';

            this.connection = new HubConnectionBuilder()
                .withUrl(`${apiUrl}/chatHub`, {
                    withCredentials: false,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    }
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .configureLogging(LogLevel.Information)
                .build();

            // Setup event handlers
            this.setupEventHandlers();

            // Start connection
            await this.connection.start();
            console.log('🔗 SignalR: Connected successfully');

            // Join chat for this user
            if (userId) {
                await this.joinChat(userId);
            }

            this.isConnected = true;
            this.reconnectAttempts = 0;

        } catch (error) {
            console.error('🔗 SignalR: Connection failed:', error);
            this.isConnected = false;

            // Retry connection
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => this.initialize(userId), 5000 * this.reconnectAttempts);
            }
        }
    }

    // Setup event handlers
    setupEventHandlers() {
        if (!this.connection) return;

        // Connection events
        this.connection.onclose((error) => {
            console.log('🔗 SignalR: Disconnected', error);
            this.isConnected = false;
        });

        this.connection.onreconnecting((error) => {
            console.log('🔗 SignalR: Reconnecting...', error);
            this.isConnected = false;
        });

        this.connection.onreconnected(() => {
            console.log('🔗 SignalR: Reconnected');
            this.isConnected = true;
        });

        // Message events
        this.connection.on('ReceiveMessage', (message) => {
            console.log('💬 SignalR: Received message:', message);
            this.notifyListeners('messageReceived', message);
        });

        this.connection.on('MessageSent', (message) => {
            console.log('✅ SignalR: Message sent confirmed:', message);
            this.notifyListeners('messageSent', message);
        });

        this.connection.on('UserOnline', (userId) => {
            console.log('🟢 SignalR: User online:', userId);
            this.notifyListeners('userOnline', userId);
        });

        this.connection.on('UserOffline', (userId) => {
            console.log('🔴 SignalR: User offline:', userId);
            this.notifyListeners('userOffline', userId);
        });
    }

    // Join chat for user
    async joinChat(userId) {
        if (!this.isConnected || !this.connection) {
            console.warn('🔗 SignalR: Not connected, cannot join chat');
            return;
        }

        try {
            await this.connection.invoke('JoinChat', userId);
            console.log(`🏠 SignalR: Joined chat for user ${userId}`);
        } catch (error) {
            console.error('🔗 SignalR: Failed to join chat:', error);
        }
    }

    // Send message via SignalR
    async sendMessage(senderId, receiverId, message) {
        if (!this.isConnected || !this.connection) {
            console.warn('🔗 SignalR: Not connected, cannot send message');
            throw new Error('Not connected to chat server');
        }

        try {
            await this.connection.invoke('SendMessage', senderId, receiverId, message);
            console.log('📤 SignalR: Message sent via SignalR');
        } catch (error) {
            console.error('🔗 SignalR: Failed to send message:', error);
            throw error;
        }
    }

    // Leave chat
    async leaveChat(userId) {
        if (!this.isConnected || !this.connection) return;

        try {
            await this.connection.invoke('LeaveChat', userId);
            console.log(`🚪 SignalR: Left chat for user ${userId}`);
        } catch (error) {
            console.error('🔗 SignalR: Failed to leave chat:', error);
        }
    }

    // Event listener management
    addEventListener(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    removeEventListener(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    notifyListeners(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }

    // Disconnect
    async disconnect() {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log('🔗 SignalR: Disconnected gracefully');
            } catch (error) {
                console.error('🔗 SignalR: Error during disconnect:', error);
            }
        }
        this.isConnected = false;
        this.connection = null;
        this.listeners = {};
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            connectionState: this.connection?.state || 'Disconnected',
            reconnectAttempts: this.reconnectAttempts
        };
    }
}

// Create singleton instance
const chatSignalRService = new ChatSignalRService();

export default chatSignalRService;
