// API Endpoints Configuration
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5183";

// API Endpoints cho LocalMart
export const API_ENDPOINTS = {
    // Proxy Shopper Endpoints
    PROXY_SHOPPER: {
        // Dashboard analytics
        ANALYTICS: (period = '30d') => `${API_URL}/api/proxyshopper/analytics?period=${period}`,
        // My stats
        MY_STATS: `${API_URL}/api/ProxyShopper/my-stats`,
        // My orders
        MY_ORDERS: `${API_URL}/api/ProxyShopper/my-orders`,
        // Order detail
        ORDER_DETAIL: (orderId) => `${API_URL}/api/ProxyShopper/orders/${orderId}/detail`,
        // Available orders
        AVAILABLE_ORDERS: `${API_URL}/api/ProxyShopper/orders`,
        // Accept order
        ACCEPT_ORDER: (orderId) => `${API_URL}/api/ProxyShopper/orders/${orderId}/accept`,
        // Confirm order
        CONFIRM_ORDER: (orderId) => `${API_URL}/api/ProxyShopper/orders/${orderId}/confirm`,
        // Upload bought items
        UPLOAD_BOUGHT_ITEMS: (orderId) => `${API_URL}/api/ProxyShopper/orders/${orderId}/upload`,
        // Confirm final price
        CONFIRM_FINAL_PRICE: (orderId) => `${API_URL}/api/ProxyShopper/orders/${orderId}/final-price`,
        // Confirm delivery
        CONFIRM_DELIVERY: (orderId) => `${API_URL}/api/ProxyShopper/orders/${orderId}/delivery`,
        // Replace/remove product
        REPLACE_OR_REMOVE_PRODUCT: (orderId, productId) => `${API_URL}/api/ProxyShopper/orders/${orderId}/items/${productId}`,
        // Smart search products
        SMART_SEARCH_PRODUCTS: `${API_URL}/api/ProxyShopper/products/smart-search`,
        // Order history
        ORDER_HISTORY: `${API_URL}/api/ProxyShopper/order-history`,
        // Cancel order
        CANCEL_ORDER: (orderId) => `${API_URL}/api/ProxyShopper/orders/${orderId}/cancel`,
        // Registration
        REGISTRATION: `${API_URL}/api/proxyshopperregistration`,
        GET_MY_REGISTRATION: `${API_URL}/api/proxyshopperregistration/my`,
        GET_ALL_REGISTRATION: `${API_URL}/api/proxyshopperregistration`,
        APPROVE_REGISTRATION: `${API_URL}/api/proxyshopperregistration/approve`,
        // Profile
        PROFILE: `${API_URL}/api/ProxyShopper/profile`,
        UPDATE_PROFILE: `${API_URL}/api/ProxyShopper/profile`,
        // Upload proof of purchase
        UPLOAD_PROOF: (orderId) => `${API_URL}/api/ProxyShopper/orders/${orderId}/proof`,
        GET_PROOF: (orderId) => `${API_URL}/api/ProxyShopper/orders/${orderId}/proof`,
    },

    // Proxy Request Endpoints (Buyer side)
    PROXY_REQUEST: {
        // Get my requests (buyer)
        GET_MY_REQUESTS: `${API_URL}/ProxyShopper/requests/my-requests`,
        // Get request detail
        GET_REQUEST_DETAIL: (requestId) => `${API_URL}/ProxyShopper/requests/${requestId}`,
        // Create new request
        CREATE_REQUEST: `${API_URL}/ProxyShopper/requests`,
        // Approve proposal and pay
        APPROVE_PROPOSAL: (requestId) => `${API_URL}/ProxyShopper/orders/${requestId}/approve-pay`,
        // Confirm delivery
        CONFIRM_DELIVERY: (requestId) => `${API_URL}/ProxyShopper/orders/${requestId}/confirm-delivery`,
        // Cancel request (only when status is Open)
        CANCEL_REQUEST: (requestId) => `${API_URL}/ProxyShopper/requests/${requestId}/cancel`,
        // Reject proposal and request new one
        REJECT_PROPOSAL: (orderId) => `${API_URL}/ProxyShopper/orders/${orderId}/reject-proposal`,
    },
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
        // Update product status (for admin)
        UPDATE_STATUS: (id) => `${API_URL}/api/product/${id}/status`,
        // Toggle product status for my-store
        TOGGLE_STATUS_MY_STORE: (productId, enable) => `${API_URL}/api/Store/my-store/products/${productId}/toggle?enable=${enable}`,

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

    // Product Unit Endpoints
    PRODUCT_UNIT: {
        GET_ACTIVE: `${API_URL}/api/ProductUnit`, // Public - Active units
        GET_ALL_ADMIN: `${API_URL}/api/ProductUnit/admin`, // Admin - All units with pagination
        GET_BY_ID: (id) => `${API_URL}/api/ProductUnit/${id}`,
        CREATE: `${API_URL}/api/ProductUnit`,
        UPDATE: (id) => `${API_URL}/api/ProductUnit/${id}`,
        DELETE: (id) => `${API_URL}/api/ProductUnit/${id}`,
        TOGGLE: (id) => `${API_URL}/api/ProductUnit/${id}/toggle`,
        SEARCH: `${API_URL}/api/ProductUnit/search`,
        SEARCH_ADMIN: `${API_URL}/api/ProductUnit/admin/search`,
        GET_BY_TYPE: (unitType) => `${API_URL}/api/ProductUnit/type/${unitType}`,
        REORDER: `${API_URL}/api/ProductUnit/reorder`,
        GET_UNIT_TYPES: `${API_URL}/api/ProductUnit/types`,
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

        // 5-State Order Management APIs
        CONFIRM: (id) => `${API_URL}/api/order/${id}/confirm`,              // Seller xác nhận còn hàng (Pending -> Confirmed)
        MARK_PAID: (id) => `${API_URL}/api/order/${id}/mark-paid`,          // Seller xác nhận đã nhận tiền (Confirmed -> Paid)
        COMPLETE: (id) => `${API_URL}/api/order/${id}/complete`,            // Buyer xác nhận đã nhận hàng (Paid -> Completed)
        CANCEL: (id) => `${API_URL}/api/order/${id}/cancel`,                // Hủy đơn hàng với lý do

        // Buyer Order Management
        GET_BUYER_ORDERS: (buyerId) => `${API_URL}/api/Order/buyer/${buyerId}`,
        FILTER_ORDERS: `${API_URL}/api/Order/filter`,
        REORDER: (id) => `${API_URL}/api/Order/${id}/reorder`,
        REVIEW: (id) => `${API_URL}/api/Order/${id}/review`,

        // Seller Order Management  
        GET_SELLER_ORDERS: `${API_URL}/api/Order/seller/my`,
        GET_ORDER_STATS: (sellerId) => `${API_URL}/api/Order/seller/${sellerId}/stats`,

        // Admin Order Management
        GET_ALL_ADMIN: `${API_URL}/api/Order/admin/orders`,
        BULK_COMPLETE: `${API_URL}/api/Order/bulk/complete`,
        BULK_CANCEL: `${API_URL}/api/Order/bulk/cancel`,

        // Cart to Orders
        PLACE_FROM_CART: `${API_URL}/api/order/place-orders-from-cart`,
    },

    // Category Endpoints
    CATEGORY: {
        GET_ALL: `${API_URL}/api/category`,
        GET_ALL_ADMIN: `${API_URL}/api/category/admin`,
        GET_BY_ID: (id) => `${API_URL}/api/category/${id}`,
        CREATE: `${API_URL}/api/category`,
        UPDATE: (id) => `${API_URL}/api/category/${id}`,
        DELETE: (id) => `${API_URL}/api/category/${id}`,
        TOGGLE: (id) => `${API_URL}/api/category/${id}/toggle`,
        SEARCH: `${API_URL}/api/category/search`,
        SEARCH_ADMIN: `${API_URL}/api/category/searchAdmin`,
        FILTER: `${API_URL}/api/category/filter`,
        FILTER_ADMIN: `${API_URL}/api/category/filterAdmin`,
    },

    // Category Registration Endpoints
    CATEGORY_REGISTRATION: {
        GET_ALL: `${API_URL}/api/categoryregistration`, // Admin/MarketStaff - Get all registrations
        CREATE: `${API_URL}/api/categoryregistration`, // Seller - Register new category
        APPROVE: (id) => `${API_URL}/api/categoryregistration/${id}/approve`, // Admin/MarketStaff - Approve
        REJECT: (id) => `${API_URL}/api/categoryregistration/${id}/reject`, // Admin/MarketStaff - Reject
    },

    // Market Endpoints
    MARKET: {
        GET_ALL: `${API_URL}/api/Market/admin`, // Admin endpoint for all markets
        GET_ACTIVE: `${API_URL}/api/Market`, // Public endpoint for active markets only
        GET_BY_ID: (id) => `${API_URL}/api/Market/${id}`,
        CREATE: `${API_URL}/api/Market`,
        UPDATE: (id) => `${API_URL}/api/Market/${id}`,
        DELETE: (id) => `${API_URL}/api/Market/${id}`,
        TOGGLE_STATUS: (id) => `${API_URL}/api/Market/${id}/toggle`,
        SEARCH: `${API_URL}/api/Market/search`,
        SEARCH_ADMIN: `${API_URL}/api/Market/admin/search`,
        FILTER: `${API_URL}/api/Market/filter`,
        FILTER_ADMIN: `${API_URL}/api/Market/admin/filter`,
        ADMIN_GET_ALL: `${API_URL}/api/Market/admin`,
        ADMIN_SEARCH: `${API_URL}/api/Market/admin/search`,
        ADMIN_FILTER: `${API_URL}/api/Market/admin/filter`,
    },

    // Market Fee Endpoints
    MARKET_FEE: {
        GET_ALL: `${API_URL}/api/marketfee`,
        GET_BY_ID: (id) => `${API_URL}/api/marketfee/${id}`,
        CREATE: `${API_URL}/api/marketfee`,
        UPDATE: (id) => `${API_URL}/api/marketfee/${id}`,
        DELETE: (id) => `${API_URL}/api/marketfee/${id}`,
        GET_BY_MARKET: (marketId) => `${API_URL}/api/marketfee/market/${marketId}`,
        PAY: `${API_URL}/api/marketfee/pay`,
        STATISTICS: `${API_URL}/api/marketfee/statistics`,
        STATISTICS_BY_MARKET: (marketId) => `${API_URL}/api/marketfee/statistics/${marketId}`,
    },

    // Market Rule Endpoints
    MARKET_RULE: {
        GET_ALL: `${API_URL}/api/marketrule`,
        GET_BY_ID: (id) => `${API_URL}/api/marketrule/${id}`,
        CREATE: `${API_URL}/api/marketrule`,
        UPDATE: (id) => `${API_URL}/api/marketrule/${id}`,
        DELETE: (id) => `${API_URL}/api/marketrule/${id}`,
        GET_BY_MARKET: (marketId) => `${API_URL}/api/marketrule/market/${marketId}`,
        GET_PUBLIC: (marketId) => `${API_URL}/api/marketrule/public/${marketId}`,
        TOGGLE_STATUS: (id) => `${API_URL}/api/marketrule/${id}/toggle`,
        SEARCH: `${API_URL}/api/marketrule/search`,
        STATISTICS: `${API_URL}/api/marketrule/statistics`,
        STATISTICS_BY_MARKET: (marketId) => `${API_URL}/api/marketrule/statistics/${marketId}`,
    },

    // Store Endpoints
    STORE: {
        MY_STORE: `${API_URL}/api/Store/my-store`,
        GET_ALL: `${API_URL}/api/store`,
        GET_ALL_ADMIN: `${API_URL}/api/store/admin`,
        GET_BY_ID: (id) => `${API_URL}/api/store/${id}`,
        CREATE: `${API_URL}/api/store`,
        UPDATE: (id) => `${API_URL}/api/store/${id}`,
        DELETE: (id) => `${API_URL}/api/store/${id}`,
        SUSPEND: (id) => `${API_URL}/api/store/${id}/suspend`,
        REACTIVATE: (id) => `${API_URL}/api/store/${id}/reactivate`,
        TOGGLE_STATUS: (storeId) => `${API_URL}/api/Store/${storeId}/toggle`,
        SEARCH: `${API_URL}/api/store/search`,
        SEARCH_ADMIN: `${API_URL}/api/store/admin/search`,
        NEARBY: `${API_URL}/api/store/nearby`,
        GET_BY_SELLER: `${API_URL}/api/store/seller`,
        GET_BY_SELLER_ID: (sellerId) => `${API_URL}/api/store/seller/${sellerId}`,
        GET_STATISTICS: (id) => `${API_URL}/api/store/${id}/statistics`,

        // Payment Management Endpoints
        PAYMENT_OVERVIEW: `${API_URL}/api/MarketFeePayment/admin/stores-payment-overview`,
        UPDATE_PAYMENT_STATUS: (paymentId) => `${API_URL}/api/MarketFeePayment/admin/payment/${paymentId}/update-status`,
        EXPORT_PAYMENT: `${API_URL}/api/MarketFeePayment/admin/payment/export`,
        CREATE_PAYMENT: `${API_URL}/api/MarketFeePayment/admin/create-payment`,
        CREATE_PAYMENT_FOR_MARKET: `${API_URL}/api/MarketFeePayment/admin/create-payment-for-market`,

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
        UPDATE_ITEM: (userId, cartItemId) => `${API_URL}/api/Cart/${userId}/items/${cartItemId}`,
        REMOVE_ITEM: (userId, cartItemId) => `${API_URL}/api/Cart/${userId}/items/${cartItemId}`,
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
        REGISTER: `${API_URL}/api/SellerRegistration`,
        GET_MY: `${API_URL}/api/SellerRegistration/my`,
        GET_ALL: `${API_URL}/api/SellerRegistration`,
        APPROVE: `${API_URL}/api/SellerRegistration/approve`,
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
        GET_UNREAD_COUNT: `${API_URL}/api/notification/unread-count`,
        MARK_READ: (id) => `${API_URL}/api/notification/${id}/mark-as-read`,
        MARK_ALL_READ: `${API_URL}/api/notification/mark-all-as-read`,
    },

    // Favorite Endpoints
    FAVORITE: {
        GET_ALL: `${API_URL}/api/favorite`,
        ADD: `${API_URL}/api/favorite/add`,
        REMOVE: (productId) => `${API_URL}/api/favorite/${productId}`,
        CHECK: (productId) => `${API_URL}/api/favorite/check/${productId}`,
    },

    FAST_BARGAIN: {
        GET_ALL_ADMIN: `${API_URL}/api/FastBargain/admin`,
        GET_BY_BUYER: (userId) => `${API_URL}/api/FastBargain/user/${userId}`,
        GET_BY_SELLER: (sellerId) => `${API_URL}/api/FastBargain/seller/${sellerId}`,
        GET_BY_ID: (id) => `${API_URL}/api/FastBargain/${id}`,
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

    // FAQ Endpoints
    FAQ: {
        GET_ALL: `${API_URL}/api/faq`,
        GET_BY_ID: (id) => `${API_URL}/api/faq/${id}`,
        CREATE: `${API_URL}/api/faq`,
        UPDATE: (id) => `${API_URL}/api/faq/${id}`,
        DELETE: (id) => `${API_URL}/api/faq/${id}`,
    },

    // Fast Bargain Endpoints
    FAST_BARGAIN: {
        START: `${API_URL}/api/fastbargain/start`,
        PROPOSE: `${API_URL}/api/fastbargain/propose`,
        ACTION: `${API_URL}/api/fastbargain/action`,
        GET_BY_ID: (id) => `${API_URL}/api/fastbargain/${id}`,
        GET_BY_USER: (userId) => `${API_URL}/api/fastbargain/user/${userId}`,
        GET_BY_SELLER: (sellerId) => `${API_URL}/api/fastbargain/seller/${sellerId}`,
        GET_ADMIN: `${API_URL}/api/fastbargain/admin`,
    },

    // Report Endpoints
    REPORT: {
        GET_ALL: `${API_URL}/api/report`,
        GET_BY_ID: (reportId) => `${API_URL}/api/report/${reportId}`,
        GET_MY_REPORTS: `${API_URL}/api/report/my-reports`,
        CREATE: `${API_URL}/api/report`,
        GET_STATISTICS: `${API_URL}/api/report/statistics`,
        UPDATE_STATUS: (reportId) => `${API_URL}/api/report/${reportId}/status`,
    },

    // Review Endpoints
    REVIEW: {
        CREATE: `${API_URL}/api/Review`,
        UPDATE: (reviewId) => `${API_URL}/api/Review/${reviewId}`,
        GET_BY_TARGET: `${API_URL}/api/Review/target`,
        GET_USER_REVIEW: `${API_URL}/api/Review/user-review`,
        DELETE: (reviewId) => `${API_URL}/api/Review/${reviewId}`,
    },

    // Market Fee Endpoints
    MARKET_FEE: {
        GET_ALL: `${API_URL}/api/MarketFee`,
        GET_BY_ID: (feeId) => `${API_URL}/api/MarketFee/${feeId}`,
        CREATE: `${API_URL}/api/MarketFee`,
        UPDATE: (feeId) => `${API_URL}/api/MarketFee/${feeId}`,
        DELETE: (feeId) => `${API_URL}/api/MarketFee/${feeId}`,
        GET_BY_MARKET: (marketId) => `${API_URL}/api/MarketFee/market/${marketId}`,
        PAY: `${API_URL}/api/MarketFee/pay`,
        STATISTICS: `${API_URL}/api/MarketFee/statistics`,
        STATISTICS_BY_MARKET: (marketId) => `${API_URL}/api/MarketFee/statistics/market/${marketId}`,
    },

    // Market Fee Type Endpoints
    MARKET_FEE_TYPE: {
        GET_ALL: `${API_URL}/api/MarketFeeType`,
        GET_BY_ID: (feeTypeId) => `${API_URL}/api/MarketFeeType/${feeTypeId}`,
        CREATE: `${API_URL}/api/MarketFeeType`,
        UPDATE: (feeTypeId) => `${API_URL}/api/MarketFeeType/${feeTypeId}`,
        DELETE: (feeTypeId) => `${API_URL}/api/MarketFeeType/${feeTypeId}`,
        RESTORE: (feeTypeId) => `${API_URL}/api/MarketFeeType/${feeTypeId}/restore`,
    },
};

export default API_ENDPOINTS;
