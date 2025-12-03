import { redirect } from 'next/navigation';
import { getAllStation } from '@/api/stationApi';

export default async function Home() {
    try {
        await getAllStation();
        redirect('/station-management');
    } catch (error: any) {
        const status = error?.response?.status;

        if (status === 401) {
            redirect('/login');
        }

        // Nếu lỗi khác, bạn có thể chuyển sang trang lỗi riêng
        redirect('/error');
    }
}
