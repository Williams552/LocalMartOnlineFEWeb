import { uploadImageToCloudinary } from './cloudinaryService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5183/api';

/**
 * Upload proof images for purchased items
 * @param {string} orderId - ID của đơn hàng
 * @param {File[]} imageFiles - Mảng các file ảnh cần upload
 * @param {string} note - Ghi chú từ proxy shopper
 * @returns {Promise<Object>} - Response từ API
 */
export const uploadBoughtItemsProof = async (orderId, imageFiles, note = '') => {
  try {
    // 1. Upload tất cả ảnh lên Cloudinary
    const uploadPromises = imageFiles.map(file => 
      uploadImageToCloudinary(file, { 
        folder: 'localmart/proofs' 
      })
    );
    
    const imageUrls = await Promise.all(uploadPromises);
    
    // 2. Gửi URLs đến backend API
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/ProxyShopper/orders/${orderId}/proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({
        imageUrls,
        note
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể upload chứng từ mua hàng');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading bought items proof:', error);
    throw error;
  }
};

/**
 * Get proof images for an order
 * @param {string} orderId - ID của đơn hàng
 * @returns {Promise<Object>} - Thông tin chứng từ đã upload
 */
export const getOrderProof = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/ProxyShopper/orders/${orderId}/proof`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined,
      },
    });

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin chứng từ');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting order proof:', error);
    throw error;
  }
};

export default {
  uploadBoughtItemsProof,
  getOrderProof,
};
