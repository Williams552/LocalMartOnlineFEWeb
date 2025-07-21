// src/services/adminNotificationService.js
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

class AdminNotificationService {
    constructor() {
        this.api = axios.create({
            baseURL: API_ENDPOINTS.API_BASE,
            timeout: 10000,
        });

        // Add auth interceptor
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Get all notifications with pagination
    async getNotifications(page = 1, limit = 10) {
        try {
            const response = await this.api.get(API_ENDPOINTS.NOTIFICATION.GET_PAGED, {
                params: { page, limit }
            });
            return {
                success: true,
                data: response.data.data || [],
                total: response.data.total || 0,
                message: 'Lấy danh sách thông báo thành công'
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return {
                success: false,
                data: [],
                total: 0,
                message: error.response?.data?.message || 'Lỗi khi lấy danh sách thông báo'
            };
        }
    }

    // Get unread notification count
    async getUnreadCount() {
        try {
            const response = await this.api.get(API_ENDPOINTS.NOTIFICATION.GET_UNREAD_COUNT);
            return {
                success: true,
                data: response.data.data || 0,
                message: 'Lấy số lượng thông báo chưa đọc thành công'
            };
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return {
                success: false,
                data: 0,
                message: error.response?.data?.message || 'Lỗi khi lấy số lượng thông báo chưa đọc'
            };
        }
    }

    // Send notification to specific user
    async sendNotification(userToken, message, title = '') {
        try {
            const response = await this.api.post(API_ENDPOINTS.NOTIFICATION.SEND, {
                userToken,
                message,
                title
            });
            return {
                success: true,
                data: response.data,
                message: 'Gửi thông báo thành công'
            };
        } catch (error) {
            console.error('Error sending notification:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Lỗi khi gửi thông báo'
            };
        }
    }

    // Send notification by condition (role, status)
    async sendNotificationByCondition(role, status, message) {
        try {
            const response = await this.api.post(API_ENDPOINTS.NOTIFICATION.SEND_BY_CONDITION, {
                role,
                status,
                message
            });
            return {
                success: true,
                data: response.data.data || 0,
                message: response.data.message || 'Gửi thông báo thành công'
            };
        } catch (error) {
            console.error('Error sending notification by condition:', error);
            return {
                success: false,
                data: 0,
                message: error.response?.data?.message || 'Lỗi khi gửi thông báo'
            };
        }
    }

    // Send admin notice
    async sendAdminNotice(userToken, message) {
        try {
            const response = await this.api.post(API_ENDPOINTS.NOTIFICATION.SEND_ADMIN_NOTICE, {
                userToken,
                message
            });
            return {
                success: true,
                data: response.data,
                message: 'Gửi thông báo hành chính thành công'
            };
        } catch (error) {
            console.error('Error sending admin notice:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Lỗi khi gửi thông báo hành chính'
            };
        }
    }

    // Send security alert
    async sendSecurityAlert(userToken, message) {
        try {
            const response = await this.api.post(API_ENDPOINTS.NOTIFICATION.SEND_SECURITY_ALERT, {
                userToken,
                message
            });
            return {
                success: true,
                data: response.data,
                message: 'Gửi cảnh báo bảo mật thành công'
            };
        } catch (error) {
            console.error('Error sending security alert:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Lỗi khi gửi cảnh báo bảo mật'
            };
        }
    }

    // Send store suspension notification
    async sendStoreSuspensionNotification(userToken, message) {
        try {
            const response = await this.api.post(API_ENDPOINTS.NOTIFICATION.SEND_STORE_SUSPENSION, {
                userToken,
                message
            });
            return {
                success: true,
                data: response.data,
                message: 'Gửi thông báo đình chỉ cửa hàng thành công'
            };
        } catch (error) {
            console.error('Error sending store suspension notification:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Lỗi khi gửi thông báo đình chỉ cửa hàng'
            };
        }
    }

    // Format notification display data
    formatNotificationDisplay(notification) {
        const typeLabels = {
            'new_order': 'Đơn hàng mới',
            'order_update': 'Cập nhật đơn hàng',
            'store_suspension': 'Đình chỉ cửa hàng',
            'admin_notice': 'Thông báo hành chính',
            'security_alert': 'Cảnh báo bảo mật',
            'general': 'Thông báo chung'
        };

        const typeColors = {
            'new_order': 'blue',
            'order_update': 'green',
            'store_suspension': 'red',
            'admin_notice': 'orange',
            'security_alert': 'red',
            'general': 'default'
        };

        return {
            ...notification,
            typeDisplay: typeLabels[notification.type] || notification.type || 'Thông báo chung',
            typeColor: typeColors[notification.type] || 'default',
            createdAtDisplay: notification.createdAt ? new Date(notification.createdAt).toLocaleString('vi-VN') : '',
            isReadDisplay: notification.isRead ? 'Đã đọc' : 'Chưa đọc',
            readStatusColor: notification.isRead ? 'green' : 'orange'
        };
    }
}

export default new AdminNotificationService();
