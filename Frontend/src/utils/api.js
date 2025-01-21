import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
    baseURL: 'http://localhost:4001/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Helper function to safely parse JSON responses
const safeJsonParse = async (response) => {
    const contentType = response.headers?.['content-type'] || '';
    
    // If response is HTML instead of JSON, throw an error
    if (contentType.includes('text/html')) {
        throw new Error('Received HTML response instead of expected JSON');
    }
    
    try {
        // For axios responses, return the data directly - it's already parsed
        if (response.data) {
            return {
                data: response.data,
                status: response.status,
                headers: response.headers
            };
        }
        
        // For fetch responses, need to parse text
        const text = await response.text();
        try {
            return {
                data: JSON.parse(text),
                status: response.status,
                headers: response.headers
            };
        } catch (e) {
            console.error('Invalid JSON:', text.slice(0, 200));
            throw new Error(`Server returned invalid JSON: ${text.slice(0, 100)}...`);
        }
    } catch (e) {
        throw new Error(`Failed to parse response: ${e.message}`);
    }
};

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
// api.js interceptor
api.interceptors.response.use(
    async (response) => {
        try {
            // Validate response
            if (!response.data) {
                throw new Error('Empty response received');
            }
            
            // Return parsed data
            return response;
        } catch (error) {
            throw new ApiError('Response parsing error', response.status, error);
        }
    },
    async (error) => {
        if (error.response) {
            const contentType = error.response.headers?.['content-type'] || '';
            
            // Handle HTML responses
            if (contentType.includes('text/html')) {
                // For GET requests returning 404, return empty data instead of throwing
                if (error.config.method === 'get' && error.response.status === 404) {
                    return {
                        data: [],
                        status: 200,
                        headers: error.response.headers
                    };
                }
                
                console.error('Received HTML error response:', error.response.data);
                throw new ApiError(
                    'Server returned HTML instead of JSON',
                    error.response.status,
                    error.response.data.slice(0, 200)
                );
            }

            // Handle token expiration
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('role'); // Also remove role if you're storing it
                window.location.href = '/loginsignup'; // Updated to match your login route
            }

            // Handle other API errors
            throw new ApiError(
                error.response.data?.message || 'API request failed',
                error.response.status,
                error.response.data
            );
        } else if (error.request) {
            // Handle network errors
            throw new ApiError(
                'No response received from server',
                null,
                error.request
            );
        } else {
            // Handle other errors
            throw new ApiError(
                error.message || 'Unknown error occurred',
                null,
                error
            );
        }
    }
);

// Helper function to make API calls with better error handling
const makeApiCall = async (method, url, data = null, config = {}) => {
    try {
        const response = await api({
            method,
            url,
            data,
            ...config
        });
        // Use safeJsonParse to maintain consistent response format
        return await safeJsonParse(response);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('API call failed', null, error);
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