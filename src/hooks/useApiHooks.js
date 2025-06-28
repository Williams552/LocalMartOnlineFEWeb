import { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

// Custom hook for API calls
export const useApi = (endpoint, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        autoFetch = true,
        onSuccess = null,
        onError = null,
        showToast = true
    } = options;

    const fetchData = async (customEndpoint = null) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiService.get(customEndpoint || endpoint);
            setData(result);

            if (onSuccess) onSuccess(result);
            if (showToast) toast.success('Tải dữ liệu thành công');

            return result;
        } catch (err) {
            setError(err.message);

            if (onError) onError(err);
            if (showToast) toast.error(err.message);

            throw err;
        } finally {
            setLoading(false);
        }
    };

    const postData = async (postData, customEndpoint = null) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiService.post(customEndpoint || endpoint, postData);

            if (onSuccess) onSuccess(result);
            if (showToast) toast.success('Tạo dữ liệu thành công');

            return result;
        } catch (err) {
            setError(err.message);

            if (onError) onError(err);
            if (showToast) toast.error(err.message);

            throw err;
        } finally {
            setLoading(false);
        }
    };

    const putData = async (putData, customEndpoint = null) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiService.put(customEndpoint || endpoint, putData);

            if (onSuccess) onSuccess(result);
            if (showToast) toast.success('Cập nhật dữ liệu thành công');

            return result;
        } catch (err) {
            setError(err.message);

            if (onError) onError(err);
            if (showToast) toast.error(err.message);

            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteData = async (customEndpoint = null) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiService.delete(customEndpoint || endpoint);

            if (onSuccess) onSuccess(result);
            if (showToast) toast.success('Xóa dữ liệu thành công');

            return result;
        } catch (err) {
            setError(err.message);

            if (onError) onError(err);
            if (showToast) toast.error(err.message);

            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch && endpoint) {
            fetchData();
        }
    }, [endpoint, autoFetch]);

    return {
        data,
        loading,
        error,
        fetchData,
        postData,
        putData,
        deleteData,
        refetch: fetchData
    };
};

// Custom hook specifically for users
export const useUsers = (options = {}) => {
    return useApi('/api/User', options);
};

// Custom hook for MongoDB operations
export const useMongoDB = (options = {}) => {
    const mongoApi = useApi('/api/MongoDB', { ...options, autoFetch: false });

    const testConnection = async () => {
        try {
            const result = await apiService.testMongoConnection();
            return result;
        } catch (error) {
            throw error;
        }
    };

    return {
        ...mongoApi,
        testConnection
    };
};

// Custom hook for authentication
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing user data:', error);
                logout();
            }
        }
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            // This would use the authService for actual login
            const response = await apiService.post('/api/auth/login', credentials);

            if (response.token && response.user) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                setToken(response.token);
                setUser(response.user);
            }

            return response;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token && !!user;

    return {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout
    };
};
