import axiosInstance from '../utils/axiosInstance';

const API_BACKEND_URL = 'https://qldapm-be.onrender.com/evstation/api';

export async function getAllStation() {
    const res = await axiosInstance.get(`${API_BACKEND_URL}/station/getAll`);
    return res;
}

export async function addStation(data: any) {
    const res = await axiosInstance.post(`${API_BACKEND_URL}/station/create`, data);
    return res;
}

export async function deleteStation(stationID: any) {
    const res = await axiosInstance.delete(`${API_BACKEND_URL}/station/delete/${stationID}`);
    return res;
}

export async function updateStation(stationID: string, data: any) {
    // Use PUT for update. If your backend expects PATCH or a different path,
    // adjust this accordingly (e.g. axiosInstance.patch or different URL).
    const res = await axiosInstance.post(`${API_BACKEND_URL}/station/update/${stationID}`, data);
    return res;
}
