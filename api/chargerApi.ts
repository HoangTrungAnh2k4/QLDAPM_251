import axiosInstance from '../utils/axiosInstance';

const API_BACKEND_URL = 'https://qldapm-be.onrender.com/evstation/api';

export async function getAllChargers(stationId: string) {
    const res = await axiosInstance.get(`${API_BACKEND_URL}/post/getAll${stationId ? `?stationId=${stationId}` : ''}`);
    return res;
}

export async function addCharger(data: any) {
    const res = await axiosInstance.post(`${API_BACKEND_URL}/post/create`, data);
    return res;
}

export async function deleteCharger(chargerID: any) {
    const res = await axiosInstance.delete(`${API_BACKEND_URL}/post/delete/${chargerID}`);
    return res;
}

export async function updateCharger(chargerID: any, data: any) {
    const res = await axiosInstance.post(`${API_BACKEND_URL}/post/update/${chargerID}`, data);
    return res;
}
