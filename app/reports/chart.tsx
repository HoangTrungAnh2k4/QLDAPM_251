'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, ReferenceLine, LabelList } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useMemo, useState } from 'react';

export const description = 'A bar chart';

type MonthlyReportItem = {
    revenue?: number;
    quantity?: number;
    electric?: number;
};

type ChartReport = Record<string, MonthlyReportItem> | null | undefined;

const chartConfig = {
    data: {
        label: 'value',
        color: 'var(--primary)',
    },
} satisfies ChartConfig;

const MONTH_SHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ChartBarDefault({ report, selectedMonth }: { report?: ChartReport; selectedMonth?: number }) {
    const [metric, setMetric] = useState<'revenue' | 'quantity' | 'electric'>('revenue');

    const chartData = useMemo(() => {
        // build months 1..12
        const data = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const item = report ? report[String(month)] : undefined;
            const value = item ? item[metric] ?? 0 : 0;
            return {
                month: String(month),
                value,
            };
        });
        return data;
    }, [report, metric]);

    const hasAnyData =
        report &&
        Object.keys(report).some((k) => {
            const v = report![k];
            return v && Object.keys(v).length > 0;
        });

    return (
        <div>
            <div className="flex justify-end">
                <NativeSelect
                    value={metric}
                    onChange={(e) =>
                        setMetric((e.target as HTMLSelectElement).value as 'revenue' | 'quantity' | 'electric')
                    }
                    className="shadow"
                >
                    <NativeSelectOption value="revenue">Doanh thu</NativeSelectOption>
                    <NativeSelectOption value="quantity">Số lượt sạc</NativeSelectOption>
                    <NativeSelectOption value="electric">Tổng lượng điện</NativeSelectOption>
                </NativeSelect>
            </div>

            {!hasAnyData ? (
                <div className="mt-4 text-muted-foreground text-center">Không có dữ liệu để hiển thị biểu đồ</div>
            ) : (
                <ChartContainer config={chartConfig} className="mt-4 w-full h-80">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 56, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value: any) => {
                                const idx = Number(value) - 1;
                                return MONTH_SHORT_NAMES[idx] ?? value;
                            }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

                        <Bar dataKey="value" fill="var(--color-data)" radius={8}>
                            <LabelList
                                dataKey="value"
                                position="top"
                                style={{ fontSize: 12, fill: 'var(--foreground)' }}
                                formatter={(val: any) => {
                                    const num = Number(val) || 0;
                                    if (metric === 'revenue')
                                        return new Intl.NumberFormat('vi-VN').format(num) + ' VND';
                                    if (metric === 'electric') return `${num} kWh`;
                                    return String(num);
                                }}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            )}
        </div>
    );
}
