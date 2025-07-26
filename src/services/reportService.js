import { API_ENDPOINTS } from '../config/apiEndpoints';

class ReportService {
    // Get predefined report reasons
    getReportReasons() {
        return [
            {
                value: 'inappropriate_content',
                label: 'Nội dung không phù hợp'
            },
            {
                value: 'fake_product',
                label: 'Sản phẩm giả mạo'
            },
            {
                value: 'misleading_info',
                label: 'Thông tin sai lệch'
            },
            {
                value: 'poor_quality',
                label: 'Chất lượng kém'
            },
            {
                value: 'overpriced',
                label: 'Giá cả không hợp lý'
            },
            {
                value: 'copyright_violation',
                label: 'Vi phạm bản quyền'
            },
            {
                value: 'safety_concern',
                label: 'Vấn đề an toàn'
            },
            {
                value: 'spam',
                label: 'Spam hoặc quảng cáo'
            },
            {
                value: 'other',
                label: 'Lý do khác'
            }
        ];
    }

    // Create a new report
    async createReport(reportData) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = localStorage.getItem('token');

            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập để báo cáo'
                };
            }

            const response = await fetch(`${API_ENDPOINTS.API_BASE}/api/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reportData)
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    message: 'Báo cáo đã được gửi thành công',
                    data: data.data
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Có lỗi xảy ra khi gửi báo cáo'
                };
            }
        } catch (error) {
            console.error('Error creating report:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server. Vui lòng thử lại sau.'
            };
        }
    }

    // Get user's reports
    async getMyReports(page = 1, pageSize = 10) {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await fetch(`${API_ENDPOINTS.API_BASE}/api/report/my-reports?page=${page}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    data: data.data
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Có lỗi xảy ra khi lấy danh sách báo cáo'
                };
            }
        } catch (error) {
            console.error('Error getting my reports:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server. Vui lòng thử lại sau.'
            };
        }
    }

    // Get all reports (Admin only)
    async getAllReports(page = 1, pageSize = 20, filters = {}) {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                ...filters
            });

            const response = await fetch(`${API_ENDPOINTS.API_URL}/api/report?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    data: data.data
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Có lỗi xảy ra khi lấy danh sách báo cáo'
                };
            }
        } catch (error) {
            console.error('Error getting all reports:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server. Vui lòng thử lại sau.'
            };
        }
    }

    // Update report status (Admin only)
    async updateReportStatus(reportId, status) {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await fetch(`${API_ENDPOINTS.API_URL}/api/report/${reportId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    message: 'Cập nhật trạng thái báo cáo thành công'
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Có lỗi xảy ra khi cập nhật trạng thái'
                };
            }
        } catch (error) {
            console.error('Error updating report status:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server. Vui lòng thử lại sau.'
            };
        }
    }

    // Get report statistics (Admin only)
    async getReportStatistics() {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return {
                    success: false,
                    message: 'Vui lòng đăng nhập'
                };
            }

            const response = await fetch(`${API_ENDPOINTS.API_URL}/api/report/statistics`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    data: data.data
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Có lỗi xảy ra khi lấy thống kê'
                };
            }
        } catch (error) {
            console.error('Error getting report statistics:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server. Vui lòng thử lại sau.'
            };
        }
    }

    // Format report status for display
    formatReportStatus(status) {
        const statusMap = {
            'Pending': {
                label: 'Đang chờ xử lý',
                color: 'yellow',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-800'
            },
            'Resolved': {
                label: 'Đã xử lý',
                color: 'green',
                bgColor: 'bg-green-100',
                textColor: 'text-green-800'
            },
            'Dismissed': {
                label: 'Đã từ chối',
                color: 'red',
                bgColor: 'bg-red-100',
                textColor: 'text-red-800'
            }
        };

        return statusMap[status] || {
            label: status,
            color: 'gray',
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800'
        };
    }
}

const reportService = new ReportService();
export default reportService;
