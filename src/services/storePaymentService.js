// src/services/storePaymentService.js
import { API_ENDPOINTS } from '../config/apiEndpoints';
import authService from './authService';

class StorePaymentService {
    // Get all stores with payment info
    async getAllStoresWithPaymentInfo(params = {}) {
        try {
            const token = authService.getToken();
            const queryParams = new URLSearchParams();

            // Add filters according to GetAllStoresWithPaymentRequestDto
            if (params.marketId) queryParams.append('MarketId', params.marketId);
            if (params.paymentStatus) queryParams.append('PaymentStatus', params.paymentStatus);
            if (params.month) queryParams.append('Month', params.month.toString());
            if (params.year) queryParams.append('Year', params.year.toString());
            if (params.page) queryParams.append('Page', params.page.toString());
            if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());
            if (params.searchKeyword) queryParams.append('SearchKeyword', params.searchKeyword);

            const finalUrl = `${API_ENDPOINTS.STORE.PAYMENT_OVERVIEW}?${queryParams}`;
            console.log('StorePaymentService - API URL:', finalUrl);
            console.log('StorePaymentService - Params:', params);

            const response = await fetch(finalUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể tải thông tin thanh toán'}`);
            }

            const result = await response.json();
            
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data.stores || [],
                    totalCount: result.data.totalCount || 0,
                    totalPages: result.data.totalPages || 0,
                    currentPage: result.data.currentPage || 1,
                    pageSize: result.data.pageSize || 10
                };
            }

            return {
                success: false,
                message: result.message || 'Không có dữ liệu',
                data: []
            };
        } catch (error) {
            console.error('Error fetching stores with payment info:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server',
                data: []
            };
        }
    }

    // Update store payment status
    async updateStorePaymentStatus(paymentId, updateData) {
        try {
            const token = authService.getToken();
            
            // Format according to UpdateStorePaymentStatusDto
            const updateDto = {
                paymentId: paymentId,
                paymentStatus: updateData.paymentStatus,
                adminNote: updateData.adminNote || '',
                paymentDate: updateData.paymentDate || null
            };

            console.log('StorePaymentService - UpdateDto:', updateDto);

            const response = await fetch(API_ENDPOINTS.STORE.UPDATE_PAYMENT_STATUS(paymentId), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateDto)
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Không tìm thấy thông tin thanh toán');
                }
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể cập nhật trạng thái thanh toán'}`);
            }

            const result = await response.json();
            return {
                success: result.success || true,
                message: result.message || 'Cập nhật trạng thái thanh toán thành công'
            };
        } catch (error) {
            console.error('Error updating payment status:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối server'
            };
        }
    }

    // Helper method to format payment status for display
    formatPaymentStatus(status) {
        const statusMap = {
            'Pending': { text: 'Chờ thanh toán', color: 'orange' },
            'Completed': { text: 'Đã thanh toán', color: 'green' },
            'Failed': { text: 'Thanh toán thất bại', color: 'red' },
            'Overdue': { text: 'Quá hạn', color: 'volcano' }
        };
        return statusMap[status] || { text: status, color: 'default' };
    }

    // Helper method to calculate days overdue
    calculateDaysOverdue(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = now - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    // Helper method to format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    // Export payment data
    async exportPaymentData(params = {}) {
        try {
            const token = authService.getToken();
            const queryParams = new URLSearchParams();

            // Add same filters
            if (params.marketId) queryParams.append('MarketId', params.marketId);
            if (params.paymentStatus) queryParams.append('PaymentStatus', params.paymentStatus);
            if (params.month) queryParams.append('Month', params.month.toString());
            if (params.year) queryParams.append('Year', params.year.toString());
            if (params.searchKeyword) queryParams.append('SearchKeyword', params.searchKeyword);

            const finalUrl = `${API_ENDPOINTS.STORE.EXPORT_PAYMENT}?${queryParams}`;

            const response = await fetch(finalUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error('Không thể xuất dữ liệu thanh toán');
            }

            // Handle file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `store-payment-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return { success: true, message: 'Xuất dữ liệu thành công' };
        } catch (error) {
            console.error('Error exporting payment data:', error);
            return {
                success: false,
                message: error.message || 'Lỗi khi xuất dữ liệu'
            };
        }
    }
}

const storePaymentService = new StorePaymentService();
export { storePaymentService };
export default storePaymentService;
