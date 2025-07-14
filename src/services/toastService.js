import React from 'react';
import { toast } from 'react-toastify';

// Custom toast configurations - smaller and more elegant
const toastConfig = {
    success: {
        icon: '✓',
        className: 'toast-success'
    },
    error: {
        icon: '✕',
        className: 'toast-error'
    },
    warning: {
        icon: '⚠',
        className: 'toast-warning'
    },
    info: {
        icon: 'i',
        className: 'toast-info'
    }
};

class ToastService {
    success(message, options = {}) {
        return toast.success(
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="toast-icon">
                    {toastConfig.success.icon}
                </span>
                <span>{message}</span>
            </div>,
            {
                className: toastConfig.success.className,
                autoClose: 2500,
                hideProgressBar: false,
                ...options
            }
        );
    }

    error(message, options = {}) {
        return toast.error(
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="toast-icon">
                    {toastConfig.error.icon}
                </span>
                <span>{message}</span>
            </div>,
            {
                className: toastConfig.error.className,
                autoClose: 4000,
                hideProgressBar: false,
                ...options
            }
        );
    }

    warning(message, options = {}) {
        return toast.warning(
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="toast-icon">
                    {toastConfig.warning.icon}
                </span>
                <span>{message}</span>
            </div>,
            {
                className: toastConfig.warning.className,
                autoClose: 3500,
                hideProgressBar: false,
                ...options
            }
        );
    }

    info(message, options = {}) {
        return toast.info(
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="toast-icon">
                    {toastConfig.info.icon}
                </span>
                <span>{message}</span>
            </div>,
            {
                className: toastConfig.info.className,
                autoClose: 3000,
                hideProgressBar: false,
                ...options
            }
        );
    }

    // Special methods for common scenarios
    cartSuccess(productName) {
        return this.success(`Đã thêm "${productName}" vào giỏ hàng`, {
            autoClose: 2500
        });
    }

    cartError(message = 'Không thể thêm vào giỏ hàng') {
        return this.error(message, {
            autoClose: 4000
        });
    }

    authError(message = 'Vui lòng đăng nhập') {
        return this.warning(message, {
            autoClose: 3000
        });
    }

    networkError() {
        return this.error('Không thể kết nối đến server', {
            autoClose: 5000
        });
    }

    // Compact notifications for less important actions
    compact(type, message) {
        const config = toastConfig[type] || toastConfig.info;
        return toast(
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="toast-icon" style={{ width: '14px', height: '14px', fontSize: '9px' }}>
                    {config.icon}
                </span>
                <span>{message}</span>
            </div>,
            {
                className: `${config.className} toast-compact`,
                autoClose: 1500,
                hideProgressBar: true
            }
        );
    }

    // Quick notification - ultra compact for minor actions
    quick(message, type = 'info') {
        const config = toastConfig[type] || toastConfig.info;
        return toast(
            message,
            {
                className: `${config.className} toast-quick`,
                autoClose: 1000,
                hideProgressBar: true,
                closeButton: false
            }
        );
    }
}

const toastService = new ToastService();
export default toastService;

// Export for convenience
export const showSuccessToast = (message, options) => toastService.success(message, options);
export const showErrorToast = (message, options) => toastService.error(message, options);
export const showWarningToast = (message, options) => toastService.warning(message, options);
export const showInfoToast = (message, options) => toastService.info(message, options);
