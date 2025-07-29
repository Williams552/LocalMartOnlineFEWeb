import React, { useState, useEffect } from 'react';
import { FaSpinner, FaStore, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import storeService from '../../services/storeService';

const ToggleStoreButton = ({ onClick, className = "" }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [storeInfo, setStoreInfo] = useState(null);
    const [isStoreOpen, setIsStoreOpen] = useState(false);

    // Fetch store info on component mount
    useEffect(() => {
        fetchStoreInfo();
    }, []);

    const fetchStoreInfo = async () => {
        try {
            const result = await storeService.getMyStore();
            if (result.success && result.data) {
                setStoreInfo(result.data);
                // Assuming store has an 'isOpen' field or status field
                setIsStoreOpen(result.data.isOpen || result.data.status === 'Active');
            }
        } catch (error) {
            console.error('Error fetching store info:', error);
        }
    };

    const handleToggleStore = async () => {
        if (!storeInfo || !storeInfo.marketId) {
            toast.error('Không tìm thấy thông tin market ID');
            return;
        }

        setIsLoading(true);
        try {
            const result = await storeService.toggleStoreStatus(storeInfo.marketId);
            
            if (result.success) {
                setIsStoreOpen(!isStoreOpen);
                toast.success(result.message || `Cửa hàng đã được ${!isStoreOpen ? 'mở' : 'đóng'}`);
                
                // Call parent onClick if provided
                if (onClick) {
                    onClick(!isStoreOpen);
                }
            } else {
                toast.error(result.message || 'Không thể thay đổi trạng thái cửa hàng');
            }
        } catch (error) {
            console.error('Error toggling store:', error);
            toast.error('Có lỗi xảy ra khi thay đổi trạng thái cửa hàng');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleStore}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isStoreOpen 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'} ${className}`}
        >
            {isLoading ? (
                <FaSpinner className="animate-spin" size={16} />
            ) : isStoreOpen ? (
                <FaLock size={16} />
            ) : (
                <FaStore size={16} />
            )}
            <span className="font-medium">
                {isLoading 
                    ? 'Đang xử lý...' 
                    : isStoreOpen 
                        ? 'Đóng cửa hàng' 
                        : 'Mở cửa hàng'
                }
            </span>
        </button>
    );
};

export default ToggleStoreButton;
