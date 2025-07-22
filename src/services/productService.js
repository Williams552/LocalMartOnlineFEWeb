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
    // Create new product
    async createProduct(payload) {
        try {
            const response = await apiClient.post('http://localhost:5183/api/Product', payload);
            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Thêm sản phẩm thành công'
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Thêm sản phẩm thất bại'
                };
            }
        } catch (error) {
            console.error('❌ ProductService: Error creating product:', error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'Có lỗi xảy ra khi thêm sản phẩm'
            };
        }
    }
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
            if (params.marketId) queryParams.append('marketId', params.marketId);

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
                keyword: filterParams.search || filterParams.keyword || undefined,
                categoryId: filterParams.categoryId || undefined,
                storeId: filterParams.storeId || undefined,
                marketId: filterParams.marketId || undefined,
                minPrice: filterParams.minPrice || undefined,
                maxPrice: filterParams.maxPrice || undefined,
                status: filterParams.status || 'Active', // Only get active products for public view
                sortBy: filterParams.sortBy || 'created',
                ascending: filterParams.ascending !== false
            };

            // Remove undefined values
            Object.keys(filterBody).forEach(key =>
                filterBody[key] === undefined && delete filterBody[key]
            );

            console.log('🔍 Calling filter API with body:', filterBody);
            const response = await apiClient.post(API_ENDPOINTS.PRODUCT.FILTER, filterBody);
            console.log('📦 Filter API response:', response.data);

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
            console.error('❌ Error filtering products:', error);
            throw error;
        }
    }

    // Search products using backend search API (GET /api/product/search)
    async searchProductsAPI(searchParams = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Backend search API expects 'keyword' not 'search'
            if (searchParams.search || searchParams.keyword) {
                queryParams.append('keyword', searchParams.search || searchParams.keyword);
            }
            if (searchParams.categoryId) queryParams.append('categoryId', searchParams.categoryId);
            if (searchParams.marketId) queryParams.append('marketId', searchParams.marketId);
            if (searchParams.latitude) queryParams.append('latitude', searchParams.latitude);
            if (searchParams.longitude) queryParams.append('longitude', searchParams.longitude);
            if (searchParams.page) queryParams.append('page', searchParams.page);
            if (searchParams.pageSize) queryParams.append('pageSize', searchParams.pageSize);

            const url = queryParams.toString()
                ? `${API_ENDPOINTS.PRODUCT.SEARCH}?${queryParams}`
                : API_ENDPOINTS.PRODUCT.SEARCH;

            console.log('🔍 Calling search API:', url);
            const response = await apiClient.get(url);
            console.log('📦 Search API response:', response.data);

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
            console.error('❌ Error searching products via API:', error);
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

    // ========== SELLER METHODS ==========

    // Get all products for seller (including inactive)
    async getSellerProducts(page = 1, pageSize = 20) {
        try {
            console.log('🛍️ ProductService: Getting seller products (my-store)...', { page, pageSize });

            const response = await apiClient.get(`/api/store/my-store/products`, {
                params: { page, pageSize }
            });

            if (response.data?.success && response.data.data) {
                console.log('✅ ProductService: Seller products fetched successfully');

                const transformedProducts = response.data.data.items?.map(product => this.transformProduct(product)) || [];

                return {
                    success: true,
                    data: {
                        items: transformedProducts,
                        totalCount: response.data.data.totalCount || 0,
                        page: response.data.data.page || page,
                        pageSize: response.data.data.pageSize || pageSize
                    },
                    message: response.data.message || 'Lấy danh sách sản phẩm thành công'
                };
            } else {
                throw new Error(response.data?.message || 'Failed to fetch seller products');
            }
        } catch (error) {
            console.error('❌ ProductService: Error fetching seller products:', error);

            if (error.response?.status === 401) {
                throw new Error('Unauthorized - Please login again');
            }

            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra khi tải danh sách sản phẩm'
            );
        }
    }

    // Search products for seller
    async searchSellerProducts(storeId, keyword, page = 1, pageSize = 20) {
        try {
            console.log('🔍 ProductService: Searching seller products...', { storeId, keyword, page, pageSize });

            const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/seller/store/${storeId}/search`, {
                params: { keyword, page, pageSize }
            });

            if (response.data?.success) {
                console.log('✅ ProductService: Seller products search successful');

                const transformedProducts = response.data.data.items?.map(product => this.transformProduct(product)) || [];

                return {
                    success: true,
                    data: {
                        items: transformedProducts,
                        totalItems: response.data.data.totalItems || 0,
                        currentPage: response.data.data.currentPage || page,
                        totalPages: response.data.data.totalPages || 1,
                        hasNextPage: response.data.data.hasNextPage || false,
                        hasPreviousPage: response.data.data.hasPreviousPage || false
                    },
                    message: response.data.message || 'Tìm kiếm sản phẩm thành công'
                };
            } else {
                throw new Error(response.data?.message || 'Failed to search seller products');
            }
        } catch (error) {
            console.error('❌ ProductService: Error searching seller products:', error);
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra khi tìm kiếm sản phẩm'
            );
        }
    }

    // Filter products for seller
    async filterSellerProducts(filterData) {
        try {
            console.log('🎯 ProductService: Filtering seller products...', filterData);

            const response = await apiClient.post(`${API_ENDPOINTS.PRODUCTS}/seller/filter`, filterData);

            if (response.data?.success) {
                console.log('✅ ProductService: Seller products filter successful');

                const transformedProducts = response.data.data.items?.map(product => this.transformProduct(product)) || [];

                return {
                    success: true,
                    data: {
                        items: transformedProducts,
                        totalItems: response.data.data.totalItems || 0,
                        currentPage: response.data.data.currentPage || 1,
                        totalPages: response.data.data.totalPages || 1,
                        hasNextPage: response.data.data.hasNextPage || false,
                        hasPreviousPage: response.data.data.hasPreviousPage || false
                    },
                    message: response.data.message || 'Lọc sản phẩm thành công'
                };
            } else {
                throw new Error(response.data?.message || 'Failed to filter seller products');
            }
        } catch (error) {
            console.error('❌ ProductService: Error filtering seller products:', error);
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra khi lọc sản phẩm'
            );
        }
    }

    // Delete product
    async deleteProduct(productId) {
        try {
            console.log('🗑️ ProductService: Deleting product...', productId);

            const response = await apiClient.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}`);

            if (response.data?.success) {
                console.log('✅ ProductService: Product deleted successfully');
                return {
                    success: true,
                    message: response.data.message || 'Xóa sản phẩm thành công'
                };
            } else {
                throw new Error(response.data?.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('❌ ProductService: Error deleting product:', error);
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra khi xóa sản phẩm'
            );
        }
    }

    // Toggle product status
    async toggleProductStatus(productId, isActive) {
        try {
            console.log('🔄 ProductService: Toggling product status (my-store endpoint)...', { productId, isActive });
            // Use correct endpoint and method as in Swagger
            const url = API_ENDPOINTS.PRODUCT.TOGGLE_STATUS_MY_STORE(productId, isActive);
            const response = await apiClient.patch(url);
            if (response.data?.success) {
                console.log('✅ ProductService: Product status toggled successfully');
                return {
                    success: true,
                    message: response.data.message || 'Thay đổi trạng thái sản phẩm thành công'
                };
            } else {
                throw new Error(response.data?.message || 'Failed to toggle product status');
            }
        } catch (error) {
            console.error('❌ ProductService: Error toggling product status:', error);
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra khi thay đổi trạng thái sản phẩm'
            );
        }
    }

    // Get product details (helper method for duplicate)
    async getProductDetails(productId) {
        try {
            console.log('🔍 ProductService: Getting product details...', productId);

            const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/${productId}`);

            if (response.data?.success) {
                console.log('✅ ProductService: Product details fetched successfully');
                return {
                    success: true,
                    data: this.transformProduct(response.data.data),
                    message: response.data.message || 'Lấy thông tin sản phẩm thành công'
                };
            } else {
                throw new Error(response.data?.message || 'Failed to get product details');
            }
        } catch (error) {
            console.error('❌ ProductService: Error getting product details:', error);
            return {
                success: false,
                message: error.response?.data?.message ||
                    error.message ||
                    'Có lỗi xảy ra khi lấy thông tin sản phẩm'
            };
        }
    }

    // Transform product data to frontend format
    transformProduct(product) {
        return {
            id: product.id,
            name: product.name || 'Unnamed Product',
            description: product.description || '',
            price: product.price || 0,
            category: product.categoryName || product.category || 'Chưa phân loại',
            categoryId: product.categoryId,
            storeId: product.storeId,
            storeName: product.storeName || '',
            images: product.imageUrls || product.images || [],
            unit: product.unit || product.unitName || 'kg',
            unitName: product.unitName || product.unit || 'kg',
            minimumQuantity: product.minimumQuantity || 1,
            soldQuantity: product.soldQuantity || 0,
            viewCount: product.viewCount || 0,
            likeCount: product.likeCount || 0,
            isAvailable: product.isAvailable !== false,
            status: product.status,
            statusDisplay: product.statusDisplay || '',
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        };
    }

    // Duplicate product
    async duplicateProduct(productId) {
        try {
            console.log('📋 ProductService: Duplicating product...', productId);

            // First get the product details
            const productDetails = await this.getProductDetails(productId);
            if (!productDetails.success) {
                throw new Error('Không thể lấy thông tin sản phẩm để sao chép');
            }

            // Create a new product with similar data
            const originalProduct = productDetails.data;
            const duplicateData = {
                name: `${originalProduct.name} (Bản sao)`,
                description: originalProduct.description,
                price: originalProduct.price,
                categoryId: originalProduct.categoryId,
                storeId: originalProduct.storeId,
                images: originalProduct.images,
                unit: originalProduct.unit,
                minimumQuantity: originalProduct.minimumQuantity,
                stockQuantity: originalProduct.stockQuantity,
                isAvailable: false // Start as inactive for review
            };

            const response = await apiClient.post(API_ENDPOINTS.PRODUCTS, duplicateData);

            if (response.data?.success) {
                console.log('✅ ProductService: Product duplicated successfully');
                return {
                    success: true,
                    data: this.transformProduct(response.data.data),
                    message: response.data.message || 'Sao chép sản phẩm thành công'
                };
            } else {
                throw new Error(response.data?.message || 'Failed to duplicate product');
            }
        } catch (error) {
            console.error('❌ ProductService: Error duplicating product:', error);
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Có lỗi xảy ra khi sao chép sản phẩm'
            );
        }
    }
}

export default new ProductService();
