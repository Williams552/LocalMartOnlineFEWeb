import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';
import { getCurrentUserId } from './authService';

// Constants matching Backend DTOs
const REPORT_STATUS = {
    PENDING: 'Pending',
    RESOLVED: 'Resolved',
    DISMISSED: 'Dismissed'
};

const TARGET_TYPES = {
    PRODUCT: 'Product',
    STORE: 'Store',
    SELLER: 'Seller',
    BUYER: 'Buyer'
};

const REQUEST_TIMEOUT = 10000;
const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
};

// HTTP Client Configuration
const createApiClient = () => {
    const client = axios.create({
        timeout: REQUEST_TIMEOUT,
        headers: DEFAULT_HEADERS,
    });

    // Request interceptor for authentication
    client.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Clear auth data on 401
                ['token', 'user', 'userId'].forEach(key => 
                    localStorage.removeItem(key)
                );
            }
            return Promise.reject(error);
        }
    );

    return client;
};

const apiClient = createApiClient();

// Error Messages
const ERROR_MESSAGES = {
    AUTH_REQUIRED: 'Vui lòng đăng nhập để thực hiện chức năng này',
    NETWORK_ERROR: 'Có lỗi xảy ra khi kết nối với máy chủ',
    GENERIC_ERROR: 'Có lỗi không xác định xảy ra',
    REPORT_NOT_FOUND: 'Không tìm thấy báo cáo',
    CREATE_FAILED: 'Không thể tạo báo cáo',
    UPDATE_FAILED: 'Không thể cập nhật trạng thái báo cáo',
    FETCH_FAILED: 'Không thể lấy danh sách báo cáo',
    STATS_FAILED: 'Không thể lấy thống kê báo cáo'
};

