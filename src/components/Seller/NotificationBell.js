// Notification Bell Component
import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import NotificationCenter from './NotificationCenter';
import notificationService from '../../services/notificationService';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Load initial unread count
        loadUnreadCount();

        // Start real-time listener
        const stopListener = notificationService.startRealTimeListener((newNotification) => {
            // Animate bell on new notification
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1000);

            // Update unread count
            setUnreadCount(prev => prev + 1);

            // Show browser notification if permission granted
            showBrowserNotification(newNotification);
        });

        return () => {
            if (stopListener) stopListener();
        };
    }, []);

    const loadUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.count || 0);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const showBrowserNotification = (notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${notification.icon} ${notification.title}`, {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: notification.id,
                requireInteraction: notification.priority === 'high'
            });
        }
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('✅ Notification permission granted');
            }
        }
    };

    const handleBellClick = () => {
        setIsOpen(!isOpen);

        // Request notification permission on first interaction
        if (!isOpen) {
            requestNotificationPermission();
        }
    };

    const handleUnreadCountChange = (newCount) => {
        setUnreadCount(newCount);
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={handleBellClick}
                className={`relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 ${isAnimating ? 'animate-bounce' : ''
                    } ${isOpen ? 'bg-gray-100 text-gray-800' : ''}`}
                title="Thông báo"
            >
                <FaBell className="text-xl" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                {/* Pulse Animation for New Notifications */}
                {isAnimating && (
                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 animate-ping"></span>
                )}
            </button>

            {/* Notification Center Dropdown */}
            <NotificationCenter
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onUnreadCountChange={handleUnreadCountChange}
            />
        </div>
    );
};

export default NotificationBell;
