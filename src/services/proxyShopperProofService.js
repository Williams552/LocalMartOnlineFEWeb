import { uploadImageToCloudinary } from './cloudinaryService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5183';

/**
 * Upload proof images for purchased items
 * @param {string} orderId - ID của đơn hàng
 * @param {File[]} imageFiles - Mảng các file ảnh cần upload
 * @param {string} note - Ghi chú từ proxy shopper
 * @returns {Promise<Object>} - Response từ API
 */
export const uploadBoughtItemsProof = async (orderId, imageFiles, note = '') => {
  try {
    // 1. Chỉ upload 1 ảnh đầu tiên lên Cloudinary
    let ImageUrls  = '';
    if (imageFiles && imageFiles.length > 0) {
      ImageUrls  = await uploadImageToCloudinary(imageFiles[0], { folder: 'localmart/proofs' });
    }
    console.log('Successfully uploaded image to Cloudinary:', ImageUrls);
    
    // 2. Gửi URL duy nhất đến backend API
    const token = localStorage.getItem('token');
    const requestUrl = `${API_BASE_URL}/api/ProxyShopper/orders/${orderId}/proof`;
    const requestBody = {
      ImageUrls ,
      note
    };
    
    console.log('Sending request to:', requestUrl);
    console.log('Request body:', requestBody);
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = 'Không thể upload chứng từ mua hàng';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // Server trả về non-JSON response (HTML error page, etc.)
        const textResponse = await response.text();
        console.error('Non-JSON error response:', textResponse);
        errorMessage = `Server error (${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Handle successful response
    try {
      const result = await response.json();
      return result;
    } catch (parseError) {
      // Success response nhưng không phải JSON (có thể là empty response)
      console.warn('Success response but no JSON body');
      return { success: true, message: 'Upload thành công' };
    }
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
    const response = await fetch(`${API_BASE_URL}/api/ProxyShopper/orders/${orderId}/proof`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Không thể lấy thông tin chứng từ';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        const textResponse = await response.text();
        console.error('Non-JSON error response:', textResponse);
        errorMessage = `Server error (${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch (parseError) {
      console.warn('Success response but no JSON body');
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Error getting order proof:', error);
    throw error;
  }
};

export default {
  uploadBoughtItemsProof,
  getOrderProof,
};
