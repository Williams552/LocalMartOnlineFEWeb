import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';
import { getCurrentUserId } from './authService';

// Create axios instance
const createApiClient = () => {
    const client = axios.create({
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add request interceptor for auth token (temporarily disabled for testing)
    client.interceptors.request.use(
        (config) => {
            // TEMPORARY: Comment out auth token for testing
            // const token = localStorage.getItem('token');
            // if (token) {
            //     config.headers.Authorization = `Bearer ${token}`;
            // }
            console.log('🔧 API Request config:', { url: config.url, method: config.method, headers: config.headers });
            return config;
        },
        (error) => {
            console.error('🔧 API Request error:', error);
            return Promise.reject(error);
        }
    );

    // Add response interceptor for error handling
    client.interceptors.response.use(
        (response) => {
            console.log('📡 API Response success:', { status: response.status, data: response.data });
            return response;
        },
        (error) => {
            console.error('📡 API Response error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userId');
                console.log('❌ 401 Unauthorized - clearing auth data and redirecting');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return client;
};

const apiClient = createApiClient();

class CartService {
    // Get user ID from authService - more secure and proper
    getCurrentUserId() {
        console.log('🔍 CartService: Getting current user ID from authService...');

        try {
            const userId = getCurrentUserId();
            if (userId && userId.trim()) {
                console.log('✓ Found userId from authService:', userId);
                return userId.trim();
            }

            console.error('❌ No valid user ID found from authService');
            return null;
        } catch (error) {
            console.error('❌ Error getting user ID from authService:', error);
            return null;
        }
    }

    // Get cart items for current user
    async getCartItems() {
        try {
            console.log('🛒 CartService.getCartItems() called');

            const userId = this.getCurrentUserId();
            if (!userId) {
                console.error('❌ User not authenticated in getCartItems');
                return {
                    success: false,
                    data: [],
                    message: 'Vui lòng đăng nhập để xem giỏ hàng'
                };
            }

            console.log('🔄 Making API call to get cart items for user:', userId);
            const apiUrl = API_ENDPOINTS.CART.GET_ITEMS(userId);
            console.log('🔗 API URL:', apiUrl);

            const response = await apiClient.get(apiUrl);
            console.log('📡 API Response:', response);

            if (response.data?.success) {
                const items = response.data.data || [];
                console.log('✅ Cart items loaded successfully:', items);
                return {
                    success: true,
                    data: items,
                    message: response.data.message || 'Cart items loaded successfully'
                };
            }

            console.log('⚠️ No cart data in response or success=false');
            return {
                success: true,
                data: [],
                message: response.data?.message || 'No cart items found'
            };
        } catch (error) {
            console.error('❌ Error fetching cart items:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });

            if (error.response?.status === 401) {
                return {
                    success: false,
                    data: [],
                    message: 'Unauthorized. Please login again.'
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải giỏ hàng',
                data: []
            };
        }
    }

    // Add item to cart
    async addToCart(productId, quantity) {
        try {
            console.log('🛒 CartService.addToCart() called with:', { productId, quantity });

            const userId = this.getCurrentUserId();
            if (!userId) {
                console.error('❌ No userId found in addToCart');
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng'
                };
            }

            console.log('✅ User ID found:', userId);

            const apiUrl = API_ENDPOINTS.CART.ADD_ITEM(userId);
            console.log('📡 Add to cart API URL:', apiUrl);

            const requestData = { productId, quantity };
            console.log('📤 Request payload:', requestData);

            const response = await apiClient.post(apiUrl, requestData);
            console.log('✅ Add to cart response:', response);

            if (response.data?.success) {
                console.log('🎉 Add to cart successful:', response.data);
                return {
                    success: true,
                    message: response.data.message || 'Đã thêm vào giỏ hàng thành công',
                    data: response.data.data
                };
            }

            console.log('⚠️ Add to cart failed:', response.data);
            return {
                success: false,
                message: response.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng'
            };
        } catch (error) {
            console.error('❌ Add to Cart Error:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText,
                config: error.config
            });

            if (error.response?.status === 401) {
                return {
                    success: false,
                    message: 'Unauthorized. Please login again.'
                };
            }

            if (error.response?.status === 400) {
                return {
                    success: false,
                    message: error.response.data?.message || 'Invalid request'
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng'
            };
        }
    }

    // Update cart item quantity
    async updateCartItem(productId, quantity) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.put(API_ENDPOINTS.CART.UPDATE_ITEM(userId, productId), {
                quantity
            });

            if (response.data) {
                return {
                    success: true,
                    message: response.data.message || 'Đã cập nhật số lượng thành công',
                    data: response.data
                };
            }

            return {
                success: false,
                message: 'Không thể cập nhật số lượng'
            };
        } catch (error) {
            console.error('Error updating cart item:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể cập nhật số lượng'
            };
        }
    }

    // Remove item from cart
    async removeFromCart(productId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.delete(API_ENDPOINTS.CART.REMOVE_ITEM(userId, productId));

            if (response.data) {
                return {
                    success: true,
                    message: response.data.message || 'Đã xóa sản phẩm khỏi giỏ hàng',
                    data: response.data
                };
            }

            return {
                success: false,
                message: 'Không thể xóa sản phẩm khỏi giỏ hàng'
            };
        } catch (error) {
            console.error('Error removing from cart:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng'
            };
        }
    }

    // Get cart summary (total items, total price)
    calculateCartSummary(cartItems, products) {
        if (!cartItems || !Array.isArray(cartItems) || !products || !Array.isArray(products)) {
            return {
                totalItems: 0,
                totalPrice: 0,
                itemCount: 0
            };
        }

        let totalItems = 0;
        let totalPrice = 0;
        let itemCount = cartItems.length;

        cartItems.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.productId);
            if (product) {
                totalItems += cartItem.quantity;
                totalPrice += product.price * cartItem.quantity;
            }
        });

        return {
            totalItems,
            totalPrice,
            itemCount
        };
    }

    // Format cart items with product details
    formatCartItemsWithProducts(cartItems, products) {
        if (!cartItems || !Array.isArray(cartItems) || !products || !Array.isArray(products)) {
            return [];
        }

        return cartItems.map(cartItem => {
            const product = products.find(p => p.id === cartItem.productId);

            return {
                ...cartItem,
                product: product || null,
                subtotal: product ? product.price * cartItem.quantity : 0
            };
        }).filter(item => item.product !== null); // Remove items where product is not found
    }

    // Clear all cart items (by removing each item individually)
    async clearCart() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.delete(API_ENDPOINTS.CART.CLEAR_CART(userId));

            if (response.data) {
                return {
                    success: true,
                    message: response.data.message || 'Đã xóa tất cả sản phẩm khỏi giỏ hàng'
                };
            }

            return {
                success: false,
                message: 'Không thể xóa giỏ hàng'
            };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xóa giỏ hàng'
            };
        }
    }

    // Get cart summary from backend
    async getCartSummary() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await apiClient.get(API_ENDPOINTS.CART.GET_SUMMARY(userId));

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return {
                success: false,
                message: response.data?.message || 'Không thể tải thông tin tổng quan giỏ hàng'
            };
        } catch (error) {
            console.error('Error fetching cart summary:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thông tin tổng quan giỏ hàng'
            };
        }
    }

    // Clear cart items from localStorage
    clearLocalCart() {
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cartCount');
    }

    // Cache cart data to localStorage
    cacheCartData(cartItems, cartCount) {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            localStorage.setItem('cartCount', cartCount.toString());
        } catch (error) {
            console.warn('Could not cache cart data:', error);
        }
    }

    // Get cached cart data from localStorage
    getCachedCartData() {
        try {
            const cachedItems = localStorage.getItem('cartItems');
            const cachedCount = localStorage.getItem('cartCount');

            return {
                items: cachedItems ? JSON.parse(cachedItems) : [],
                count: cachedCount ? parseInt(cachedCount, 10) : 0
            };
        } catch (error) {
            console.warn('Could not get cached cart data:', error);
            return { items: [], count: 0 };
        }
    }
}

export default new CartService();
