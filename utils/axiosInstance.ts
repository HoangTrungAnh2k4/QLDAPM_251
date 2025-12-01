import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Attach access token from localStorage as Bearer token (client-side only)
if (typeof window !== 'undefined') {
    axiosInstance.interceptors.request.use(
        (config) => {
            try {
                const token = localStorage.getItem('access_token');
                if (token && config && config.headers) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
            } catch (e) {
                // ignore localStorage errors
            }
            return config;
        },
        (error) => Promise.reject(error),
    );
}

export default axiosInstance;
