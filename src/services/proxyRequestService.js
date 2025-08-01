import authService from './authService';

const API_BASE_URL = 'http://localhost:5183/api';

const proxyRequestService = {
    // Lấy danh sách yêu cầu của buyer
    getMyRequests: async () => {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/ProxyShopper/requests/my-requests`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching my proxy requests:', error);
            throw error;
        }
    },

    // Duyệt đề xuất và thanh toán
    approveProposal: async (requestId) => {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/ProxyShopper/orders/${requestId}/approve-pay`,
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error approving proposal:', error);
            throw error;
        }
    },

    // Xác nhận nhận hàng
    confirmDelivery: async (requestId) => {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/ProxyShopper/orders/${requestId}/confirm-delivery`,
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error confirming delivery:', error);
            throw error;
        }
    },

    // Hủy yêu cầu (chỉ khi chưa có proxy nhận - trạng thái Open)
    cancelRequest: async (requestId, reason) => {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/ProxyShopper/requests/${requestId}/cancel`,
                { 
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error cancelling request:', error);
            throw error;
        }
    },

    // Từ chối đề xuất và yêu cầu proxy lên đơn lại
    rejectProposal: async (orderId, reason) => {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/ProxyShopper/orders/${orderId}/reject-proposal`,
                { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error rejecting proposal:', error);
            throw error;
        }
    },

    // Lấy chi tiết một yêu cầu
    getRequestDetail: async (requestId) => {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/ProxyShopper/requests/${requestId}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching request detail:', error);
            throw error;
        }
    }
};

export default proxyRequestService;