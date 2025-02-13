import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Helper function to get user data from token
export const getUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch (error) {
            console.error('Error decoding token:', error);
            localStorage.removeItem('token');
            return null;
        }
    }
    return null;
};

// Custom error class for API errors
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Add request interceptor for token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(new ApiError('Request configuration error', null, error));
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/loginsignup';
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

// Helper function to make API calls with better error handling
const makeApiCall = async (method, url, data = null, config = {}) => {
    try {
        console.log(`Making ${method.toUpperCase()} request to ${url}`);
        
        const axiosConfig = {
            method,
            url,
            ...config,
            validateStatus: null
        };

        // Only add data if it's not a DELETE request or if specifically required
        if (method.toLowerCase() !== 'delete' || data) {
            axiosConfig.data = data;
        }

        const response = await api(axiosConfig);
        
        console.log('Raw response:', {
            status: response.status,
            headers: response.headers,
            data: response.data
        });

        // Handle non-200 status codes
        if (response.status >= 200 && response.status < 300) {
            if (response.status === 204 || !response.data) {
                return {
                    status: response.status,
                    data: null,
                    headers: response.headers
                };
            }
            return response;
        }
        
        throw new ApiError(
            response.data?.message || 'Request failed',
            response.status,
            response.data
        );
    } catch (error) {
        console.error('API call error:', {
            name: error.name,
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });

        if (error.response) {
            const errorData = error.response.data || { message: 'Unknown error occurred' };
            throw new ApiError(
                errorData.message || 'Request failed',
                error.response.status,
                errorData
            );
        }
        
        throw new ApiError(error.message || 'API call failed', null, error);
    }
};

// Export enhanced API methods
export default {
    ...api,
    safeGet: (url, config) => makeApiCall('get', url, null, config),
    safePost: (url, data, config) => makeApiCall('post', url, data, config),
    safePut: (url, data, config) => makeApiCall('put', url, data, config),
    safePatch: (url, data, config) => makeApiCall('patch', url, data, config),
    safeDelete: (url, config) => makeApiCall('delete', url, null, config)
};