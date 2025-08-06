import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const authenticated = await authService.isAuthenticated();
            const currentUser = authService.getCurrentUser();

            console.log('useAuth - checkAuthStatus:', { authenticated, currentUser });

            setIsAuthenticated(authenticated);
            setUser(currentUser);
        } catch (error) {
            console.error('Auth status check failed:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (emailOrUsername, password, userToken = null) => {
        try {
            const result = await authService.login(emailOrUsername, password, userToken);

            if (result.requires2FA) {
                return result;
            }

            if (result.success && result.data?.token) {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);
                setIsAuthenticated(true);
            }

            return result;
        } catch (error) {
            throw error;
        }
    };

    const verify2FA = async (email, code) => {
        try {
            const result = await authService.verify2FA(email, code);

            if (result.success && result.data?.token) {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);
                setIsAuthenticated(true);
            }

            return result;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const result = await authService.register(userData);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const forgotPassword = async (email) => {
        try {
            const result = await authService.forgotPassword(email);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            const result = await authService.resetPassword(token, newPassword);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const result = await authService.changePassword(currentPassword, newPassword);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const verifyEmail = async (token) => {
        try {
            const result = await authService.verifyEmail(token);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const send2FACode = async (email) => {
        try {
            const result = await authService.send2FACode(email);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const logout = async (logoutFromAllDevices = false) => {
        console.log('useAuth - Logout function called');
        await authService.logout(logoutFromAllDevices);

        // Force immediate state update
        setUser(null);
        setIsAuthenticated(false);

        // Double-check auth status to ensure consistency
        setTimeout(() => {
            checkAuthStatus();
        }, 50);

        console.log('useAuth - Logout completed, state cleared');
        // Let individual components handle navigation
    };

    const updateUser = (userData) => {
        try {
            const updated = authService.updateCurrentUser(userData);
            if (updated) {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating user in context:', error);
            return false;
        }
    };

    const redirectToDashboard = () => {
        // Admin roles should go to /admin
        const adminRoles = ['Admin', 'MS', 'MMBH', 'LGR'];
        if (user?.role && adminRoles.includes(user.role)) {
            navigate('/admin');
        } else if (user?.role === 'Seller') {
            navigate('/seller/dashboard'); // Updated to match routes.js
        } else {
            navigate('/');
        }
    };

    const hasRole = (role) => {
        return authService.hasRole(role);
    };

    const hasAnyRole = (roles) => {
        return authService.hasAnyRole(roles);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        verify2FA,
        send2FACode,
        register,
        forgotPassword,
        resetPassword,
        changePassword,
        verifyEmail,
        logout,
        updateUser,
        checkAuthStatus,
        redirectToDashboard,
        hasRole,
        hasAnyRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
