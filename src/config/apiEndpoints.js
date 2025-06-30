// API Endpoints Configuration
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5183";

// API Endpoints cho LocalMart
export const API_ENDPOINTS = {
    // Authentication Endpoints
    AUTH: {
        LOGIN: `${API_URL}/api/auth/login`,
        REGISTER: `${API_URL}/api/auth/register`,
        VERIFY_EMAIL: `${API_URL}/api/auth/verify-email`,
        FORGOT_PASSWORD: `${API_URL}/api/auth/forgot-password`,
        RESET_PASSWORD: `${API_URL}/api/auth/reset-password`,
        CHANGE_PASSWORD: `${API_URL}/api/auth/change-password`,
        VERIFY_2FA: `${API_URL}/api/auth/2fa/verify`,
    },

    // User Management Endpoints
    USER: {
        GET_ALL: `${API_URL}/api/user`,
        GET_BY_ID: (id) => `${API_URL}/api/user/${id}`,
        UPDATE: (id) => `${API_URL}/api/user/${id}`,
        DELETE: (id) => `${API_URL}/api/user/${id}`,
        GET_PROFILE: `${API_URL}/api/user/profile`,
        UPDATE_PROFILE: `${API_URL}/api/user/profile`,
        UPLOAD_AVATAR: `${API_URL}/api/user/upload-avatar`,
    },

    // Product Endpoints
    PRODUCT: {
        GET_ALL: `${API_URL}/api/product`,
        GET_BY_ID: (id) => `${API_URL}/api/product/${id}`,
        CREATE: `${API_URL}/api/product`,
        UPDATE: (id) => `${API_URL}/api/product/${id}`,
        DELETE: (id) => `${API_URL}/api/product/${id}`,
        SEARCH: `${API_URL}/api/product/search`,
        BY_CATEGORY: (categoryId) => `${API_URL}/api/product/category/${categoryId}`,
        BY_SELLER: (sellerId) => `${API_URL}/api/product/seller/${sellerId}`,
    },

    // Order Endpoints
    ORDER: {
        GET_ALL: `${API_URL}/api/order`,
        GET_BY_ID: (id) => `${API_URL}/api/order/${id}`,
        CREATE: `${API_URL}/api/order`,
        UPDATE: (id) => `${API_URL}/api/order/${id}`,
        DELETE: (id) => `${API_URL}/api/order/${id}`,
        GET_BY_USER: `${API_URL}/api/order/user`,
        GET_BY_SELLER: `${API_URL}/api/order/seller`,
        UPDATE_STATUS: (id) => `${API_URL}/api/order/${id}/status`,
    },

    // Category Endpoints
    CATEGORY: {
        GET_ALL: `${API_URL}/api/category`,
        GET_BY_ID: (id) => `${API_URL}/api/category/${id}`,
        CREATE: `${API_URL}/api/category`,
        UPDATE: (id) => `${API_URL}/api/category/${id}`,
        DELETE: (id) => `${API_URL}/api/category/${id}`,
    },

    // Market Endpoints
    MARKET: {
        GET_ALL: `${API_URL}/api/market`,
        GET_BY_ID: (id) => `${API_URL}/api/market/${id}`,
        CREATE: `${API_URL}/api/market`,
        UPDATE: (id) => `${API_URL}/api/market/${id}`,
        DELETE: (id) => `${API_URL}/api/market/${id}`,
    },

    // Store Endpoints
    STORE: {
        GET_ALL: `${API_URL}/api/store`,
        GET_BY_ID: (id) => `${API_URL}/api/store/${id}`,
        CREATE: `${API_URL}/api/store`,
        UPDATE: (id) => `${API_URL}/api/store/${id}`,
        DELETE: (id) => `${API_URL}/api/store/${id}`,
        GET_BY_SELLER: `${API_URL}/api/store/seller`,
    },

    // Cart Endpoints
    CART: {
        GET: `${API_URL}/api/cart`,
        ADD_ITEM: `${API_URL}/api/cart/add`,
        UPDATE_ITEM: `${API_URL}/api/cart/update`,
        REMOVE_ITEM: `${API_URL}/api/cart/remove`,
        CLEAR: `${API_URL}/api/cart/clear`,
    },

    // Payment Endpoints
    PAYMENT: {
        VNPAY_CREATE: `${API_URL}/api/vnpay/create-payment`,
        VNPAY_CALLBACK: `${API_URL}/api/vnpay/payment-callback`,
    },

    // Admin Endpoints
    ADMIN: {
        DASHBOARD: `${API_URL}/api/admin/dashboard`,
        USERS: `${API_URL}/api/admin/users`,
        PRODUCTS: `${API_URL}/api/admin/products`,
        ORDERS: `${API_URL}/api/admin/orders`,
        REPORTS: `${API_URL}/api/admin/reports`,
    },

    // Seller Registration Endpoints
    SELLER_REGISTRATION: {
        REGISTER: `${API_URL}/api/sellerregistration`,
        GET_MY: `${API_URL}/api/sellerregistration/my`,
        GET_ALL: `${API_URL}/api/sellerregistration`,
        APPROVE: `${API_URL}/api/sellerregistration/approve`,
    },

    // Notification Endpoints
    NOTIFICATION: {
        GET_ALL: `${API_URL}/api/notification`,
        MARK_READ: (id) => `${API_URL}/api/notification/${id}/read`,
        MARK_ALL_READ: `${API_URL}/api/notification/read-all`,
    },
};

export default API_ENDPOINTS;
