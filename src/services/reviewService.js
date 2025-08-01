import apiService from './apiService';

class ReviewService {
    constructor() {
        this.baseURL = '/api/Review';
    }

    // Tạo review mới
    async createReview(userId, reviewData) {
        try {
            console.log('Creating review with data:', { userId, reviewData });
            const response = await apiService.post(`${this.baseURL}?userId=${userId}`, reviewData);
            console.log('Create review response:', response);
            return {
                success: true,
                data: response.data,
                message: response.message || 'Đánh giá đã được tạo thành công'
            };
        } catch (error) {
            console.error('Error creating review:', error);
            console.error('Error response details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error config:', error.config);
            
            let errorMessage = 'Không thể tạo đánh giá';
            
            // Customize error message based on server response
            if (error.response?.data?.message) {
                if (error.response.data.message.includes('already reviewed')) {
                    errorMessage = 'Bạn đã đánh giá cửa hàng này rồi';
                } else if (error.response.data.message.includes('completed an order')) {
                    errorMessage = 'Bạn cần mua hàng từ cửa hàng này trước khi có thể đánh giá';
                } else {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Cập nhật review
    async updateReview(reviewId, userId, reviewData) {
        try {
            console.log('Updating review with data:', { reviewId, userId, reviewData });
            const response = await apiService.put(`${this.baseURL}/${reviewId}?userId=${userId}`, reviewData);
            console.log('Update review response:', response);
            return {
                success: true,
                data: response.data,
                message: response.message || 'Đánh giá đã được cập nhật'
            };
        } catch (error) {
            console.error('Error updating review:', error);
            console.error('Error response details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể cập nhật đánh giá'
            };
        }
    }

    // Xóa review
    async deleteReview(reviewId, userId) {
        try {
            const response = await apiService.delete(`${this.baseURL}/${reviewId}?userId=${userId}`);
            return {
                success: true,
                message: response.message || 'Đánh giá đã được xóa'
            };
        } catch (error) {
            console.error('Error deleting review:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xóa đánh giá'
            };
        }
    }

    // Lấy reviews của user
    async getUserReviews(userId) {
        try {
            const response = await apiService.get(`${this.baseURL}/user/${userId}`);
            return {
                success: true,
                data: response.data || response,
                reviews: response.data?.reviews || response.reviews || []
            };
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải đánh giá của người dùng',
                reviews: []
            };
        }
    }

    // Kiểm tra xem đơn hàng đã được đánh giá chưa
    async isOrderReviewed(orderId, userId) {
        try {
            const response = await apiService.get(`${this.baseURL}/order/${orderId}/reviewed?userId=${userId}`);
            return {
                success: true,
                isReviewed: response.data?.isReviewed || response.isReviewed || false
            };
        } catch (error) {
            console.error('Error checking order review status:', error);
            return {
                success: false,
                isReviewed: false,
                message: error.response?.data?.message || 'Không thể kiểm tra trạng thái đánh giá'
            };
        }
    }

    // Lấy reviews cho target (Product, Seller, Proxy Shopper)
    async getReviewsForTarget(targetType, targetId, filters = {}) {
        try {
            // Filter out null, undefined, and empty values
            const cleanFilters = {};
            Object.keys(filters).forEach(key => {
                const value = filters[key];
                if (value !== null && value !== undefined && value !== '' && value !== 'null') {
                    // Additional validation for specific fields
                    if (key === 'rating' && (isNaN(value) || value < 1 || value > 5)) {
                        return; // Skip invalid rating values
                    }
                    if (key === 'page' && (isNaN(value) || value < 1)) {
                        cleanFilters[key] = 1; // Default to page 1
                        return;
                    }
                    if (key === 'pageSize' && (isNaN(value) || value < 1)) {
                        cleanFilters[key] = 10; // Default page size
                        return;
                    }
                    cleanFilters[key] = value;
                }
            });

            const params = new URLSearchParams({
                targetType,
                targetId,
                ...cleanFilters
            }); console.log('Fetching reviews with params:', params.toString());
            const response = await apiService.get(`${this.baseURL}/target?${params}`);

            // Handle different response formats
            const data = response.data || response;
            const reviews = data.reviews || data.Reviews || data.items || [];
            const totalCount = data.totalCount || data.TotalCount || data.count || reviews.length;
            const averageRating = data.averageRating || data.AverageRating || data.rating || 0;

            console.log('Reviews API Response:', response);
            console.log('Parsed data:', { reviews, totalCount, averageRating });

            // Validate that reviews is an array
            const validReviews = Array.isArray(reviews) ? reviews : [];

            return {
                success: true,
                data,
                reviews: validReviews,
                totalCount: Number(totalCount) || 0,
                averageRating: Number(averageRating) || 0
            };
        } catch (error) {
            console.error('Error fetching target reviews:', error);
            console.error('Error response:', error.response);
            console.error('Request URL:', `${this.baseURL}/target?${new URLSearchParams({ targetType, targetId, ...filters })}`);

            // Check if it's a 404 or no content error
            if (error.response?.status === 404 || error.response?.status === 204) {
                return {
                    success: true,
                    message: 'Chưa có đánh giá nào',
                    reviews: [],
                    totalCount: 0,
                    averageRating: 0
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể tải đánh giá',
                reviews: [],
                totalCount: 0,
                averageRating: 0
            };
        }
    }

    // Lấy review theo ID
    async getReviewById(reviewId) {
        try {
            const response = await apiService.get(`${this.baseURL}/${reviewId}`);
            return {
                success: true,
                data: response.data || response
            };
        } catch (error) {
            console.error('Error fetching review:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không tìm thấy đánh giá'
            };
        }
    }

    // Lấy reviews cho sản phẩm với phân trang và bộ lọc
    async getProductReviews(productId, options = {}) {
        const {
            page = 1,
            pageSize = 10,
            rating = null,
            sortBy = 'newest'
        } = options;

        const filters = {
            page,
            pageSize,
            sortBy
        };

        if (rating) {
            filters.rating = rating;
        }

        return this.getReviewsForTarget('Product', productId, filters);
    }

    // Format dữ liệu review cho hiển thị
    formatReviewForDisplay(review) {
        if (!review) {
            return null;
        }

        return {
            id: review.id || '',
            userId: review.userId || '',
            userName: review.userName || review.username || 'Người dùng ẩn danh',
            userAvatar: review.userAvatar || review.avatar || null,
            rating: Number(review.rating) || 0,
            comment: review.comment || review.content || '',
            response: review.response || null,
            createdAt: review.createdAt || review.createDate || new Date().toISOString(),
            updatedAt: review.updatedAt || review.updateDate || null,
            isVerifiedPurchase: Boolean(review.isVerifiedPurchase || review.verified),
            helpfulCount: Number(review.helpfulCount || review.helpful) || 0,
            timeAgo: this.getTimeAgo(review.createdAt || review.createDate || new Date().toISOString())
        };
    }

    // Tính toán thời gian đã qua
    getTimeAgo(dateString) {
        const now = new Date();
        const reviewDate = new Date(dateString);
        const diffMs = now - reviewDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) {
            return `${diffDays} ngày trước`;
        } else if (diffHours > 0) {
            return `${diffHours} giờ trước`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} phút trước`;
        } else {
            return 'Vừa xong';
        }
    }

    // Validate dữ liệu review
    validateReviewData(reviewData) {
        const errors = [];

        if (!reviewData.targetType) {
            errors.push('Loại đối tượng đánh giá là bắt buộc');
        }

        if (!reviewData.targetId) {
            errors.push('ID đối tượng đánh giá là bắt buộc');
        }

        if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            errors.push('Đánh giá phải từ 1 đến 5 sao');
        }

        if (reviewData.comment && reviewData.comment.length > 1000) {
            errors.push('Bình luận không được vượt quá 1000 ký tự');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Tính toán rating breakdown
    calculateRatingBreakdown(reviews) {
        const breakdown = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        // Ensure reviews is an array and handle null/undefined
        const validReviews = Array.isArray(reviews) ? reviews : [];

        validReviews.forEach(review => {
            const rating = Number(review?.rating);
            if (rating >= 1 && rating <= 5) {
                breakdown[rating]++;
            }
        });

        const total = validReviews.length;
        const percentages = {};

        for (let i = 1; i <= 5; i++) {
            percentages[i] = total > 0 ? (breakdown[i] / total) * 100 : 0;
        }

        return {
            counts: breakdown,
            percentages,
            total
        };
    }

    // Tính toán average rating
    calculateAverageRating(reviews) {
        const validReviews = Array.isArray(reviews) ? reviews : [];
        if (validReviews.length === 0) return 0;

        const sum = validReviews.reduce((acc, review) => {
            const rating = Number(review?.rating) || 0;
            return acc + rating;
        }, 0);

        return Number((sum / validReviews.length).toFixed(1));
    }

    // Lấy review của user cho một target cụ thể
    async getUserReviewForTarget(targetType, targetId, userId) {
        try {
            console.log('Getting user review for target:', { targetType, targetId, userId });
            const response = await apiService.get(`${this.baseURL}/user-review?targetType=${targetType}&targetId=${targetId}&userId=${userId}`);
            console.log('Get user review response:', response);
            return {
                success: true,
                data: response.data || response
            };
        } catch (error) {
            console.error('Error fetching user review for target:', error);
            console.error('Error response details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            // If 404, user hasn't reviewed this target yet
            if (error.response?.status === 404) {
                console.log('No existing review found (404)');
                return {
                    success: true,
                    data: null
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể kiểm tra đánh giá của người dùng'
            };
        }
    }
}

const reviewService = new ReviewService();
export default reviewService;
