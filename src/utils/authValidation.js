// Authentication Validation Utils
// Synchronized with Backend validation rules

/**
 * Email validation function
 * @param {string} email - Email to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        return "Email không được để trống";
    }
    if (!emailRegex.test(email)) {
        return "Email không đúng định dạng";
    }
    return "";
};

/**
 * Password validation function
 * @param {string} password - Password to validate
 * @returns {string} Error message or empty string if valid
 */
export const validatePassword = (password) => {
    if (!password) {
        return "Mật khẩu không được để trống";
    }
    if (password.length < 6) {
        return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (password.length > 50) {
        return "Mật khẩu không được quá 50 ký tự";
    }
    return "";
};

/**
 * Username validation function
 * @param {string} username - Username to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateUsername = (username) => {
    if (!username) {
        return "Tên đăng nhập không được để trống";
    }
    if (username.length < 3) {
        return "Tên đăng nhập phải có ít nhất 3 ký tự";
    }
    if (username.length > 30) {
        return "Tên đăng nhập không được quá 30 ký tự";
    }
    // Allow alphanumeric, underscore, and dot
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
        return "Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới và dấu chấm";
    }
    return "";
};

/**
 * Full name validation function
 * @param {string} fullName - Full name to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateFullName = (fullName) => {
    if (!fullName) {
        return "Họ và tên không được để trống";
    }
    if (fullName.trim().length < 2) {
        return "Họ và tên phải có ít nhất 2 ký tự";
    }
    if (fullName.length > 100) {
        return "Họ và tên không được quá 100 ký tự";
    }
    return "";
};

/**
 * Phone number validation function (Vietnamese format)
 * @param {string} phoneNumber - Phone number to validate
 * @returns {string} Error message or empty string if valid
 */
export const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
        return ""; // Phone number is optional
    }
    // Vietnamese phone number pattern: 10-11 digits, starts with 0
    const phoneRegex = /^0[0-9]{9,10}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return "Số điện thoại không đúng định dạng (10-11 số, bắt đầu bằng 0)";
    }
    return "";
};

/**
 * 2FA code validation function (Backend expects 4-10 chars, but UI enforces 6 digits)
 * @param {string} code - 2FA code to validate
 * @returns {string} Error message or empty string if valid
 */
export const validate2FACode = (code) => {
    if (!code) {
        return "Mã xác thực không được để trống";
    }
    if (code.length !== 6) {
        return "Mã xác thực phải có đúng 6 chữ số";
    }
    if (!/^\d{6}$/.test(code)) {
        return "Mã xác thực chỉ được chứa số";
    }
    return "";
};

/**
 * Password confirmation validation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string} Error message or empty string if valid
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
    if (!confirmPassword) {
        return "Vui lòng xác nhận mật khẩu";
    }
    if (password !== confirmPassword) {
        return "Mật khẩu xác nhận không khớp";
    }
    return "";
};

/**
 * Address validation function
 * @param {string} address - Address to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateAddress = (address) => {
    if (!address) {
        return ""; // Address is optional
    }
    if (address.length > 200) {
        return "Địa chỉ không được quá 200 ký tự";
    }
    return "";
};

/**
 * Login credentials validation (email or username + password)
 * @param {string} emailOrUsername - Email or username
 * @param {string} password - Password
 * @returns {object} Object with emailOrUsername and password error messages
 */
export const validateLoginCredentials = (emailOrUsername, password) => {
    let emailOrUsernameError = "";
    let passwordError = "";

    if (!emailOrUsername) {
        emailOrUsernameError = "Email hoặc tên đăng nhập không được để trống";
    } else {
        // Check if it's an email format
        if (emailOrUsername.includes('@')) {
            emailOrUsernameError = validateEmail(emailOrUsername);
        } else {
            emailOrUsernameError = validateUsername(emailOrUsername);
        }
    }

    passwordError = validatePassword(password);

    return {
        emailOrUsernameError,
        passwordError
    };
};

/**
 * Registration data validation
 * @param {object} userData - User registration data
 * @returns {object} Object with error messages for each field
 */
export const validateRegistrationData = (userData) => {
    return {
        fullNameError: validateFullName(userData.fullName),
        usernameError: validateUsername(userData.username),
        emailError: validateEmail(userData.email),
        passwordError: validatePassword(userData.password),
        confirmPasswordError: validatePasswordConfirmation(userData.password, userData.confirmPassword),
        phoneNumberError: validatePhoneNumber(userData.phoneNumber),
        addressError: validateAddress(userData.address)
    };
};
