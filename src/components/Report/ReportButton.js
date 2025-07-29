import React, { useState, memo, useCallback } from 'react';
import { FaFlag, FaExclamationTriangle } from 'react-icons/fa';
import ReportModal from './ReportModal';

const ReportButton = memo(({ 
    targetType = 'Product',
    targetId,
    targetName,
    targetInfo = null,
    variant = 'default', // 'default', 'icon', 'text'
    size = 'md', // 'sm', 'md', 'lg'
    className = '',
    showIcon = true,
    buttonText = 'Báo cáo',
    onReportSuccess = null
}) => {
    const [showReportModal, setShowReportModal] = useState(false);

    // Size configuration
    const sizeConfig = {
        sm: { button: 'px-2 py-1 text-xs', icon: 12 },
        md: { button: 'px-3 py-2 text-sm', icon: 14 },
        lg: { button: 'px-4 py-2 text-base', icon: 16 }
    };

    // Variant styles
    const variantStyles = {
        default: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg',
        icon: 'text-gray-400 hover:text-red-500 p-1 rounded',
        text: 'text-red-600 hover:text-red-700 hover:underline'
    };

    const handleOpenModal = useCallback(() => {
        setShowReportModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowReportModal(false);
    }, []);

    const handleReportSuccess = useCallback((reportData) => {
        setShowReportModal(false);
        onReportSuccess?.(reportData);
    }, [onReportSuccess]);

    // Render button based on variant
    const renderButton = () => {
        const currentSize = sizeConfig[size];
        const commonProps = {
            onClick: handleOpenModal,
            title: `Báo cáo ${targetName || targetType}`,
            'aria-label': `Báo cáo ${targetName || targetType}`
        };

        const iconElement = showIcon && (
            variant === 'icon' 
                ? <FaFlag size={currentSize.icon} />
                : <FaExclamationTriangle size={currentSize.icon} />
        );

        if (variant === 'icon') {
            return (
                <button 
                    {...commonProps} 
                    className={`${variantStyles.icon} ${className} transition-colors duration-200`}
                >
                    {iconElement}
                </button>
            );
        }

        return (
            <button 
                {...commonProps}
                className={`${variantStyles[variant]} ${currentSize.button} ${className} transition-colors duration-200 flex items-center space-x-2 font-medium`}
            >
                {iconElement}
                <span>{buttonText}</span>
            </button>
        );
    };

    return (
        <>
            {renderButton()}
            
            {showReportModal && (
                <ReportModal
                    isOpen={showReportModal}
                    onClose={handleCloseModal}
                    targetType={targetType}
                    targetId={targetId}
                    targetName={targetName}
                    targetInfo={targetInfo}
                    onSuccess={handleReportSuccess}
                />
            )}
        </>
    );
});

ReportButton.displayName = 'ReportButton';

export default ReportButton;
