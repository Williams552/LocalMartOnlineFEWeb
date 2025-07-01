// src/utils/userValidation.js
import { message } from 'antd';

// Validation rules for user fields (based on BE RegisterDTO and User model)
export const userValidationRules = {
    username: [
        { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
        { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
        { max: 30, message: 'Tên đăng nhập không được quá 30 ký tự!' },
        {
            pattern: /^[a-zA-Z0-9._-]+$/,
            message: 'Tên đăng nhập chỉ được chứa chữ, số và ký tự ._-'
        }
    ],
    password: [
        { required: true, message: 'Vui lòng nhập mật khẩu!' },
        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
        { max: 50, message: 'Mật khẩu không được quá 50 ký tự!' }
    ],
    fullName: [
        { required: true, message: 'Vui lòng nhập họ và tên!' },
        { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
        { max: 100, message: 'Họ và tên không được quá 100 ký tự!' }
    ],
    email: [
        { required: true, message: 'Vui lòng nhập email!' },
        { type: 'email', message: 'Email không hợp lệ!' },
        { max: 100, message: 'Email không được quá 100 ký tự!' }
    ],
    phoneNumber: [
        {
            pattern: /^[0-9]{10,11}$/,
            message: 'Số điện thoại phải có 10-11 chữ số!'
        }
    ],
    address: [
        { max: 255, message: 'Địa chỉ không được quá 255 ký tự!' }
    ]
};

// Available roles based on BE User model
export const USER_ROLES = [
    { value: 'Admin', label: 'Quản trị viên' },
    { value: 'Buyer', label: 'Người mua' },
    { value: 'Seller', label: 'Người bán' },
    { value: 'ProxyShopper', label: 'Người mua hộ' }
];

// Available statuses based on BE User model
export const USER_STATUSES = [
    { value: 'Active', label: 'Hoạt động' },
    { value: 'Disabled', label: 'Bị khóa' }
];

// Helper functions for validation
export const validateUserData = (userData, isUpdate = false) => {
    const errors = [];

    // Required fields validation for create
    const requiredFields = isUpdate
        ? ['fullName', 'email'] // Username và password không required khi update
        : ['username', 'password', 'fullName', 'email'];

    requiredFields.forEach(field => {
        if (!userData[field] || userData[field].trim() === '') {
            errors.push(`${getFieldLabel(field)} là bắt buộc`);
        }
    });

    // Username validation
    if (userData.username && !isUpdate) {
        if (userData.username.length < 3) {
            errors.push('Tên đăng nhập phải có ít nhất 3 ký tự');
        }
        if (!/^[a-zA-Z0-9._-]+$/.test(userData.username)) {
            errors.push('Tên đăng nhập chỉ được chứa chữ, số và ký tự ._-');
        }
    }

    // Email validation
    if (userData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('Email không hợp lệ');
        }
    }

    // Password validation (for new users)
    if (userData.password && !isUpdate) {
        if (userData.password.length < 6) {
            errors.push('Mật khẩu phải có ít nhất 6 ký tự');
        }
    }

    // Phone number validation
    if (userData.phoneNumber && userData.phoneNumber.trim() !== '') {
        if (!/^[0-9]{10,11}$/.test(userData.phoneNumber)) {
            errors.push('Số điện thoại phải có 10-11 chữ số');
        }
    }

    // Role validation
    const validRoles = ['Admin', 'Buyer', 'Seller', 'ProxyShopper'];
    if (userData.role && !validRoles.includes(userData.role)) {
        errors.push('Vai trò không hợp lệ');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Get field label in Vietnamese
export const getFieldLabel = (field) => {
    const labels = {
        username: 'Tên đăng nhập',
        password: 'Mật khẩu',
        fullName: 'Họ và tên',
        email: 'Email',
        phoneNumber: 'Số điện thoại',
        role: 'Vai trò',
        address: 'Địa chỉ',
        status: 'Trạng thái'
    };
    return labels[field] || field;
};

// Format user data for display
export const formatUserData = (user) => {
    return {
        ...user,
        displayName: user.fullName || user.username,
        displayRole: getRoleLabel(user.role),
        displayStatus: getStatusLabel(user.status),
        displayCreatedAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Không rõ',
        displayUpdatedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN') : 'Không rõ'
    };
};

// Get role label in Vietnamese
export const getRoleLabel = (role) => {
    const roleLabels = {
        Admin: 'Quản trị viên',
        Buyer: 'Người mua',
        Seller: 'Người bán',
        ProxyShopper: 'Người mua hộ'
    };
    return roleLabels[role] || role;
};

// Get status label in Vietnamese
export const getStatusLabel = (status) => {
    const statusLabels = {
        Active: 'Hoạt động',
        Disabled: 'Bị chặn',
        Pending: 'Chờ duyệt',
        Suspended: 'Tạm khóa'
    };
    return statusLabels[status] || status;
};

// Get role color for tags
export const getRoleColor = (role) => {
    const roleColors = {
        Admin: 'red',
        Buyer: 'blue',
        Seller: 'orange',
        ProxyShopper: 'purple'
    };
    return roleColors[role] || 'default';
};

// Get status color for tags
export const getStatusColor = (status) => {
    const statusColors = {
        Active: 'green',
        Disabled: 'red',
        Pending: 'orange',
        Suspended: 'volcano'
    };
    return statusColors[status] || 'default';
};

// Sanitize user input
export const sanitizeUserInput = (userData) => {
    const sanitized = {};

    Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
            if (typeof userData[key] === 'string') {
                sanitized[key] = userData[key].trim();
            } else {
                sanitized[key] = userData[key];
            }
        }
    });

    return sanitized;
};

// Show validation messages
export const showValidationMessages = (validation) => {
    if (!validation.isValid) {
        validation.errors.forEach(error => {
            message.error(error);
        });
    }
};

// Export all functions as default object
export default {
    userValidationRules,
    validateUserData,
    getFieldLabel,
    formatUserData,
    getRoleLabel,
    getStatusLabel,
    getRoleColor,
    getStatusColor,
    sanitizeUserInput,
    showValidationMessages
};
