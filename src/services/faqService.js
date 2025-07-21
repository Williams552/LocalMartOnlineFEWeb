// src/services/faqService.js
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

class FaqService {
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

    // Get all FAQs (public)
    async getAllFaqs() {
        try {
            const response = await this.api.get(API_ENDPOINTS.FAQ.GET_ALL);
            return {
                success: true,
                data: response.data,
                message: 'Lấy danh sách FAQs thành công'
            };
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Lỗi khi lấy danh sách FAQs'
            };
        }
    }

    // Get FAQ by ID
    async getFaqById(id) {
        try {
            const response = await this.api.get(API_ENDPOINTS.FAQ.GET_BY_ID(id));
            return {
                success: true,
                data: response.data,
                message: 'Lấy thông tin FAQ thành công'
            };
        } catch (error) {
            console.error('Error fetching FAQ:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Lỗi khi lấy thông tin FAQ'
            };
        }
    }

    // Create FAQ (admin only)
    async createFaq(faqData) {
        try {
            const response = await this.api.post(API_ENDPOINTS.FAQ.CREATE, faqData);
            return {
                success: true,
                data: response.data,
                message: 'Tạo FAQ thành công'
            };
        } catch (error) {
            console.error('Error creating FAQ:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Lỗi khi tạo FAQ'
            };
        }
    }

    // Update FAQ (admin only)
    async updateFaq(id, faqData) {
        try {
            const response = await this.api.put(API_ENDPOINTS.FAQ.UPDATE(id), faqData);
            return {
                success: true,
                data: response.data,
                message: 'Cập nhật FAQ thành công'
            };
        } catch (error) {
            console.error('Error updating FAQ:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Lỗi khi cập nhật FAQ'
            };
        }
    }

    // Delete FAQ (admin only)
    async deleteFaq(id) {
        try {
            await this.api.delete(API_ENDPOINTS.FAQ.DELETE(id));
            return {
                success: true,
                data: null,
                message: 'Xóa FAQ thành công'
            };
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Lỗi khi xóa FAQ'
            };
        }
    }

    // Format FAQ display data
    formatFaqDisplay(faq) {
        return {
            ...faq,
            createdAtDisplay: faq.createdAt ? new Date(faq.createdAt).toLocaleDateString('vi-VN') : '',
            updatedAtDisplay: faq.updatedAt ? new Date(faq.updatedAt).toLocaleDateString('vi-VN') : '',
        };
    }
}

export default new FaqService();
