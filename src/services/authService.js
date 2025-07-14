import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import toastService from './toastService';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5183';

console.log('🔧 AuthService: API_URL =', API_URL);

// Helper function to generate device/browser identifier
const generateUserToken = () => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);

        const canvasFingerprint = canvas.toDataURL();
        const screenFingerprint = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
        const timezoneFingerprint = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const languageFingerprint = navigator.language;
        const platformFingerprint = navigator.platform;

        const combined = `${canvasFingerprint}-${screenFingerprint}-${timezoneFingerprint}-${languageFingerprint}-${platformFingerprint}`;

        // Create a simple hash
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        return `web_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
    } catch (error) {
        console.warn('Could not generate device fingerprint, using fallback');
        return `web_fallback_${Date.now().toString(36)}`;
    }
};

class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.user = this.getStoredUser();
        this.userToken = this.getUserToken();

        // Setup axios interceptors
        this.setupAxiosInterceptors();

        console.log('🔐 AuthService initialized');
    }

    // ============= USER TOKEN MANAGEMENT =============

    getUserToken() {
        let token = localStorage.getItem('userToken');
        if (!token) {
            token = generateUserToken();
            localStorage.setItem('userToken', token);
            console.log('🔧 Generated new user token:', token);
        }
        return token;
    }

    // ============= TOKEN MANAGEMENT =============

    setTokens(token, refreshToken = null) {
        console.log('🔐 AuthService: Setting tokens');
        this.token = token;
        this.refreshToken = refreshToken;

        localStorage.setItem('token', token);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
    }

    clearTokens() {
        console.log('🔐 AuthService: Clearing tokens');
        this.token = null;
        this.refreshToken = null;

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }

    getToken() {
        return this.token || localStorage.getItem('token');
    }

    getRefreshToken() {
        return this.refreshToken || localStorage.getItem('refreshToken');
    }

    // ============= USER MANAGEMENT =============

    setUser(user) {
        console.log('👤 AuthService: Setting user', user);
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));

        // Store userId separately for easy access
        if (user && (user.id || user.userId || user.ID || user.UserId)) {
            const userId = user.id || user.userId || user.ID || user.UserId;
            localStorage.setItem('userId', userId.toString());
            console.log('✅ AuthService: Saved userId:', userId);
        }
    }

    getStoredUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing stored user:', error);
            return null;
        }
    }

    getCurrentUser() {
        return this.user || this.getStoredUser();
    }

    getCurrentUserId() {
        // Try localStorage first
        const userId = localStorage.getItem('userId');
        if (userId) {
            return userId;
        }

        // Try from user object
        const user = this.getCurrentUser();
        if (user && (user.id || user.userId || user.ID || user.UserId)) {
            const extractedUserId = user.id || user.userId || user.ID || user.UserId;
            localStorage.setItem('userId', extractedUserId.toString());
            return extractedUserId.toString();
        }

        // Try from token
        const token = this.getToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const tokenUserId = decoded.sub || decoded.userId || decoded.id || decoded.nameid;
                if (tokenUserId) {
                    localStorage.setItem('userId', tokenUserId.toString());
                    return tokenUserId.toString();
                }
            } catch (error) {
                console.error('Error decoding token for userId:', error);
            }
        }

        console.warn('⚠️ AuthService: No userId found');
        return null;
    }

    clearUser() {
        console.log('👤 AuthService: Clearing user');
        this.user = null;
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
    }

    // ============= TOKEN VALIDATION =============

    isTokenValid(token = null) {
        const tokenToCheck = token || this.getToken();
        if (!tokenToCheck) return false;

        try {
            const decoded = jwtDecode(tokenToCheck);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }

    getTokenExpiration(token = null) {
        const tokenToCheck = token || this.getToken();
        if (!tokenToCheck) return null;

        try {
            const decoded = jwtDecode(tokenToCheck);
            return decoded.exp;
        } catch (error) {
            console.error('Error getting token expiration:', error);
            return null;
        }
    }

    isTokenExpiringSoon(minutesThreshold = 5) {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const timeLeft = decoded.exp - currentTime;
            return timeLeft < (minutesThreshold * 60);
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return false;
        }
    }

    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            console.warn('⚠️ AuthService: No refresh token available');
            return false;
        }

        try {
            console.log('🔄 AuthService: Refreshing token...');
            const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
                token: this.getToken(),
                refreshToken: refreshToken
            });

            if (response.data && response.data.success && response.data.data) {
                const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
                this.setTokens(newToken, newRefreshToken);
                console.log('✅ AuthService: Token refreshed successfully');
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ AuthService: Token refresh failed:', error);
            // Token refresh thất bại, logout user
            this.logout();
            return false;
        }
    }

    isAuthenticated() {
        const token = this.getToken();
        const isValid = this.isTokenValid(token);
        console.log('🔐 AuthService: isAuthenticated check:', { hasToken: !!token, isValid });
        return isValid;
    }

    // ============= AXIOS INTERCEPTORS =============

    setupAxiosInterceptors() {
        // Request interceptor
        axios.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token && this.isTokenValid(token)) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    console.warn('🔐 AuthService: 401 Unauthorized - logging out');
                    this.logout();
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // ============= AUTH OPERATIONS =============

    async login(emailOrUsername, password, customUserToken = null) {
        try {
            console.log('🔐 AuthService: Attempting login...', { emailOrUsername });

            const loginData = {
                username: emailOrUsername, // Backend uses 'username' field for both email and username
                password,
                userToken: customUserToken || this.userToken
            };

            const response = await axios.post(`${API_URL}/api/auth/login`, loginData);

            console.log('🔐 AuthService: Login response:', response.data);

            if (response.data && response.data.success) {
                // Check if 2FA is required
                if (response.data.requires2FA) {
                    console.log('🔐 AuthService: 2FA required');
                    return {
                        success: true,
                        requires2FA: true,
                        message: response.data.message || 'Vui lòng nhập mã xác thực 2FA'
                    };
                }

                // Normal login success
                const { data } = response.data;
                if (data?.token) {
                    this.setTokens(data.token);
                    this.setUser({
                        id: data.userId,
                        userId: data.userId,
                        username: data.username,
                        role: data.role,
                        token: data.token
                    });

                    console.log('✅ AuthService: Login successful');
                    toastService.success('Đăng nhập thành công!');

                    return {
                        success: true,
                        data: {
                            token: data.token,
                            user: this.getCurrentUser()
                        },
                        message: 'Đăng nhập thành công'
                    };
                }
            }

            return {
                success: false,
                message: response.data?.message || 'Đăng nhập thất bại'
            };

        } catch (error) {
            console.error('❌ AuthService: Login error:', error);

            let message = 'Đăng nhập thất bại. Vui lòng thử lại.';
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.message?.includes('Network Error')) {
                message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            }

            toastService.error(message);
            return {
                success: false,
                message
            };
        }
    }

    async verify2FA(email, code) {
        try {
            console.log('🔐 AuthService: Verifying 2FA code...');

            const response = await axios.post(`${API_URL}/api/auth/2fa/verify`, {
                email,
                otpCode: code
            });

            if (response.data && response.data.success) {
                const { data } = response.data;
                if (data?.token) {
                    this.setTokens(data.token);
                    this.setUser({
                        id: data.userId,
                        userId: data.userId,
                        username: data.username,
                        role: data.role,
                        token: data.token
                    });

                    console.log('✅ AuthService: 2FA verification successful');
                    toastService.success('Xác thực 2FA thành công!');

                    return {
                        success: true,
                        data: {
                            token: data.token,
                            user: this.getCurrentUser()
                        },
                        message: 'Xác thực thành công'
                    };
                }
            }

            return {
                success: false,
                message: response.data?.message || 'Mã xác thực không đúng'
            };

        } catch (error) {
            console.error('❌ AuthService: 2FA verification error:', error);
            const message = error.response?.data?.message || 'Xác thực 2FA thất bại. Vui lòng thử lại.';
            toastService.error(message);

            return {
                success: false,
                message
            };
        }
    }

    async send2FACode(email) {
        try {
            console.log('📧 AuthService: Sending 2FA code...');

            const response = await axios.post(`${API_URL}/api/auth/2fa/send`, { email });

            if (response.data && response.data.success) {
                console.log('✅ AuthService: 2FA code sent successfully');
                toastService.success('Mã xác thực đã được gửi đến email của bạn!');

                return {
                    success: true,
                    message: 'Mã xác thực đã được gửi'
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Không thể gửi mã xác thực'
            };

        } catch (error) {
            console.error('❌ AuthService: Send 2FA code error:', error);
            const message = error.response?.data?.message || 'Không thể gửi mã xác thực. Vui lòng thử lại.';
            toastService.error(message);

            return {
                success: false,
                message
            };
        }
    }

    async register(userData) {
        try {
            console.log('📝 AuthService: Attempting registration...');

            const registerData = {
                username: userData.username,
                password: userData.password,
                email: userData.email,
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber || '',
                address: userData.address || '',
                userToken: userData.userToken || this.userToken
            };

            const response = await axios.post(`${API_URL}/api/auth/register`, registerData);

            if (response.data && response.data.success) {
                console.log('✅ AuthService: Registration successful');
                toastService.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');

                return {
                    success: true,
                    message: 'Đăng ký thành công'
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Đăng ký thất bại'
            };

        } catch (error) {
            console.error('❌ AuthService: Registration error:', error);
            const message = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            toastService.error(message);

            return {
                success: false,
                message
            };
        }
    }

    async forgotPassword(email) {
        try {
            console.log('🔐 AuthService: Requesting password reset...');

            const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });

            if (response.data && response.data.success) {
                console.log('✅ AuthService: Password reset email sent');
                toastService.success('Email khôi phục mật khẩu đã được gửi!');

                return {
                    success: true,
                    message: 'Email khôi phục đã được gửi'
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Không thể gửi email khôi phục'
            };

        } catch (error) {
            console.error('❌ AuthService: Forgot password error:', error);
            const message = error.response?.data?.message || 'Không thể gửi email khôi phục. Vui lòng thử lại.';
            toastService.error(message);

            return {
                success: false,
                message
            };
        }
    }

    async resetPassword(token, newPassword) {
        try {
            console.log('🔐 AuthService: Resetting password...');

            const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
                token,
                newPassword
            });

            if (response.data && response.data.success) {
                console.log('✅ AuthService: Password reset successful');
                toastService.success('Mật khẩu đã được cập nhật thành công!');

                return {
                    success: true,
                    message: 'Mật khẩu đã được cập nhật'
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Không thể cập nhật mật khẩu'
            };

        } catch (error) {
            console.error('❌ AuthService: Reset password error:', error);
            const message = error.response?.data?.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.';
            toastService.error(message);

            return {
                success: false,
                message
            };
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            console.log('🔐 AuthService: Changing password...');

            const response = await axios.post(`${API_URL}/api/auth/change-password`, {
                currentPassword,
                newPassword
            });

            if (response.data && response.data.success) {
                console.log('✅ AuthService: Password changed successfully');
                toastService.success('Mật khẩu đã được thay đổi thành công!');

                return {
                    success: true,
                    message: 'Mật khẩu đã được thay đổi'
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Không thể thay đổi mật khẩu'
            };

        } catch (error) {
            console.error('❌ AuthService: Change password error:', error);
            const message = error.response?.data?.message || 'Không thể thay đổi mật khẩu. Vui lòng thử lại.';
            toastService.error(message);

            return {
                success: false,
                message
            };
        }
    }

    async verifyEmail(token) {
        try {
            console.log('📧 AuthService: Verifying email...');

            const response = await axios.get(`${API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`);

            if (response.data && response.data.success) {
                console.log('✅ AuthService: Email verified successfully');
                toastService.success('Email đã được xác thực thành công!');

                return {
                    success: true,
                    message: 'Email đã được xác thực'
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Xác thực email thất bại'
            };

        } catch (error) {
            console.error('❌ AuthService: Email verification error:', error);
            const message = error.response?.data?.message || 'Xác thực email thất bại. Vui lòng thử lại.';
            toastService.error(message);

            return {
                success: false,
                message
            };
        }
    }

    logout(fromAllDevices = false) {
        console.log('🔐 AuthService: Logging out...', { fromAllDevices });

        try {
            // Clear tokens and user data
            this.clearTokens();
            this.clearUser();

            // Remove authentication-related items
            const authItems = [
                'rememberMe',
                'tempAuthData',
                'userId',
                'lastLoginTime',
                'userPreferences'
            ];

            authItems.forEach(item => {
                try {
                    localStorage.removeItem(item);
                } catch (error) {
                    console.warn(`Failed to remove ${item}:`, error);
                }
            });

            // If clearing all devices, remove additional user data
            if (fromAllDevices) {
                const userDataItems = [
                    'cartItems',
                    'favorites',
                    'recentSearches',
                    'browsHistory',
                    'userSettings',
                    'tempData'
                ];

                userDataItems.forEach(item => {
                    try {
                        localStorage.removeItem(item);
                    } catch (error) {
                        console.warn(`Failed to remove ${item}:`, error);
                    }
                });

                // Clear sessionStorage completely
                try {
                    sessionStorage.clear();
                } catch (error) {
                    console.warn('Failed to clear sessionStorage:', error);
                }
            }

            console.log('✅ AuthService: Logout completed');
            toastService.success(fromAllDevices ?
                'Đã đăng xuất và xóa tất cả dữ liệu thiết bị' :
                'Đã đăng xuất khỏi hệ thống');

        } catch (error) {
            console.error('❌ AuthService: Logout error:', error);
            toastService.error('Có lỗi xảy ra khi đăng xuất, nhưng đã xóa dữ liệu cục bộ');
        }
    }

    // ============= AUTHENTICATED REQUEST HELPER =============

    async makeAuthenticatedRequest(url, options = {}) {
        try {
            const token = this.getToken();
            if (!token || !this.isTokenValid(token)) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            // Merge headers, allowing custom headers to override defaults
            const headers = {
                ...defaultHeaders,
                ...options.headers
            };

            // Use fetch API for the request
            const response = await fetch(url, {
                ...options,
                headers
            });

            return response;
        } catch (error) {
            console.error('❌ AuthService: Authenticated request error:', error);
            throw error;
        }
    }

    // ============= UTILITY METHODS =============

    getUserRole() {
        const user = this.getCurrentUser();
        return user?.role || null;
    }

    hasRole(requiredRole) {
        const userRole = this.getUserRole();
        return userRole === requiredRole;
    }

    hasAnyRole(roles) {
        const userRole = this.getUserRole();
        return roles.includes(userRole);
    }

    updateCurrentUser(userData) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            this.setUser(updatedUser);
            return true;
        }
        return false;
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;

// Export individual functions for backward compatibility
export const login = (emailOrUsername, password, userToken) => authService.login(emailOrUsername, password, userToken);
export const register = (userData) => authService.register(userData);
export const verify2FA = (email, code) => authService.verify2FA(email, code);
export const send2FACode = (email) => authService.send2FACode(email);
export const verifyEmail = (token) => authService.verifyEmail(token);
export const forgotPassword = (email) => authService.forgotPassword(email);
export const resetPassword = (token, newPassword) => authService.resetPassword(token, newPassword);
export const changePassword = (currentPassword, newPassword) => authService.changePassword(currentPassword, newPassword);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const getCurrentUserId = () => authService.getCurrentUserId();
export const getToken = () => authService.getToken();
export const getTokenExpiration = (token) => authService.getTokenExpiration(token);
export const isAuthenticated = () => authService.isAuthenticated();
export const isTokenExpiringSoon = (minutesThreshold) => authService.isTokenExpiringSoon(minutesThreshold);
export const refreshToken = () => authService.refreshToken();
export const getUserToken = () => authService.getUserToken();
export const hasRole = (role) => authService.hasRole(role);
export const hasAnyRole = (roles) => authService.hasAnyRole(roles);
export const updateCurrentUser = (userData) => authService.updateCurrentUser(userData);
export const makeAuthenticatedRequest = (url, options) => authService.makeAuthenticatedRequest(url, options);
