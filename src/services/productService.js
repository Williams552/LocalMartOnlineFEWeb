import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Create axios instance
const createApiClient = () => {
    const client = axios.create({
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add request interceptor for auth token
    client.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Add response interceptor for error handling
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Don't auto redirect for public API calls
            }
            return Promise.reject(error);
        }
    );

    return client;
};

const apiClient = createApiClient();

class ProductService {
    // Get all products
    async getAllProducts(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Add pagination parameters if provided
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);
            if (params.search) queryParams.append('search', params.search);
            if (params.categoryId) queryParams.append('categoryId', params.categoryId);
            if (params.storeId) queryParams.append('storeId', params.storeId);

            const url = queryParams.toString()
                ? `${API_ENDPOINTS.PRODUCT.GET_ALL}?${queryParams}`
                : API_ENDPOINTS.PRODUCT.GET_ALL;

            const response = await apiClient.get(url);

            // Return the items from the API response
            if (response.data && response.data.success && response.data.data) {
                return {
                    items: response.data.data.items || [],
                    totalCount: response.data.data.totalCount || 0,
                    page: response.data.data.page || 1,
                    pageSize: response.data.data.pageSize || 20
                };
            }

            return {
                items: [],
                totalCount: 0,
                page: 1,
                pageSize: 20
            };
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    // Get product by ID
    async getProductById(id) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PRODUCT.GET_BY_ID(id));

            if (response.data && response.data.success && response.data.data) {
                return {
                    success: true,
                    data: this.formatProductForFrontend(response.data.data)
                };
            }

            return {
                success: false,
                message: 'Product not found'
            };
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thông tin sản phẩm'
            };
        }
    }

    // Search products
    async searchProducts(searchTerm, params = {}) {
        try {
            const searchParams = {
                ...params,
                search: searchTerm
            };

            return await this.getAllProducts(searchParams);
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    // Get products by category
    async getProductsByCategory(categoryId, params = {}) {
        try {
            const categoryParams = {
                ...params,
                categoryId: categoryId
            };

            return await this.getAllProducts(categoryParams);
        } catch (error) {
            console.error(`Error fetching products by category ${categoryId}:`, error);
            throw error;
        }
    }

    // Get products by store using correct Backend API
    async getProductsByStore(storeId, params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);

            const url = queryParams.toString()
                ? `${API_ENDPOINTS.PRODUCT.BY_STORE(storeId)}?${queryParams}`
                : API_ENDPOINTS.PRODUCT.BY_STORE(storeId);

            const response = await apiClient.get(url);

            if (response.data && response.data.success && response.data.data) {
                return {
                    items: (response.data.data.items || []).map(item => this.formatProductForFrontend(item)),
                    totalCount: response.data.data.totalCount || 0,
                    page: response.data.data.page || 1,
                    pageSize: response.data.data.pageSize || 20
                };
            }

            return {
                items: [],
                totalCount: 0,
                page: 1,
                pageSize: 20
            };
        } catch (error) {
            console.error(`Error fetching products by store ${storeId}:`, error);
            throw error;
        }
    }

    // Search products in store using correct Backend API
    async searchProductsInStore(storeId, keyword, params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (keyword) queryParams.append('keyword', keyword);
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);

            const url = queryParams.toString()
                ? `${API_ENDPOINTS.PRODUCT.SEARCH_IN_STORE(storeId)}?${queryParams}`
                : API_ENDPOINTS.PRODUCT.SEARCH_IN_STORE(storeId);

            const response = await apiClient.get(url);

            if (response.data && response.data.success && response.data.data) {
                return {
                    items: (response.data.data.items || []).map(item => this.formatProductForFrontend(item)),
                    totalCount: response.data.data.totalCount || 0,
                    page: response.data.data.page || 1,
                    pageSize: response.data.data.pageSize || 20
                };
            }

            return {
                items: [],
                totalCount: 0,
                page: 1,
                pageSize: 20
            };
        } catch (error) {
            console.error(`Error searching products in store ${storeId}:`, error);
            throw error;
        }
    }

    // Filter products in store using correct Backend API
    async filterProductsInStore(storeId, filterParams = {}) {
        try {
            const filterBody = {
                storeId: storeId,
                page: filterParams.page || 1,
                pageSize: filterParams.pageSize || 20,
                keyword: filterParams.keyword || undefined,
                categoryId: filterParams.categoryId || undefined,
                minPrice: filterParams.minPrice || undefined,
                maxPrice: filterParams.maxPrice || undefined,
                status: 'Active', // Only active products for public view
                sortBy: filterParams.sortBy || 'created',
                ascending: filterParams.ascending !== false
            };

            // Remove undefined values
            Object.keys(filterBody).forEach(key =>
                filterBody[key] === undefined && delete filterBody[key]
            );

            const response = await apiClient.post(API_ENDPOINTS.PRODUCT.FILTER_IN_STORE(storeId), filterBody);

            if (response.data && response.data.success && response.data.data) {
                return {
                    items: (response.data.data.items || []).map(item => this.formatProductForFrontend(item)),
                    totalCount: response.data.data.totalCount || 0,
                    page: response.data.data.page || 1,
                    pageSize: response.data.data.pageSize || 20
                };
            }

            return {
                items: [],
                totalCount: 0,
                page: 1,
                pageSize: 20
            };
        } catch (error) {
            console.error(`Error filtering products in store ${storeId}:`, error);
            throw error;
        }
    }

    // Format product data for frontend use
    formatProductForFrontend(product) {
        return {
            id: product.id,
            name: product.name || "Sản phẩm",
            description: product.description || "",
            price: product.price || 0,
            image: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null,
            images: product.imageUrls || [],
            status: product.status || "Active",
            statusDisplay: product.statusDisplay || this.getStatusDisplay(product.status),
            minimumQuantity: product.minimumQuantity || 1,
            storeId: product.storeId || "",
            categoryId: product.categoryId || "",
            unitId: product.unitId || "",
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            // Enhanced fields from joined data (prefer real data from backend)
            seller: product.sellerName || product.seller || null, // Prefer sellerName from backend
            sellerId: product.sellerId || null,
            market: product.storeAddress || product.marketName || product.market || null,
            category: product.categoryName || null,
            // Store information (if available)
            storeName: product.storeName || null,
            storeAddress: product.storeAddress || null,
            // Category information (if available) 
            categoryName: product.categoryName || null
        };
    }

    // Helper method to get status display text
    getStatusDisplay(status) {
        switch (status) {
            case 'Active': return 'Còn hàng';
            case 'OutOfStock': return 'Hết hàng';
            case 'Inactive': return 'Đã xóa';
            default: return 'Không xác định';
        }
    }

    // Get formatted products for frontend
    async getFormattedProducts(params = {}) {
        try {
            const result = await this.getAllProducts(params);

            return {
                ...result,
                items: result.items.map(product => this.formatProductForFrontend(product))
            };
        } catch (error) {
            console.error('Error getting formatted products:', error);
            throw error;
        }
    }

    // Get product with full details (store and category info)
    async getProductsWithDetails(params = {}) {
        try {
            const result = await this.getAllProducts(params);

            // Get unique store IDs and category IDs from products
            const storeIds = [...new Set(result.items.map(p => p.storeId).filter(Boolean))];
            const categoryIds = [...new Set(result.items.map(p => p.categoryId).filter(Boolean))];

            // Fetch store and category data in parallel
            const [storesData, categoriesData] = await Promise.all([
                this.getStoresByIds(storeIds),
                this.getCategoriesByIds(categoryIds)
            ]);

            // Create lookup maps
            const storeMap = new Map(storesData.map(store => [store.id, store]));
            const categoryMap = new Map(categoriesData.map(cat => [cat.id, cat]));

            // Get unique seller IDs from stores
            const sellerIds = [...new Set(storesData.map(store => store.sellerId).filter(Boolean))];

            // Fetch seller data
            const sellersData = await this.getSellersByIds(sellerIds);
            const sellerMap = new Map(sellersData.map(seller => [seller.id, seller]));

            // Enhance products with store, category, and seller info
            const enhancedProducts = result.items.map(product => {
                const store = storeMap.get(product.storeId);
                const category = categoryMap.get(product.categoryId);
                const seller = store ? sellerMap.get(store.sellerId) : null;

                return this.formatProductForFrontend({
                    ...product,
                    // Store information
                    storeName: store?.name || null,
                    storeAddress: store?.address || null,
                    sellerId: store?.sellerId || null,
                    // Seller information (prefer seller name from user data)
                    sellerName: seller?.fullName || seller?.displayName || seller?.username || null,
                    // Category information
                    categoryName: category?.name || null,
                    // Market info (could be from store's market relationship)
                    marketName: store?.marketName || null
                });
            });

            return {
                ...result,
                items: enhancedProducts
            };
        } catch (error) {
            console.error('Error getting products with details:', error);
            // Fallback to basic product data
            return await this.getFormattedProducts(params);
        }
    }

    // Get products with advanced filtering using backend filter API
    async getProductsWithFilter(filterParams = {}) {
        try {
            const filterBody = {
                page: filterParams.page || 1,
                pageSize: filterParams.pageSize || 20,
                keyword: filterParams.search || undefined,
                categoryId: filterParams.categoryId || undefined,
                storeId: filterParams.storeId || undefined,
                minPrice: filterParams.minPrice || undefined,
                maxPrice: filterParams.maxPrice || undefined,
                status: 'Active', // Only get active products for public view
                sortBy: filterParams.sortBy || 'created',
                ascending: filterParams.ascending !== false
            };

            // Remove undefined values
            Object.keys(filterBody).forEach(key =>
                filterBody[key] === undefined && delete filterBody[key]
            );

            const response = await apiClient.post(API_ENDPOINTS.PRODUCT.FILTER, filterBody);

            if (response.data && response.data.success && response.data.data) {
                return {
                    items: (response.data.data.items || []).map(item => this.formatProductForFrontend(item)),
                    totalCount: response.data.data.totalCount || 0,
                    page: response.data.data.page || 1,
                    pageSize: response.data.data.pageSize || 20
                };
            }

            return {
                items: [],
                totalCount: 0,
                page: 1,
                pageSize: 20
            };
        } catch (error) {
            console.error('Error filtering products:', error);
            throw error;
        }
    }

    // Helper method to get stores by IDs
    async getStoresByIds(storeIds) {
        if (!storeIds || storeIds.length === 0) return [];

        try {
            const response = await apiClient.get(API_ENDPOINTS.STORE.GET_ALL);

            if (response.data && response.data.success && response.data.data) {
                const allStores = response.data.data.items || [];
                return allStores.filter(store => storeIds.includes(store.id));
            }

            return [];
        } catch (error) {
            console.error('Error fetching stores:', error);
            return [];
        }
    }

    // Helper method to get categories by IDs
    async getCategoriesByIds(categoryIds) {
        if (!categoryIds || categoryIds.length === 0) return [];

        try {
            const response = await apiClient.get(API_ENDPOINTS.CATEGORY.GET_ALL);

            if (response.data && response.data.success && response.data.data) {
                const allCategories = response.data.data.items || [];
                return allCategories.filter(cat => categoryIds.includes(cat.id));
            }

            return [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Helper method to get sellers by IDs
    async getSellersByIds(sellerIds) {
        if (!sellerIds || sellerIds.length === 0) return [];

        try {
            // Import userService to get seller information
            const userService = (await import('./userService')).default;

            // Get seller information for each seller ID
            const sellerPromises = sellerIds.map(async (sellerId) => {
                try {
                    const sellerResult = await userService.getSellerById(sellerId);
                    return sellerResult.success ? sellerResult.data : null;
                } catch (error) {
                    console.error(`Error fetching seller ${sellerId}:`, error);
                    return null;
                }
            });

            const sellers = await Promise.all(sellerPromises);
            return sellers.filter(seller => seller !== null);
        } catch (error) {
            console.error('Error fetching sellers:', error);
            return [];
        }
    }
}

export default new ProductService();
