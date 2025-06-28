const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5183";

// Helper function to generate device/browser identifier
const generateUserToken = () => {
    // Combine various browser characteristics to create a unique identifier
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
};

// Auth Service for LocalMartOnline
class AuthService {
    constructor() {
        this.setupRequestInterceptor();
        this.userToken = this.getUserToken();
    }

    // Get or generate user token for device identification
    getUserToken() {
        let token = localStorage.getItem('userToken');
        if (!token) {
            token = generateUserToken();
            localStorage.setItem('userToken', token);
        }
        return token;
    }

    // Setup request interceptor to add token to all requests
    setupRequestInterceptor() {
        // This could be used with axios if needed
        // For now, we handle it in makeAuthenticatedRequest
    }
    // Login user - supports both email and username
    async login(emailOrUsername, password, customUserToken = null) {
        try {
            const loginData = {
                username: emailOrUsername, // Backend uses 'username' field for both email and username
                password,
                userToken: customUserToken || this.userToken // Use provided token or default device token
            };

            const response = await fetch(`${API_URL}/api/Auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Đăng nhập thất bại");
            }

            // Check if 2FA is required
            if (result.requires2FA) {
                return {
                    requires2FA: true,
                    message: result.message,
                    success: true
                };
            }

            // Store token and user info
            if (result.data?.token) {
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify({
                    username: result.data.username,
                    role: result.data.role,
                    token: result.data.token
                }));
            }

            return result;
        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error("Không thể kết nối đến server");
            }
            throw new Error(error.message || "Lỗi đăng nhập");
        }
    }

    // Register user
    async register(userData) {
        try {
            const registerData = {
                username: userData.username,
                password: userData.password,
                email: userData.email,
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber || "",
                address: userData.address || "",
                role: userData.role || "buyer",
                userToken: userData.userToken || this.userToken // Use provided token or default device token
            };

            console.log('Sending registration data:', registerData);

            const response = await fetch(`${API_URL}/api/Auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            let result;

            try {
                const text = await response.text();
                console.log('Raw response:', text);

                if (!contentType || !contentType.includes('application/json')) {
                    console.error('Non-JSON response received:', text);
                    throw new Error("Server trả về định dạng không đúng. Vui lòng kiểm tra kết nối server.");
                }

                result = JSON.parse(text);
                console.log('Parsed server response:', result);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error("Server trả về dữ liệu không hợp lệ. Vui lòng thử lại sau.");
            }

            if (!response.ok || !result.success) {
                console.error('Registration failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    result: result
                });
                throw new Error(result.message || "Đăng ký thất bại");
            }

            return result;
        } catch (error) {
            console.error('Registration error:', error);

            // Handle different types of errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
            }

            if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
                throw new Error("Server trả về định dạng không đúng. Vui lòng thử lại sau.");
            }

            // If it's already a formatted error message, use it
            if (error.message && typeof error.message === 'string') {
                throw new Error(error.message);
            }

            // Default error message
            throw new Error("Đăng ký thất bại. Vui lòng thử lại sau.");
        }
    }

    // Verify Email
    async verifyEmail(token) {
        try {
            const response = await fetch(`${API_URL}/api/Auth/verify-email?token=${encodeURIComponent(token)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Xác thực email thất bại");
            }

            return result;
        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error("Không thể kết nối đến server");
            }
            throw new Error(error.message || "Lỗi xác thực email");
        }
    }

    // Forgot Password
    async forgotPassword(email) {
        try {
            const response = await fetch(`${API_URL}/api/Auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Gửi email đặt lại mật khẩu thất bại");
            }

            return result;
        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error("Không thể kết nối đến server");
            }
            throw new Error(error.message || "Lỗi gửi email đặt lại mật khẩu");
        }
    }

    // Reset Password
    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${API_URL}/api/Auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Đặt lại mật khẩu thất bại");
            }

            return result;
        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error("Không thể kết nối đến server");
            }
            throw new Error(error.message || "Lỗi đặt lại mật khẩu");
        }
    }

    // Change Password (requires authentication)
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_URL}/api/Auth/change-password`, {
                method: "POST",
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Đổi mật khẩu thất bại");
            }

            return result;
        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error("Không thể kết nối đến server");
            }
            throw new Error(error.message || "Lỗi đổi mật khẩu");
        }
    }

    // Verify 2FA
    async verify2FA(email, code) {
        try {
            const response = await fetch(`${API_URL}/api/Auth/2fa/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otpCode: code })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Xác thực thất bại");
            }

            // Store token and user info
            if (result.data?.token) {
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify({
                    username: result.data.username,
                    role: result.data.role,
                    token: result.data.token
                }));
            }

            return result;
        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error("Không thể kết nối đến server");
            }
            throw new Error(error.message || "Lỗi xác thực");
        }
    }

    // Send 2FA Code (if backend supports this endpoint)
    async send2FACode(email) {
        try {
            const response = await fetch(`${API_URL}/api/Auth/2fa/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Gửi mã xác thực thất bại");
            }

            return result;
        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error("Không thể kết nối đến server");
            }
            throw new Error(error.message || "Lỗi gửi mã xác thực");
        }
    }

    // Logout user
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Keep userToken for device identification
    }

    // Get current user
    getCurrentUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    // Get token
    getToken() {
        return localStorage.getItem('token');
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Decode JWT token to check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            if (payload.exp < currentTime) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating token:', error);
            this.logout();
            return false;
        }
    }

    // Check if user has specific role
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }

    // Check if user has any of the specified roles
    hasAnyRole(roles) {
        const user = this.getCurrentUser();
        return user && roles.includes(user.role);
    }

    // Get auth headers for API requests
    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Make authenticated API request
    async makeAuthenticatedRequest(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.logout();
            // Don't redirect here directly, let the AuthProvider handle it
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        return response;
    }
}

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
export const getToken = () => authService.getToken();
export const isAuthenticated = () => authService.isAuthenticated();
export const getUserToken = () => authService.getUserToken();
