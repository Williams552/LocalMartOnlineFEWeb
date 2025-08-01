import React, { useState, useRef } from 'react';
import { FiCamera, FiX, FiUpload, FiLoader } from 'react-icons/fi';
import { uploadBoughtItemsProof } from '../../services/proxyShopperProofService';

const UploadProofModal = ({ isOpen, onClose, orderId, onSuccess }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Không thể truy cập camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Vui lòng cấp quyền camera cho trình duyệt. Click vào biểu tượng 🔒 bên trái thanh địa chỉ và chọn "Allow" cho Camera.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'Không tìm thấy camera. Vui lòng kiểm tra kết nối DroidCam hoặc camera của thiết bị.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác đang dùng camera.';
      } else {
        errorMessage += 'Vui lòng kiểm tra quyền truy cập camera và thử lại.';
      }
      
      setError(errorMessage);
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().getTime();
        const file = new File([blob], `photo_${timestamp}.jpg`, { type: 'image/jpeg' });
        setSelectedImages(prev => [...prev, file]);
        setError('');
      }
    }, 'image/jpeg', 0.8);
  };

  const handleImageCapture = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      setError('Chỉ được chọn file hình ảnh');
      return;
    }

    setSelectedImages(prev => [...prev, ...imageFiles]);
    setError('');
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      setError('Vui lòng chụp ít nhất một hình ảnh');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await uploadBoughtItemsProof(orderId, selectedImages, note);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi upload chứng từ');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
    // Reset form
    setSelectedImages([]);
    setNote('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Đăng hình sản phẩm đã mua</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={uploading}
          >
            <FiX />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Vui lòng chụp ảnh chứng minh bạn đã mua các sản phẩm theo yêu cầu 
              (hóa đơn, sản phẩm thực tế, v.v.)
            </p>
            
            {/* Camera Interface */}
            {!isCapturing ? (
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Lưu ý:</strong> Khi click "Mở camera", trình duyệt sẽ yêu cầu quyền truy cập camera. 
                    Vui lòng click <strong>"Allow"</strong> để tiếp tục.
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={uploading}
                >
                  <FiCamera className="mr-2" />
                  Mở camera để chụp ảnh
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <div className="relative bg-black rounded-lg overflow-hidden mb-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={capturePhoto}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    disabled={uploading}
                  >
                    <FiCamera className="mr-2" />
                    Chụp ảnh
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    disabled={uploading}
                  >
                    <FiX className="mr-2" />
                    Đóng camera
                  </button>
                </div>
              </div>
            )}

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Hình ảnh đã chọn ({selectedImages.length}):</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        disabled={uploading}
                      >
                        <FiX />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Đã mua đầy đủ các sản phẩm theo yêu cầu, một số sản phẩm đã hết nên thay thế bằng sản phẩm tương tự..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
                disabled={uploading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                <div className="flex items-start">
                  <span className="text-red-500 mr-2 mt-0.5">⚠️</span>
                  <div>
                    <div className="font-medium mb-1">Lỗi truy cập camera:</div>
                    <div>{error}</div>
                    {error.includes('NotAllowedError') && (
                      <div className="mt-2 text-xs bg-red-50 p-2 rounded border">
                        <strong>Hướng dẫn cấp quyền:</strong><br/>
                        1. Click vào biểu tượng 🔒 bên trái thanh địa chỉ<br/>
                        2. Chọn "Camera" → "Allow"<br/>
                        3. Refresh trang (F5) và thử lại
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={uploading}
              >
                Hủy
              </button>
              
              <button
                onClick={handleUpload}
                className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading || selectedImages.length === 0}
              >
                {uploading ? (
                  <>
                    <FiLoader className="mr-2 animate-spin" />
                    Đang upload...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" />
                    Upload chứng từ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProofModal;
