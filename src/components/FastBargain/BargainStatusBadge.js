import React from 'react';
import fastBargainService from '../../services/fastBargainService';

const BargainStatusBadge = ({ status, size = 'sm' }) => {
    const statusInfo = fastBargainService.formatStatus(status);

    const sizeClasses = {
        'xs': 'text-xs px-2 py-1',
        'sm': 'text-sm px-2.5 py-1.5',
        'md': 'text-base px-3 py-2'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${statusInfo.color} ${sizeClasses[size]}`}>
            <span className="mr-1">{statusInfo.icon}</span>
            {statusInfo.name}
        </span>
    );
};

export default BargainStatusBadge;