class ReportService {
    // Helper method to build query parameters for DTO compatibility  
    _buildQueryParams(params) {
        const query = {};
        
        // Map FE params to BE DTO fields (GetReportsRequestDto)
        if (params.reporterId) query.ReporterId = params.reporterId;
        if (params.targetType) query.TargetType = params.targetType;
        if (params.targetId) query.TargetId = params.targetId;
        if (params.status) query.Status = params.status;
        if (params.page) query.Page = params.page;
        if (params.pageSize) query.PageSize = params.pageSize;
        if (params.fromDate) query.FromDate = params.fromDate;
        if (params.toDate) query.ToDate = params.toDate;
        
        const queryParams = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });
        return queryParams.toString();
    }

    // Helper method to handle API responses
    _handleResponse(response, defaultMessage = 'Thao tác thành công') {
        // Check if response is successful (2xx status code)
        if (response.status >= 200 && response.status < 300) {
            // Handle different response formats
            if (response.data?.success !== undefined) {
                // Case 1: Response has explicit success field
                if (response.data.success) {
                    return {
                        success: true,
                        data: response.data.data,
                        message: response.data.message || defaultMessage
                    };
                } else {
                    return {
                        success: false,
                        message: response.data.message || 'Thao tác không thành công'
                    };
                }
            } else {
                // Case 2: No explicit success field, assume success based on status code
                return {
                    success: true,
                    data: response.data,
                    message: response.data?.message || defaultMessage
                };
            }
        }
        
        // Case 3: Non-success status code
        return {
            success: false,
            message: response.data?.message || 'Thao tác không thành công'
        };
    }

    // Helper method to handle errors
    _handleError(error, context = '', defaultMessage = ERROR_MESSAGES.GENERIC_ERROR) {
        console.error(`❌ ReportService - ${context}:`, error);
        
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           defaultMessage;
        
        return {
            success: false,
            message: errorMessage
        };
    }

    // Helper method to get user headers
    _getUserHeaders() {
        const userId = getCurrentUserId();
        if (!userId) {
            throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
        }
        return { 'userId': userId };
    }

    // Get all reports with filtering (Admin/Public)
    async getReports(params = {}) {
        try {
            console.log('📋 ReportService - Getting reports with params:', params);
            
            const queryString = this._buildQueryParams(params);
            const url = queryString 
                ? `${API_ENDPOINTS.REPORT.GET_ALL}?${queryString}`
                : API_ENDPOINTS.REPORT.GET_ALL;

            console.log('📋 ReportService - API URL:', url);
            const response = await apiClient.get(url);
            
            console.log('📋 ReportService - Response:', response.data);
            return this._handleResponse(response, 'Lấy danh sách báo cáo thành công');

        } catch (error) {
            return this._handleError(error, 'Error getting reports', ERROR_MESSAGES.FETCH_FAILED);
        }
    }

    // Get report by ID (Public)
    async getReportById(reportId) {
        try {
            console.log('📋 ReportService - Getting report by ID:', reportId);
            
            const response = await apiClient.get(API_ENDPOINTS.REPORT.GET_BY_ID(reportId));
            console.log('📋 ReportService - Report detail response:', response.data);
            
            return this._handleResponse(response, 'Lấy thông tin báo cáo thành công');

        } catch (error) {
            return this._handleError(error, 'Error getting report by ID', ERROR_MESSAGES.REPORT_NOT_FOUND);
        }
    }

    // Get user's reports (Requires userId header)
    async getMyReports(params = {}) {
        try {
            console.log('📋 ReportService - Getting my reports with params:', params);
            
            const queryString = this._buildQueryParams(params);
            const url = queryString 
                ? `${API_ENDPOINTS.REPORT.GET_MY_REPORTS}?${queryString}`
                : API_ENDPOINTS.REPORT.GET_MY_REPORTS;

            console.log('📋 ReportService - My reports URL:', url);
            
            const headers = this._getUserHeaders();
            const response = await apiClient.get(url, { headers });
            
            console.log('📋 ReportService - My reports response:', response.data);
            return this._handleResponse(response, 'Lấy báo cáo của bạn thành công');

        } catch (error) {
            return this._handleError(error, 'Error getting my reports', ERROR_MESSAGES.FETCH_FAILED);
        }
    }

    // Create a new report (Requires userId header)
    // Matches CreateReportDto: TargetType, TargetId, Title, Reason, EvidenceImage
    async createReport(reportData) {
        try {
            console.log('📋 ReportService - Creating report:', reportData);
            
            // Validate required fields matching CreateReportDto
            const requiredFields = ['targetType', 'targetId', 'title', 'reason'];
            for (const field of requiredFields) {
                if (!reportData[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // Transform data to match CreateReportDto
            const createReportDto = {
                TargetType: reportData.targetType,
                TargetId: reportData.targetId,
                Title: reportData.title,
                Reason: reportData.reason,
                EvidenceImage: reportData.evidenceImage || null
            };
            
            const headers = this._getUserHeaders();
            const response = await apiClient.post(API_ENDPOINTS.REPORT.CREATE, createReportDto, { headers });
            
            console.log('📋 ReportService - Create report response:', response.data);
            return this._handleResponse(response, 'Báo cáo đã được tạo thành công');

        } catch (error) {
            return this._handleError(error, 'Error creating report', ERROR_MESSAGES.CREATE_FAILED);
        }
    }

    // Get reports statistics (Public)
    async getReportStatistics() {
        try {
            console.log('📋 ReportService - Getting report statistics');
            
            const response = await apiClient.get(API_ENDPOINTS.REPORT.GET_STATISTICS);
            console.log('📋 ReportService - Statistics response:', response.data);
            
            return this._handleResponse(response, 'Lấy thống kê báo cáo thành công');

        } catch (error) {
            return this._handleError(error, 'Error getting statistics', ERROR_MESSAGES.STATS_FAILED);
        }
    }

    // Update report status (Admin only)
    // Matches UpdateReportStatusDto: Status, AdminResponse
    async updateReportStatus(reportId, statusData) {
        try {
            console.log('📋 ReportService - Updating report status:', { reportId, statusData });
            
            // Validate required fields matching UpdateReportStatusDto
            if (!statusData.status) {
                throw new Error('Status is required');
            }

            // Transform data to match UpdateReportStatusDto
            const updateStatusDto = {
                Status: statusData.status,
                AdminResponse: statusData.adminResponse || null
            };
            
            const response = await apiClient.put(API_ENDPOINTS.REPORT.UPDATE_STATUS(reportId), updateStatusDto);
            console.log('📋 ReportService - Update status response:', response.data);
            
            return this._handleResponse(response, 'Trạng thái báo cáo đã được cập nhật');

        } catch (error) {
            return this._handleError(error, 'Error updating report status', ERROR_MESSAGES.UPDATE_FAILED);
        }
    }

    // Configuration and Constants Methods
    getReportReasons() {
        return [
            { value: 'inappropriate_content', label: 'Nội dung không phù hợp' },
            { value: 'fake_product', label: 'Sản phẩm giả mạo' },
            { value: 'misleading_info', label: 'Thông tin sai lệch' },
            { value: 'poor_quality', label: 'Chất lượng kém' },
            { value: 'overpriced', label: 'Giá cả không hợp lý' },
            { value: 'copyright_violation', label: 'Vi phạm bản quyền' },
            { value: 'safety_concern', label: 'Vấn đề an toàn' },
            { value: 'spam', label: 'Spam hoặc quảng cáo' },
            { value: 'other', label: 'Lý do khác' }
        ];
    }

    getTargetTypes() {
        return [
            { value: TARGET_TYPES.PRODUCT, label: 'Sản phẩm' },
            { value: TARGET_TYPES.STORE, label: 'Cửa hàng' },
            { value: TARGET_TYPES.SELLER, label: 'Người bán' },
            { value: TARGET_TYPES.BUYER, label: 'Người mua' }
        ];
    }

    getStatusTypes() {
        return [
            { value: REPORT_STATUS.PENDING, label: 'Đang chờ xử lý', color: 'yellow' },
            { value: REPORT_STATUS.RESOLVED, label: 'Đã giải quyết', color: 'green' },
            { value: REPORT_STATUS.DISMISSED, label: 'Đã bác bỏ', color: 'red' }
        ];
    }

    // Utility Methods
    getStatusColor(status) {
        const statusMap = {
            [REPORT_STATUS.PENDING]: 'yellow',
            [REPORT_STATUS.RESOLVED]: 'green',
            [REPORT_STATUS.DISMISSED]: 'red'
        };
        return statusMap[status] || 'gray';
    }

    getStatusLabel(status) {
        const statusMap = {
            [REPORT_STATUS.PENDING]: 'Đang chờ xử lý',
            [REPORT_STATUS.RESOLVED]: 'Đã giải quyết',
            [REPORT_STATUS.DISMISSED]: 'Đã bác bỏ'
        };
        return statusMap[status] || status;
    }

    getTargetTypeLabel(targetType) {
        const targetMap = {
            [TARGET_TYPES.PRODUCT]: 'Sản phẩm',
            [TARGET_TYPES.STORE]: 'Cửa hàng',
            [TARGET_TYPES.SELLER]: 'Người bán',
            [TARGET_TYPES.BUYER]: 'Người mua'
        };
        return targetMap[targetType] || targetType;
    }

    formatReportStatus(status) {
        const statusMap = {
            [REPORT_STATUS.PENDING]: {
                label: 'Đang chờ xử lý',
                color: 'yellow',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-800'
            },
            [REPORT_STATUS.RESOLVED]: {
                label: 'Đã giải quyết',
                color: 'green',
                bgColor: 'bg-green-100',
                textColor: 'text-green-800'
            },
            [REPORT_STATUS.DISMISSED]: {
                label: 'Đã bác bỏ',
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

    // Build query parameters for GetReportsRequestDto
    buildReportsQuery(params = {}) {
        const query = {};
        
        // Map FE params to BE DTO fields
        if (params.reporterId) query.ReporterId = params.reporterId;
        if (params.targetType) query.TargetType = params.targetType;
        if (params.status) query.Status = params.status;
        if (params.page) query.Page = params.page;
        if (params.pageSize) query.PageSize = params.pageSize;
        if (params.fromDate) query.FromDate = params.fromDate;
        if (params.toDate) query.ToDate = params.toDate;
        
        return query;
    }

    // Format response data from GetReportsResponseDto
    formatReportsResponse(response) {
        return {
            reports: response.Reports || [],
            totalCount: response.TotalCount || 0,
            currentPage: response.CurrentPage || 1,
            pageSize: response.PageSize || 10,
            totalPages: response.TotalPages || 0
        };
    }

    // Constants exports
    getConstants() {
        return {
            REPORT_STATUS,
            TARGET_TYPES
        };
    }
}

const reportService = new ReportService();

export { reportService, REPORT_STATUS, TARGET_TYPES };
export default reportService;