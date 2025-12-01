'use client';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { columns, Payment } from './columns';
import { getMockPayments } from './mock-data';
import { DataTable } from './data-table';
import { useEffect, useState } from 'react';
import { ChartBarDefault } from './chart';

async function getData(): Promise<Payment[]> {
    return getMockPayments();
}

export default function ReportPage() {
    const [data, setData] = useState<Payment[]>([]);

    const handleExportFile = () => {};

    useEffect(() => {
        getData().then((data) => {
            setData(data);
            console.log('Fetched data:', data);
        });
    }, []);

    return (
        <div className="mx-auto px-6 pb-6 container">
            <div className="shadow pt-2 pb-6 border border-[#999] rounded-2xl">
                <div className="flex justify-center items-center mb-4">
                    <button
                        aria-label="previous-month"
                        className="flex justify-center items-center hover:bg-[#f0f0f0] p-1 rounded-2xl text-gray-700 text-2xl cursor-pointer"
                    >
                        <IoIosArrowBack />
                    </button>
                    <div className="mx-4 font-semibold text-lg">5</div>
                    <div className="mx-4 font-semibold text-lg">/</div>
                    <div className="mx-4 font-semibold text-lg">2025</div>
                    <button
                        aria-label="previous-year"
                        className="flex justify-center items-center hover:bg-[#f0f0f0] p-1 rounded-2xl text-gray-700 text-2xl cursor-pointer"
                    >
                        <IoIosArrowForward />
                    </button>
                    <button
                        className="top-12 right-16 absolute bg-primary hover:bg-primary/85 px-4 py-2 rounded-lg text-white cursor-pointer"
                        onClick={handleExportFile}
                    >
                        Xuất báo cáo
                    </button>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <div className="flex-1 px-6 text-center">
                        <div className="font-semibold text-lg">Tổng doanh thu</div>
                        <div className="mt-4 font-semibold text-primary text-lg">50.000.000 VND</div>
                    </div>

                    <div className="bg-gray-300 mx-4 w-px h-20" />

                    <div className="flex-1 px-6 text-center">
                        <div className="font-semibold text-lg">Tổng lượt sạc</div>
                        <div className="mt-4 font-semibold text-primary text-lg">200</div>
                    </div>

                    <div className="bg-gray-300 mx-4 w-px h-20" />

                    <div className="flex-1 px-6 text-center">
                        <div className="font-semibold text-lg">Tổng điện năng</div>
                        <div className="mt-4 font-semibold text-primary text-lg">5.1 MW</div>
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-6">
                <ChartBarDefault />
            </div>

            <div className="mx-auto py-10">
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    );
}
