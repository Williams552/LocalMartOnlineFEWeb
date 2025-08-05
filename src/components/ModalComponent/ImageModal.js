import React from 'react';
import { FiX } from 'react-icons/fi';

const ImageModal = ({ src, alt, onClose }) => {
    if (!src) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
            <div className="relative max-w-[90vw] max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute -top-10 -right-10 text-white hover:text-gray-300 transition-colors z-10"
                >
                    <FiX className="w-8 h-8" />
                </button>
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full object-contain rounded-lg"
                />
            </div>
        </div>
    );
};

export default ImageModal;
