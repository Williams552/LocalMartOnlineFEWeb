import { API_ENDPOINTS } from '../config/apiEndpoints';

class RecommendationService {
    /**
     * Get product recommendations for current user
     * @param {number} count - Number of recommendations to fetch (default: 5)
     * @returns {Promise} API response with recommended products
     */
    async getRecommendationsForUser(count = 5) {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.warn('No authentication token found for recommendations');
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để xem đề xuất sản phẩm',
                    data: []
                };
            }

            const response = await fetch(API_ENDPOINTS.RECOMMENDATION.GET_FOR_USER(count), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            // Log successful response for debugging
            console.log('🎯 Recommendations fetched successfully:', result);

            return {
                success: true,
                data: result.data || [],
                count: result.count || 0,
                userId: result.userId,
                timestamp: result.timestamp
            };

        } catch (error) {
            console.error('❌ Error fetching recommendations:', error);
            return {
                success: false,
                message: error.message || 'Không thể tải đề xuất sản phẩm',
                data: []
            };
        }
    }

    /**
     * Get detailed product information for recommended products
     * This method fetches full product details for the recommended product IDs
     * @param {Array} recommendedProducts - Array of recommendation objects with productId
     * @returns {Promise} Array of full product details
     */
    async getRecommendedProductsDetails(recommendedProducts) {
        try {
            if (!recommendedProducts || recommendedProducts.length === 0) {
                return [];
            }

            // Import productService dynamically to avoid circular dependency
            const productService = await import('./productService');
            
            const productDetailsPromises = recommendedProducts.map(async (recommendation) => {
                try {
                    const productResult = await productService.default.getProductById(recommendation.productId);
                    
                    if (productResult.success && productResult.data) {
                        // Enhance product with recommendation score
                        return {
                            ...productResult.data,
                            recommendationScore: recommendation.score,
                            recommendedPrice: recommendation.price // Price from recommendation API
                        };
                    }
                    return null;
                } catch (error) {
                    console.error(`❌ Error fetching product ${recommendation.productId}:`, error);
                    return null;
                }
            });

            const productDetails = await Promise.all(productDetailsPromises);
            
            // Filter out null results and return valid products
            const validProducts = productDetails.filter(product => product !== null);
            
            console.log(`✅ Retrieved ${validProducts.length} recommended product details out of ${recommendedProducts.length} recommendations`);
            
            return validProducts;

        } catch (error) {
            console.error('❌ Error getting recommended products details:', error);
            return [];
        }
    }
}

export default new RecommendationService();
