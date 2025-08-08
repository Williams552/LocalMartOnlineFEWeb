// src/services/policyService.js
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

class PolicyService {
    constructor() {
        this.api = axios.create({
            baseURL: API_ENDPOINTS.API_BASE,
            timeout: 10000,
        });

        // Add auth interceptor
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Lấy tất cả chính sách
    async getAllPolicies() {
        try {
            const response = await this.api.get(API_ENDPOINTS.PLATFORM_POLICY.GET_ALL);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching policies:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải danh sách chính sách',
                error: error
            };
        }
    }

    // Lấy chính sách theo ID
    async getPolicyById(id) {
        try {
            const response = await this.api.get(API_ENDPOINTS.PLATFORM_POLICY.GET_BY_ID(id));
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching policy:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải chính sách',
                error: error
            };
        }
    }

    // Tìm kiếm chính sách (client-side filtering)
    async searchPolicies(keyword) {
        try {
            const response = await this.getAllPolicies();
            if (response.success) {
                const filtered = response.data.filter(policy =>
                    policy.title?.toLowerCase().includes(keyword.toLowerCase()) ||
                    policy.content?.toLowerCase().includes(keyword.toLowerCase()) ||
                    policy.policyType?.toLowerCase().includes(keyword.toLowerCase())
                );
                return {
                    success: true,
                    data: filtered
                };
            }
            return response;
        } catch (error) {
            console.error('Error searching policies:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tìm kiếm chính sách',
                error: error
            };
        }
    }

    // Lấy chính sách theo loại (client-side filtering)
    async getPoliciesByType(type) {
        try {
            const response = await this.getAllPolicies();
            if (response.success) {
                const filtered = response.data.filter(policy =>
                    policy.policyType?.toLowerCase() === type.toLowerCase()
                );
                return {
                    success: true,
                    data: filtered
                };
            }
            return response;
        } catch (error) {
            console.error('Error fetching policies by type:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải chính sách theo loại',
                error: error
            };
        }
    }

    // Lấy chính sách đang hoạt động (client-side filtering)
    async getActivePolicies() {
        try {
            const response = await this.getAllPolicies();
            if (response.success) {
                const filtered = response.data.filter(policy => policy.isActive === true);
                return {
                    success: true,
                    data: filtered
                };
            }
            return response;
        } catch (error) {
            console.error('Error fetching active policies:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Lỗi khi tải chính sách đang hoạt động',
                error: error
            };
        }
    }
}

const policyService = new PolicyService();
export default policyService;
