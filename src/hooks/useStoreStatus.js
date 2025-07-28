import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storeService from '../services/storeService';
import { toast } from 'react-toastify';

export const useStoreStatus = () => {
    const [storeStatus, setStoreStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [storeInfo, setStoreInfo] = useState(null);
    const navigate = useNavigate();

    const checkStoreStatus = async () => {
        try {
            setIsLoading(true);
            
            const result = await storeService.getMyStore();
            
            if (result.success && result.data) {
                const store = result.data;
                setStoreInfo(store);
                setStoreStatus(store.status);
                
                // If store is suspended, show notification and redirect
                if (store.status === 'Suspended') {
                    toast.error(
                        `Cửa hàng "${store.name}" của bạn đã bị đình chỉ. Vui lòng liên hệ với admin để biết thêm chi tiết.`,
                        {
                            position: "top-center",
                            autoClose: 8000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        }
                    );
                    
                    // Redirect to homepage immediately
                    navigate('/', { replace: true });
                    return false; // Store is suspended
                }
                
                return true; // Store is active
            } else {
                console.error('❌ Error getting store info:', result.message);
                toast.error('Không thể lấy thông tin cửa hàng. Vui lòng thử lại.');
                
                // If can't get store info, redirect to homepage
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 2000);
                
                return false;
            }
        } catch (error) {
            console.error('❌ Error checking store status:', error);
            toast.error('Có lỗi xảy ra khi kiểm tra trạng thái cửa hàng.');
            
            // If error occurs, redirect to homepage
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 2000);
            
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Only check if user has seller role and hasn't checked yet
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'Seller' && storeStatus === null) {
            checkStoreStatus();
        } else if (user.role !== 'Seller') {
            setIsLoading(false);
        }
    }, []); // Empty dependency array to run only once

    return {
        storeStatus,
        storeInfo,
        isLoading,
        checkStoreStatus,
        isStoreSuspended: storeStatus === 'Suspended',
        isStoreActive: storeStatus === 'Active'
    };
};

export default useStoreStatus;
