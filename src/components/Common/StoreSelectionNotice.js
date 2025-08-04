import React from 'react';
import { FiMapPin, FiInfo, FiUsers } from 'react-icons/fi';

const StoreSelectionNotice = ({ variant = 'info', className = '' }) => {
    const variants = {
        info: {
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-400',
            textColor: 'text-blue-700',
            iconColor: 'text-blue-500',
            icon: FiInfo
        },
        warning: {
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-400',
            textColor: 'text-yellow-700',
            iconColor: 'text-yellow-500',
            icon: FiMapPin
        },
        success: {
            bgColor: 'bg-green-50',
            borderColor: 'border-green-400',
            textColor: 'text-green-700',
            iconColor: 'text-green-500',
            icon: FiUsers
        }
    };

    const config = variants[variant] || variants.info;
    const IconComponent = config.icon;

    return (
        <div className={`${config.bgColor} rounded-lg border-l-4 ${config.borderColor} p-4 ${className}`}>
            <div className="flex items-start">
                <IconComponent className={`${config.iconColor} mr-3 mt-0.5`} size={18} />
                <div className={`${config.textColor}`}>
                    <h4 className="font-medium mb-2">Cơ chế đi chợ giùm mới</h4>
                    <div className="text-sm space-y-1">
                        <p>• <strong>Bước 1:</strong> Bạn cần chọn chợ cụ thể khi tạo yêu cầu đi chợ giùm</p>
                        <p>• <strong>Bước 2:</strong> Hệ thống sẽ gửi yêu cầu đến các proxy shopper đã đăng ký tại chợ đó</p>
                        <p>• <strong>Bước 3:</strong> Chỉ những proxy shopper trong chợ được chọn mới có thể nhận đơn hàng của bạn</p>
                        <p className="mt-2 font-medium">
                            ✨ Điều này đảm bảo proxy shopper hiểu rõ về chợ và có thể mua đúng sản phẩm bạn yêu cầu!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreSelectionNotice;
