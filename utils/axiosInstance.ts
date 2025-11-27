import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Nếu có response và status là 401
        if (error.response && error.response.status === 401) {
            // Tránh lỗi khi chạy trên server
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    },
);

export default axiosInstance;
