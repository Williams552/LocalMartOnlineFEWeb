// API Endpoints Configuration
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5183";

// API Endpoints cho LocalMart
export const API_ENDPOINTS = {
    // Base API URL
    API_BASE: API_URL,

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
        TOGGLE: (id) => `${API_URL}/api/product/${id}/toggle`,

        // Search & Filter endpoints
        SEARCH: `${API_URL}/api/product/search`,
        FILTER: `${API_URL}/api/product/filter`,

        // Store specific endpoints
        BY_STORE: (storeId) => `${API_URL}/api/product/store/${storeId}`,
        SEARCH_IN_STORE: (storeId) => `${API_URL}/api/product/store/${storeId}/search`,
        FILTER_IN_STORE: (storeId) => `${API_URL}/api/product/store/${storeId}/filter`,

        // Market specific endpoints
        BY_MARKET: (marketId) => `${API_URL}/api/product/market/${marketId}`,
        SEARCH_IN_MARKET: (marketId) => `${API_URL}/api/product/market/${marketId}/search`,
        FILTER_IN_MARKET: (marketId) => `${API_URL}/api/product/market/${marketId}/filter`,

        // Seller endpoints (for authenticated sellers)
        SELLER_GET_ALL: (storeId) => `${API_URL}/api/product/seller/store/${storeId}`,
        SELLER_SEARCH: (storeId) => `${API_URL}/api/product/seller/store/${storeId}/search`,
        SELLER_FILTER: `${API_URL}/api/product/seller/filter`,

        // Photo upload
        UPLOAD_ACTUAL_PHOTO: (productId) => `${API_URL}/api/product/${productId}/actual-photo`,

        // Legacy endpoints (for backward compatibility)
        BY_CATEGORY: (categoryId) => `${API_URL}/api/product?categoryId=${categoryId}`,
        BY_SELLER: (sellerId) => `${API_URL}/api/product?sellerId=${sellerId}`,
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
        GET_STATISTICS: (id) => `${API_URL}/api/store/${id}/statistics`,

        // Follow endpoints
        FOLLOW: (storeId) => `${API_URL}/api/store/${storeId}/follow`,
        UNFOLLOW: (storeId) => `${API_URL}/api/store/${storeId}/unfollow`,
        GET_FOLLOWING: `${API_URL}/api/store/following`,
        CHECK_FOLLOWING: (storeId) => `${API_URL}/api/store/${storeId}/check-follow`,
        GET_FOLLOWERS: (storeId) => `${API_URL}/api/store/${storeId}/followers`,
    },

    // Cart Endpoints
    CART: {
        GET_ITEMS: (userId) => `${API_URL}/api/Cart/${userId}`,
        ADD_ITEM: (userId) => `${API_URL}/api/Cart/${userId}/items`,
        UPDATE_ITEM: (userId, productId) => `${API_URL}/api/Cart/${userId}/items/${productId}`,
        REMOVE_ITEM: (userId, productId) => `${API_URL}/api/Cart/${userId}/items/${productId}`,
        CLEAR_CART: (userId) => `${API_URL}/api/Cart/${userId}`,
        GET_SUMMARY: (userId) => `${API_URL}/api/Cart/${userId}/summary`,
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

    // Proxy Shopper Registration Endpoints
    PROXY_SHOPPER_REGISTRATION: {
        REGISTER: `${API_URL}/api/proxyshopperregistration`,
        GET_MY: `${API_URL}/api/proxyshopperregistration/my`,
        GET_ALL: `${API_URL}/api/proxyshopperregistration`,
        APPROVE: `${API_URL}/api/proxyshopperregistration/approve`,
    },

    // Notification Endpoints
    NOTIFICATION: {
        GET_ALL: `${API_URL}/api/notification`,
        MARK_READ: (id) => `${API_URL}/api/notification/${id}/read`,
        MARK_ALL_READ: `${API_URL}/api/notification/read-all`,
    },

    // Favorite Endpoints
    FAVORITE: {
        GET_ALL: `${API_URL}/api/favorite`,
        ADD: `${API_URL}/api/favorite/add`,
        REMOVE: (productId) => `${API_URL}/api/favorite/${productId}`,
        CHECK: (productId) => `${API_URL}/api/favorite/check/${productId}`,
    },

    // Seller Dashboard & Management Endpoints
    SELLER: {
        // Dashboard endpoints
        DASHBOARD_STATS: `${API_URL}/api/seller/dashboard/stats`,

        // Store management endpoints
        GET_MY_STORE: `${API_URL}/api/store/seller`,
        CREATE_STORE: `${API_URL}/api/store`,
        UPDATE_STORE: (id) => `${API_URL}/api/store/${id}`,
        TOGGLE_STORE: (id) => `${API_URL}/api/store/${id}/toggle`,

        // Product management endpoints (Seller specific)
        GET_MY_PRODUCTS: (storeId) => `${API_URL}/api/product/seller/store/${storeId}`,
        SEARCH_MY_PRODUCTS: (storeId) => `${API_URL}/api/product/seller/store/${storeId}/search`,
        FILTER_MY_PRODUCTS: `${API_URL}/api/product/seller/filter`,

        // Order management endpoints
        GET_MY_ORDERS: (buyerId) => `${API_URL}/api/order/buyer/${buyerId}`,
        FILTER_MY_ORDERS: `${API_URL}/api/order/filter`,

        // Customer management endpoints
        GET_LOYAL_CUSTOMERS: `${API_URL}/api/customer`,
        GET_CUSTOMER_ORDERS: (customerId) => `${API_URL}/api/customer/customer/${customerId}/orders`,
        GET_CUSTOMER_STATS: `${API_URL}/api/customer/statistics`,
        GET_LOYALTY_INFO: `${API_URL}/api/customer/loyalty-score-info`,

        // License management endpoints
        CREATE_LICENSE: `${API_URL}/api/license`,
        GET_MY_LICENSES: `${API_URL}/api/license/my-licenses`,
        UPDATE_LICENSE: (licenseId) => `${API_URL}/api/license/${licenseId}`,
        DELETE_LICENSE: (licenseId) => `${API_URL}/api/license/${licenseId}`,
        GET_LICENSE_BY_ID: (licenseId) => `${API_URL}/api/license/${licenseId}`,

        // Category registration endpoints
        REGISTER_CATEGORY: `${API_URL}/api/categoryregistration`,

        // Review endpoints
        GET_MY_REVIEWS: (sellerId) => `${API_URL}/api/review/target?targetType=Seller&targetId=${sellerId}`,

        // Profile endpoints
        GET_SELLER_PROFILE: (userId) => `${API_URL}/api/sellerregistration/profile/${userId}`,
    },
};

export default API_ENDPOINTS;
