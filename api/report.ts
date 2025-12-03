import axiosInstance from '../utils/axiosInstance';

const API_BACKEND_URL = 'https://qldapm-be.onrender.com/evstation/api';

export async function getDataReport(year: string | number = '2025') {
    const res = await axiosInstance.get(`${API_BACKEND_URL}/chargeData/getByYear/${year}`);
    return res;
}

export async function getDataHistory(page: number = 1, limit: number = 10) {
    const res = await axiosInstance.get(`${API_BACKEND_URL}/chargeData/getAll`, { params: { page, limit } });
    return res;
}
