import axiosInstance from '../utils/axiosInstance';

const API_BACKEND_URL = 'https://qldapm-be.onrender.com/evstation/api';

export async function addData(data: any) {
    const res = await axiosInstance.post(`${API_BACKEND_URL}/chargeData/create`, data);
    return res;
}
