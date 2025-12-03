'use client';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { columns, Payment } from './columns';
import { DataTable } from './data-table';
import { useEffect, useState } from 'react';
import { ChartBarDefault } from './chart';
import { getDataHistory, getDataReport } from '@/api/report';
import { log } from 'console';

type MonthlyReportItem = {
    revenue?: number;
    quantity?: number;
    electric?: number;
};

type ReportResponse = Record<string, MonthlyReportItem> & { year?: string };

export default function ReportPage() {
    const [data, setData] = useState<Payment[]>([]);
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
    const [report, setReport] = useState<ReportResponse | null>(null);
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [reportsCache, setReportsCache] = useState<Record<number, ReportResponse | null>>({});

    const handleExportFile = () => {};

    // Table data is loaded from API (`getDataHistory`) instead of mock data.
    const [historyPage, setHistoryPage] = useState<number>(1);
    const [historyTotalPages, setHistoryTotalPages] = useState<number>(1);
    const [historyTotalItems, setHistoryTotalItems] = useState<number>(0);
    const pageSize = 10;

    useEffect(() => {
        const fetchReport = async (year: number) => {
            try {
                setLoadingReport(true);
                const res = await getDataReport(year);
                // API shape (as provided): { status..., data: { '1': {...}, '11': {...}, 'year': '2025' } }
                const payload = res?.data?.data ?? null;
                setReportsCache((prev) => ({ ...prev, [year]: payload }));
                setReport(payload);
            } catch (error) {
                console.error('Lỗi khi fetch API:', error);
                setReportsCache((prev) => ({ ...prev, [year]: null }));
                setReport(null);
            } finally {
                setLoadingReport(false);
            }
        };

        if (reportsCache[selectedYear] !== undefined) {
            setReport(reportsCache[selectedYear]);
        } else {
            fetchReport(selectedYear);
        }
    }, [selectedYear]);

    async function ensureYearLoaded(year: number) {
        if (reportsCache[year] !== undefined) return reportsCache[year];
        try {
            const res = await getDataReport(year);
            const payload = res?.data?.data ?? null;
            setReportsCache((prev) => ({ ...prev, [year]: payload }));
            return payload;
        } catch (error) {
            setReportsCache((prev) => ({ ...prev, [year]: null }));
            return null;
        }
    }

    async function hasDataFor(year: number, month: number) {
        const todayMonth = today.getMonth() + 1;
        const todayYear = today.getFullYear();
        if (year > todayYear) return false;
        if (year === todayYear && month > todayMonth) return false;

        const payload = reportsCache[year] ?? (await ensureYearLoaded(year));
        if (!payload) return false;
        const item = payload[String(month)];
        // treat missing or empty objects as no-data
        if (!item) return false;
        if (typeof item === 'object' && Object.keys(item).length === 0) return false;
        return true;
    }

    const prevMonth = async () => {
        const tentativeMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
        const tentativeYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

        const ok = await hasDataFor(tentativeYear, tentativeMonth);
        if (!ok) {
            window.alert('Không có dữ liệu cho tháng này');
            return;
        }

        setSelectedMonth(tentativeMonth);
        setSelectedYear(tentativeYear);
    };

    const nextMonth = async () => {
        const tentativeMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
        const tentativeYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;

        const ok = await hasDataFor(tentativeYear, tentativeMonth);
        if (!ok) {
            window.alert('Không có dữ liệu cho tháng này');
            return;
        }

        setSelectedMonth(tentativeMonth);
        setSelectedYear(tentativeYear);
    };

    const currentMonthData: MonthlyReportItem = (report && report[String(selectedMonth)]) || {};

    const formatCurrency = (value?: number) => {
        if (!value && value !== 0) return '0 VND';
        return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
    };

    const formatElectric = (value?: number) => {
        if (!value && value !== 0) return '0 kWh';
        return `${value} kWh`;
    };

    async function fetchHistory(page: number = 1) {
        try {
            const res = await getDataHistory(page, pageSize);
            const payload = res?.data?.data ?? res?.data ?? null;

            const items = payload?.result ?? [];
            const pageFromApi = payload?.page ?? page;
            const totalPages = payload?.totalPages ?? 1;
            const totalItems = payload?.totalItems ?? items.length;

            const rows: Payment[] = Array.isArray(items)
                ? items.map((item: any, idx: number) => {
                      const electric = Number(item.electric ?? 0);
                      const money = electric * 7600;
                      return {
                          id: item._id ?? String((pageFromApi - 1) * pageSize + idx + 1),
                          phoneNumber: item._id ?? '',
                          type: item.vehicleType ?? '',
                          startTime: item.timeStart ?? '',
                          duration: item.duration ? String(item.duration) : '',
                          electricityAmount: electric,
                          station: item.station ?? '',
                          charger: item.charger ?? '',
                          money: money,
                      } as Payment;
                  })
                : [];

            setData(rows);
            setHistoryPage(pageFromApi);
            setHistoryTotalPages(totalPages);
            setHistoryTotalItems(totalItems);
        } catch (error) {
            console.log('Lỗi khi fetch history API:', error);
            setData([]);
            setHistoryPage(1);
            setHistoryTotalPages(1);
            setHistoryTotalItems(0);
        }
    }

    useEffect(() => {
        fetchHistory(historyPage);
    }, []);

    return (
        <div className="mx-auto px-6 pb-6 container">
            <div className="relative shadow pt-2 pb-6 border border-[#999] rounded-2xl">
                <div className="flex justify-center items-center mb-4">
                    <button
                        aria-label="previous-month"
                        onClick={prevMonth}
                        className="flex justify-center items-center hover:bg-[#f0f0f0] p-1 rounded-2xl text-gray-700 text-2xl cursor-pointer"
                    >
                        <IoIosArrowBack />
                    </button>
                    <div className="mx-4 font-semibold text-lg">{selectedMonth}</div>
                    <div className="mx-4 font-semibold text-lg">/</div>
                    <div className="mx-4 font-semibold text-lg">{selectedYear}</div>
                    {(() => {
                        const todayMonth = today.getMonth() + 1;
                        const todayYear = today.getFullYear();
                        const isNextDisabled =
                            selectedYear > todayYear || (selectedYear === todayYear && selectedMonth >= todayMonth);

                        return (
                            <button
                                aria-label="next-month"
                                onClick={isNextDisabled ? undefined : nextMonth}
                                disabled={isNextDisabled}
                                className={`flex justify-center items-center p-1 rounded-2xl text-gray-700 text-2xl ${
                                    isNextDisabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-[#f0f0f0] cursor-pointer'
                                }`}
                            >
                                <IoIosArrowForward />
                            </button>
                        );
                    })()}
                    <button
                        className="top-4 right-6 absolute bg-primary hover:bg-primary/85 px-4 py-2 rounded-lg text-white cursor-pointer"
                        onClick={handleExportFile}
                    >
                        Xuất báo cáo
                    </button>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <div className="flex-1 px-6 text-center">
                        <div className="font-semibold text-lg">Tổng doanh thu</div>
                        <div className="mt-4 font-semibold text-primary text-lg">
                            {loadingReport ? 'Đang tải...' : formatCurrency(currentMonthData.revenue)}
                        </div>
                    </div>

                    <div className="bg-gray-300 mx-4 w-px h-20" />

                    <div className="flex-1 px-6 text-center">
                        <div className="font-semibold text-lg">Tổng lượt sạc</div>
                        <div className="mt-4 font-semibold text-primary text-lg">
                            {loadingReport ? 'Đang tải...' : currentMonthData.quantity ?? 0}
                        </div>
                    </div>

                    <div className="bg-gray-300 mx-4 w-px h-20" />

                    <div className="flex-1 px-6 text-center">
                        <div className="font-semibold text-lg">Tổng điện năng</div>
                        <div className="mt-4 font-semibold text-primary text-lg">
                            {loadingReport ? 'Đang tải...' : formatElectric(currentMonthData.electric)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-6">
                <ChartBarDefault report={report} selectedMonth={selectedMonth} />
            </div>

            <div className="mx-auto py-10">
                <DataTable
                    columns={columns}
                    data={data}
                    currentPage={historyPage}
                    totalPages={historyTotalPages}
                    onPageChange={(p) => fetchHistory(p)}
                />
            </div>
        </div>
    );
}
