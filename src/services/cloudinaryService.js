// Cloudinary upload service for LocalMart

export const CLOUDINARY_CONFIG = {
  cloudName: 'dmqrmxyuz',
  uploadPreset: 'LocalMart',
  folder: 'localmart/products',
  apiUrl: 'https://api.cloudinary.com/v1_1/dmqrmxyuz/image/upload',
};

/**
 * Upload an image file to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Object} [options] - Optional extra params (e.g. folder override)
 * @returns {Promise<string>} - The secure_url of the uploaded image
 */
export async function uploadImageToCloudinary(file, options = {}) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', options.uploadPreset || CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', options.folder || CLOUDINARY_CONFIG.folder);

    const response = await fetch(CLOUDINARY_CONFIG.apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Upload to Cloudinary failed');
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of image files to upload
 * @param {Object} [options] - Optional extra params
 * @returns {Promise<string[]>} - Array of secure_urls
 */
export async function uploadMultipleImages(files, options = {}) {
  const uploadPromises = files.map(file => uploadImageToCloudinary(file, options));
  return Promise.all(uploadPromises);
}
